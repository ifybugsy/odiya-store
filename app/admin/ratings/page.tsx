"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AdminSidebar from "@/components/admin/admin-sidebar"
import DashboardHeader from "@/components/admin/dashboard-header"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Star, TrendingUp } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export default function AdminRatingsPage() {
  const { user, token, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [vendors, setVendors] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [totalVendorRatings, setTotalVendorRatings] = useState(0)
  const [totalUserRatings, setTotalUserRatings] = useState(0)

  useEffect(() => {
    if (authLoading) return

    if (!user?.isAdmin || !token) {
      router.push("/admin-login")
      return
    }

    loadRatings()
  }, [user, token, authLoading, router])

  const loadRatings = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/ratings`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        const data = await res.json()
        setVendors(data.vendors || [])
        setUsers(data.users || [])
        setTotalVendorRatings(data.totalVendorRatings || 0)
        setTotalUserRatings(data.totalUserRatings || 0)
      }
    } catch (error) {
      console.error("Failed to load ratings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("user")
    router.push("/")
  }

  const filteredVendors = vendors.filter((v) => v.storeName?.toLowerCase().includes(searchQuery.toLowerCase()))

  const filteredUsers = users.filter(
    (u) =>
      u.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.lastName?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar onLogout={handleLogout} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader
          user={user}
          title="Ratings & Reviews"
          description="Monitor all vendor and user ratings across the platform"
        />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-yellow-500/10 rounded-lg">
                    <Star className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Vendor Ratings</p>
                    <p className="text-2xl font-bold">{totalVendorRatings}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total User Ratings</p>
                    <p className="text-2xl font-bold">{totalUserRatings}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-500/10 rounded-lg">
                    <Star className="h-6 w-6 text-green-600 fill-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Average Rating</p>
                    <p className="text-2xl font-bold">
                      {vendors.length > 0
                        ? (vendors.reduce((sum, v) => sum + (v.averageRating || 0), 0) / vendors.length).toFixed(1)
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Search */}
            <Card className="p-4">
              <Input
                type="text"
                placeholder="Search vendors or users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </Card>

            {/* Vendor Ratings */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Vendor Ratings</h2>
              <div className="space-y-3">
                {filteredVendors.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No vendors found</p>
                ) : (
                  filteredVendors.map((vendor) => (
                    <div
                      key={vendor._id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg"
                    >
                      <div>
                        <p className="font-semibold text-foreground">{vendor.storeName}</p>
                        <p className="text-sm text-muted-foreground">{vendor.totalReviews || 0} reviews</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        <span className="text-xl font-bold">{vendor.averageRating?.toFixed(1) || "N/A"}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* User Ratings */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Seller Ratings</h2>
              <div className="space-y-3">
                {filteredUsers.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No sellers found</p>
                ) : (
                  filteredUsers.map((u) => (
                    <div key={u._id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div>
                        <p className="font-semibold text-foreground">
                          {u.firstName} {u.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">{u.ratingCount || 0} ratings</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        <span className="text-xl font-bold">{u.rating?.toFixed(1) || "N/A"}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
