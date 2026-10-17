"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Wheat, ArrowLeft } from "lucide-react"
import Link from "next/link"

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
}

export default function EditCrop({ params }: { params: { id: string } }) {
  const [crop, setCrop] = useState<Crop | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
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
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/auth/login")
      return
    }

    fetchCrop(token)
  }, [params.id, router])

  const fetchCrop = async (token: string) => {
    try {
      const response = await fetch(`/api/farmer/crops/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setCrop(data.crop)
        setFormData({
          cropName: data.crop.cropName,
          image: data.crop.image,
          district: data.crop.district,
          pricePerKg: data.crop.pricePerKg.toString(),
          isOrganic: data.crop.isOrganic,
          minimumOrderQuantity: data.crop.minimumOrderQuantity.toString(),
          availableQuantity: data.crop.availableQuantity.toString(),
          farmerLocation: data.crop.farmerLocation,
        })
      } else {
        setError("Failed to load crop data")
      }
    } catch (err) {
      setError("Failed to load crop data")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")

    const token = localStorage.getItem("token")
    if (!token) return

    try {
      const response = await fetch(`/api/farmer/crops/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cropName: formData.cropName,
          image: formData.image,
          district: formData.district,
          pricePerKg: parseFloat(formData.pricePerKg),
          isOrganic: formData.isOrganic,
          minimumOrderQuantity: parseInt(formData.minimumOrderQuantity),
          availableQuantity: parseInt(formData.availableQuantity),
          farmerLocation: formData.farmerLocation,
        }),
      })

      if (response.ok) {
        router.push("/farmer/dashboard")
      } else {
        const data = await response.json()
        setError(data.message || "Failed to update crop")
      }
    } catch (err) {
      setError("Failed to update crop")
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Wheat className="w-8 h-8 text-primary mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Loading crop data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/farmer/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Wheat className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Edit Crop</h1>
                <p className="text-sm text-muted-foreground">Update your crop listing</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Edit Crop Listing</CardTitle>
              <CardDescription>Update the information for your crop</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="cropName">Crop Name</Label>
                    <Input
                      id="cropName"
                      value={formData.cropName}
                      onChange={(e) => handleInputChange("cropName", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="district">District</Label>
                    <Select value={formData.district} onValueChange={(value) => handleInputChange("district", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select district" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ahmedabad">Ahmedabad</SelectItem>
                        <SelectItem value="Amreli">Amreli</SelectItem>
                        <SelectItem value="Anand">Anand</SelectItem>
                        <SelectItem value="Aravalli">Aravalli</SelectItem>
                        <SelectItem value="Banaskantha">Banaskantha</SelectItem>
                        <SelectItem value="Bharuch">Bharuch</SelectItem>
                        <SelectItem value="Bhavnagar">Bhavnagar</SelectItem>
                        <SelectItem value="Botad">Botad</SelectItem>
                        <SelectItem value="Chhota Udepur">Chhota Udepur</SelectItem>
                        <SelectItem value="Dahod">Dahod</SelectItem>
                        <SelectItem value="Dang">Dang</SelectItem>
                        <SelectItem value="Devbhoomi Dwarka">Devbhoomi Dwarka</SelectItem>
                        <SelectItem value="Gandhinagar">Gandhinagar</SelectItem>
                        <SelectItem value="Gir Somnath">Gir Somnath</SelectItem>
                        <SelectItem value="Jamnagar">Jamnagar</SelectItem>
                        <SelectItem value="Junagadh">Junagadh</SelectItem>
                        <SelectItem value="Kutch">Kutch</SelectItem>
                        <SelectItem value="Kheda">Kheda</SelectItem>
                        <SelectItem value="Mahisagar">Mahisagar</SelectItem>
                        <SelectItem value="Mehsana">Mehsana</SelectItem>
                        <SelectItem value="Morbi">Morbi</SelectItem>
                        <SelectItem value="Narmada">Narmada</SelectItem>
                        <SelectItem value="Navsari">Navsari</SelectItem>
                        <SelectItem value="Panchmahal">Panchmahal</SelectItem>
                        <SelectItem value="Patan">Patan</SelectItem>
                        <SelectItem value="Porbandar">Porbandar</SelectItem>
                        <SelectItem value="Rajkot">Rajkot</SelectItem>
                        <SelectItem value="Sabarkantha">Sabarkantha</SelectItem>
                        <SelectItem value="Surat">Surat</SelectItem>
                        <SelectItem value="Surendranagar">Surendranagar</SelectItem>
                        <SelectItem value="Tapi">Tapi</SelectItem>
                        <SelectItem value="Vadodara">Vadodara</SelectItem>
                        <SelectItem value="Valsad">Valsad</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pricePerKg">Price per kg (₹)</Label>
                    <Input
                      id="pricePerKg"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.pricePerKg}
                      onChange={(e) => handleInputChange("pricePerKg", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="availableQuantity">Available Quantity (kg)</Label>
                    <Input
                      id="availableQuantity"
                      type="number"
                      min="0"
                      value={formData.availableQuantity}
                      onChange={(e) => handleInputChange("availableQuantity", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="minimumOrderQuantity">Minimum Order Quantity (kg)</Label>
                    <Input
                      id="minimumOrderQuantity"
                      type="number"
                      min="1"
                      value={formData.minimumOrderQuantity}
                      onChange={(e) => handleInputChange("minimumOrderQuantity", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="farmerLocation">Farm Location</Label>
                    <Input
                      id="farmerLocation"
                      value={formData.farmerLocation}
                      onChange={(e) => handleInputChange("farmerLocation", e.target.value)}
                      placeholder="Village, Taluka, District"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Image URL</Label>
                  <Input
                    id="image"
                    type="url"
                    value={formData.image}
                    onChange={(e) => handleInputChange("image", e.target.value)}
                    placeholder="https://example.com/crop-image.jpg"
                    required
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isOrganic"
                    checked={formData.isOrganic}
                    onCheckedChange={(checked) => handleInputChange("isOrganic", checked)}
                  />
                  <Label htmlFor="isOrganic">Organic Crop</Label>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={saving} className="flex-1">
                    {saving ? "Saving..." : "Update Crop"}
                  </Button>
                  <Button type="button" variant="outline" asChild className="flex-1">
                    <Link href="/farmer/dashboard">Cancel</Link>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
