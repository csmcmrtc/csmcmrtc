import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/lib/models/User"
import { hashPassword } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { role, name, phone, district, address, kisanId, email, password } = body

    // Validate required fields
    if (!role || !name || !phone || !district || !address || !password) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 })
    }

    // Role-specific validation
    if (role === "farmer" && !kisanId) {
      return NextResponse.json({ message: "Kisan ID is required for farmers" }, { status: 400 })
    }

    if ((role === "wholesaler" || role === "admin") && !email) {
      return NextResponse.json({ message: "Email is required for wholesalers and admins" }, { status: 400 })
    }

    // Check if user already exists
    let existingUser
    if (role === "farmer") {
      existingUser = await User.findOne({ kisanId })
      if (existingUser) {
        return NextResponse.json({ message: "Kisan ID already registered" }, { status: 400 })
      }
    } else {
      existingUser = await User.findOne({ email })
      if (existingUser) {
        return NextResponse.json({ message: "Email already registered" }, { status: 400 })
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const userData: any = {
      role,
      name,
      phone,
      district,
      address,
      password: hashedPassword,
      isApproved: role === "admin", // Auto-approve admin users
    }

    if (role === "farmer") {
      userData.kisanId = kisanId
    } else {
      userData.email = email
    }

    const user = new User(userData)
    await user.save()

    return NextResponse.json(
      {
        message:
          role === "admin"
            ? "Admin account created successfully"
            : "Registration successful! Please wait for admin approval.",
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error("Registration error:", error)

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0]
      return NextResponse.json({ message: `${field} already exists` }, { status: 400 })
    }

    return NextResponse.json({ message: "Registration failed. Please try again." }, { status: 500 })
  }
}
