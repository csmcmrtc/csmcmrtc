"""
FastAPI Backend for AI-Agent Travel Planning Platform

This is the main backend server that exposes REST APIs for the frontend.
It handles travel plan generation requests and coordinates the AI agents.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from datetime import datetime

from backend.schemas import TravelRequest, TravelPlan, HealthResponse, TravelPlanNew
from backend.Agent import ai_review

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="AI Travel Planning Platform",
    description="An AI-Agent platform for sustainable and budget-friendly travel planning",
    version="1.0.0"
)

# Add CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize agents (orchestrator no longer used, we use Agent.py directly now)


@app.get("/", tags=["Root"])
async def root():
    """
    Root endpoint - provides basic API information.
    """
    return {
        "message": "Welcome to AI Travel Planning Platform API",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "generate_plan": "/generate-plan"
        }
    }


@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """
    Health check endpoint to verify the API is running.
    
    Returns:
        HealthResponse with status and message
    """
    return HealthResponse(
        status="healthy",
        message="AI Travel Planning API is running successfully"
    )


@app.post("/generate-plan", response_model=TravelPlanNew, tags=["Travel Planning"])
async def generate_travel_plan(request: TravelRequest):
    """
    Generate a personalized travel plan based on user inputs.
    
    This endpoint:
    1. Validates the input request
    2. Coordinates all AI agents (Budget, Sustainability, Preference, Planner)
    3. Generates an optimized travel itinerary using LLM
    4. Returns a complete travel plan with cost breakdown and sustainability insights
    
    Args:
        request: TravelRequest object containing user preferences
        
    Returns:
        TravelPlan object with complete itinerary and analysis
        
    Raises:
        HTTPException: If validation fails or plan generation encounters an error
    """
    try:
        # Validate dates
        validate_dates(request.start_date, request.end_date)
        
        # Validate sustainability preference
        if request.sustainability_preference not in ["Low", "Medium", "High"]:
            raise HTTPException(
                status_code=400,
                detail="Sustainability preference must be 'Low', 'Medium', or 'High'"
            )
        
        # Generate travel plan using the new Agent's ai_review function
        print(f"\n{'='*60}")
        print(f"Generating travel plan for: {request.destination}")
        print(f"Budget: ${request.budget:.2f}")
        print(f"Dates: {request.start_date} to {request.end_date}")
        print(f"Sustainability: {request.sustainability_preference}")
        print(f"{'='*60}\n")
        
        raw_plan = ai_review(
            place=request.destination,
            budget=request.budget,
            start_date=request.start_date,
            end_date=request.end_date,
            sustainability_pref=request.sustainability_preference,
            group_size=request.group_size,
            transport_pref=request.transport_preference
        )
        
        # Parse into TravelPlanNew
        travel_plan = TravelPlanNew(**raw_plan)
        
        print(f"\n{'='*60}")
        print(f"Travel plan generated successfully!")
        print(f"Location: {travel_plan.trip_summary.location}")
        print(f"Total Budget: {travel_plan.trip_summary.total_budget}")
        print(f"{'='*60}\n")
        
        return travel_plan
    
    except ValueError as ve:
        # Handle validation errors
        raise HTTPException(status_code=400, detail=str(ve))
    
    except Exception as e:
        # Handle unexpected errors
        print(f"Error generating travel plan: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate travel plan: {str(e)}"
        )


def validate_dates(start_date: str, end_date: str):
    """
    Validate that dates are in correct format and logical.
    
    Args:
        start_date: Start date in YYYY-MM-DD format
        end_date: End date in YYYY-MM-DD format
        
    Raises:
        ValueError: If dates are invalid
    """
    try:
        start = datetime.strptime(start_date, "%Y-%m-%d")
        end = datetime.strptime(end_date, "%Y-%m-%d")
        
        # Check that end date is after start date
        if end <= start:
            raise ValueError("End date must be after start date")
        
        # Check that dates are not in the past
        today = datetime.now()
        if start.date() < today.date():
            raise ValueError("Start date cannot be in the past")
        
        # Check that trip is not too long (max 30 days for this demo)
        duration = (end - start).days
        if duration > 30:
            raise ValueError("Trip duration cannot exceed 30 days")
    
    except ValueError as e:
        if "does not match format" in str(e):
            raise ValueError("Dates must be in YYYY-MM-DD format")
        raise e


if __name__ == "__main__":
    import uvicorn
    
    # Get configuration from environment variables
    host = os.getenv("BACKEND_HOST", "localhost")
    port = int(os.getenv("BACKEND_PORT", 8000))
    
    print(f"\n{'='*60}")
    print(f"Starting AI Travel Planning API")
    print(f"Server: http://{host}:{port}")
    print(f"Docs: http://{host}:{port}/docs")
    print(f"{'='*60}\n")
    
    # Run the server
    uvicorn.run(
        "backend.main:app",
        host=host,
        port=port,
        reload=True  # Enable auto-reload during development
    )
