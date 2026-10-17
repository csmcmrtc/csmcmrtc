import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Crop from "@/lib/models/Crop"
import { getTokenFromRequest, verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const crops = await Crop.find().populate("farmerId", "name").sort({ createdAt: -1 })

    return NextResponse.json({ crops })
  } catch (error) {
    console.error("Get crops error:", error)
    return NextResponse.json({ message: "Failed to fetch crops" }, { status: 500 })
  }
}
