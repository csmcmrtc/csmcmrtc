# FoodBridge MySQL Setup Instructions

## Prerequisites
- XAMPP installed and running
- Node.js installed (v14 or higher)
- MySQL running via XAMPP

## Step 1: Start XAMPP MySQL

1. Open XAMPP Control Panel
2. Start **Apache** and **MySQL** services
3. Verify MySQL is running (green indicator)

## Step 2: Create Database

1. Open phpMyAdmin: http://localhost/phpmyadmin
2. Click on "SQL" tab
3. Copy and paste the SQL from `backend/database/schema.sql`
4. Click "Go" to execute
5. Verify database `foodbridge` is created with all tables

**OR** use MySQL command line:
```bash
mysql -u root -p
```
Then run:
```sql
source backend/database/schema.sql
```

## Step 3: Install Backend Dependencies

Open terminal in project root and run:
```bash
cd backend
npm install
```

## Step 4: Configure Backend

1. Copy `backend/.env.example` to `backend/.env` (if exists) or create `backend/.env`
2. Verify these settings in `backend/.env`:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=foodbridge
PORT=5000
JWT_SECRET=your-secret-key-change-in-production
```

## Step 5: Start Backend Server

In the `backend` folder, run:
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

Backend should be running on: http://localhost:5000

## Step 6: Start Frontend

Open a NEW terminal window in project root and run:
```bash
npm run dev
```

Frontend should be running on: http://localhost:5173 (or similar Vite port)

## Step 7: Verify Setup

1. Check backend health: http://localhost:5000/api/health
2. Should return: `{"status":"OK","message":"FoodBridge API is running"}`
3. Open frontend in browser
4. Try logging in with sample user: `admin@foodbridge.com`

## Troubleshooting

### MySQL Connection Error
- Verify XAMPP MySQL is running
- Check `backend/.env` has correct credentials
- Try connecting via phpMyAdmin first

### Port Already in Use
- Change PORT in `backend/.env` if 5000 is taken
- Update `src/services/api.ts` with new backend URL

### Database Not Found
- Run SQL schema again
- Check database name matches in `.env`

### CORS Errors
- Ensure backend is running before frontend
- Check backend URL in `src/services/api.ts`

## File Structure

```
project/
├── backend/
│   ├── db.js                 # Database connection
│   ├── server.js             # Express server
│   ├── routes/               # API routes
│   │   ├── users.js
│   │   ├── donations.js
│   │   ├── organizations.js
│   │   ├── chat.js
│   │   └── analytics.js
│   ├── database/
│   │   └── schema.sql        # MySQL schema
│   ├── package.json
│   └── .env                  # Environment config
├── src/
│   ├── services/
│   │   ├── api.ts            # Frontend API service (NEW)
│   │   └── authService.ts    # Updated to use API
│   └── components/           # All updated to use API
└── SETUP_INSTRUCTIONS.md     # This file
```

## Files Changed

### DELETED:
- `src/services/mockDatabase.ts` ❌

### ADDED:
- `backend/` folder with complete backend structure ✅
- `backend/db.js` ✅
- `backend/server.js` ✅
- `backend/routes/*.js` (all route files) ✅
- `backend/database/schema.sql` ✅
- `backend/package.json` ✅
- `src/services/api.ts` ✅

### UPDATED:
- All component files to use `api` instead of `mockDB` ✅
- `src/services/authService.ts` ✅

## Production Notes

For production deployment:
1. Change `JWT_SECRET` in `.env` to a strong random string
2. Set proper `DB_PASSWORD` (not empty)
3. Use environment variables for all sensitive data
4. Enable HTTPS
5. Configure proper CORS origins
6. Set up database backups
