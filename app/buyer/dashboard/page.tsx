"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { useBuyerAuth } from "@/lib/buyer-auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, MapPin, Clock } from "lucide-react"

export default function BuyerDashboardPage() {
  const { buyer, isLoading } = useBuyerAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !buyer) {
      router.push("/buyer/login")
    }
  }, [buyer, isLoading, router])

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen">
          <div className="flex items-center justify-center h-screen">
            <Card className="p-8">
              <p className="text-muted-foreground">Loading...</p>
            </Card>
          </div>
        </main>
      </>
    )
  }

  if (!buyer) {
    return null
  }

  const stats = [
    {
      label: "Active Orders",
      value: "0",
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      label: "Pending Deliveries",
      value: "0",
      icon: MapPin,
      color: "text-amber-600",
    },
    {
      label: "Average Delivery Time",
      value: "--",
      icon: Clock,
      color: "text-purple-600",
    },
  ]

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-background to-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground">Welcome, {buyer.firstName}!</h1>
            <p className="text-muted-foreground mt-2">Browse and purchase items from trusted sellers</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <Card key={stat.label}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Main Content Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Your Shopping Hub</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Explore and discover amazing products from our marketplace
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      Start browsing our collection of items from trusted sellers. Use the search and filter options to
                      find exactly what you're looking for.
                    </p>
                    <Button onClick={() => router.push("/")} className="bg-primary hover:bg-primary/90">
                      Browse Items
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Account Info Sidebar */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Account Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="text-muted-foreground">Email:</span>
                      <br />
                      <span className="font-semibold break-all">{buyer.email}</span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">Phone:</span>
                      <br />
                      <span className="font-semibold">{buyer.phone || "Not provided"}</span>
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full bg-transparent"
                      onClick={() => router.push("/saved-items")}
                    >
                      View Saved Items
                    </Button>
                    <Button variant="outline" className="w-full bg-transparent" onClick={() => router.push("/profile")}>
                      Edit Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
