"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ShoppingCart,
  Search,
  Filter,
  Package,
  MessageSquare,
  TrendingUp,
  IndianRupee,
  MapPin,
  Plus,
  Minus,
} from "lucide-react"
import { TELANGANA_DISTRICTS } from "@/lib/constants.js"

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
  farmerId: {
    _id: string
    name: string
    phone: string
  }
}

interface CartItem {
  crop: Crop
  quantity: number
}

interface BuyRequest {
  _id: string
  cropId: {
    _id: string
    cropName: string
    pricePerKg: number
  }
  farmerId: {
    _id: string
    name: string
  }
  requestedQuantity: number
  totalPrice: number
  status: string
  pickupDate: string
  message: string
  createdAt: string
}

export default function WholesalerDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [crops, setCrops] = useState<Crop[]>([])
  const [filteredCrops, setFilteredCrops] = useState<Crop[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [buyRequests, setBuyRequests] = useState<BuyRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDistrict, setSelectedDistrict] = useState("all")
  const [organicFilter, setOrganicFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")

  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (!token || !userData) {
      router.push("/auth/login")
      return
    }

    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== "wholesaler") {
      router.push("/auth/login")
      return
    }

    setUser(parsedUser)

    // Load cart from localStorage
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }

    fetchDashboardData(token)
  }, [router])

  useEffect(() => {
    // Apply filters
    const filtered = crops.filter((crop) => {
      const matchesSearch =
        crop.cropName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crop.district.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesDistrict = selectedDistrict === "all" || crop.district === selectedDistrict
      const matchesOrganic =
        organicFilter === "all" ||
        (organicFilter === "organic" && crop.isOrganic) ||
        (organicFilter === "inorganic" && !crop.isOrganic)

      return matchesSearch && matchesDistrict && matchesOrganic
    })

    // Apply sorting
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.pricePerKg - b.pricePerKg)
        break
      case "price-high":
        filtered.sort((a, b) => b.pricePerKg - a.pricePerKg)
        break
      case "newest":
      default:
        // Already sorted by newest from API
        break
    }

    setFilteredCrops(filtered)
  }, [crops, searchTerm, selectedDistrict, organicFilter, sortBy])

  const fetchDashboardData = async (token: string) => {
    try {
      const [cropsResponse, requestsResponse] = await Promise.all([
        fetch("/api/wholesaler/crops", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/wholesaler/buy-requests", {
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

  const addToCart = (crop: Crop) => {
    const existingItem = cart.find((item) => item.crop._id === crop._id)
    let newCart: CartItem[]

    if (existingItem) {
      newCart = cart.map((item) =>
        item.crop._id === crop._id
          ? { ...item, quantity: Math.min(item.quantity + crop.minimumOrderQuantity, crop.availableQuantity) }
          : item,
      )
    } else {
      newCart = [...cart, { crop, quantity: crop.minimumOrderQuantity }]
    }

    setCart(newCart)
    localStorage.setItem("cart", JSON.stringify(newCart))
  }

  const updateCartQuantity = (cropId: string, newQuantity: number) => {
    const newCart = cart
      .map((item) => {
        if (item.crop._id === cropId) {
          const quantity = Math.max(item.crop.minimumOrderQuantity, Math.min(newQuantity, item.crop.availableQuantity))
          return { ...item, quantity }
        }
        return item
      })
      .filter((item) => item.quantity > 0)

    setCart(newCart)
    localStorage.setItem("cart", JSON.stringify(newCart))
  }

  const removeFromCart = (cropId: string) => {
    const newCart = cart.filter((item) => item.crop._id !== cropId)
    setCart(newCart)
    localStorage.setItem("cart", JSON.stringify(newCart))
  }

  const getTotalCartValue = () => {
    return cart.reduce((total, item) => total + item.crop.pricePerKg * item.quantity, 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="w-8 h-8 text-primary mx-auto mb-4 animate-pulse" />
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
            <ShoppingCart className="w-12 h-12 text-primary mx-auto mb-4" />
            <CardTitle>Account Pending Approval</CardTitle>
            <CardDescription>
              Your wholesaler account is waiting for admin approval. You'll be able to access the dashboard once
              approved.
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
                <ShoppingCart className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Wholesaler Dashboard</h1>
                <p className="text-sm text-muted-foreground">Welcome back, {user?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Button variant="outline" size="sm" className="relative bg-transparent">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Cart ({cart.length})
                  {cart.length > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                      {cart.length}
                    </Badge>
                  )}
                </Button>
              </div>
              <Button
                onClick={() => {
                  localStorage.removeItem("token")
                  localStorage.removeItem("user")
                  localStorage.removeItem("cart")
                  router.push("/")
                }}
                variant="outline"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="browse" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="browse" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Browse Products ({filteredCrops.length})
            </TabsTrigger>
            <TabsTrigger value="cart" className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Cart ({cart.length})
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              My Orders ({buyRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Search & Filter
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search crops or districts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
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

                  <Select value={organicFilter} onValueChange={setOrganicFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="organic">Organic Only</SelectItem>
                      <SelectItem value="inorganic">Inorganic Only</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("")
                      setSelectedDistrict("all")
                      setOrganicFilter("all")
                      setSortBy("newest")
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Products Grid */}
            {filteredCrops.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No crops found</h3>
                  <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCrops.map((crop) => (
                  <Card key={crop._id} className="overflow-hidden">
                    <div className="aspect-video bg-muted overflow-hidden">
                      <img
                        src={crop.image || "/placeholder.svg"}
                        alt={crop.cropName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{crop.cropName}</CardTitle>
                        <Badge variant={crop.isOrganic ? "default" : "secondary"}>
                          {crop.isOrganic ? "Organic" : "Inorganic"}
                        </Badge>
                      </div>
                      <CardDescription>By {crop.farmerId.name}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2">
                        <IndianRupee className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold text-lg">₹{crop.pricePerKg}/kg</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{crop.district}</span>
                      </div>
                      <div className="text-sm space-y-1">
                        <div>Available: {crop.availableQuantity} kg</div>
                        <div>Min Order: {crop.minimumOrderQuantity} kg</div>
                      </div>
                      <Button
                        onClick={() => addToCart(crop)}
                        className="w-full"
                        disabled={cart.some((item) => item.crop._id === crop._id)}
                      >
                        {cart.some((item) => item.crop._id === crop._id) ? "In Cart" : "Add to Cart"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="cart" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Shopping Cart</h2>
                <p className="text-muted-foreground">Review your selected items</p>
              </div>
              {cart.length > 0 && (
                <div className="text-right">
                  <div className="text-2xl font-bold">₹{getTotalCartValue().toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">Total Amount</div>
                </div>
              )}
            </div>

            {cart.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
                  <p className="text-muted-foreground mb-4">Browse products to add items to your cart</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <Card key={item.crop._id}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={item.crop.image || "/placeholder.svg"}
                            alt={item.crop.cropName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{item.crop.cropName}</h3>
                          <p className="text-sm text-muted-foreground">By {item.crop.farmerId.name}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <Badge variant={item.crop.isOrganic ? "default" : "secondary"}>
                              {item.crop.isOrganic ? "Organic" : "Inorganic"}
                            </Badge>
                            <span className="text-sm text-muted-foreground">{item.crop.district}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold">₹{item.crop.pricePerKg}/kg</div>
                          <div className="flex items-center gap-2 mt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updateCartQuantity(item.crop._id, item.quantity - item.crop.minimumOrderQuantity)
                              }
                              disabled={item.quantity <= item.crop.minimumOrderQuantity}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="w-16 text-center">{item.quantity} kg</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updateCartQuantity(item.crop._id, item.quantity + item.crop.minimumOrderQuantity)
                              }
                              disabled={item.quantity >= item.crop.availableQuantity}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            Total: ₹{(item.crop.pricePerKg * item.quantity).toFixed(2)}
                          </div>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeFromCart(item.crop._id)}
                            className="mt-2"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between text-xl font-bold">
                      <span>Total Amount:</span>
                      <span>₹{getTotalCartValue().toFixed(2)}</span>
                    </div>
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={() => router.push("/wholesaler/checkout")}
                      disabled={cart.length === 0}
                    >
                      Proceed to Checkout
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">My Orders</h2>
              <p className="text-muted-foreground">Track your purchase requests and orders</p>
            </div>

            {buyRequests.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
                  <p className="text-muted-foreground">Your purchase requests will appear here</p>
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
                          <CardDescription>From: {request.farmerId.name}</CardDescription>
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
                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <strong>Total Amount:</strong> ₹{request.totalPrice}
                        </div>
                        <div>
                          <strong>Pickup Date:</strong> {new Date(request.pickupDate).toLocaleDateString()}
                        </div>
                        <div>
                          <strong>Ordered:</strong> {new Date(request.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      {request.message && (
                        <div className="bg-muted p-3 rounded-lg">
                          <p className="text-sm">
                            <strong>Your Message:</strong> {request.message}
                          </p>
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
