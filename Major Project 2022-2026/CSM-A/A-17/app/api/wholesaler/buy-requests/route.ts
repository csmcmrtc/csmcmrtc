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
    if (!decoded || decoded.role !== "wholesaler") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const requests = await BuyRequest.find({ wholesalerId: decoded.userId })
      .populate("farmerId", "name")
      .populate("cropId", "cropName pricePerKg")
      .sort({ createdAt: -1 })

    return NextResponse.json({ requests })
  } catch (error) {
    console.error("Get buy requests error:", error)
    return NextResponse.json({ message: "Failed to fetch buy requests" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== "wholesaler") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { cropId, farmerId, requestedQuantity, totalPrice, pickupDate, message } = body

    // Validate required fields
    if (!cropId || !farmerId || !requestedQuantity || !totalPrice || !pickupDate) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 })
    }

    // Create buy request
    const buyRequest = new BuyRequest({
      wholesalerId: decoded.userId,
      farmerId,
      cropId,
      requestedQuantity,
      totalPrice,
      pickupDate: new Date(pickupDate),
      message: message || "",
    })

    await buyRequest.save()

    return NextResponse.json({ message: "Buy request sent successfully", request: buyRequest }, { status: 201 })
  } catch (error) {
    console.error("Create buy request error:", error)
    return NextResponse.json({ message: "Failed to send buy request" }, { status: 500 })
  }
}
