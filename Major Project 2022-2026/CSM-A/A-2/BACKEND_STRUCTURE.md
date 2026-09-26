# Backend Folder Structure

```
backend/
├── db.js                      # MySQL database connection pool
├── server.js                  # Express server entry point
├── package.json               # Backend dependencies
├── .env                       # Environment variables (create this)
├── routes/
│   ├── users.js              # User CRUD operations
│   ├── donations.js          # Donation CRUD operations
│   ├── organizations.js     # Organization CRUD operations
│   ├── chat.js               # Chat message operations
│   └── analytics.js          # Analytics calculations
└── database/
    └── schema.sql            # MySQL database schema
```

## API Endpoints

### Users (`/api/users`)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/email/:email` - Get user by email
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user

### Donations (`/api/donations`)
- `GET /api/donations` - Get all donations
- `GET /api/donations/:id` - Get donation by ID
- `GET /api/donations/donor/:donorId` - Get donations by donor
- `POST /api/donations` - Create new donation
- `PUT /api/donations/:id` - Update donation

### Organizations (`/api/organizations`)
- `GET /api/organizations` - Get all organizations
- `GET /api/organizations/:id` - Get organization by ID
- `POST /api/organizations` - Create new organization
- `PUT /api/organizations/:id` - Update organization

### Chat (`/api/chat`)
- `GET /api/chat/history/:userId` - Get chat history for user
- `POST /api/chat` - Create new chat message

### Analytics (`/api/analytics`)
- `GET /api/analytics` - Get platform analytics

### Health Check
- `GET /api/health` - Server health check
