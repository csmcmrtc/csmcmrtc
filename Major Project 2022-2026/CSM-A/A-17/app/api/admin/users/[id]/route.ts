import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/lib/models/User"
import { getTokenFromRequest, verifyToken } from "@/lib/auth"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
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

    const body = await request.json()
    const { action } = body

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ message: "Invalid action" }, { status: 400 })
    }

    if (action === "approve") {
      const user = await User.findByIdAndUpdate(params.id, { isApproved: true }, { new: true }).select("-password")

      if (!user) {
        return NextResponse.json({ message: "User not found" }, { status: 404 })
      }

      return NextResponse.json({
        message: "User approved successfully",
        user,
      })
    } else {
      // For reject, we could either delete the user or mark as rejected
      // For now, let's delete the user
      const user = await User.findByIdAndDelete(params.id)

      if (!user) {
        return NextResponse.json({ message: "User not found" }, { status: 404 })
      }

      return NextResponse.json({
        message: "User rejected and removed",
      })
    }
  } catch (error) {
    console.error("Update user error:", error)
    return NextResponse.json({ message: "Failed to update user" }, { status: 500 })
  }
}
