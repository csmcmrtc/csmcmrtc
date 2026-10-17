# AgroConnect: Telangana Agricultural Marketplace

A modern, full-stack agricultural marketplace platform connecting farmers and wholesalers across Telangana's 33 districts. Built with Next.js 15, TypeScript, and MongoDB.

## 🌾 Overview

AgroConnect is a direct marketplace platform that enables farmers to sell their crops directly to wholesalers, eliminating middlemen and ensuring fair pricing. The platform supports all 33 districts of Telangana and includes features for organic certification, district-based filtering, and an approval system for quality control.

## ✨ Features

### For Farmers
- **Kisan ID Registration**: Secure registration using government-issued Kisan ID
- **Crop Listing**: Post crops with detailed information including price, quantity, and organic certification
- **Buy Request Management**: Approve or reject buy requests from wholesalers
- **District Coverage**: Support for all 33 Telangana districts
- **Dashboard**: Track your listings and manage orders

### For Wholesalers
- **Advanced Search**: Filter crops by district, organic status, and price range
- **Shopping Cart**: Add multiple crops to cart and place bulk orders
- **Minimum Order Requirements**: Respect farmer's minimum quantity requirements
- **Order Tracking**: Monitor order status and pickup details
- **District-based Sourcing**: Find crops from specific districts across Telangana

### For Administrators
- **User Management**: Approve/reject farmer and wholesaler registrations
- **Analytics Dashboard**: Monitor platform usage and trading statistics
- **Content Moderation**: Manage crop listings and user accounts
- **System Overview**: Track platform health and user activity

## 🛠️ Tech Stack

### Frontend
- **Next.js 15.2.4** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS 4.1.9** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icons
- **React Hook Form** - Form handling with validation
- **Zod** - Schema validation
- **shadcn/ui** - Modern UI component library

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT** - Authentication tokens with 7-day expiration
- **bcryptjs** - Password hashing (12 salt rounds)

### Development Tools
- **ESLint** - Code linting with Next.js config
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB (local or cloud instance)
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd demo-major
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Environment Setup**
   Copy the example environment file and update it:
   ```bash
   cp env-example.txt .env.local
   ```
   
   Then edit `.env.local` with your actual values:
   ```env
   MONGODB_URI=mongodb://localhost:27017/agroconnect
   JWT_SECRET=your-super-secret-jwt-key-here
   NEXTAUTH_SECRET=your-nextauth-secret-here
   ```

