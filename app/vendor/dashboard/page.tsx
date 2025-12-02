"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useVendorAuth } from "@/lib/vendor-auth-context"
import SubscriptionStatusCard from "@/components/subscription-status-card"
import { BarChart3, Users, TrendingUp, Package, Store, Settings, MessageSquare, Gift, Upload } from "lucide-react"
import Link from "next/link"
import BoostButtonVendor from "@/components/boost-button-vendor"
import ReferralPanel from "@/components/referral-panel"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

interface VendorData {
  _id: string
  storeName: string
  storeDescription: string
  status: string
  ratings: number
  followers_count: number
  totalSales: number
  totalRevenue: number
  isPromoted: boolean
  promotedUntil: string | null
}

interface DashboardStats {
  totalSales: number
  totalRevenue: number
  followers: number
  items: number
}

export default function VendorDashboard() {
  const { vendor, vendorToken, isVendorLoading } = useVendorAuth()
  const router = useRouter()
  const [vendorData, setVendorData] = useState<VendorData | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [unreadMessages, setUnreadMessages] = useState(0)

  useEffect(() => {
    if (isVendorLoading) return
    if (!vendor || !vendorToken) {
      router.push("/vendor/login")
      return
    }
    loadVendorData()
    checkSubscriptionReminders()
  }, [vendor, vendorToken, isVendorLoading, router])

  const loadVendorData = async () => {
    if (!vendorToken) return

    try {
      setLoading(true)
      const [vendorRes, statsRes, messagesRes] = await Promise.all([
        fetch(`${API_URL}/vendors/my-store/profile`, {
          headers: { Authorization: `Bearer ${vendorToken}` },
        }),
        fetch(`${API_URL}/vendors/${vendor?.id}/stats`, {
          headers: { Authorization: `Bearer ${vendorToken}` },
        }).catch(() => null),
        fetch(`${API_URL}/vendors/${vendor?.id}/messages`, {
          headers: { Authorization: `Bearer ${vendorToken}` },
        }).catch(() => null),
      ])

      if (vendorRes.ok) {
        const data = await vendorRes.json()
        setVendorData(data)
      }

      if (statsRes?.ok) {
        const data = await statsRes.json()
        setStats(data)
      }

      if (messagesRes?.ok) {
        const data = await messagesRes.json()
        const unread = data.messages?.filter((m: any) => !m.isRead).length || 0
        setUnreadMessages(unread)
      }
    } catch (error) {
      console.error("[v0] Failed to load vendor data:", error)
    } finally {
      setLoading(false)
    }
  }

  const checkSubscriptionReminders = async () => {
    if (!vendorToken) return
    try {
      const res = await fetch(`${API_URL}/subscriptions/vendor/reminders`, {
        headers: { Authorization: `Bearer ${vendorToken}` },
      })
      if (res.ok) {
        const data = await res.json()
        if (data.reminder) {
          console.log("[v0] Subscription reminder:", data.reminder)
        }
      }
    } catch (error) {
      console.error("[v0] Failed to check reminders:", error)
    }
  }

  const statCards = [
    {
      label: "Total Sales",
      value: stats?.totalSales || 0,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Total Revenue",
      value: `₦${(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: BarChart3,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Followers",
      value: vendorData?.followers_count || 0,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      label: "Items Listed",
      value: stats?.items || 0,
      icon: Package,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ]

  if (isVendorLoading || loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-background via-purple/5 to-background">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <SubscriptionStatusCard />
          </div>

          {/* Modern Header */}
          <div className="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 p-8 text-white shadow-xl">
            <div className="relative z-10">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="text-white/90 text-sm mb-1">Welcome back,</p>
                  <h1 className="text-4xl font-bold mb-2">
                    {vendor?.firstName || vendor?.storeName || vendorData?.storeName || "Dashboard"}
                  </h1>
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge
                      className={`${
                        vendor?.status === "approved"
                          ? "bg-green-500"
                          : vendor?.status === "pending"
                            ? "bg-yellow-500"
                            : "bg-gray-500"
                      } border-0 text-white`}
                    >
                      {vendor?.status ? vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1) : "Unknown"}
                    </Badge>
                    {vendor?.status === "approved" && <p className="text-white/90">Your store is live</p>}
                  </div>
                </div>
                <div>
                  {vendor?.status === "approved" && (
                    <BoostButtonVendor
                      vendorId={vendor?.id || vendorData?._id}
                      isPromoted={
                        vendorData?.isPromoted &&
                        vendorData?.promotedUntil &&
                        new Date(vendorData.promotedUntil) > new Date()
                      }
                      onBoostSuccess={() => loadVendorData()}
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          </div>

          {/* Modern Tab Navigation */}
          <div className="mb-6 bg-white rounded-xl shadow-sm border border-border p-2">
            <div className="flex gap-2 overflow-x-auto">
              {[
                { id: "overview", label: "Overview", icon: BarChart3 },
                { id: "messages", label: "Messages", icon: MessageSquare, badge: unreadMessages },
                { id: "referrals", label: "Referrals", icon: Gift },
                { id: "settings", label: "Settings", icon: Settings },
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
                    {tab.badge !== undefined && tab.badge > 0 && (
                      <Badge className="bg-red-500 text-white ml-2">{tab.badge}</Badge>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat) => {
                  const Icon = stat.icon
                  return (
                    <Card key={stat.label} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                            <Icon className={`w-6 h-6 ${stat.color}`} />
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground font-medium mb-1">{stat.label}</p>
                        <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* Quick Actions */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-purple-50">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link href="/upload-item">
                      <div className="p-6 rounded-xl bg-white hover:shadow-md transition-all border border-border group">
                        <Upload className="w-8 h-8 text-primary mb-3" />
                        <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                          Upload New Item
                        </h3>
                        <p className="text-sm text-muted-foreground">Add products to your store</p>
                      </div>
                    </Link>
                    <Link href={`/vendor/${vendor?.id || vendorData?._id}`}>
                      <div className="p-6 rounded-xl bg-white hover:shadow-md transition-all border border-border group">
                        <Store className="w-8 h-8 text-primary mb-3" />
                        <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                          View Your Store
                        </h3>
                        <p className="text-sm text-muted-foreground">See your public storefront</p>
                      </div>
                    </Link>
                    <Link href={`/vendor/${vendor?.id || vendorData?._id}/items`}>
                      <div className="p-6 rounded-xl bg-white hover:shadow-md transition-all border border-border group">
                        <Package className="w-8 h-8 text-primary mb-3" />
                        <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                          Manage Products
                        </h3>
                        <p className="text-sm text-muted-foreground">Edit and organize items</p>
                      </div>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Messages Tab */}
          {activeTab === "messages" && (
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Customer Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <Link href={`/vendor/${vendor?.id || vendorData?._id}/messages`}>
                  <Button className="w-full bg-primary hover:bg-primary/90" size="lg">
                    View All Messages
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Referrals Tab */}
          {activeTab === "referrals" && (
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Referral Program</CardTitle>
              </CardHeader>
              <CardContent>
                <ReferralPanel />
              </CardContent>
            </Card>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Store Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <Link href={`/vendor/${vendor?.id || vendorData?._id}/settings`}>
                  <Button className="bg-primary hover:bg-primary/90" size="lg">
                    Go to Settings
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </>
  )
}
