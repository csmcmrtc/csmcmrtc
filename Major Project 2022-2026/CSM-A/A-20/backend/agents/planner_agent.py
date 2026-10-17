"""
Planner Agent
Orchestrates all other agents and generates the final travel plan using LLM.
"""

from typing import Dict
from backend.agents.budget_agent import BudgetAgent
from backend.agents.sustainability_agent import SustainabilityAgent
from backend.agents.preference_agent import PreferenceAgent
from backend.utils import LLMClient, calculate_trip_duration
from backend.schemas import (
    TravelRequest, TravelPlan, TransportOption, AccommodationOption,
    ActivityOption, CostBreakdown, SustainabilityInsights
)


class PlannerAgent:
    """
    The Planner Agent is the orchestrator that coordinates all other agents
    and uses the LLM to generate a comprehensive, natural-language travel itinerary.
    """
    
    def __init__(self):
        self.name = "Planner Agent"
        self.budget_agent = BudgetAgent()
        self.sustainability_agent = SustainabilityAgent()
        self.preference_agent = PreferenceAgent()
        self.llm_client = LLMClient()
    
    def generate_travel_plan(self, request: TravelRequest) -> TravelPlan:
        """
        Main method to generate a complete travel plan.
        """
        # Step 1: Budget Agent analyzes budget constraints
        print(f"[{self.budget_agent.name}] Analyzing budget...")
        budget_analysis = self.budget_agent.analyze_budget(
            destination=request.destination,
            budget=request.budget,
            start_date=request.start_date,
            end_date=request.end_date,
            sustainability_pref=request.sustainability_preference,
            group_size=request.group_size,
            transport_pref=request.transport_preference
        )
        
        # Step 2: Sustainability Agent evaluates environmental impact
        print(f"[{self.sustainability_agent.name}] Evaluating sustainability...")
        duration = calculate_trip_duration(request.start_date, request.end_date)
        sustainability_analysis = self.sustainability_agent.evaluate_sustainability(
            transport=budget_analysis["transport"],
            accommodation=budget_analysis["accommodation"],
            duration=duration,
            sustainability_pref=request.sustainability_preference
        )
        
        # Step 3: Preference Agent customizes the plan
        print(f"[{self.preference_agent.name}] Customizing preferences...")
        preference_analysis = self.preference_agent.customize_plan(
            destination=request.destination,
            start_date=request.start_date,
            end_date=request.end_date,
            budget=request.budget,
            sustainability_pref=request.sustainability_preference,
            budget_analysis=budget_analysis
        )
        
        # Step 4: Generate natural language itinerary using LLM
        print(f"[{self.name}] Generating itinerary with LLM...")
        itinerary = self._generate_itinerary_with_llm(
            request, budget_analysis, sustainability_analysis, preference_analysis, duration
        )
        
        # Step 5: Generate AI explanation
        print(f"[{self.name}] Generating AI explanation...")
        explanation = self._generate_explanation_with_llm(
            request, budget_analysis, sustainability_analysis, preference_analysis
        )
        
        # Step 6: Structure the complete travel plan
        travel_plan = self._structure_travel_plan(
            request=request,
            duration=duration,
            itinerary=itinerary,
            explanation=explanation,
            budget_analysis=budget_analysis,
            sustainability_analysis=sustainability_analysis,
            preference_analysis=preference_analysis
        )
        
        print(f"[{self.name}] Travel plan generated successfully!")
        return travel_plan
    
    def _generate_itinerary_with_llm(self, request: TravelRequest,
                                     budget_analysis: Dict,
                                     sustainability_analysis: Dict,
                                     preference_analysis: Dict,
                                     duration: int) -> str:
        """
        Use LLM to generate a natural language itinerary.
        """
        # Prepare structured data for the LLM
        activities_summary = "\n".join([
            f"Day {act['day']}: {', '.join(act['activities'])} (Cost: ${act['estimated_cost']:.2f})"
            for act in preference_analysis["activities"]
        ])
        
        prompt = f"""
You are an intelligent AI travel assistant designed to help users plan budget-friendly, personalized, and well-coordinated trips, including group travel management.

Your role is to act like a smart travel planner that simplifies end-to-end trip planning by analyzing user inputs, optimizing costs, and automating coordination.

🧳 Trip Details

Destination / Starting Location: {request.destination}
Travel Duration: {duration} days ({request.start_date} to {request.end_date})
Total Budget: ${request.budget:.2f}
Transport Preference: {request.transport_preference}
Sustainability Preference: {request.sustainability_preference}
Group Size: {request.group_size}

� Transportation Recommendation

Mode: {budget_analysis['transport']['mode']}

Route: {budget_analysis['transport']['route']}

Estimated Cost: ${budget_analysis['transport']['cost']:.2f}

Reason for selection: Budget efficiency and convenience

🏨 Accommodation Recommendation

Name: {budget_analysis['accommodation']['name']}

Type: {budget_analysis['accommodation']['type']}

Cost per night: ${budget_analysis['accommodation']['cost_per_night']:.2f}

Suitable for group stay: Yes

Sustainability Rating (if available): {budget_analysis['accommodation']['sustainability_rating']}

🎯 Suggested Activities & Attractions

{activities_summary}

💰 Group Cost Management

Estimated total trip cost: ${budget_analysis['total_cost']:.2f}

Cost per person: ${budget_analysis['cost_per_person']:.2f}

Payment method supported: UPI / Wallet / Manual tracking

Payment status tracking enabled

🧭 Travel Style

{preference_analysis['trip_style']}

✨ Instructions for Itinerary Generation

Create a clear, friendly, and practical day-by-day itinerary that:

Breaks the trip into Day 1, Day 2, etc and activities and famous places to visit in {request.destination}.

Includes morning, afternoon, and evening activities and famous places to visit in {request.destination}.

Suggests local food options (budget-friendly where possible)

Keeps activities realistic for group travel

Mentions transport between locations

Respects budget limits

Feels helpful for first-time or inexperienced travelers

Keep the tone human, simple, and engaging, as if assisting a real user.
Avoid overly technical language.
"""
        
        try:
            itinerary = self.llm_client.generate_text(prompt, max_tokens=2000)
            return itinerary
        except Exception as e:
            # Fallback to structured itinerary if LLM fails
            print(f"LLM generation failed: {e}. Using fallback itinerary.")
            return self._generate_fallback_itinerary(request, preference_analysis, duration)
    
    def _generate_explanation_with_llm(self, request: TravelRequest,
                                       budget_analysis: Dict,
                                       sustainability_analysis: Dict,
                                       preference_analysis: Dict) -> str:
        """
        Use LLM to generate an explanation of why these choices were made.
        """
        prompt = f"""
You are an AI travel assistant explaining your planning decisions to the user in a simple and friendly way.

👤 User Information

Destination: {request.destination}

Budget: ${request.budget:.2f}

Group Size: {request.group_size}

Transport Preference: {request.transport_preference}

Sustainability Preference: {request.sustainability_preference}

🤖 Planning Decisions

Transportation chosen: {budget_analysis['transport']['mode']} (${budget_analysis['transport']['cost']:.2f})

Accommodation selected: {budget_analysis['accommodation']['name']} (${budget_analysis['accommodation']['cost_per_night']:.2f}/night)

Total Trip Cost: ${budget_analysis['total_cost']:.2f}

Cost per person: ${budget_analysis['cost_per_person']:.2f}

📝 Explanation Guidelines

Write a short and easy-to-understand explanation (4–5 sentences) covering:

Why this transport option fits the group and budget

Why the accommodation is suitable for group travel

How the trip stays within budget

How cost splitting makes group travel easier

Any sustainability benefits (if applicable)

Tone should be friendly, reassuring, and user-focused, like a helpful travel guide.
"""
        
        try:
            explanation = self.llm_client.generate_text(prompt, max_tokens=500)
            return explanation
        except Exception as e:
            # Fallback explanation
            print(f"LLM explanation failed: {e}. Using fallback explanation.")
            return self._generate_fallback_explanation(request, budget_analysis, sustainability_analysis)
    
    def _structure_travel_plan(self, request: TravelRequest, duration: int,
                               itinerary: str, explanation: str,
                               budget_analysis: Dict, sustainability_analysis: Dict,
                               preference_analysis: Dict) -> TravelPlan:
        """
        Structure all the data into a TravelPlan object.
        """
        # Create transport option
        transport = TransportOption(
            mode=budget_analysis["transport"]["mode"],
            route=budget_analysis["transport"]["route"],
            cost=budget_analysis["transport"]["cost"],
            carbon_footprint=budget_analysis["transport"]["carbon_footprint"],
            duration=budget_analysis["transport"]["duration"]
        )
        
        # Create accommodation option
        accommodation = AccommodationOption(
            name=budget_analysis["accommodation"]["name"],
            type=budget_analysis["accommodation"]["type"],
            cost_per_night=budget_analysis["accommodation"]["cost_per_night"],
            total_cost=budget_analysis["accommodation"]["total_cost"],
            sustainability_rating=budget_analysis["accommodation"]["sustainability_rating"],
            carbon_footprint=budget_analysis["accommodation"]["carbon_footprint"]
        )
        
        # Create activity options
        activities = [
            ActivityOption(
                day=act["day"],
                activities=act["activities"],
                estimated_cost=act["estimated_cost"]
            )
            for act in preference_analysis["activities"]
        ]
        
        # Create cost breakdown
        cost_breakdown = CostBreakdown(
            transport=budget_analysis["budget_allocation"]["transport"],
            accommodation=budget_analysis["budget_allocation"]["accommodation"],
            activities=budget_analysis["budget_allocation"]["activities"],
            food=budget_analysis["budget_allocation"]["food"],
            miscellaneous=budget_analysis["budget_allocation"]["miscellaneous"],
            total=budget_analysis["budget_allocation"]["total"],
            cost_per_person=budget_analysis["cost_per_person"]
        )
        
        # Create sustainability insights
        sustainability_insights = SustainabilityInsights(
            total_carbon_footprint=sustainability_analysis["total_carbon_footprint"],
            carbon_comparison=sustainability_analysis["carbon_comparison"],
            eco_friendly_choices=sustainability_analysis["eco_friendly_choices"],
            sustainability_score=sustainability_analysis["sustainability_score"]
        )
        
        # Create and return the complete travel plan
        return TravelPlan(
            destination=request.destination,
            duration_days=duration,
            group_size=request.group_size,
            itinerary=itinerary,
            transport=transport,
            accommodation=accommodation,
            activities=activities,
            cost_breakdown=cost_breakdown,
            sustainability_insights=sustainability_insights,
            ai_explanation=explanation
        )
    
    def _generate_fallback_itinerary(self, request: TravelRequest,
                                     preference_analysis: Dict, duration: int) -> str:
        """
        Generate a simple fallback itinerary if LLM fails.
        """
        itinerary = f"# {duration}-Day Trip to {request.destination}\n\n"
        
        for activity in preference_analysis["activities"]:
            itinerary += f"## Day {activity['day']}\n"
            for act in activity["activities"]:
                itinerary += f"- {act}\n"
            itinerary += f"*Estimated cost: ${activity['estimated_cost']:.2f}*\n\n"
        
        return itinerary
    
    def _generate_fallback_explanation(self, request: TravelRequest,
                                       budget_analysis: Dict,
                                       sustainability_analysis: Dict) -> str:
        """
        Generate a simple fallback explanation if LLM fails.
        """
        return f"""Based on your budget of ${request.budget:.2f} and {request.sustainability_preference} sustainability preference, 
I've selected {budget_analysis['transport']['mode']} for transportation and {budget_analysis['accommodation']['type']} 
accommodation. This plan keeps your total carbon footprint at {sustainability_analysis['total_carbon_footprint']} kg CO2, 
which is {sustainability_analysis['carbon_comparison']}. The plan optimizes both cost and environmental impact."""
