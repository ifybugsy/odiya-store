"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { useBuyerAuth } from "@/lib/buyer-auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  MapPin,
  Users,
  Store,
  Heart,
  Package,
  AlertCircle,
  Star,
  MessageSquare,
  ShoppingBag,
  Award,
  Gift,
} from "lucide-react"
import Link from "next/link"
import UserMessagesPanel from "@/components/user-messages-panel"
import ReferralPanel from "@/components/referral-panel"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

interface BuyerStats {
  activeOrders: number
  pendingDeliveries: number
  totalSpent: number
  followedVendors: number
  savedItems: number
}

interface Vendor {
  _id: string
  storeName: string
  storeLogo: string
  ratings: number
  ratingCount: number
  followers_count: number
  totalSales: number
}

export default function BuyerDashboardPage() {
  const { buyer, isLoading, token } = useBuyerAuth()
  const router = useRouter()
  const [isSeller, setIsSeller] = useState(false)
  const [isVendor, setIsVendor] = useState(false)
  const [stats, setStats] = useState<BuyerStats>({
    activeOrders: 0,
    pendingDeliveries: 0,
    totalSpent: 0,
    followedVendors: 0,
    savedItems: 0,
  })
  const [followedVendors, setFollowedVendors] = useState<Vendor[]>([])
  const [loadingStats, setLoadingStats] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    if (!isLoading && !buyer) {
      router.push("/buyer/login")
    }
  }, [buyer, isLoading, router])

  useEffect(() => {
    if (buyer) {
      loadDashboardStats()
      checkUserStatus()
    }
  }, [buyer])

  const checkUserStatus = async () => {
    try {
      const authToken = token
      if (!authToken) return

      const response = await fetch(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })

      if (response.ok) {
        const userData = await response.json()
        setIsSeller(userData.isSeller || false)
        setIsVendor(userData.isVendor || false)
      }
    } catch (err) {
      console.error("[v0] Failed to check user status:", err)
    }
  }

  const loadDashboardStats = async () => {
    try {
      setLoadingStats(true)
      const authToken = token

      if (!authToken) {
        console.log("[v0] No buyer auth token found")
        setLoadingStats(false)
        return
      }

      const [ordersRes, vendorsRes] = await Promise.all([
        fetch(`${API_URL}/buyer/orders`, {
          headers: { Authorization: `Bearer ${authToken}` },
        }).catch(() => null),
        fetch(`${API_URL}/users/followed-vendors`, {
          headers: { Authorization: `Bearer ${authToken}` },
        }).catch(() => null),
      ])

      let activeOrders = 0
      let pendingDeliveries = 0
      let totalSpent = 0

      if (ordersRes?.ok) {
        const ordersData = await ordersRes.json()
        const ordersList = Array.isArray(ordersData) ? ordersData : ordersData.orders || []
        activeOrders = ordersList.filter((o: any) => ["pending", "confirmed", "shipped"].includes(o.status)).length
        pendingDeliveries = ordersList.filter((o: any) => o.status === "shipped").length
        totalSpent = ordersList.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0)
      }

      let followedVendorsData: Vendor[] = []
      let followedCount = 0
      if (vendorsRes?.ok) {
        const vendorsData = await vendorsRes.json()
        followedVendorsData = vendorsData.vendors || []
        followedCount = followedVendorsData.length
        setFollowedVendors(followedVendorsData.slice(0, 3))
      }

      setStats({
        activeOrders,
        pendingDeliveries,
        totalSpent,
        followedVendors: followedCount,
        savedItems: 0,
      })
      setError("")
    } catch (err) {
      console.error("[v0] Failed to load dashboard stats:", err)
      setError(err instanceof Error ? err.message : "Failed to load stats")
    } finally {
      setLoadingStats(false)
    }
  }

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

  const dashboardStats = [
    {
      label: "Active Orders",
      value: stats.activeOrders,
      icon: Package,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/30",
      link: "/buyer/orders",
    },
    {
      label: "Pending Deliveries",
      value: stats.pendingDeliveries,
      icon: MapPin,
      color: "text-amber-600",
      bgColor: "bg-amber-50 dark:bg-amber-950/30",
    },
    {
      label: "Total Spent",
      value: `₦${stats.totalSpent.toLocaleString()}`,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/30",
    },
    {
      label: "Followed Vendors",
      value: stats.followedVendors,
      icon: Store,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
      link: "/dashboard/followed-vendors",
    },
  ]

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold text-foreground">Welcome back, {buyer.firstName}!</h1>
                <p className="text-muted-foreground mt-2 text-lg">Your one-stop shop for trusted marketplace items</p>
              </div>
              <div className="hidden md:block text-right">
                <p className="text-sm text-muted-foreground">Member since</p>
                <p className="text-lg font-semibold text-foreground">
                  {buyer.createdAt ? new Date(buyer.createdAt).toLocaleDateString() : "Today"}
                </p>
              </div>
            </div>
          </div>

          {error && (
            <Card className="mb-6 p-4 border-yellow-200 bg-yellow-50 dark:bg-yellow-950/30">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800 dark:text-yellow-200">{error}</p>
              </div>
            </Card>
          )}

          {/* Tab Navigation */}
          <div className="mb-6 bg-white dark:bg-card rounded-xl shadow-sm border border-border p-2">
            <div className="flex gap-2 overflow-x-auto">
              {[
                { id: "overview", label: "Overview", icon: Package },
                { id: "messages", label: "Messages", icon: MessageSquare },
                { id: "referrals", label: "Referrals", icon: Gift },
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 min-w-fit px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                      activeTab === tab.id ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Overview Tab Content */}
          {activeTab === "overview" && (
            <>
              {/* Seller and Vendor Quick Access Card */}
              <Card className="mb-8 bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-background border-2 border-purple-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground mb-1">Grow Your Business</h2>
                      <p className="text-sm text-muted-foreground">Start selling or manage your vendor store</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Seller Card */}
                    <Card className="border-border hover:border-primary/50 transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                            <ShoppingBag className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-bold text-foreground">Seller Store</h3>
                            <p className="text-xs text-muted-foreground">List and sell items</p>
                          </div>
                        </div>
                        {isSeller ? (
                          <Button
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            onClick={() => router.push("/dashboard")}
                          >
                            <Store className="h-4 w-4 mr-2" />
                            Go to Your Store
                          </Button>
                        ) : (
                          <Button
                            className="w-full bg-transparent"
                            variant="outline"
                            onClick={() => router.push("/buyer/login?role=seller")}
                          >
                            Become a Seller
                          </Button>
                        )}
                      </CardContent>
                    </Card>

                    {/* Vendor Card */}
                    <Card className="border-border hover:border-primary/50 transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30">
                            <Store className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-bold text-foreground">Vendor Shop</h3>
                            <p className="text-xs text-muted-foreground">Manage your shop</p>
                          </div>
                        </div>
                        {isVendor ? (
                          <Button
                            className="w-full bg-green-600 hover:bg-green-700"
                            onClick={() => router.push("/vendor/dashboard")}
                          >
                            <Store className="h-4 w-4 mr-2" />
                            Go to Vendor Dashboard
                          </Button>
                        ) : (
                          <Button
                            className="w-full bg-transparent"
                            variant="outline"
                            onClick={() => router.push("/buyer/login?role=vendor")}
                          >
                            Become a Vendor
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>

              {/* Featured Vendor Card */}
              {followedVendors.length > 0 && (
                <Card className="mb-8 bg-gradient-to-br from-primary/10 via-primary/5 to-background border-2 border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-foreground mb-1">Your Followed Stores</h2>
                        <p className="text-sm text-muted-foreground">
                          You follow {stats.followedVendors} vendor{stats.followedVendors !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <Link href="/vendors">
                        <Button size="lg" variant="outline" className="bg-background hover:bg-muted">
                          View All
                        </Button>
                      </Link>
                    </div>

                    {/* Featured Vendors Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {followedVendors.slice(0, 3).map((vendor) => (
                        <Link key={vendor._id} href={`/vendor/${vendor._id}`}>
                          <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer border-border hover:border-primary/50">
                            <CardContent className="p-4 h-full flex flex-col gap-4">
                              <div className="w-full h-32 rounded-lg overflow-hidden bg-muted">
                                <img
                                  src={vendor.storeLogo || "/placeholder.svg"}
                                  alt={vendor.storeName}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-bold text-foreground line-clamp-2 mb-2">{vendor.storeName}</h3>
                                <div className="flex items-center gap-4 text-sm">
                                  <div className="flex items-center gap-1">
                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    <span className="font-semibold">{vendor.ratings?.toFixed(1) || "N/A"}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    <Users className="h-4 w-4" />
                                    <span>{vendor.followers_count || 0}</span>
                                  </div>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                className="w-full bg-primary hover:bg-primary/90"
                                onClick={(e) => {
                                  e.preventDefault()
                                  router.push(`/messages?vendorId=${vendor._id}&redirect=true`)
                                }}
                              >
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Message
                              </Button>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {dashboardStats.map((stat) => {
                  const Icon = stat.icon
                  return (
                    <Link key={stat.label} href={stat.link || "#"} className={stat.link ? "" : "pointer-events-none"}>
                      <Card className="hover:shadow-lg transition-shadow h-full cursor-pointer">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                          <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                            <Icon className={`h-4 w-4 ${stat.color}`} />
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{loadingStats ? "..." : stat.value}</div>
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })}
              </div>

              {/* Main Content Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  {/* Shopping Hub */}
                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="text-2xl flex items-center gap-2">
                        <ShoppingBag className="h-6 w-6" />
                        Shopping Hub
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-2">
                        Explore and discover amazing products from our trusted marketplace sellers
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p className="text-muted-foreground leading-relaxed">
                          Browse our collection of items from verified sellers. Use our search and filter options to
                          find exactly what you're looking for. Compare prices, read reviews, and make informed
                          purchases from trusted vendors.
                        </p>
                        <div className="flex gap-3 flex-wrap">
                          <Button onClick={() => router.push("/")} className="bg-primary hover:bg-primary/90">
                            <ShoppingBag className="w-4 h-4 mr-2" />
                            Browse Items
                          </Button>
                          <Button onClick={() => router.push("/vendors")} variant="outline">
                            <Store className="w-4 h-4 mr-2" />
                            Explore Vendors
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Features Section */}
                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="text-xl flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        Marketplace Features
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                          <div className="flex items-start gap-3">
                            <Star className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                            <div>
                              <h4 className="font-semibold text-foreground mb-1">Rate Vendors</h4>
                              <p className="text-sm text-muted-foreground">
                                Share your experience and help others choose
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-900/30">
                          <div className="flex items-start gap-3">
                            <Heart className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <h4 className="font-semibold text-foreground mb-1">Follow Vendors</h4>
                              <p className="text-sm text-muted-foreground">
                                Get updates on new items and special offers
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200/50 dark:border-purple-900/30">
                          <div className="flex items-start gap-3">
                            <MessageSquare className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <h4 className="font-semibold text-foreground mb-1">Direct Messaging</h4>
                              <p className="text-sm text-muted-foreground">
                                Connect directly with vendors for inquiries
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/30">
                          <div className="flex items-start gap-3">
                            <Heart className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <h4 className="font-semibold text-foreground mb-1">Save Items</h4>
                              <p className="text-sm text-muted-foreground">Bookmark your favorite items for later</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Account Info Sidebar */}
                <div className="space-y-4">
                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="text-lg">Account Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1 font-medium">Full Name</p>
                          <p className="font-semibold text-foreground">
                            {buyer.firstName} {buyer.lastName}
                          </p>
                        </div>
                        <div className="border-t border-border pt-4">
                          <p className="text-xs text-muted-foreground mb-1 font-medium">Email Address</p>
                          <p className="font-semibold break-all text-foreground text-sm">{buyer.email}</p>
                        </div>
                        <div className="border-t border-border pt-4">
                          <p className="text-xs text-muted-foreground mb-1 font-medium">Phone</p>
                          <p className="font-semibold text-foreground">{buyer.phone || "Not provided"}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="text-lg">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          className="w-full justify-start bg-background hover:bg-muted text-foreground"
                          onClick={() => router.push("/saved-items")}
                        >
                          <Heart className="w-4 h-4 mr-2" />
                          Saved Items
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start bg-background hover:bg-muted text-foreground"
                          onClick={() => router.push("/buyer/orders")}
                        >
                          <Package className="w-4 h-4 mr-2" />
                          My Orders
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start bg-background hover:bg-muted text-foreground"
                          onClick={() => router.push("/buyer/profile/edit")}
                        >
                          <Users className="w-4 h-4 mr-2" />
                          Edit Profile
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border bg-primary/5 border-primary/20">
                    <CardContent className="p-6">
                      <Badge className="bg-primary/20 text-primary mb-3">Pro Tip</Badge>
                      <p className="text-sm text-foreground leading-relaxed">
                        Follow vendors to stay updated with their latest items and exclusive offers!
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          )}

          {/* Messages Tab Content */}
          {activeTab === "messages" && (
            <div className="space-y-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    Your Messages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <UserMessagesPanel />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Referrals Tab Content */}
          {activeTab === "referrals" && (
            <div className="space-y-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="w-5 h-5 text-primary" />
                    Referral Program
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ReferralPanel />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
