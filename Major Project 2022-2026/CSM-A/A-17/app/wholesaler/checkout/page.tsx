"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, MapPin, ShoppingCart } from "lucide-react"
import Link from "next/link"

interface CartItem {
  crop: {
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
  quantity: number
}

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [pickupDate, setPickupDate] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")
    const savedCart = localStorage.getItem("cart")

    if (!token || !userData) {
      router.push("/auth/login")
      return
    }

    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== "wholesaler" || !parsedUser.isApproved) {
      router.push("/wholesaler/dashboard")
      return
    }

    if (!savedCart) {
      router.push("/wholesaler/dashboard")
      return
    }

    const parsedCart = JSON.parse(savedCart)
    if (parsedCart.length === 0) {
      router.push("/wholesaler/dashboard")
      return
    }

    setCart(parsedCart)

    // Set minimum pickup date to tomorrow
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    setPickupDate(tomorrow.toISOString().split("T")[0])
  }, [router])

  const getTotalCartValue = () => {
    return cart.reduce((total, item) => total + item.crop.pricePerKg * item.quantity, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/auth/login")
      return
    }

    try {
      // Create buy requests for each item in cart
      const requests = cart.map((item) => ({
        cropId: item.crop._id,
        farmerId: item.crop.farmerId._id,
        requestedQuantity: item.quantity,
        totalPrice: item.crop.pricePerKg * item.quantity,
        pickupDate,
        message,
      }))

      const promises = requests.map((request) =>
        fetch("/api/wholesaler/buy-requests", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(request),
        }),
      )

      const responses = await Promise.all(promises)
      const allSuccessful = responses.every((response) => response.ok)

      if (allSuccessful) {
        setSuccess("All buy requests sent successfully!")
        localStorage.removeItem("cart")
        setTimeout(() => {
          router.push("/wholesaler/dashboard?tab=orders")
        }, 2000)
      } else {
        setError("Some requests failed. Please try again.")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="w-8 h-8 text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading checkout...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link href="/wholesaler/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Checkout</h1>
              <p className="text-sm text-muted-foreground">Review and place your orders</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>Review your selected items</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.map((item) => (
                  <div key={item.crop._id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.crop.image || "/placeholder.svg"}
                        alt={item.crop.cropName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.crop.cropName}</h3>
                      <p className="text-sm text-muted-foreground">By {item.crop.farmerId.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={item.crop.isOrganic ? "default" : "secondary"} className="text-xs">
                          {item.crop.isOrganic ? "Organic" : "Inorganic"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{item.crop.district}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">₹{item.crop.pricePerKg}/kg</div>
                      <div className="text-sm text-muted-foreground">{item.quantity} kg</div>
                      <div className="font-semibold text-primary">
                        ₹{(item.crop.pricePerKg * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between text-xl font-bold">
                    <span>Total Amount:</span>
                    <span className="text-primary">₹{getTotalCartValue().toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pickup Locations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Pickup Locations
                </CardTitle>
                <CardDescription>Where you'll collect your orders</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.from(new Set(cart.map((item) => item.crop.farmerId._id))).map((farmerId) => {
                  const farmerItems = cart.filter((item) => item.crop.farmerId._id === farmerId)
                  const farmer = farmerItems[0].crop.farmerId
                  const location = farmerItems[0].crop.farmerLocation

                  return (
                    <div key={farmerId} className="p-4 border rounded-lg">
                      <h3 className="font-semibold">{farmer.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">Phone: {farmer.phone}</p>
                      <p className="text-sm">{location}</p>
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground">
                          Items: {farmerItems.map((item) => item.crop.cropName).join(", ")}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>

          {/* Order Details Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
                <CardDescription>Provide pickup date and any special instructions</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="pickupDate">Preferred Pickup Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="pickupDate"
                        type="date"
                        value={pickupDate}
                        onChange={(e) => setPickupDate(e.target.value)}
                        min={new Date(Date.now() + 86400000).toISOString().split("T")[0]} // Tomorrow
                        className="pl-10"
                        required
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Select when you'd like to pickup your orders. Minimum 1 day advance notice required.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message to Farmers (Optional)</Label>
                    <Textarea
                      id="message"
                      placeholder="Any special instructions or requirements..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                    />
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {success && (
                    <Alert>
                      <AlertDescription>{success}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-4">
                    <div className="bg-muted p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">Order Summary</h3>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Total Items:</span>
                          <span>{cart.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Quantity:</span>
                          <span>{cart.reduce((sum, item) => sum + item.quantity, 0)} kg</span>
                        </div>
                        <div className="flex justify-between font-semibold text-base border-t pt-2">
                          <span>Total Amount:</span>
                          <span>₹{getTotalCartValue().toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <Button type="submit" className="w-full" size="lg" disabled={loading}>
                      {loading ? "Placing Orders..." : "Place Orders"}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      By placing orders, you agree to pickup the items on the specified date and pay the farmers
                      directly.
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
