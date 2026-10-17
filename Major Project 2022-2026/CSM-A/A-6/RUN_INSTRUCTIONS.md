# Step-by-Step Instructions to Run FoodBridge Application

## Prerequisites Check

Before starting, ensure you have:
- ✅ XAMPP installed
- ✅ Node.js installed (v14 or higher)
- ✅ npm installed (comes with Node.js)

Check Node.js version:
```bash
node --version
```

---

## STEP 1: Start XAMPP MySQL

1. **Open XAMPP Control Panel**
   - Search for "XAMPP Control Panel" in Windows Start menu
   - Or navigate to: `C:\xampp\xampp-control.exe`

2. **Start MySQL Service**
   - Click the **"Start"** button next to MySQL
   - Wait until MySQL status shows **"Running"** (green indicator)
   - ✅ MySQL is now running on port 3306

3. **Start Apache (Optional but recommended)**
   - Click the **"Start"** button next to Apache
   - This enables phpMyAdmin access

---

## STEP 2: Create MySQL Database

### Option A: Using phpMyAdmin (Easier)

1. **Open phpMyAdmin**
   - Open browser and go to: http://localhost/phpmyadmin
   - Or: http://127.0.0.1/phpmyadmin

2. **Create Database**
   - Click on **"SQL"** tab at the top
   - Copy the ENTIRE content from `backend/database/schema.sql`
   - Paste it into the SQL text area
   - Click **"Go"** button

3. **Verify Database Created**
   - Check left sidebar - you should see **"foodbridge"** database
   - Expand it to see tables: `users`, `donations`, `organizations`, `chat_messages`

### Option B: Using MySQL Command Line

1. **Open Command Prompt** (as Administrator)

2. **Navigate to MySQL bin folder:**
   ```bash
   cd C:\xampp\mysql\bin
   ```

3. **Login to MySQL:**
   ```bash
   mysql -u root -p
   ```
   (Press Enter when asked for password - leave it empty)

4. **Run SQL file:**
   ```sql
   source C:\Users\kommawar roshini\Downloads\final project\project\backend\database\schema.sql
   ```
   (Adjust path to your project location)

5. **Verify:**
   ```sql
   USE foodbridge;
   SHOW TABLES;
   ```
   Should show 4 tables.

6. **Exit MySQL:**
   ```sql
   EXIT;
   ```

---

## STEP 3: Configure Backend Environment

1. **Navigate to backend folder:**
   ```bash
   cd backend
   ```

