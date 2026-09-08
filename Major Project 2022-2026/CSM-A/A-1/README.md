# JustSearch 🛒🔍

**Smart Price Comparison Platform for Local Stores and Delivery Apps**

JustSearch is a full-stack web application that helps consumers compare grocery and daily essential prices across local stores and popular delivery platforms (Swiggy Instamart, Zepto, Blinkit). Make informed purchasing decisions and save money on everyday shopping.

---

## 📋 Table of Contents

- [Objective](#-objective)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Running the Application](#-running-the-application)
- [API Endpoints](#-api-endpoints)
- [Database Schema](#-database-schema)

---

## 🎯 Objective

The main objective of JustSearch is to **empower consumers with price transparency** by:

1. **Comparing prices** across local neighborhood stores and online delivery platforms
2. **Finding nearby stores** within a 2km radius using location-based services
3. **Providing flexible shopping options** - online payment with pickup, delivery, or pay-at-store
4. **Helping users save money** by identifying the best deals available

---

## ✨ Features

### For Customers
- 🔍 **Smart Product Search** - Search any product and compare prices instantly
- 📍 **Location-Based Store Finder** - Find nearby stores using GPS/manual location
- 💰 **Price Comparison** - Compare local store prices with Swiggy, Zepto, and Blinkit
- 🛒 **Shopping Cart** - Add products and manage cart across stores
- 💳 **Secure Payments** - Razorpay integration for online payments
- ⭐ **Reviews & Ratings** - Rate and review products and stores

### For Store Owners (Store Admin)
- 📊 **Dashboard** - View sales analytics and order statistics
- 📦 **Inventory Management** - Add, edit, and manage products
- 📋 **Order Management** - Process and track customer orders
- 👥 **Customer Management** - View and manage store customers
- 💬 **Review Management** - Monitor and respond to reviews

### For Platform Administrators
- 🏪 **Store Management** - Add, verify, and manage all stores
- 👤 **User Management** - Manage platform users and roles
- 📈 **Platform Analytics** - View overall platform statistics
- ⚙️ **Settings** - Configure platform-wide settings

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 19 | UI Library |
| TypeScript | Type Safety |
| Vite | Build Tool |
| Redux Toolkit | State Management |
| React Router v7 | Routing |
| Tailwind CSS v4 | Styling |
| Axios | HTTP Client |
| Lucide React | Icons |
| React Toastify | Notifications |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime |
| Express 5 | Web Framework |
| Supabase | Database (PostgreSQL) |
| JWT | Authentication |
| bcrypt | Password Hashing |
| Razorpay | Payment Gateway |
| Puppeteer | Web Scraping |
| Google Gemini AI | Data Parsing |

---

## 📁 Project Structure

```
Project/
├── client/                    # Frontend React Application
│   ├── src/
│   │   ├── admin/            # Platform admin dashboard
│   │   │   ├── components/   # Admin UI components
│   │   │   └── pages/        # Admin pages (Dashboard, Stores, Users, etc.)
│   │   ├── store-admin/      # Store owner dashboard
│   │   │   ├── components/   # Store admin UI components
│   │   │   └── pages/        # Store pages (Products, Orders, etc.)
│   │   ├── components/       # Shared components (Navbar, Auth, etc.)
│   │   ├── pages/            # Public pages (Home, Search, Payment)
│   │   ├── services/         # API service functions
│   │   ├── store/            # Redux store and slices
│   │   └── styles/           # Global CSS styles
│   ├── package.json
│   └── vite.config.ts
│
├── server/                    # Backend Node.js Application
│   ├── config/               # Configuration files
│   │   └── supabase.js       # Supabase client setup
│   ├── controllers/          # Route controllers
│   ├── middleware/           # Express middleware
│   │   └── auth.js           # JWT authentication
│   ├── routes/               # API route definitions
│   ├── services/             # Business logic services
│   │   └── externalPriceService.js  # Price scraping service
│   ├── database/             # Database schema and policies
│   ├── index.js              # Server entry point
│   └── package.json
│
└── README.md
```

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **Git**

You will also need accounts for:

- [Supabase](https://supabase.com) - Database and authentication
- [Razorpay](https://razorpay.com) - Payment processing
- [Google AI Studio](https://aistudio.google.com) - For Gemini API key

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Project
```

### 2. Install Server Dependencies

```bash
cd server
npm install
```

### 3. Install Client Dependencies

```bash
cd ../client
npm install
```

### 4. Setup Database

1. Create a new project in [Supabase](https://supabase.com)
2. Go to SQL Editor and run the schema from `server/database/schema.sql`
3. Run the policies from `server/database/policies.sql`

---

## 🔐 Environment Variables

### Server (`server/.env`)

Create a `.env` file in the server directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d

# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Google Gemini AI (for price scraping)
GEMINI_API_KEY=your_gemini_api_key
```

### Client (`client/.env`)

Create a `.env` file in the client directory:

```env
VITE_API_URL=http://localhost:3000/api
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

---

## ▶️ Running the Application

### Development Mode

**Terminal 1 - Start the Server:**
```bash
cd server
npm run dev
```

**Terminal 2 - Start the Client:**
```bash
cd client
npm run dev
```

The application will be available at:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000

### Production Build

**Build the Client:**
```bash
cd client
npm run build
```

**Start the Server:**
```bash
cd server
npm start
```

---

## 🗄️ Database Schema

The application uses the following main tables:

- **users** - User accounts and authentication
- **stores** - Store information with location data
- **products** - Product catalog for each store
- **categories** - Product categories
- **orders** - Customer orders
- **order_items** - Individual items in orders
- **cart_items** - Shopping cart items
- **reviews** - Product and store reviews
- **customers** - Store-specific customer relationships

See `server/database/schema.sql` for the complete database schema.

---

## 👥 User Roles

| Role | Access |
|------|--------|
| `user` | Browse, search, compare prices, place orders |
| `store_admin` | Manage own store, products, orders, inventory |
| `admin` | Full platform access, manage all stores and users |

---

## 📝 License

This project is developed as a Major Project for academic purposes.

---

**Made with ❤️ for smart shoppers**
