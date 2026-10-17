"""
Sustainability Agent
Responsible for estimating carbon footprint and preferring
eco-friendly transport and accommodation options.
"""

from typing import Dict, List
from backend.utils import calculate_carbon_savings


class SustainabilityAgent:
    """
    The Sustainability Agent evaluates the environmental impact of travel choices
    and recommends eco-friendly alternatives.
    """
    
    def __init__(self):
        self.name = "Sustainability Agent"
        # Average carbon footprint for a typical week-long trip (kg CO2)
        self.average_trip_footprint = 500
    
    def evaluate_sustainability(self, transport: Dict, accommodation: Dict,
                               duration: int, sustainability_pref: str) -> Dict:
        """
        Evaluate the sustainability of the travel plan.
        
        Args:
            transport: Transport details from Budget Agent
            accommodation: Accommodation details from Budget Agent
            duration: Trip duration in days
            sustainability_pref: User's sustainability preference
            
        Returns:
            Dictionary with sustainability insights
        """
        # Calculate total carbon footprint
        transport_carbon = transport["carbon_footprint"]
        accommodation_carbon = accommodation["carbon_footprint"] * duration
        
        # Estimate carbon from activities and food
        # Eco-conscious travelers typically have lower activity carbon footprint
        activity_carbon = self._estimate_activity_carbon(duration, sustainability_pref)
        food_carbon = self._estimate_food_carbon(duration, sustainability_pref)
        
        total_carbon = transport_carbon + accommodation_carbon + activity_carbon + food_carbon
        
        # Calculate carbon savings compared to average
        savings = calculate_carbon_savings(total_carbon, self.average_trip_footprint)
        
        # Generate eco-friendly choices list
        eco_choices = self._identify_eco_choices(transport, accommodation, sustainability_pref)
        
        # Calculate sustainability score
        score = self._calculate_sustainability_score(total_carbon, sustainability_pref)
        
        # Generate comparison message
        if savings["percentage"] > 0:
            comparison = f"{savings['percentage']}% lower than average trip"
        else:
            comparison = f"{abs(savings['percentage'])}% higher than average trip"
        
        return {
            "total_carbon_footprint": round(total_carbon, 2),
            "carbon_breakdown": {
                "transport": round(transport_carbon, 2),
                "accommodation": round(accommodation_carbon, 2),
                "activities": round(activity_carbon, 2),
                "food": round(food_carbon, 2)
            },
            "carbon_comparison": comparison,
            "eco_friendly_choices": eco_choices,
            "sustainability_score": score,
            "carbon_savings_kg": savings["savings_kg"]
        }
    
    def _estimate_activity_carbon(self, duration: int, sustainability_pref: str) -> float:
        """
        Estimate carbon footprint from activities.
        
        Assumptions:
        - High sustainability: Walking tours, public transport (5 kg CO2/day)
        - Medium sustainability: Mix of transport (10 kg CO2/day)
        - Low sustainability: Private transport, tours (15 kg CO2/day)
        """
        daily_carbon = {
            "High": 5.0,
            "Medium": 10.0,
            "Low": 15.0
        }
        
        return daily_carbon.get(sustainability_pref, 10.0) * duration
    
    def _estimate_food_carbon(self, duration: int, sustainability_pref: str) -> float:
        """
        Estimate carbon footprint from food consumption.
        
        Assumptions:
        - High sustainability: Plant-based, local food (3 kg CO2/day)
        - Medium sustainability: Mixed diet (6 kg CO2/day)
        - Low sustainability: Meat-heavy diet (10 kg CO2/day)
        """
        daily_carbon = {
            "High": 3.0,
            "Medium": 6.0,
            "Low": 10.0
        }
        
        return daily_carbon.get(sustainability_pref, 6.0) * duration
    
    def _identify_eco_choices(self, transport: Dict, accommodation: Dict,
                             sustainability_pref: str) -> List[str]:
        """
        Identify and list eco-friendly choices made in the plan.
        """
        choices = []
        
        # Transport choices
        if transport["mode"] in ["Train", "Bus"]:
            choices.append(f"{transport['mode']} travel (low carbon footprint)")
        
        # Accommodation choices
        if "Eco" in accommodation["sustainability_rating"]:
            choices.append(f"{accommodation['sustainability_rating']} accommodation")
        
        # Preference-based choices
        if sustainability_pref == "High":
            choices.extend([
                "Plant-based meal options recommended",
                "Walking and public transport prioritized",
                "Local and sustainable activities selected"
            ])
        elif sustainability_pref == "Medium":
            choices.extend([
                "Balanced approach to transport",
                "Mix of sustainable and standard options"
            ])
        
        return choices
    
    def _calculate_sustainability_score(self, total_carbon: float,
                                       sustainability_pref: str) -> str:
        """
        Calculate an overall sustainability score.
        
        Score based on total carbon footprint:
        - Excellent: < 200 kg CO2
        - Very Good: 200-300 kg CO2
        - Good: 300-400 kg CO2
        - Fair: 400-500 kg CO2
        - Poor: > 500 kg CO2
        """
        if total_carbon < 200:
            return "Excellent"
        elif total_carbon < 300:
            return "Very Good"
        elif total_carbon < 400:
            return "Good"
        elif total_carbon < 500:
            return "Fair"
        else:
            return "Needs Improvement"
    
    def get_sustainability_recommendations(self, sustainability_pref: str) -> List[str]:
        """
        Generate personalized sustainability recommendations.
        
        Args:
            sustainability_pref: User's sustainability preference
            
        Returns:
            List of recommendations
        """
        recommendations = []
        
        if sustainability_pref == "High":
            recommendations = [
                "Consider carbon offset programs for your trip",
                "Pack reusable water bottles and shopping bags",
                "Choose restaurants with local, organic ingredients",
                "Use public transportation and walk when possible",
                "Support local eco-tourism initiatives"
            ]
        elif sustainability_pref == "Medium":
            recommendations = [
                "Try to use public transport for at least half your trips",
                "Choose accommodations with recycling programs",
                "Reduce single-use plastics during your trip",
                "Support local businesses and artisans"
            ]
        else:  # Low
            recommendations = [
                "Consider bringing a reusable water bottle",
                "Turn off lights and AC when leaving your room",
                "Try local public transport at least once"
            ]
        
        return recommendations