2. **Create .env file** (if it doesn't exist):
   - Create a new file named `.env` in the `backend` folder
   - Copy this content:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=foodbridge
   PORT=5000
   JWT_SECRET=your-secret-key-change-in-production
   ```
   - Save the file

3. **Verify .env file exists:**
   ```bash
   dir .env
   ```
   (Windows) or
   ```bash
   ls -la .env
   ```
   (Git Bash)

---

## STEP 4: Install Backend Dependencies

1. **Make sure you're in backend folder:**
   ```bash
   cd backend
   ```

2. **Install packages:**
   ```bash
   npm install
   ```
   Wait for installation to complete (may take 1-2 minutes)

3. **Verify installation:**
   ```bash
   dir node_modules
   ```
   Should show many folders.

---

## STEP 5: Start Backend Server

1. **Start the backend:**
   ```bash
   npm start
   ```

2. **Expected Output:**
   ```
   Connected to MySQL database
   Server running on http://localhost:5000
   ```

3. **Keep this terminal window OPEN** - backend must keep running

4. **Test Backend (Optional):**
   - Open browser: http://localhost:5000/api/health
   - Should see: `{"status":"OK","message":"FoodBridge API is running"}`

---

## STEP 6: Start Frontend (New Terminal)

1. **Open a NEW Command Prompt/Terminal window**
   - Keep backend terminal running in background

2. **Navigate to project root:**
   ```bash
   cd "C:\Users\kommawar roshini\Downloads\final project\project"
   ```
   (Adjust to your actual project path)

3. **Install Frontend Dependencies (if not already done):**
   ```bash
   npm install
   ```

4. **Start Frontend Development Server:**
   ```bash
   npm run dev
   ```

5. **Expected Output:**
   ```
   VITE v5.x.x  ready in xxx ms

   ➜  Local:   http://localhost:5173/
   ➜  Network: use --host to expose
   ```

6. **Note the URL** - Usually `http://localhost:5173`

---

## STEP 7: Access Application

1. **Open Browser:**
   - Go to: http://localhost:5173
   - (Or the URL shown in terminal)

2. **Test Login:**
   - Email: `admin@foodbridge.com`
   - Password: (any password - authentication is simplified)
   - Click Login

3. **Verify Database Connection:**
   - Navigate to Admin Dashboard
   - Check if users/donations load from database
   - Create a new donation to test database writes

---

## Troubleshooting

### ❌ Error: "Cannot connect to MySQL"

**Solution:**
- Check XAMPP MySQL is running (green in Control Panel)
- Verify `.env` file has correct credentials:
  ```
  DB_HOST=localhost
  DB_USER=root
  DB_PASSWORD=
  ```

### ❌ Error: "Port 5000 already in use"

**Solution:**
- Change PORT in `backend/.env` to another port (e.g., 5001)
- Update `src/services/api.ts` line 3:
  ```typescript
  const API_BASE_URL = 'http://localhost:5001/api';
  ```

### ❌ Error: "Database 'foodbridge' doesn't exist"

**Solution:**
- Go back to STEP 2
- Run SQL schema again in phpMyAdmin
- Verify database exists in phpMyAdmin sidebar

### ❌ Error: "Cannot find module 'mysql2'"

**Solution:**
- Make sure you're in `backend` folder
- Run: `npm install` again
- Check `backend/package.json` exists

### ❌ Frontend shows "Network Error" or "Failed to fetch"

**Solution:**
- Verify backend is running (check terminal)
- Test: http://localhost:5000/api/health in browser
- Check `src/services/api.ts` has correct URL
- Ensure CORS is enabled in backend (it is by default)

### ❌ MySQL won't start in XAMPP

**Solution:**
- Check if port 3306 is already in use
- Stop any other MySQL services
- Restart XAMPP Control Panel as Administrator
- Check XAMPP error logs: `C:\xampp\mysql\data\mysql_error.log`

---

## Quick Command Reference

### Terminal 1 (Backend):
```bash
cd backend
npm install          # First time only
npm start
```

### Terminal 2 (Frontend):
```bash
cd "C:\Users\kommawar roshini\Downloads\final project\project"
npm install          # First time only
npm run dev
```

### To Stop:
- **Backend:** Press `Ctrl + C` in backend terminal
- **Frontend:** Press `Ctrl + C` in frontend terminal
- **MySQL:** Stop via XAMPP Control Panel

---

## Verification Checklist

- [ ] XAMPP MySQL is running (green)
- [ ] Database `foodbridge` exists in phpMyAdmin
- [ ] All 4 tables visible: users, donations, organizations, chat_messages
- [ ] Backend `.env` file configured correctly
- [ ] Backend dependencies installed (`npm install` in backend folder)
- [ ] Backend server running on http://localhost:5000
- [ ] Backend health check works: http://localhost:5000/api/health
- [ ] Frontend dependencies installed (`npm install` in root)
- [ ] Frontend dev server running (usually http://localhost:5173)
- [ ] Application opens in browser
- [ ] Can login and see data from database

---

## Next Steps After Setup

1. **Test Features:**
   - Create a new user account
   - Create a donation
   - View donations list
   - Test admin dashboard

2. **Add Sample Data (Optional):**
   - The schema.sql already includes sample users
   - You can add more via the application UI

3. **Development:**
   - Backend auto-restarts on file changes (if using `npm run dev`)
   - Frontend hot-reloads automatically
   - Check browser console for errors

---

## Summary

**What's Running:**
1. ✅ XAMPP MySQL (port 3306)
2. ✅ Backend Express Server (port 5000)
3. ✅ Frontend Vite Dev Server (port 5173)

**Access Points:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- phpMyAdmin: http://localhost/phpmyadmin

**Default Login:**
- Email: `admin@foodbridge.com`
- Password: (any - simplified auth)

---

**Need Help?** Check the error messages in terminal windows and browser console (F12).