4. **Database Setup**
   - Start your MongoDB instance
   - The application will automatically create the necessary collections

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
demo-major/
├── app/                          # Next.js App Router
│   ├── admin/                    # Admin dashboard pages
│   ├── api/                      # API routes
│   │   ├── admin/                # Admin API endpoints
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── farmer/               # Farmer-specific APIs
│   │   │   ├── crops/            # Crop management endpoints
│   │   │   └── buy-requests/     # Buy request endpoints
│   │   └── wholesaler/           # Wholesaler-specific APIs
│   │       ├── crops/            # Crop browsing endpoints
│   │       └── buy-requests/     # Purchase request endpoints
│   ├── auth/                     # Authentication pages
│   │   ├── login/                # Login page
│   │   └── register/             # Registration page
│   ├── farmer/                   # Farmer dashboard pages
│   │   ├── dashboard/            # Main farmer dashboard
│   │   └── add-crop/             # Crop listing page
│   ├── wholesaler/               # Wholesaler dashboard pages
│   │   ├── dashboard/            # Main wholesaler dashboard
│   │   └── checkout/             # Checkout and cart pages
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Homepage
├── components/                   # Reusable UI components
│   ├── ui/                       # shadcn/ui components
│   └── theme-provider.tsx        # Theme context
├── hooks/                        # Custom React hooks
│   ├── use-mobile.ts             # Mobile detection hook
│   └── use-toast.ts              # Toast notification hook
├── lib/                          # Utility libraries
│   ├── models/                   # MongoDB models
│   │   ├── User.js               # User schema
│   │   ├── Crop.js               # Crop schema
│   │   └── BuyRequest.js         # Buy request schema
│   ├── auth.js                   # Authentication utilities
│   ├── constants.js              # Application constants
│   ├── mongodb.js                # Database connection
│   └── utils.ts                  # Utility functions
├── public/                       # Static assets
├── styles/                       # Additional styles
├── env-example.txt               # Environment variables template
└── package.json                  # Dependencies and scripts
```

## 🗄️ Database Schema

### User Model
- **Role-based**: farmer, wholesaler, admin
- **Farmer fields**: Kisan ID, password, name, phone, district, address
- **Wholesaler fields**: Email, password, name, phone, district, address
- **Common fields**: Role, approval status, creation timestamp
- **Validation**: Role-based field requirements and unique constraints

### Crop Model
- **Farmer reference**: Links to User model
- **Crop details**: Name, image, price per kg, organic status
- **Location**: District and specific farmer location
- **Quantity**: Available quantity and minimum order requirements
- **Status**: Active/inactive listing (default: active)
- **Validation**: Required fields and quantity constraints

### BuyRequest Model
- **References**: Wholesaler, farmer, and crop
- **Order details**: Quantity, total price, pickup date
- **Status**: Pending, approved, or rejected (default: pending)
- **Communication**: Optional message from wholesaler
- **Timestamps**: Creation and response timestamps

## 🔐 Authentication & Authorization

- **JWT-based authentication** with 7-day token expiration
- **Role-based access control** (RBAC) for different user types
- **Password hashing** using bcryptjs with 12 salt rounds
- **Bearer token** authentication for API endpoints
- **Account approval system** for farmers and wholesalers

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Farmer APIs
- `GET /api/farmer/crops` - Get farmer's crops
- `POST /api/farmer/crops` - Add new crop
- `PUT /api/farmer/crops` - Update crop status
- `DELETE /api/farmer/crops?id={cropId}` - Delete crop
- `GET /api/farmer/buy-requests` - Get buy requests
- `PATCH /api/farmer/buy-requests/{requestId}` - Respond to buy request

### Wholesaler APIs
- `GET /api/wholesaler/crops` - Browse available crops
- `POST /api/wholesaler/buy-requests` - Place buy request
- `GET /api/wholesaler/buy-requests` - Get order history

### Admin APIs
- `GET /api/admin/users` - Get all users
- `PATCH /api/admin/users/{userId}` - Approve/reject users
- `GET /api/admin/analytics` - Get platform analytics

## 🌍 Telangana Districts Support

The platform supports all 33 districts of Telangana:
- Adilabad, Bhadradri Kothagudem, Hanumakonda, Hyderabad
- Jagtial, Jangaon, Jayashankar Bhupalpally, Jogulamba Gadwal
- Kamareddy, Karimnagar, Khammam, Kumuram Bheem
- Mahabubabad, Mahabubnagar, Mancherial, Medak
- Medchal-Malkajgiri, Mulugu, Nagarkurnool, Nalgonda
- Narayanpet, Nirmal, Nizamabad, Peddapalli
- Rajanna Sircilla, Rangareddy, Sangareddy, Siddipet
- Suryapet, Vikarabad, Wanaparthy, Warangal
- Yadadri Bhuvanagiri

## 📱 User Roles & Permissions

### Farmer
- Register with Kisan ID
- Post and manage crop listings
- Approve/reject buy requests
- View order history

### Wholesaler
- Register with email
- Browse and search crops
- Add crops to cart
- Place buy requests
- Track order status

### Admin
- Approve user registrations
- Manage platform content
- View analytics and reports
- Moderate user activities

## 🚀 Deployment

### Environment Variables
Ensure these environment variables are set in production:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Strong secret key for JWT tokens
- `NEXTAUTH_SECRET` - Secret key for NextAuth (if used)

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms
The application can be deployed on any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

### Docker Deployment
```bash
# Build the image
docker build -t agroconnect .

# Run the container
docker run -p 3000:3000 --env-file .env.local agroconnect
```

## 🔧 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## 🐛 Troubleshooting

### Common Issues
- **MongoDB Connection**: Ensure MongoDB is running and URI is correct
- **JWT Errors**: Check that JWT_SECRET is set and consistent
- **Build Errors**: Verify all environment variables are properly set
- **Permission Issues**: Ensure proper file permissions for `.env.local`

### Development Tips
- Use `npm run lint` to check for code issues
- Check browser console for frontend errors
- Monitor terminal for backend error logs
- Verify MongoDB collections are created properly

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email bhoopeshkumarconst@gmail.com or create an issue in the repository.

## 🔮 Future Enhancements

- [ ] Mobile app development
- [ ] Payment gateway integration
- [ ] Real-time notifications
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Weather integration for crop planning
- [ ] Logistics and delivery tracking
- [ ] Quality certification system
- [ ] Price prediction using AI/ML

---

**AgroConnect** - Empowering Telangana's agricultural community through technology. 🌾
