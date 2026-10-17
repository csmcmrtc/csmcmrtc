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
    if (!decoded || decoded.role !== "farmer") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const crops = await Crop.find({ farmerId: decoded.userId }).sort({ createdAt: -1 })

    return NextResponse.json({ crops })
  } catch (error) {
    console.error("Get crops error:", error)
    return NextResponse.json({ message: "Failed to fetch crops" }, { status: 500 })
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

    // Create crop
    const crop = new Crop({
      farmerId: decoded.userId,
      cropName,
      image,
      district,
      pricePerKg,
      isOrganic: Boolean(isOrganic),
      minimumOrderQuantity,
      availableQuantity,
      farmerLocation,
    })

    await crop.save()

    return NextResponse.json({ message: "Crop added successfully", crop }, { status: 201 })
  } catch (error) {
    console.error("Add crop error:", error)
    return NextResponse.json({ message: "Failed to add crop" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
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
    const { cropId, isActive } = body

    if (!cropId) {
      return NextResponse.json({ message: "Crop ID is required" }, { status: 400 })
    }

    const crop = await Crop.findOneAndUpdate(
      { _id: cropId, farmerId: decoded.userId },
      { isActive },
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

export async function DELETE(request: NextRequest) {
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

    const url = new URL(request.url)
    const cropId = url.searchParams.get('id')

    if (!cropId) {
      return NextResponse.json({ message: "Crop ID is required" }, { status: 400 })
    }

    const crop = await Crop.findOneAndDelete({ _id: cropId, farmerId: decoded.userId })

    if (!crop) {
      return NextResponse.json({ message: "Crop not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Crop deleted successfully" })
  } catch (error) {
    console.error("Delete crop error:", error)
    return NextResponse.json({ message: "Failed to delete crop" }, { status: 500 })
  }
}
