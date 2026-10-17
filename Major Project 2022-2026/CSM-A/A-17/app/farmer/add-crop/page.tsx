"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Upload, Wheat } from "lucide-react"
import { TELANGANA_DISTRICTS } from "@/lib/constants.js"
import Link from "next/link"

export default function AddCropPage() {
  const [formData, setFormData] = useState({
    cropName: "",
    image: "",
    district: "",
    pricePerKg: "",
    isOrganic: false,
    minimumOrderQuantity: "",
    availableQuantity: "",
    farmerLocation: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (!token || !userData) {
      router.push("/auth/login")
      return
    }

    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== "farmer" || !parsedUser.isApproved) {
      router.push("/farmer/dashboard")
      return
    }
  }, [router])

  const processImageFile = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file')
      return
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB')
      return
    }
    
    setImageFile(file)
    setError('') // Clear any previous errors
    
    // Create preview URL
    const reader = new FileReader()
    reader.onload = (e) => {
      setFormData({ ...formData, image: e.target?.result as string })
    }
    reader.onerror = () => {
      setError('Failed to read image file')
    }
    reader.readAsDataURL(file)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processImageFile(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      processImageFile(files[0])
    }
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
      // In a real app, you'd upload the image to a service like Cloudinary
      // For now, we'll use the base64 data URL
      const response = await fetch("/api/farmer/crops", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          pricePerKg: Number.parseFloat(formData.pricePerKg),
          minimumOrderQuantity: Number.parseInt(formData.minimumOrderQuantity),
          availableQuantity: Number.parseInt(formData.availableQuantity),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Crop added successfully!")
        setTimeout(() => {
          router.push("/farmer/dashboard")
        }, 2000)
      } else {
        setError(data.message || "Failed to add crop")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link href="/farmer/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Wheat className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Add New Crop</h1>
              <p className="text-sm text-muted-foreground">List your crop for wholesalers</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Crop Details</CardTitle>
            <CardDescription>Fill in the details about your crop to create a listing</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cropName">Crop Name</Label>
                  <Input
                    id="cropName"
                    type="text"
                    placeholder="e.g., Rice, Wheat, Tomato"
                    value={formData.cropName}
                    onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="district">District</Label>
                  <Select
                    value={formData.district}
                    onValueChange={(value) => setFormData({ ...formData, district: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select district" />
                    </SelectTrigger>
                    <SelectContent>
                      {TELANGANA_DISTRICTS.map((district) => (
                        <SelectItem key={district} value={district}>
                          {district}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Crop Image</Label>
                <div 
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    isDragOver 
                      ? 'border-primary bg-primary/5' 
                      : 'border-muted-foreground/25'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {formData.image ? (
                    <div className="space-y-4">
                      <img
                        src={formData.image || "/placeholder.svg"}
                        alt="Crop preview"
                        className="w-32 h-32 object-cover rounded-lg mx-auto"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setFormData({ ...formData, image: "" })
                          setImageFile(null)
                        }}
                      >
                        Change Image
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="w-12 h-12 text-muted-foreground mx-auto" />
                      <div>
                        <Input
                          id="imageInput"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          required
                        />
                        <Label htmlFor="imageInput" className="cursor-pointer">
                          <Button type="button" variant="outline">
                            Choose Image
                          </Button>
                        </Label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {isDragOver 
                          ? 'Drop your image here' 
                          : 'Upload a clear image of your crop or drag and drop'
                        }
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pricePerKg">Price per Kg (₹)</Label>
                  <Input
                    id="pricePerKg"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.pricePerKg}
                    onChange={(e) => setFormData({ ...formData, pricePerKg: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="availableQuantity">Available Quantity (kg)</Label>
                  <Input
                    id="availableQuantity"
                    type="number"
                    min="1"
                    placeholder="100"
                    value={formData.availableQuantity}
                    onChange={(e) => setFormData({ ...formData, availableQuantity: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minimumOrderQuantity">Min Order (kg)</Label>
                  <Input
                    id="minimumOrderQuantity"
                    type="number"
                    min="1"
                    placeholder="10"
                    value={formData.minimumOrderQuantity}
                    onChange={(e) => setFormData({ ...formData, minimumOrderQuantity: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="farmerLocation">Pickup Location</Label>
                <Textarea
                  id="farmerLocation"
                  placeholder="Enter the exact location where wholesalers can pickup the crop"
                  value={formData.farmerLocation}
                  onChange={(e) => setFormData({ ...formData, farmerLocation: e.target.value })}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isOrganic"
                  checked={formData.isOrganic}
                  onCheckedChange={(checked) => setFormData({ ...formData, isOrganic: checked })}
                />
                <Label htmlFor="isOrganic">This is an organic crop</Label>
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

              <div className="flex gap-4">
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? "Adding Crop..." : "Add Crop"}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/farmer/dashboard">Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
