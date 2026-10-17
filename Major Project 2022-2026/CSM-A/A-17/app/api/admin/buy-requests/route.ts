import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import BuyRequest from "@/lib/models/BuyRequest"
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

    const requests = await BuyRequest.find()
      .populate("wholesalerId", "name")
      .populate("farmerId", "name")
      .populate("cropId", "cropName")
      .sort({ createdAt: -1 })

    return NextResponse.json({ requests })
  } catch (error) {
    console.error("Get buy requests error:", error)
    return NextResponse.json({ message: "Failed to fetch buy requests" }, { status: 500 })
  }
}
