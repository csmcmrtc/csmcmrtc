import os
from typing import Optional
import google.generativeai as genai
from openai import OpenAI


class LLMClient:
    """
    Unified LLM client that supports both Gemini and OpenAI.
    Automatically selects the provider based on environment variables.
    """
    
    def __init__(self):
        self.provider = os.getenv("LLM_PROVIDER", "gemini").lower()
        
        if self.provider == "gemini":
            api_key = os.getenv("GEMINI_API_KEY")
            if not api_key:
                raise ValueError("GEMINI_API_KEY not found in environment variables")
            genai.configure(api_key=api_key)
            # Using Gemini 1.5 Flash model
            self.model = genai.GenerativeModel('gemini-2.0-flash')
        
        elif self.provider == "openai":
            api_key = os.getenv("OPENAI_API_KEY")
            if not api_key:
                raise ValueError("OPENAI_API_KEY not found in environment variables")
            self.client = OpenAI(api_key=api_key)
        
        else:
            raise ValueError(f"Unsupported LLM provider: {self.provider}")
    
    def generate_text(self, prompt: str, max_tokens: int = 2000) -> str:
        """
        Generate text using the configured LLM provider.
        
        Args:
            prompt: The input prompt
            max_tokens: Maximum tokens to generate
            
        Returns:
            Generated text response
        """
        try:
            if self.provider == "gemini":
                response = self.model.generate_content(prompt)
                print(response.text)
                return response.text
            
            elif self.provider == "openai":
                response = self.client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": "You are a helpful travel planning assistant."},
                        {"role": "user", "content": prompt}
                    ],
                    max_tokens=max_tokens,
                    temperature=0.7
                )
                return response.choices[0].message.content
        
        except Exception as e:
            raise Exception(f"LLM generation failed: {str(e)}")


def calculate_trip_duration(start_date: str, end_date: str) -> int:
    """
    Calculate the number of days between two dates.
    
    Args:
        start_date: Start date in YYYY-MM-DD format
        end_date: End date in YYYY-MM-DD format
        
    Returns:
        Number of days
    """
    from datetime import datetime
    
    start = datetime.strptime(start_date, "%Y-%m-%d")
    end = datetime.strptime(end_date, "%Y-%m-%d")
    return (end - start).days + 1


def validate_budget(total_cost: float, budget: float) -> bool:
    """
    Check if the total cost is within the user's budget.
    
    Args:
        total_cost: Calculated total cost
        budget: User's maximum budget
        
    Returns:
        True if within budget, False otherwise
    """
    return total_cost <= budget


def format_currency(amount: float) -> str:
    """
    Format a number as currency (USD).
    
    Args:
        amount: Amount to format
        
    Returns:
        Formatted currency string
    """
    return f"${amount:,.2f}"


def calculate_carbon_savings(actual_footprint: float, average_footprint: float) -> dict:
    """
    Calculate carbon savings compared to average.
    
    Args:
        actual_footprint: Actual carbon footprint (kg CO2)
        average_footprint: Average carbon footprint for similar trips
        
    Returns:
        Dictionary with savings amount and percentage
    """
    savings = average_footprint - actual_footprint
    percentage = (savings / average_footprint * 100) if average_footprint > 0 else 0
    
    return {
        "savings_kg": round(savings, 2),
        "percentage": round(percentage, 1)
    }


# Mock data for destinations
# In a real application, this would come from external APIs
DESTINATION_DATA = {
    "paris": {
        "country": "France",
        "average_daily_cost": 150,
        "popular_activities": [
            "Visit Eiffel Tower",
            "Louvre Museum",
            "Notre-Dame Cathedral",
            "Seine River Cruise",
            "Montmartre Walking Tour"
        ],
        "eco_hotels": ["Green Hotel Paris", "Eco Lodge Marais", "Sustainable Stay Bastille"],
        "transport_options": {
            "train": {"cost_multiplier": 0.8, "carbon": 15},
            "flight": {"cost_multiplier": 1.2, "carbon": 150},
            "bus": {"cost_multiplier": 0.5, "carbon": 30}
        }
    },
    "tokyo": {
        "country": "Japan",
        "average_daily_cost": 180,
        "popular_activities": [
            "Visit Senso-ji Temple",
            "Tokyo Skytree",
            "Shibuya Crossing",
            "Meiji Shrine",
            "Tsukiji Fish Market"
        ],
        "eco_hotels": ["Green Palace Tokyo", "Eco Inn Shibuya", "Sustainable Hotel Shinjuku"],
        "transport_options": {
            "train": {"cost_multiplier": 0.9, "carbon": 20},
            "flight": {"cost_multiplier": 1.5, "carbon": 200},
            "bus": {"cost_multiplier": 0.6, "carbon": 40}
        }
    },
    "london": {
        "country": "United Kingdom",
        "average_daily_cost": 160,
        "popular_activities": [
            "British Museum",
            "Tower of London",
            "Buckingham Palace",
            "London Eye",
            "Hyde Park"
        ],
        "eco_hotels": ["Green Hotel London", "Eco Stay Westminster", "Sustainable Lodge Camden"],
        "transport_options": {
            "train": {"cost_multiplier": 0.7, "carbon": 12},
            "flight": {"cost_multiplier": 1.0, "carbon": 120},
            "bus": {"cost_multiplier": 0.4, "carbon": 25}
        }
    },
    "default": {
        "country": "Unknown",
        "average_daily_cost": 140,
        "popular_activities": [
            "City Walking Tour",
            "Local Museum Visit",
            "Cultural Experience",
            "Food Tour",
            "Nature Exploration"
        ],
        "eco_hotels": ["Green Hotel", "Eco Lodge", "Sustainable Stay"],
        "transport_options": {
            "train": {"cost_multiplier": 0.8, "carbon": 15},
            "flight": {"cost_multiplier": 1.2, "carbon": 150},
            "bus": {"cost_multiplier": 0.5, "carbon": 30}
        }
    }
}


def get_destination_data(destination: str) -> dict:
    """
    Get mock data for a destination.
    
    Args:
        destination: Destination name
        
    Returns:
        Dictionary with destination data
    """
    # Normalize destination name
    dest_key = destination.lower().split(",")[0].strip()
    
    # Return specific data or default
    return DESTINATION_DATA.get(dest_key, DESTINATION_DATA["default"])
