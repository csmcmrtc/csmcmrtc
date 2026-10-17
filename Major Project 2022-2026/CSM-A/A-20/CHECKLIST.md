# 🎯 Setup and Run Checklist

## ✅ Pre-Flight Checklist

### System Requirements
- [ ] Windows OS
- [ ] Python 3.8 or higher installed
- [ ] Internet connection (for API calls)
- [ ] Gemini API key (get from https://makersuite.google.com/app/apikey)

---

## 📋 Setup Steps (First Time Only)

### Step 1: Initial Setup
```bash
# Run the setup script
setup.bat
```

**What this does:**
- Creates virtual environment
- Installs all dependencies
- Creates .env file

**Expected output:**
```
Setup completed successfully!
```

### Step 2: Configure API Key

1. Open `.env` file in a text editor
2. Find this line:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
3. Replace `your_gemini_api_key_here` with your actual API key
4. Save the file

**Example:**
```
GEMINI_API_KEY=AIzaSyABC123...your_actual_key
```

### Step 3: Verify Setup (Optional but Recommended)
```bash
# Activate virtual environment
venv\Scripts\activate

# Run test script
python test_setup.py
```

**Expected output:**
```
🎉 All tests passed! Your setup is complete.
```

---

## 🚀 Running the Application

### Option 1: Automated Start (Recommended)
```bash
start.bat
```

This will:
1. Activate virtual environment
2. Start backend server (http://localhost:8000)
3. Start frontend app (http://localhost:8501)
4. Open two terminal windows

**Wait for:**
- Backend: "Application startup complete"
- Frontend: "You can now view your Streamlit app"

### Option 2: Manual Start

**Terminal 1 - Backend:**
```bash
venv\Scripts\activate
python -m backend.main
```

**Terminal 2 - Frontend:**
```bash
venv\Scripts\activate
streamlit run frontend/app.py
```

---

## 🧪 Testing the Application

### 1. Check Backend Health
Open browser: http://localhost:8000/health

**Expected response:**
```json
{
  "status": "healthy",
  "message": "AI Travel Planning API is running successfully"
}
```

### 2. Check API Documentation
Open browser: http://localhost:8000/docs

**You should see:**
- Swagger UI interface
- Two endpoints: `/health` and `/generate-plan`

### 3. Test Frontend
Open browser: http://localhost:8501

**You should see:**
- "AI Travel Planner" header
- Input form in sidebar
- Welcome message in main area

### 4. Generate a Test Plan

**In the frontend:**
1. Enter destination: "Paris, France"
2. Set budget: $2000
3. Select dates: 30 days from today, 6 days duration
4. Choose sustainability: "Medium"
5. Click "Generate Travel Plan"

**Expected result:**
- Loading spinner appears
- Plan generates in 10-30 seconds
- Five tabs appear with results
- No errors in console

---

## 🔍 Troubleshooting

### Problem: "Python not found"
**Solution:**
```bash
# Install Python 3.8+ from python.org
# Make sure to check "Add Python to PATH" during installation
```

### Problem: "Module not found"
**Solution:**
```bash
venv\Scripts\activate
pip install -r requirements.txt
```

### Problem: "Backend not running" in frontend
**Solution:**
1. Check if backend terminal shows errors
2. Make sure port 8000 is not in use
3. Restart backend server

### Problem: "Invalid API key"
**Solution:**
1. Verify API key in `.env` file
2. No extra spaces or quotes
3. Get new key from https://makersuite.google.com/app/apikey

### Problem: "Request timeout"
**Solution:**
1. Check internet connection
2. Gemini API might be slow - wait longer
3. Check API quota limits

### Problem: Port already in use
**Solution:**
```bash
# Change port in .env file
BACKEND_PORT=8001
FRONTEND_PORT=8502
```

---

## 📊 Success Indicators

### Backend Running Successfully
- ✅ Terminal shows "Application startup complete"
- ✅ http://localhost:8000/health returns 200 OK
- ✅ http://localhost:8000/docs shows Swagger UI
- ✅ No error messages in terminal

### Frontend Running Successfully
- ✅ Terminal shows "You can now view your Streamlit app"
- ✅ http://localhost:8501 loads the interface
- ✅ "Backend server is running" message (not error)
- ✅ Input form is interactive

### Integration Working
- ✅ Can submit travel plan request
- ✅ Loading spinner appears
- ✅ Results display in tabs
- ✅ All data populated (no "None" or errors)
- ✅ Can download JSON

---

## 🎓 Usage Tips

### Best Practices
1. **Always start backend before frontend**
2. **Wait for backend to fully start** (3-5 seconds)
3. **Keep both terminals open** while using the app
4. **Check console for errors** if something doesn't work

### Sample Test Inputs

**Budget Trip:**
- Destination: London, UK
- Budget: $1000
- Duration: 4 days
- Sustainability: Low

**Eco Trip:**
- Destination: Paris, France
- Budget: $3000
- Duration: 7 days
- Sustainability: High

**Balanced Trip:**
- Destination: Tokyo, Japan
- Budget: $2000
- Duration: 6 days
- Sustainability: Medium

---

## 📞 Getting Help

### Check These First
1. **Console logs** - Look for error messages
2. **API docs** - http://localhost:8000/docs
3. **README.md** - Full documentation
4. **PROJECT_SUMMARY.md** - Project overview

### Common Questions

**Q: How long does plan generation take?**
A: 10-30 seconds depending on LLM response time

**Q: Can I use OpenAI instead of Gemini?**
A: Yes, set `LLM_PROVIDER=openai` in `.env` and add `OPENAI_API_KEY`

**Q: Is my API key secure?**
A: Yes, it's stored locally in `.env` (not committed to git)

**Q: Can I modify the agents?**
A: Yes, edit files in `backend/agents/` directory

---

## ✨ You're Ready!

If you've completed all steps and tests pass, you're ready to use the AI Travel Planning Platform!

**Next Steps:**
1. ✅ Start the application
2. ✅ Generate your first travel plan
3. ✅ Explore different destinations and preferences
4. ✅ Review the code to understand the architecture

**Happy Planning! ✈️🌍**
