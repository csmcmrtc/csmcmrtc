import os
from dotenv import load_dotenv
import google.generativeai as genai
import json

gemini_url='https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=GEMINI_API_KEY'
load_dotenv()
gemini_api = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=gemini_api)
def ai_review(place,budget,start_date,end_date,sustainability_pref,group_size,transport_pref) -> dict:

    model = genai.GenerativeModel("gemini-2.5-flash")
    prompt =f"""
Act as an expert AI Travel Planner. Your goal is to generate a highly structured travel itinerary in JSON format based on the user's input.

### USER INPUTS:
- Place: {place}
- Budget: {budget}
- Start Date: {start_date}
- End Date: {end_date}
- Sustainability Preference: {sustainability_pref}
- Group Size: {group_size}
- Transport Preference: {transport_pref}

### INSTRUCTIONS:
1. Generate a daily plan under "planned_days". Include famous landmarks, estimated costs for each activity, and a brief description.
2. Provide transport booking links (train, bus, flight) for the route, ensuring they match the user's budget and sustainability preferences.
3. Provide a weather report forecast for the specified dates.
4. Include YouTube Vlog links for the destination.The links should be working links not dummy links.
5. Use Indian Rupees (INR) for all currency and cost mentions.
6. Ensure the output is ONLY valid JSON. Do not include any conversational filler.

### JSON SCHEMA:
{{
  "trip_summary": {{
    "location": "",
    "total_budget": "",
    "sustainability_rating": "1-5"
  }},
  "planned_days": [
    {{
      "day": 1,
      "date": "YYYY-MM-DD",
      "weather": {{
        "temp": "",
        "condition": "",
        "precip_chance": ""
      }},
      "activities": [
        {{
          "time": "Morning/Afternoon/Evening",
          "place_name": "",
          "description": "",
          "estimated_cost": "",
          "sustainability_note": ""
        }}
      ],
      "daily_budget_total": ""
    }}
  ],
  "transport_options": [
    {{
      "type": "Flight/Train/Bus",
      "provider": "",
      "estimated_price": "",
      "booking_link": "",
      "eco_friendly": true
    }}
  ],
  "visual_resources": {{
    "youtube_vlogs": [
      {{
        "title": "",
        "url": ""
      }}
    ]
  }}
}}"""
    res = model.generate_content(prompt)
    print(res.text[7:-3])
    result=json.loads(res.text[7:-3])
    return result

if __name__ == "__main__":
    print(ai_review("paris",1000,"2022-01-01","2022-01-05","low",1,"train"))