# 🌍 AI-Agent Platform for Sustainable and Budget-Friendly Travel Planning

An intelligent travel planning platform that uses **AI-Agent architecture** to generate personalized, sustainable, and budget-optimized travel itineraries. Built with **FastAPI**, **React (Vite)**, and **Google Gemini 2.5 Flash**.

![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109.0-green.svg)
![React](https://img.shields.io/badge/React-18.2-61DAFB.svg?logo=react)
![Vite](https://img.shields.io/badge/Vite-5.0-646CFF.svg?logo=vite)
![Gemini](https://img.shields.io/badge/Gemini-2.5_Flash-4285F4.svg?logo=google)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [AI-Agent Architecture](#ai-agent-architecture)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [How to Run](#how-to-run)
- [API Documentation](#api-documentation)
- [Example Usage](#example-usage)
- [Future Enhancements](#future-enhancements)

---

## 🎯 Overview

This platform helps users plan their trips by optimizing three key factors:

1. **💰 Budget** — Stays within user's financial constraints (all costs in **INR ₹**)
2. **🌱 Sustainability** — Minimizes carbon footprint and promotes eco-friendly choices
3. **🎨 Preferences** — Customizes based on group size, transport, and trip style

The system uses a **multi-agent AI architecture** where specialized agents collaborate to create the perfect travel plan, powered by a single direct LLM call via `Agent.py`.

---

## ✨ Features

### User Features
- 📍 **Destination-based Planning** — Plan trips to any destination worldwide
- 💵 **Budget Optimization** — Get the best value within your budget (INR ₹)
- 👥 **Group Travel Support** — Plans for individuals or groups with per-person cost breakdown
- 🚗 **Transport Preference** — Choose your preferred mode of transport
- 🌿 **Sustainability Scoring** — Track and minimize your carbon footprint
- 📅 **Flexible Date Selection** — Choose your preferred travel dates
- 🗓️ **Day-by-Day Itinerary** — Detailed daily activity plans with weather info
- 📊 **Cost Breakdown** — Transparent breakdown of all expenses
- 🎥 **Vlog Suggestions** — YouTube-style vlog ideas for your trip
- 🤖 **AI Explanations** — Understand why specific choices were made

### Technical Features
- 🔄 **Multi-Agent System** — Specialized agents for Budget, Sustainability, and Preference
- 🚀 **RESTful API** — Clean, documented FastAPI backend
- ⚛️ **React Frontend** — Fast, modern UI built with Vite + Framer Motion
- 🧠 **LLM Integration** — Powered by Gemini 2.5 Flash (JSON-structured output)
- ✅ **Input Validation** — Comprehensive error handling on both frontend & backend
- 📦 **Modular Design** — Easy to extend and maintain

---

## 🛠️ Tech Stack

### Backend
| Tool | Purpose |
|---|---|
| **FastAPI** | Modern, fast REST API framework |
| **Uvicorn** | ASGI server |
| **Pydantic v2** | Data validation & schema definition |
| **python-dotenv** | Environment variable management |
| **Google Generative AI** | Gemini 2.5 Flash LLM |

### Frontend
| Tool | Purpose |
|---|---|
| **React 18** | UI component library |
| **Vite 5** | Fast dev server & bundler |
| **Framer Motion** | Animations |
| **Lucide React** | Icons |
| **Axios** | HTTP client |
| **React Router DOM** | Client-side routing |

---

## 🤖 AI-Agent Architecture

The platform uses a **collaborative multi-agent system** where each agent has a specific responsibility, and the results are passed to a single Gemini LLM call via `Agent.py`:

```
┌─────────────────────────────────────────────────────────┐
│                    User Request                         │
│  (Destination, Budget, Dates, Group Size, Transport)   │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
┌────────────────┐      ┌────────────────────┐
│  Budget Agent  │      │ Sustainability Agent│
│ - Transport    │      │ - Carbon calc      │
│ - Accommodation│      │ - Eco choices      │
│ - Cost alloc   │      │ - Green score      │
│ - Group cost   │      └─────────┬──────────┘
└───────┬────────┘                │
        └──────────┬──────────────┘
                   │
                   ▼
       ┌───────────────────────┐
       │   Preference Agent    │
       │  - Activities         │
       │  - Customization      │
       │  - Recommendations    │
       └───────────┬───────────┘
                   │
                   ▼
       ┌───────────────────────┐
       │     Agent.py          │
       │  (Gemini 2.5 Flash)   │
       │  - JSON itinerary     │
       │  - Structured output  │
       └───────────┬───────────┘
                   │
                   ▼
       ┌───────────────────────┐
       │   TravelPlanNew       │
       │   (Pydantic Schema)   │
       └───────────────────────┘
```

### Agent Responsibilities

| Agent | File | Role |
|---|---|---|
| **Budget Agent** | `budget_agent.py` | Transport selection, accommodation, cost allocation, group totals |
| **Sustainability Agent** | `sustainability_agent.py` | Carbon footprint, eco-score, green alternatives |
| **Preference Agent** | `preference_agent.py` | Daily activities, packing tips, personalization |
| **LLM Agent** | `Agent.py` | Calls Gemini 2.5 Flash, returns structured JSON travel plan |

---

## 📁 Project Structure

```
Travel_Agent/
│
├── backend/                          # FastAPI backend
│   ├── main.py                      # App entry point, API routes
│   ├── Agent.py                     # Core Gemini LLM call (ai_review)
│   ├── schemas.py                   # Pydantic models (TravelRequest, TravelPlanNew)
│   ├── utils.py                     # LLM client utility
│   └── agents/                      # AI Agent modules
│       ├── __init__.py
│       ├── budget_agent.py          # Budget optimization agent
│       ├── sustainability_agent.py  # Sustainability evaluation agent
│       ├── preference_agent.py      # Preference customization agent
│       └── planner_agent.py         # Legacy orchestrator (kept for reference)
│
├── frontend-react/                   # React + Vite frontend
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── main.jsx
│       ├── App.jsx                  # Main app component with tabs
│       ├── index.css                # Global styles
│       └── components/              # UI components
│           ├── CostBreakdown.jsx
│           ├── Itinerary.jsx
│           ├── LoadingSpinner.jsx
│           ├── Sustainability.jsx
│           ├── TransportAccommodation.jsx
│           └── Vlogs.jsx
│
├── requirements.txt                  # Python dependencies
├── .env.example                     # Environment variables template
├── .env                             # Your local env file (NOT committed)
├── setup.bat                        # Full setup script (venv + pip + npm)
├── setup_react.bat                  # React frontend setup
├── start_full_app.bat               # Launches backend + frontend together
├── start_react.bat                  # Starts React dev server only
├── start.bat                        # Starts backend only
└── README.md                        # This file
```

---

## 🚀 Setup Instructions

### Prerequisites

- **Python 3.8+**
- **Node.js 18+** and **npm**
- **Gemini API Key** → Get it from [Google AI Studio](https://aistudio.google.com/app/apikey)
- **Git**

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/Travel_Agent.git
cd Travel_Agent
```

### Step 2: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   copy .env.example .env
   ```

2. Edit `.env` and add your API key:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   LLM_PROVIDER=gemini
   BACKEND_HOST=localhost
   BACKEND_PORT=8000
   FRONTEND_PORT=8501
   ```

3. **Get your Gemini API Key:**
   - Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Sign in with your Google account
   - Click **"Create API Key"**
   - Paste it into `.env`

### Step 3: Install Backend Dependencies

```bash
# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate       # Windows
# source venv/bin/activate  # macOS/Linux

# Install Python packages
pip install -r requirements.txt
```

### Step 4: Install Frontend Dependencies

```bash
cd frontend-react
npm install
cd ..
```

---

## 🎮 How to Run

### ✅ Recommended: One-Click Launch (Windows)

Run both backend and React frontend simultaneously:

```bash
start_full_app.bat
```

This opens:
- **Backend API** → `http://localhost:8000`
- **React Frontend** → `http://localhost:5173`

---

### Manual Launch

#### Terminal 1 — Backend

```bash
venv\Scripts\activate
python -m backend.main
```

You should see:
```
============================================================
Starting AI Travel Planning API
Server: http://localhost:8000
Docs:   http://localhost:8000/docs
============================================================
```

#### Terminal 2 — React Frontend

```bash
cd frontend-react
npm run dev
```

You should see:
```
  VITE v5.x  ready in xxx ms
  ➜  Local:   http://localhost:5173/
```

---

## 📚 API Documentation

### Base URL
```
http://localhost:8000
```

### Endpoints

#### `GET /` — Root
Returns basic API info.

#### `GET /health` — Health Check
```json
{
  "status": "healthy",
  "message": "AI Travel Planning API is running successfully"
}
```

#### `POST /generate-plan` — Generate Travel Plan

**Request Body:**
```json
{
  "destination": "Goa, India",
  "budget": 50000.0,
  "start_date": "2026-06-01",
  "end_date": "2026-06-07",
  "sustainability_preference": "High",
  "group_size": 2,
  "transport_preference": "Train"
}
```

**Response:** A `TravelPlanNew` object containing:
- `trip_summary` — Destination, dates, total budget (INR), per-person cost
- `daily_itinerary` — Day-by-day activities with weather
- `cost_breakdown` — Transport, accommodation, food, activities
- `sustainability` — Carbon score, eco-tips
- `transport_accommodation` — Selected options with prices
- `vlogs` — Video content ideas for the trip

> 📖 Visit `http://localhost:8000/docs` for **live Swagger UI** where you can test all endpoints.

---

## 💡 Example Usage

### Budget Trip — Goa, India

| Field | Value |
|---|---|
| Destination | Goa, India |
| Budget | ₹30,000 |
| Dates | 2026-06-01 → 2026-06-05 |
| Group | 2 people |
| Transport | Bus |
| Sustainability | Medium |

**Output highlights:**
- 🚌 Bus transport selected (low cost, low carbon)
- 🏨 Budget guesthouse near beach
- 🌊 Free beach activities + local food
- 💚 Sustainability Score: Good
- 💰 Cost per person: ₹15,000

---

### Eco Luxury Trip — Manali, Himachal Pradesh

| Field | Value |
|---|---|
| Destination | Manali, HP |
| Budget | ₹1,20,000 |
| Dates | 2026-07-10 → 2026-07-17 |
| Group | 4 people |
| Transport | Train |
| Sustainability | High |

**Output highlights:**
- 🚂 Train (lowest carbon footprint)
- 🏔️ Eco-certified mountain resort
- 🥾 Trekking, local cultural tours
- 💚 Sustainability Score: Excellent
- 💰 Cost per person: ₹30,000

---

## 🔮 Future Enhancements

### Short-term
- [ ] Real travel API integration (flight prices, hotels)
- [ ] User authentication & saved plans
- [ ] PDF export of itinerary
- [ ] Email itinerary delivery

### Medium-term
- [ ] Multi-city trip planning
- [ ] Real-time weather integration
- [ ] Currency conversion (multi-currency support)
- [ ] Interactive map view

### Long-term
- [ ] Mobile app (React Native)
- [ ] Social sharing & community reviews
- [ ] AI chatbot for post-plan Q&A
- [ ] Direct booking integration

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 👨‍💻 Author

Built with ❤️ as a demonstration of AI-Agent architecture for sustainable travel planning.

---

## 🙏 Acknowledgments

- **Google Gemini** — Powerful and fast LLM capabilities
- **FastAPI** — Excellent Python API framework
- **React + Vite** — Lightning-fast modern frontend tooling
- **Framer Motion** — Smooth UI animations

---

## 📞 Support & Troubleshooting

| Issue | Fix |
|---|---|
| Backend not starting | Check port 8000 is free; verify Python 3.8+ |
| `GEMINI_API_KEY` error | Ensure `.env` file exists with your key |
| Frontend not loading | Run `npm install` inside `frontend-react/` first |
| CORS errors | Backend must be running before opening the frontend |
| LLM quota error | Check your Gemini API usage at [AI Studio](https://aistudio.google.com) |
| Date validation error | Dates must be `YYYY-MM-DD` format and not in the past |

---
## Sreenshots
<img width="1919" height="1017" alt="Screenshot 2026-01-22 211902" src="https://github.com/user-attachments/assets/2a4a3847-649b-46f0-95de-5e93294053b2" />
<img width="1915" height="846" alt="Screenshot 2026-01-22 211923" src="https://github.com/user-attachments/assets/7f1a23d8-1fdf-4130-9528-e5b79128d0c7" />
<img width="1910" height="856" alt="Screenshot 2026-01-22 213218" src="https://github.com/user-attachments/assets/d91bd5b1-9779-4ce7-bcb4-6c0e184d66ac" />
<img width="1887" height="838" alt="Screenshot 2026-01-22 213320" src="https://github.com/user-attachments/assets/cf15dca6-523d-4691-8b54-1106dc7ab957" />
<img width="1887" height="843" alt="Screenshot 2026-01-22 213414" src="https://github.com/user-attachments/assets/e4312a36-7c65-43c4-8937-2166c2560a34" />
<img width="1895" height="844" alt="Screenshot 2026-01-22 213434" src="https://github.com/user-attachments/assets/1f129116-615b-4b80-b9cd-5cd55359c50f" />
<img width="1891" height="851" alt="Screenshot 2026-01-22 213457" src="https://github.com/user-attachments/assets/6dd953ff-093b-40d6-bee6-21a5e64ff28e" />
<img width="1891" height="850" alt="Screenshot 2026-01-22 213519" src="https://github.com/user-attachments/assets/383bdd3f-65d8-4750-9a46-ea12584c5f20" />

---
**Happy Traveling! ✈️🌍**
