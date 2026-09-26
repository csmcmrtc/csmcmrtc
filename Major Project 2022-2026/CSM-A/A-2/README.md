# FoodBridge - AI-Powered Food Donation & Distribution Platform

**Department:** Computer Science and Machine Learning (CSM)  
**Academic Year:** 2022 - 2026  
**Batch / Section:** CSM-A  
**Team:** A-2  

---

## 📌 Project Overview
**FoodBridge** is a web-based, AI-driven food donation platform designed to connect food donors (individuals, restaurants, caterers) with recipient organizations (NGOs, shelters, community kitchens) to eliminate food waste and fight hunger. The platform integrates an intelligent chatbot assistant, real-time donation tracking, interactive dashboards, and donor/recipient management.

---

## 🚀 Key Features
- **AI Chatbot Assistance**: Interactive conversational agent guiding users through donation scheduling, eligibility checks, and common queries.
- **Donor Management**: Seamless donation listing for surplus cooked food, packaged goods, and grocery items with expiry alerts.
- **Recipient & NGO Matching**: Real-time notifications and matching algorithms for NGOs to claim and collect food supplies efficiently.
- **Interactive Dashboards**: Role-based dashboards for Donors, Organizations, and Administrators to monitor active donations, distribution history, and impact metrics.
- **Secure Authentication & RBAC**: Role-based access control protecting donor and NGO workflows.
- **Full-Stack Architecture**: React + TypeScript frontend paired with an Express.js & MySQL backend.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **Bundler:** Vite
- **Styling:** Tailwind CSS, Lucide React (Icons)
- **Machine Learning Client:** TensorFlow.js / MobileNet

### Backend
- **Runtime:** Node.js (Express.js)
- **Database:** MySQL (via `mysql2/promise` connection pooling)
- **Authentication & Security:** JWT (JSON Web Tokens), bcryptjs, Helmet, CORS
- **Real-Time Communication:** Socket.io

---

## 📁 Project Structure
```
Major Project 2022-2026/CSM-A/A-2/
├── backend/
│   ├── database/
│   │   └── schema.sql        # Database schema and initial seed data
│   ├── middleware/           # Auth and validation middlewares
│   ├── routes/               # API route handlers (users, donations, organizations)
│   ├── db.js                 # MySQL database connection pool
│   ├── package.json          # Backend dependencies
│   └── server.js             # Express API server entry point
├── src/
│   ├── components/           # UI components (Admin, Auth, Chat, Dashboard, Donations, Layout)
│   ├── services/             # Frontend API and service clients
│   ├── types/                # TypeScript interface definitions
│   ├── App.tsx               # Root application component
│   └── main.tsx              # Application entry point
├── public/                   # Static assets
├── index.html                # Main HTML template
├── package.json              # Frontend dependencies and scripts
├── tailwind.config.js        # Tailwind CSS configuration
├── vite.config.ts            # Vite build configuration
├── BACKEND_STRUCTURE.md      # Detailed backend architecture docs
├── MIGRATION_SUMMARY.md      # Database and migration summary
├── RUN_INSTRUCTIONS.md       # Step-by-step execution guide
└── SETUP_INSTRUCTIONS.md     # MySQL & environment setup instructions
```

---

## ⚙️ Getting Started

### 1. Database Setup (MySQL / XAMPP)
1. Start **Apache** and **MySQL** services in the XAMPP Control Panel.
2. Open phpMyAdmin (`http://localhost/phpmyadmin`) or MySQL CLI.
3. Import and execute the SQL script in `backend/database/schema.sql` to initialize the `foodbridge` database and tables.

### 2. Backend Setup
```bash
cd backend
npm install
npm start
```
The backend server runs on `http://localhost:5000`.

### 3. Frontend Setup
```bash
# In the root project directory (A-2)
npm install
npm run dev
```
Open `http://localhost:5173` to access the application.

---

## 📄 Documentation
For detailed setup instructions and API routes, please refer to:
- [RUN_INSTRUCTIONS.md](RUN_INSTRUCTIONS.md)
- [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md)
- [BACKEND_STRUCTURE.md](BACKEND_STRUCTURE.md)
