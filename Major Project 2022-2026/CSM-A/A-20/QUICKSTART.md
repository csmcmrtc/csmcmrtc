# 🚀 Quick Start Guide

## For First-Time Setup

### Step 1: Run Setup
```bash
setup.bat
```

This will:
- Create a virtual environment
- Install all dependencies
- Create a `.env` file

### Step 2: Add Your API Key

1. Get your Gemini API key from: https://makersuite.google.com/app/apikey
2. Open `.env` file
3. Replace `your_gemini_api_key_here` with your actual API key:
   ```
   GEMINI_API_KEY=AIzaSy...your_actual_key_here
   ```

### Step 3: Start the Application
```bash
start.bat
```

This will open:
- Backend API at http://localhost:8000
- Frontend UI at http://localhost:8501

---

## Manual Start (Alternative)

### Terminal 1 - Backend
```bash
venv\Scripts\activate
python -m backend.main
```

### Terminal 2 - Frontend
```bash
venv\Scripts\activate
streamlit run frontend/app.py
```

---

## Testing the API

Visit http://localhost:8000/docs for interactive API documentation.

Example API request:
```bash
curl -X POST "http://localhost:8000/generate-plan" \
  -H "Content-Type: application/json" \
  -d '{
    "destination": "Paris, France",
    "budget": 2000,
    "start_date": "2026-06-01",
    "end_date": "2026-06-07",
    "sustainability_preference": "High"
  }'
```

---

## Troubleshooting

### "Module not found" error
```bash
venv\Scripts\activate
pip install -r requirements.txt
```

### "Backend not running" in frontend
1. Make sure backend is started first
2. Check if port 8000 is available
3. Look for errors in backend terminal

### "Invalid API key" error
1. Verify your API key in `.env`
2. Make sure there are no extra spaces
3. Check API quota at https://makersuite.google.com/

---

## Project Structure Overview

```
travel_ai_agent/
├── backend/
│   ├── main.py              # FastAPI server
│   ├── schemas.py           # Data models
│   ├── utils.py             # LLM client & utilities
│   └── agents/              # AI Agents
│       ├── budget_agent.py
│       ├── sustainability_agent.py
│       ├── preference_agent.py
│       └── planner_agent.py
├── frontend/
│   └── app.py               # Streamlit UI
├── requirements.txt
├── .env                     # Your API keys (DO NOT COMMIT)
├── setup.bat               # Setup script
└── start.bat               # Start script
```

---

## Next Steps

1. ✅ Complete setup
2. ✅ Add API key
3. ✅ Start application
4. 🎯 Try planning a trip!
5. 📖 Read full README.md for details

---

**Need Help?** Check the full README.md for detailed documentation.
