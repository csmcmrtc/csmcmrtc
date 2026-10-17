import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/lib/models/User"
import { comparePassword, generateToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { role, kisanId, email, password } = body

    if (!role || !password) {
      return NextResponse.json({ message: "Role and password are required" }, { status: 400 })
    }

    // Find user based on role
    let user
    if (role === "farmer") {
      if (!kisanId) {
        return NextResponse.json({ message: "Kisan ID is required for farmers" }, { status: 400 })
      }
      user = await User.findOne({ kisanId, role: "farmer" })
    } else {
      if (!email) {
        return NextResponse.json({ message: "Email is required" }, { status: 400 })
      }
      user = await User.findOne({ email, role })
    }

    if (!user) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    // Check password
    const isValidPassword = await comparePassword(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    // Check if user is approved (except for admin)
    if (role !== "admin" && !user.isApproved) {
      return NextResponse.json(
        { message: "Account pending approval. Please wait for admin approval." },
        { status: 403 },
      )
    }

    // Generate token
    const token = generateToken(user._id, user.role)

    // Return user data (without password)
    const userData = {
      _id: user._id,
      name: user.name,
      role: user.role,
      isApproved: user.isApproved,
      district: user.district,
      ...(user.kisanId && { kisanId: user.kisanId }),
      ...(user.email && { email: user.email }),
    }

    return NextResponse.json({
      message: "Login successful",
      token,
      user: userData,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ message: "Login failed. Please try again." }, { status: 500 })
  }
}
