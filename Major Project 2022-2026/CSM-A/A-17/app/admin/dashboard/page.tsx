"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  Shield,
  Users,
  UserCheck,
  TrendingUp,
  Package,
  ShoppingCart,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  MapPin,
  Phone,
  Mail,
} from "lucide-react"
import { TELANGANA_DISTRICTS } from "@/lib/constants.js"

interface User {
  _id: string
  name: string
  role: string
  isApproved: boolean
  district: string
  phone: string
  email?: string
  kisanId?: string
  address: string
  createdAt: string
}

interface Crop {
  _id: string
  cropName: string
  district: string
  pricePerKg: number
  isOrganic: boolean
  availableQuantity: number
  farmerId: {
    _id: string
    name: string
  }
  createdAt: string
}

interface BuyRequest {
  _id: string
  wholesalerId: {
    _id: string
    name: string
  }
  farmerId: {
    _id: string
    name: string
  }
  cropId: {
    _id: string
    cropName: string
  }
  requestedQuantity: number
  totalPrice: number
  status: string
  createdAt: string
}

interface Analytics {
  totalFarmers: number
  totalWholesalers: number
  totalCrops: number
  totalTransactions: number
  pendingApprovals: number
  recentActivity: number
}

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null)
  const [pendingFarmers, setPendingFarmers] = useState<User[]>([])
  const [pendingWholesalers, setPendingWholesalers] = useState<User[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [crops, setCrops] = useState<Crop[]>([])
  const [buyRequests, setBuyRequests] = useState<BuyRequest[]>([])
  const [analytics, setAnalytics] = useState<Analytics>({
    totalFarmers: 0,
    totalWholesalers: 0,
    totalCrops: 0,
    totalTransactions: 0,
    pendingApprovals: 0,
    recentActivity: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Filter states
  const [userFilter, setUserFilter] = useState({
    role: "all",
    district: "all",
    status: "all",
    search: "",
  })

  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (!token || !userData) {
      router.push("/auth/login")
      return
    }

    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== "admin") {
      router.push("/auth/login")
      return
    }

    setUser(parsedUser)
    fetchDashboardData(token)
  }, [router])

  const fetchDashboardData = async (token: string) => {
    try {
      const [usersResponse, cropsResponse, requestsResponse, analyticsResponse] = await Promise.all([
        fetch("/api/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/admin/crops", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/admin/buy-requests", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/admin/analytics", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        setAllUsers(usersData.users || [])
        setPendingFarmers(usersData.users?.filter((u: User) => u.role === "farmer" && !u.isApproved) || [])
        setPendingWholesalers(usersData.users?.filter((u: User) => u.role === "wholesaler" && !u.isApproved) || [])
      }

      if (cropsResponse.ok) {
        const cropsData = await cropsResponse.json()
        setCrops(cropsData.crops || [])
      }

      if (requestsResponse.ok) {
        const requestsData = await requestsResponse.json()
        setBuyRequests(requestsData.requests || [])
      }

      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json()
        setAnalytics(analyticsData)
      }
    } catch (err) {
      setError("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const handleUserApproval = async (userId: string, action: "approve" | "reject") => {
    const token = localStorage.getItem("token")
    if (!token) return

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      })

      if (response.ok) {
        // Refresh data
        fetchDashboardData(token)
      } else {
        setError("Failed to update user status")
      }
    } catch (err) {
      setError("Network error occurred")
    }
  }

  const getFilteredUsers = () => {
    return allUsers.filter((user) => {
      const matchesRole = userFilter.role === "all" || user.role === userFilter.role
      const matchesDistrict = userFilter.district === "all" || user.district === userFilter.district
      const matchesStatus =
        userFilter.status === "all" ||
        (userFilter.status === "approved" && user.isApproved) ||
        (userFilter.status === "pending" && !user.isApproved)
      const matchesSearch =
        userFilter.search === "" ||
        user.name.toLowerCase().includes(userFilter.search.toLowerCase()) ||
        user.email?.toLowerCase().includes(userFilter.search.toLowerCase()) ||
        user.kisanId?.toLowerCase().includes(userFilter.search.toLowerCase())

      return matchesRole && matchesDistrict && matchesStatus && matchesSearch
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-8 h-8 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">Platform Management & Analytics</p>
              </div>
            </div>
            <Button
              onClick={() => {
                localStorage.removeItem("token")
                localStorage.removeItem("user")
                router.push("/")
              }}
              variant="outline"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Analytics Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Farmers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalFarmers}</div>
              <p className="text-xs text-muted-foreground">{pendingFarmers.length} pending approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Wholesalers</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalWholesalers}</div>
              <p className="text-xs text-muted-foreground">{pendingWholesalers.length} pending approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Crops</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalCrops}</div>
              <p className="text-xs text-muted-foreground">Active listings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalTransactions}</div>
              <p className="text-xs text-muted-foreground">Buy requests processed</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="approvals" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="approvals" className="flex items-center gap-2">
              <UserCheck className="w-4 h-4" />
              Approvals ({pendingFarmers.length + pendingWholesalers.length})
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              All Users ({allUsers.length})
            </TabsTrigger>
            <TabsTrigger value="crops" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Crops ({crops.length})
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Transactions ({buyRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="approvals" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Pending Farmers */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Pending Farmers ({pendingFarmers.length})
                  </CardTitle>
                  <CardDescription>Review and approve farmer registrations</CardDescription>
                </CardHeader>
                <CardContent>
                  {pendingFarmers.length === 0 ? (
                    <div className="text-center py-8">
                      <UserCheck className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No pending farmer approvals</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingFarmers.map((farmer) => (
                        <div key={farmer._id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <h3 className="font-semibold">{farmer.name}</h3>
                              <p className="text-sm text-muted-foreground">Kisan ID: {farmer.kisanId}</p>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {farmer.district}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {farmer.phone}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground">{farmer.address}</p>
                              <p className="text-xs text-muted-foreground">
                                Registered: {new Date(farmer.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleUserApproval(farmer._id, "approve")}>
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleUserApproval(farmer._id, "reject")}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Pending Wholesalers */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Pending Wholesalers ({pendingWholesalers.length})
                  </CardTitle>
                  <CardDescription>Review and approve wholesaler registrations</CardDescription>
                </CardHeader>
                <CardContent>
                  {pendingWholesalers.length === 0 ? (
                    <div className="text-center py-8">
                      <UserCheck className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No pending wholesaler approvals</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingWholesalers.map((wholesaler) => (
                        <div key={wholesaler._id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <h3 className="font-semibold">{wholesaler.name}</h3>
                              <p className="text-sm text-muted-foreground">{wholesaler.email}</p>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {wholesaler.district}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {wholesaler.phone}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground">{wholesaler.address}</p>
                              <p className="text-xs text-muted-foreground">
                                Registered: {new Date(wholesaler.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleUserApproval(wholesaler._id, "approve")}>
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleUserApproval(wholesaler._id, "reject")}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            {/* User Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filter Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={userFilter.search}
                      onChange={(e) => setUserFilter({ ...userFilter, search: e.target.value })}
                      className="pl-10"
                    />
                  </div>

                  <Select
                    value={userFilter.role}
                    onValueChange={(value) => setUserFilter({ ...userFilter, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="farmer">Farmers</SelectItem>
                      <SelectItem value="wholesaler">Wholesalers</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={userFilter.district}
                    onValueChange={(value) => setUserFilter({ ...userFilter, district: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Districts" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Districts</SelectItem>
                      {TELANGANA_DISTRICTS.map((district) => (
                        <SelectItem key={district} value={district}>
                          {district}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={userFilter.status}
                    onValueChange={(value) => setUserFilter({ ...userFilter, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    onClick={() => setUserFilter({ role: "all", district: "all", status: "all", search: "" })}
                  >
                    Clear Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Users List */}
            <Card>
              <CardHeader>
                <CardTitle>All Users ({getFilteredUsers().length})</CardTitle>
                <CardDescription>Manage platform users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getFilteredUsers().map((user) => (
                    <div key={user._id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold">{user.name}</h3>
                            <Badge variant={user.role === "farmer" ? "default" : "secondary"}>
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </Badge>
                            <Badge variant={user.isApproved ? "default" : "destructive"}>
                              {user.isApproved ? "Approved" : "Pending"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {user.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {user.email}
                              </span>
                            )}
                            {user.kisanId && <span>Kisan ID: {user.kisanId}</span>}
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {user.district}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {user.phone}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Joined: {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        {!user.isApproved && (
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleUserApproval(user._id, "approve")}>
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleUserApproval(user._id, "reject")}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="crops" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Crop Listings ({crops.length})</CardTitle>
                <CardDescription>Monitor platform crop listings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {crops.map((crop) => (
                    <div key={crop._id} className="border rounded-lg p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{crop.cropName}</h3>
                          <Badge variant={crop.isOrganic ? "default" : "secondary"}>
                            {crop.isOrganic ? "Organic" : "Inorganic"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">By {crop.farmerId.name}</p>
                        <div className="text-sm space-y-1">
                          <div>Price: ₹{crop.pricePerKg}/kg</div>
                          <div>Available: {crop.availableQuantity} kg</div>
                          <div>District: {crop.district}</div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Posted: {new Date(crop.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Transactions ({buyRequests.length})</CardTitle>
                <CardDescription>Monitor platform transactions and buy requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {buyRequests.map((request) => (
                    <div key={request._id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h3 className="font-semibold">
                            {request.cropId.cropName} - {request.requestedQuantity} kg
                          </h3>
                          <div className="text-sm text-muted-foreground">
                            <span>From: {request.wholesalerId.name}</span>
                            <span className="mx-2">→</span>
                            <span>To: {request.farmerId.name}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span>Amount: ₹{request.totalPrice}</span>
                            <span>Date: {new Date(request.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <Badge
                          variant={
                            request.status === "pending"
                              ? "secondary"
                              : request.status === "approved"
                                ? "default"
                                : "destructive"
                          }
                        >
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
