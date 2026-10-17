"""
Preference Agent
Adapts the travel plan based on user preferences and constraints.
"""

from typing import Dict, List
from backend.utils import get_destination_data, calculate_trip_duration


class PreferenceAgent:
    """
    The Preference Agent customizes the travel plan based on user inputs
    and ensures all constraints are met.
    """
    
    def __init__(self):
        self.name = "Preference Agent"
    
    def customize_plan(self, destination: str, start_date: str, end_date: str,
                      budget: float, sustainability_pref: str,
                      budget_analysis: Dict) -> Dict:
        """
        Customize the travel plan based on user preferences.
        
        Args:
            destination: Travel destination
            start_date: Trip start date
            end_date: Trip end date
            budget: User's budget
            sustainability_pref: Sustainability preference
            budget_analysis: Output from Budget Agent
            
        Returns:
            Dictionary with customized activities and recommendations
        """
        # Get destination data
        dest_data = get_destination_data(destination)
        
        # Calculate trip duration
        duration = calculate_trip_duration(start_date, end_date)
        
        # Generate daily activities based on budget and preferences
        activities = self._generate_activities(
            dest_data, duration, budget_analysis["budget_allocation"]["activities"],
            sustainability_pref
        )
        
        # Generate personalized recommendations
        recommendations = self._generate_recommendations(
            destination, sustainability_pref, budget
        )
        
        return {
            "activities": activities,
            "recommendations": recommendations,
            "trip_style": self._determine_trip_style(budget, sustainability_pref),
            "packing_suggestions": self._get_packing_suggestions(sustainability_pref)
        }
    
    def _generate_activities(self, dest_data: Dict, duration: int,
                            activities_budget: float, sustainability_pref: str) -> List[Dict]:
        """
        Generate day-by-day activities based on destination and preferences.
        """
        activities = []
        popular_activities = dest_data.get("popular_activities", [])
        
        # Calculate cost per day for activities
        cost_per_day = activities_budget / duration if duration > 0 else 0
        
        for day in range(1, duration + 1):
            # Select activities for this day
            # For simplicity, rotate through popular activities
            day_activities = []
            
            if day == 1:
                # Arrival day - lighter activities
                day_activities = ["Check-in and settle", "Explore neighborhood", "Welcome dinner"]
                estimated_cost = cost_per_day * 0.5
            elif day == duration:
                # Departure day
                day_activities = ["Last-minute shopping", "Farewell lunch", "Departure"]
                estimated_cost = cost_per_day * 0.6
            else:
                # Full activity days
                # Select 2-3 activities from popular list
                start_idx = ((day - 2) * 2) % len(popular_activities)
                selected = popular_activities[start_idx:start_idx + 2]
                if len(selected) < 2 and popular_activities:
                    selected.append(popular_activities[0])
                
                day_activities = selected
                
                # Add sustainability-based activities
                if sustainability_pref == "High":
                    day_activities.append("Eco-friendly local experience")
                
                estimated_cost = cost_per_day
            
            activities.append({
                "day": day,
                "activities": day_activities,
                "estimated_cost": round(estimated_cost, 2)
            })
        
        return activities
    
    def _generate_recommendations(self, destination: str, sustainability_pref: str,
                                 budget: float) -> List[str]:
        """
        Generate personalized travel recommendations.
        """
        recommendations = []
        
        # Budget-based recommendations
        if budget > 2000:
            recommendations.append("Consider upgrading to premium experiences")
            recommendations.append("Book guided tours for deeper cultural insights")
        elif budget < 1000:
            recommendations.append("Look for free walking tours")
            recommendations.append("Visit public parks and free museums")
        
        # Sustainability-based recommendations
        if sustainability_pref == "High":
            recommendations.extend([
                "Bring reusable containers and utensils",
                "Choose bike rentals for local exploration",
                "Visit farmers' markets for local produce"
            ])
        
        # General recommendations
        recommendations.extend([
            "Book accommodations and activities in advance",
            "Learn basic local phrases",
            "Check visa requirements and travel insurance"
        ])
        
        return recommendations
    
    def _determine_trip_style(self, budget: float, sustainability_pref: str) -> str:
        """
        Determine the overall trip style based on preferences.
        """
        if sustainability_pref == "High":
            if budget > 2000:
                return "Luxury Eco-Tourism"
            elif budget > 1000:
                return "Sustainable Adventure"
            else:
                return "Budget Eco-Travel"
        elif sustainability_pref == "Medium":
            if budget > 2000:
                return "Comfortable Exploration"
            else:
                return "Balanced Travel"
        else:  # Low sustainability
            if budget > 2000:
                return "Luxury Getaway"
            else:
                return "Budget Adventure"
    
    def _get_packing_suggestions(self, sustainability_pref: str) -> List[str]:
        """
        Provide packing suggestions based on sustainability preference.
        """
        base_items = [
            "Comfortable walking shoes",
            "Weather-appropriate clothing",
            "Travel adapter",
            "First aid kit",
            "Important documents (passport, tickets)"
        ]
        
        if sustainability_pref in ["High", "Medium"]:
            eco_items = [
                "Reusable water bottle",
                "Cloth shopping bags",
                "Bamboo utensils",
                "Solid toiletries (shampoo bars, soap)",
                "Reusable food containers"
            ]
            return base_items + eco_items
        
        return base_items
