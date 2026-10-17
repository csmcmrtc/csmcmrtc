"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Wheat, Plus, Package, MessageSquare, IndianRupee, Calendar, MapPin } from "lucide-react"
import Link from "next/link"

interface User {
  _id: string
  name: string
  role: string
  isApproved: boolean
}

interface Crop {
  _id: string
  cropName: string
  image: string
  district: string
  pricePerKg: number
  isOrganic: boolean
  minimumOrderQuantity: number
  availableQuantity: number
  farmerLocation: string
  isActive: boolean
  createdAt: string
}

interface BuyRequest {
  _id: string
  wholesalerId: {
    _id: string
    name: string
    email: string
    phone: string
  }
  cropId: {
    _id: string
    cropName: string
    pricePerKg: number
  }
  requestedQuantity: number
  totalPrice: number
  status: string
  pickupDate: string
  message: string
  createdAt: string
}

export default function FarmerDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [crops, setCrops] = useState<Crop[]>([])
  const [buyRequests, setBuyRequests] = useState<BuyRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (!token || !userData) {
      router.push("/auth/login")
      return
    }

    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== "farmer") {
      router.push("/auth/login")
      return
    }

    setUser(parsedUser)
    fetchDashboardData(token)
  }, [router])

  const fetchDashboardData = async (token: string) => {
    try {
      const [cropsResponse, requestsResponse] = await Promise.all([
        fetch("/api/farmer/crops", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/farmer/buy-requests", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      if (cropsResponse.ok) {
        const cropsData = await cropsResponse.json()
        setCrops(cropsData.crops || [])
      }

      if (requestsResponse.ok) {
        const requestsData = await requestsResponse.json()
        setBuyRequests(requestsData.requests || [])
      }
    } catch (err) {
      setError("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const handleCropAction = async (cropId: string, action: "activate" | "deactivate" | "delete") => {
    const token = localStorage.getItem("token")
    if (!token) return

    try {
      let response
      if (action === "delete") {
        response = await fetch(`/api/farmer/crops?id=${cropId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        })
      } else {
        response = await fetch("/api/farmer/crops", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ 
            cropId, 
            isActive: action === "activate" 
          }),
        })
      }

      if (response.ok) {
        if (action === "delete") {
          setCrops((prev) => prev.filter((crop) => crop._id !== cropId))
        } else {
          setCrops((prev) => 
            prev.map((crop) => 
              crop._id === cropId 
                ? { ...crop, isActive: action === "activate" } 
                : crop
            )
          )
        }
      }
    } catch (err) {
      setError(`Failed to ${action} crop`)
    }
  }

  const handleRequestAction = async (requestId: string, action: "approved" | "rejected") => {
    const token = localStorage.getItem("token")
    if (!token) return

    try {
      const response = await fetch(`/api/farmer/buy-requests/${requestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: action }),
      })

      if (response.ok) {
        setBuyRequests((prev) => prev.map((req) => (req._id === requestId ? { ...req, status: action } : req)))
        
        // Refresh crops data if request was approved to update available quantities
        if (action === "approved") {
          const cropsResponse = await fetch("/api/farmer/crops", {
            headers: { Authorization: `Bearer ${token}` },
          })
          if (cropsResponse.ok) {
            const cropsData = await cropsResponse.json()
            setCrops(cropsData.crops || [])
          }
        }
      }
    } catch (err) {
      setError("Failed to update request")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Wheat className="w-8 h-8 text-primary mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user?.isApproved) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <Wheat className="w-12 h-12 text-primary mx-auto mb-4" />
            <CardTitle>Account Pending Approval</CardTitle>
            <CardDescription>
              Your farmer account is waiting for admin approval. You'll be able to access the dashboard once approved.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/auth/login")} variant="outline">
              Back to Login
            </Button>
          </CardContent>
        </Card>
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
                <Wheat className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Farmer Dashboard</h1>
                <p className="text-sm text-muted-foreground">Welcome back, {user?.name}</p>
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

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              My Products ({crops.length})
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Buy Requests ({buyRequests.filter((r) => r.status === "pending").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">My Crop Listings</h2>
                <p className="text-muted-foreground">Manage your posted crops</p>
              </div>
              <Button asChild>
                <Link href="/farmer/add-crop">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Crop
                </Link>
              </Button>
            </div>

            {crops.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No crops posted yet</h3>
                  <p className="text-muted-foreground mb-4">Start by adding your first crop listing</p>
                  <Button asChild>
                    <Link href="/farmer/add-crop">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Crop
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {crops.map((crop) => (
                  <Card key={crop._id}>
                    <CardHeader className="pb-3">
                      <div className="aspect-video bg-muted rounded-lg mb-3 overflow-hidden">
                        <img
                          src={crop.image || "/placeholder.svg"}
                          alt={crop.cropName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{crop.cropName}</CardTitle>
                        <Badge variant={crop.isOrganic ? "default" : "secondary"}>
                          {crop.isOrganic ? "Organic" : "Inorganic"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <IndianRupee className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold">₹{crop.pricePerKg}/kg</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{crop.district}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">Available: {crop.availableQuantity} kg</div>
                      <div className="text-sm text-muted-foreground">Min Order: {crop.minimumOrderQuantity} kg</div>
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline" className="flex-1 bg-transparent" asChild>
                          <Link href={`/farmer/edit-crop/${crop._id}`}>
                            Edit
                          </Link>
                        </Button>
                        <Button 
                          size="sm" 
                          variant={crop.isActive ? "destructive" : "default"} 
                          className="flex-1"
                          onClick={() => handleCropAction(crop._id, crop.isActive ? "deactivate" : "activate")}
                        >
                          {crop.isActive ? "Deactivate" : "Activate"}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => handleCropAction(crop._id, "delete")}
                        >
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="requests" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Buy Requests</h2>
              <p className="text-muted-foreground">Review and respond to wholesaler requests</p>
            </div>

            {buyRequests.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No buy requests yet</h3>
                  <p className="text-muted-foreground">Requests from wholesalers will appear here</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {buyRequests.map((request) => (
                  <Card key={request._id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {request.cropId.cropName} - {request.requestedQuantity} kg
                          </CardTitle>
                          <CardDescription>From: {request.wholesalerId.name}</CardDescription>
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
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <IndianRupee className="w-4 h-4 text-muted-foreground" />
                          <span>Total: ₹{request.totalPrice}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>Pickup: {new Date(request.pickupDate).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {request.message && (
                        <div className="bg-muted p-3 rounded-lg">
                          <p className="text-sm">
                            <strong>Message:</strong> {request.message}
                          </p>
                        </div>
                      )}

                      <div className="text-sm text-muted-foreground">
                        <p>
                          <strong>Contact:</strong> {request.wholesalerId.email}
                        </p>
                        <p>
                          <strong>Phone:</strong> {request.wholesalerId.phone}
                        </p>
                      </div>

                      {request.status === "pending" && (
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            onClick={() => handleRequestAction(request._id, "approved")}
                            className="flex-1"
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRequestAction(request._id, "rejected")}
                            className="flex-1"
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
