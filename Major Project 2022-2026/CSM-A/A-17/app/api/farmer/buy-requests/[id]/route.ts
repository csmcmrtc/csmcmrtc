import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import BuyRequest from "@/lib/models/BuyRequest"
import Crop from "@/lib/models/Crop"
import { getTokenFromRequest, verifyToken } from "@/lib/auth"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== "farmer") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { status } = body

    if (!["approved", "rejected"].includes(status)) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 })
    }

    const buyRequest = await BuyRequest.findOneAndUpdate(
      { _id: params.id, farmerId: decoded.userId },
      { status, respondedAt: new Date() },
      { new: true },
    ).populate("cropId")

    if (!buyRequest) {
      return NextResponse.json({ message: "Buy request not found" }, { status: 404 })
    }

    // If request is approved, update crop available quantity
    if (status === "approved") {
      const crop = await Crop.findById(buyRequest.cropId._id)
      if (crop) {
        const newAvailableQuantity = crop.availableQuantity - buyRequest.requestedQuantity
        if (newAvailableQuantity >= 0) {
          crop.availableQuantity = newAvailableQuantity
          await crop.save()
        } else {
          return NextResponse.json({ 
            message: "Insufficient quantity available" 
          }, { status: 400 })
        }
      }
    }

    return NextResponse.json({
      message: `Request ${status} successfully`,
      request: buyRequest,
    })
  } catch (error) {
    console.error("Update buy request error:", error)
    return NextResponse.json({ message: "Failed to update request" }, { status: 500 })
  }
}
