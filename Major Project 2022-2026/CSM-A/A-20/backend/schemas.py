from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import date


class TravelRequest(BaseModel):
    """
    Schema for incoming travel plan requests from the frontend.
    Contains all user inputs needed to generate a personalized travel plan.
    """
    destination: str = Field(..., description="Travel destination city/country")
    budget: float = Field(..., gt=0, description="Maximum budget in INR")
    start_date: str = Field(..., description="Travel start date (YYYY-MM-DD)")
    end_date: str = Field(..., description="Travel end date (YYYY-MM-DD)")
    sustainability_preference: str = Field(
        ..., 
        description="User's sustainability preference: Low, Medium, or High"
    )
    group_size: int = Field(default=1, description="Number of travelers in the group")
    transport_preference: str = Field(
        default="Auto", 
        description="User's preferred mode of transport: Auto, Flight, Train, or Bus"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "destination": "Paris, France",
                "budget": 50000.0,
                "start_date": "2026-06-01",
                "end_date": "2026-06-07",
                "sustainability_preference": "High",
                "group_size": 2,
                "transport_preference": "Auto"
            }
        }


class TransportOption(BaseModel):
    """Schema for transportation details"""
    mode: str  # e.g., "Train", "Flight", "Bus"
    route: str
    cost: float
    carbon_footprint: float  # kg CO2
    duration: str


class AccommodationOption(BaseModel):
    """Schema for accommodation details"""
    name: str
    type: str  # e.g., "Hotel", "Hostel", "Eco-lodge"
    cost_per_night: float
    total_cost: float
    sustainability_rating: str  # e.g., "Eco-certified", "Standard"
    carbon_footprint: float  # kg CO2 per night


class ActivityOption(BaseModel):
    """Schema for daily activities"""
    day: int
    activities: List[str]
    estimated_cost: float


class CostBreakdown(BaseModel):
    """Detailed cost breakdown"""
    transport: float
    accommodation: float
    activities: float
    food: float
    miscellaneous: float
    total: float
    cost_per_person: float


class SustainabilityInsights(BaseModel):
    """Sustainability metrics and insights"""
    total_carbon_footprint: float  # kg CO2
    carbon_comparison: str  # Comparison with average trip
    eco_friendly_choices: List[str]
    sustainability_score: str  # e.g., "Excellent", "Good", "Fair"


class TravelPlan(BaseModel):
    """
    Complete travel plan response.
    This is what gets sent back to the frontend.
    """
    destination: str
    duration_days: int
    group_size: int
    itinerary: str  # Natural language itinerary from LLM
    transport: TransportOption
    accommodation: AccommodationOption
    activities: List[ActivityOption]
    cost_breakdown: CostBreakdown
    sustainability_insights: SustainabilityInsights
    ai_explanation: str  # Why these choices were made
    
    class Config:
        json_schema_extra = {
            "example": {
                "destination": "Paris, France",
                "duration_days": 6,
                "itinerary": "Day 1: Arrive in Paris...",
                "transport": {
                    "mode": "Train",
                    "route": "London to Paris",
                    "cost": 15000.0,
                    "carbon_footprint": 12.5,
                    "duration": "2h 30m"
                },
                "accommodation": {
                    "name": "Green Hotel Paris",
                    "type": "Eco-hotel",
                    "cost_per_night": 5000.0,
                    "total_cost": 30000.0,
                    "sustainability_rating": "Eco-certified",
                    "carbon_footprint": 8.0
                },
                "activities": [],
                "cost_breakdown": {
                    "total": 120000.0
                },
                "sustainability_insights": {
                    "total_carbon_footprint": 120.5,
                    "carbon_comparison": "40% lower than average",
                    "eco_friendly_choices": ["Train travel", "Eco-certified hotel"],
                    "sustainability_score": "Excellent"
                },
                "ai_explanation": "Based on your preferences..."
            }
        }



class WeatherInfo(BaseModel):
    temp: str
    condition: str
    precip_chance: str

class ActivityDetail(BaseModel):
    time: str
    place_name: str
    description: str
    estimated_cost: str
    sustainability_note: str

class PlannedDay(BaseModel):
    day: int
    date: str
    weather: WeatherInfo
    activities: List[ActivityDetail]
    daily_budget_total: str

class TransportOptionRes(BaseModel):
    type: str
    provider: str
    estimated_price: str
    booking_link: str
    eco_friendly: bool

class YouTubeVlog(BaseModel):
    title: str
    url: str

class VisualResources(BaseModel):
    youtube_vlogs: List[YouTubeVlog]

class TripSummary(BaseModel):
    location: str
    total_budget: str
    sustainability_rating: str

class TravelPlanNew(BaseModel):
    trip_summary: TripSummary
    planned_days: List[PlannedDay]
    transport_options: List[TransportOptionRes]
    visual_resources: VisualResources

class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    message: str
