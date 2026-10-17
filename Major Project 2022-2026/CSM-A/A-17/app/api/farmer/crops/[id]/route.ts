import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Crop from "@/lib/models/Crop"
import { getTokenFromRequest, verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

    const crop = await Crop.findOne({ _id: params.id, farmerId: decoded.userId })

    if (!crop) {
      return NextResponse.json({ message: "Crop not found" }, { status: 404 })
    }

    return NextResponse.json({ crop })
  } catch (error) {
    console.error("Get crop error:", error)
    return NextResponse.json({ message: "Failed to fetch crop" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
    const {
      cropName,
      image,
      district,
      pricePerKg,
      isOrganic,
      minimumOrderQuantity,
      availableQuantity,
      farmerLocation,
    } = body

    // Validate required fields
    if (
      !cropName ||
      !image ||
      !district ||
      !pricePerKg ||
      !minimumOrderQuantity ||
      !availableQuantity ||
      !farmerLocation
    ) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 })
    }

    const crop = await Crop.findOneAndUpdate(
      { _id: params.id, farmerId: decoded.userId },
      {
        cropName,
        image,
        district,
        pricePerKg,
        isOrganic: Boolean(isOrganic),
        minimumOrderQuantity,
        availableQuantity,
        farmerLocation,
      },
      { new: true }
    )

    if (!crop) {
      return NextResponse.json({ message: "Crop not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Crop updated successfully", crop })
  } catch (error) {
    console.error("Update crop error:", error)
    return NextResponse.json({ message: "Failed to update crop" }, { status: 500 })
  }
}
