import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Wheat, Users, ShoppingCart, TrendingUp } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 to-secondary/10 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
              AgroConnect: Connecting Telangana Farmers with Wholesalers
            </h1>
            <p className="text-xl text-muted-foreground mb-8 text-pretty">
              AgroConnect is a direct marketplace platform where farmers can sell their crops and wholesalers can source
              quality produce from across Telangana's 33 districts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8">
                <Link href="/auth/register">Join as Farmer</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 bg-transparent">
                <Link href="/auth/register">Join as Wholesaler</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Simple, direct, and efficient marketplace for agricultural trade
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Wheat className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Farmers Post Crops</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Farmers register with Kisan ID and post their crops with details like price, quantity, and organic
                  certification.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-secondary" />
                </div>
                <CardTitle>Wholesalers Browse</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Wholesalers can search and filter crops by district, organic status, and price across all 33 Telangana
                  districts.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>Direct Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Wholesalers add crops to cart, place orders with minimum quantity requirements, and get pickup
                  details.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-chart-1/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-chart-1" />
                </div>
                <CardTitle>Approval System</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Farmers approve or reject buy requests, while admin manages user approvals for platform quality.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-muted py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of farmers and wholesalers already trading on our platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/auth/login">Login</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/auth/register">Create Account</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
