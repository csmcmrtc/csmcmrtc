import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/lib/models/User"
import Crop from "@/lib/models/Crop"
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

    // Get analytics data
    const [totalFarmers, totalWholesalers, totalCrops, totalTransactions, pendingApprovals] = await Promise.all([
      User.countDocuments({ role: "farmer", isApproved: true }),
      User.countDocuments({ role: "wholesaler", isApproved: true }),
      Crop.countDocuments({ isActive: true }),
      BuyRequest.countDocuments(),
      User.countDocuments({ isApproved: false }),
    ])

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentActivity = await BuyRequest.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    })

    const analytics = {
      totalFarmers,
      totalWholesalers,
      totalCrops,
      totalTransactions,
      pendingApprovals,
      recentActivity,
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error("Get analytics error:", error)
    return NextResponse.json({ message: "Failed to fetch analytics" }, { status: 500 })
  }
}
