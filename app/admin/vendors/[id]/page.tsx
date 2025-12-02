"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Store, Mail, Phone, MapPin, Calendar, Activity, TrendingUp, Users, DollarSign } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

interface VendorActivity {
  _id: string
  activityType: string
  description: string
  severity: string
  timestamp: string
  metadata?: any
}

interface Vendor {
  _id: string
  storeName: string
  storeDescription: string
  status: string
  userId: {
    firstName: string
    lastName: string
    email: string
    phone?: string
    city?: string
  }
  totalSales: number
  totalRevenue: number
  followers_count: number
  ratings: number
  ratingCount: number
  createdAt: string
  approvedAt?: string
}

export default function VendorDetailPage() {
  const { user, token, isLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const vendorId = params.id as string

  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [activities, setActivities] = useState<VendorActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isLoading) return
    if (!user?.isAdmin) {
      router.push("/")
      return
    }

    loadVendorDetails()
  }, [user, token, isLoading, vendorId, router])

  const loadVendorDetails = async () => {
    if (!token) return

    try {
      setLoading(true)

      // Load vendor details
      const vendorRes = await fetch(`${API_URL}/admin/vendors/${vendorId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (vendorRes.ok) {
        const vendorData = await vendorRes.json()
        setVendor(vendorData)
      }

      // Load vendor activities
      const activitiesRes = await fetch(`${API_URL}/admin/vendors/${vendorId}/activities`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (activitiesRes.ok) {
        const activitiesData = await activitiesRes.json()
        setActivities(activitiesData.activities || [])
      }
    } catch (error) {
      console.error("[v0] Failed to load vendor details:", error)
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-blue-100 text-blue-800 border-blue-200"
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background py-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          </div>
        </main>
      </>
    )
  }

  if (!vendor) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background py-8">
          <div className="max-w-7xl mx-auto px-4">
            <p className="text-center text-muted-foreground">Vendor not found</p>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="mb-6">
            <Button variant="ghost" onClick={() => router.push("/admin/vendors")} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Vendors
            </Button>
            <div className="flex items-center gap-4">
              <Store className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold text-foreground">{vendor.storeName}</h1>
                <p className="text-muted-foreground">{vendor.storeDescription || "No description"}</p>
              </div>
              <Badge
                className={
                  vendor.status === "approved"
                    ? "bg-green-100 text-green-800 border-green-200"
                    : vendor.status === "pending"
                      ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                      : "bg-red-100 text-red-800 border-red-200"
                }
              >
                {vendor.status.toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Sales</p>
                  <p className="text-2xl font-bold">{vendor.totalSales}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                  <p className="text-2xl font-bold">₦{(vendor.totalRevenue / 1000).toFixed(1)}K</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Followers</p>
                  <p className="text-2xl font-bold">{vendor.followers_count}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Rating</p>
                  <p className="text-2xl font-bold">
                    {vendor.ratings.toFixed(1)} ({vendor.ratingCount})
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Vendor Information */}
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Vendor Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{vendor.userId.email}</p>
                </div>
              </div>

              {vendor.userId.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{vendor.userId.phone}</p>
                  </div>
                </div>
              )}

              {vendor.userId.city && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{vendor.userId.city}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Joined</p>
                  <p className="font-medium">{new Date(vendor.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Recent Activities */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Recent Activities</h2>
            {activities.length > 0 ? (
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div
                    key={activity._id}
                    className="flex items-start justify-between p-4 bg-muted/50 rounded-lg border"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getSeverityColor(activity.severity)}>{activity.severity}</Badge>
                        <span className="text-sm text-muted-foreground">{activity.activityType.replace("_", " ")}</span>
                      </div>
                      <p className="text-sm">{activity.description}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                      {new Date(activity.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No recent activities</p>
            )}
          </Card>
        </div>
      </main>
    </>
  )
}
