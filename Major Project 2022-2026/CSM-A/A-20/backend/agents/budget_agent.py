"""
Budget Agent
Responsible for evaluating affordable transport and accommodation options
while ensuring the total cost stays within the user's budget.
"""

from typing import Dict, List
from backend.utils import get_destination_data, calculate_trip_duration


class BudgetAgent:
    """
    The Budget Agent analyzes user's budget constraints and recommends
    cost-effective travel options without compromising quality.
    """
    
    def __init__(self):
        self.name = "Budget Agent"
    
    def analyze_budget(self, destination: str, budget: float, start_date: str, 
                       end_date: str, sustainability_pref: str, 
                       group_size: int = 1, transport_pref: str = "Auto") -> Dict:
        """
        Analyze budget and recommend transport and accommodation options.
        
        Args:
            destination: Travel destination
            budget: User's maximum budget
            start_date: Trip start date
            end_date: Trip end date
            sustainability_pref: Sustainability preference (Low/Medium/High)
            group_size: Number of travelers
            transport_pref: Preferred transport mode
            
        Returns:
            Dictionary with budget analysis and recommendations
        """
        # Get destination data
        dest_data = get_destination_data(destination)
        
        # Calculate trip duration
        duration = calculate_trip_duration(start_date, end_date)
        
        # Determine transport mode based on budget and sustainability
        transport = self._select_transport(budget, sustainability_pref, dest_data, transport_pref)
        
        # Determine accommodation based on remaining budget
        remaining_budget = budget - transport["cost"]
        accommodation = self._select_accommodation(
            remaining_budget, duration, sustainability_pref, dest_data
        )
        
        # Calculate remaining budget for activities and food
        total_fixed_cost = transport["cost"] + accommodation["total_cost"]
        remaining_for_activities = budget - total_fixed_cost
        
        # Allocate remaining budget
        activities_budget = remaining_for_activities * 0.4  # 40% for activities
        food_budget = remaining_for_activities * 0.5  # 50% for food
        misc_budget = remaining_for_activities * 0.1  # 10% for miscellaneous
        
        return {
            "transport": transport,
            "accommodation": accommodation,
            "budget_allocation": {
                "transport": transport["cost"],
                "accommodation": accommodation["total_cost"],
                "activities": activities_budget,
                "food": food_budget,
                "miscellaneous": misc_budget,
                "total": budget
            },
            "total_cost": total_fixed_cost + remaining_for_activities, # This should be the same as budget if fully utilized
            "cost_per_person": budget / group_size if group_size > 0 else budget,
            "within_budget": total_fixed_cost <= budget,
            "budget_utilization": (total_fixed_cost / budget * 100) if budget > 0 else 0
        }
    
    def _select_transport(self, budget: float, sustainability_pref: str, 
                          dest_data: Dict, transport_pref: str = "Auto") -> Dict:
        """
        Select the most appropriate transport mode.
        """
        transport_options = dest_data["transport_options"]
        
        # Base cost for transport (estimated)
        base_cost = budget * 0.2  # Allocate 20% of budget to transport
        
        # Use user preference if specified and not "Auto"
        if transport_pref != "Auto" and transport_pref.lower() in transport_options:
            mode = transport_pref.capitalize()
            data = transport_options[transport_pref.lower()]
        elif sustainability_pref == "High":
            # Prefer train
            mode = "Train"
            data = transport_options["train"]
        elif sustainability_pref == "Medium":
            # Balance between cost and sustainability
            if budget > 1500:
                mode = "Train"
                data = transport_options["train"]
            else:
                mode = "Bus"
                data = transport_options["bus"]
        else:  # Low sustainability preference
            # Choose cheapest
            mode = "Bus"
            data = transport_options["bus"]
        
        cost = base_cost * data["cost_multiplier"]
        
        return {
            "mode": mode,
            "cost": round(cost, 2),
            "carbon_footprint": data["carbon"],
            "route": f"Origin to {dest_data.get('country', 'Destination')}",
            "duration": "Varies"  # Would be calculated with real API
        }
    
    def _select_accommodation(self, remaining_budget: float, duration: int,
                             sustainability_pref: str, dest_data: Dict) -> Dict:
        """
        Select appropriate accommodation based on budget and preferences.
        """
        # Calculate cost per night based on remaining budget
        # Allocate 50-60% of remaining budget to accommodation
        accommodation_budget = remaining_budget * 0.55
        cost_per_night = accommodation_budget / duration if duration > 0 else 0
        
        # Select accommodation type based on cost per night
        if cost_per_night > 150:
            acc_type = "Eco-Hotel"
            sustainability_rating = "Eco-certified"
            carbon_per_night = 8.0
        elif cost_per_night > 80:
            acc_type = "Hotel"
            sustainability_rating = "Standard" if sustainability_pref == "Low" else "Eco-friendly"
            carbon_per_night = 12.0 if sustainability_pref == "Low" else 10.0
        else:
            acc_type = "Hostel"
            sustainability_rating = "Basic"
            carbon_per_night = 6.0
        
        # Select a hotel name from destination data
        eco_hotels = dest_data.get("eco_hotels", ["Green Hotel"])
        hotel_name = eco_hotels[0] if sustainability_pref in ["High", "Medium"] else "Budget Stay"
        
        return {
            "name": hotel_name,
            "type": acc_type,
            "cost_per_night": round(cost_per_night, 2),
            "total_cost": round(cost_per_night * duration, 2),
            "sustainability_rating": sustainability_rating,
            "carbon_footprint": carbon_per_night
        }
    
    def get_cost_breakdown(self, budget_analysis: Dict) -> Dict:
        """
        Generate a detailed cost breakdown.
        
        Args:
            budget_analysis: Output from analyze_budget method
            
        Returns:
            Structured cost breakdown
        """
        allocation = budget_analysis["budget_allocation"]
        
        return {
            "transport": allocation["transport"],
            "accommodation": allocation["accommodation"],
            "activities": allocation["activities"],
            "food": allocation["food"],
            "miscellaneous": allocation["miscellaneous"],
            "total": allocation["total"]
        }
