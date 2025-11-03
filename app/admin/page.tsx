"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AdminSidebar from "@/components/admin/admin-sidebar"
import DashboardHeader from "@/components/admin/dashboard-header"
import StatsCard from "@/components/admin/stats-card"
import PendingItemsSection from "@/components/admin/pending-items-section"
import { useAuth } from "@/lib/auth-context"
import { Ban, Users, Package, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://odiya-store.onrender.com/"

export default function AdminPage() {
  const { user, token, isLoading } = useAuth()
  const router = useRouter()
  const [tab, setTab] = useState("items")
  const [stats, setStats] = useState<any>(null)
  const [pendingItems, setPendingItems] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    if (isLoading) {
      return
    }

    console.log("[v0] Auth state - user:", user, "token:", token, "isAdmin:", user?.isAdmin)

    if (!user) {
      console.log("[v0] No user found, redirecting to login")
      setAuthError("Please log in to access admin dashboard")
      setTimeout(() => router.push("/admin-login"), 1000)
      return
    }

    if (!user.isAdmin) {
      console.log("[v0] User is not admin, redirecting to home")
      setAuthError("You do not have admin privileges")
      setTimeout(() => router.push("/"), 1000)
      return
    }

    if (!token) {
      console.log("[v0] No token found, redirecting to login")
      setAuthError("Authentication token missing")
      setTimeout(() => router.push("/admin-login"), 1000)
      return
    }

    console.log("[v0] Admin authorization successful, loading data")
    loadData()
  }, [user, token, isLoading, router])

  const loadData = async () => {
    setLoading(true)
    try {
      const [statsRes, itemsRes, usersRes] = await Promise.all([
        fetch(`${API_URL}/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/admin/pending-items`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      if (statsRes.ok) setStats(await statsRes.json())
      if (itemsRes.ok) setPendingItems(await itemsRes.json())
      if (usersRes.ok) setUsers(await usersRes.json())
    } catch (error) {
      console.error("Failed to load admin data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveItem = async (itemId: string) => {
    try {
      await fetch(`${API_URL}/admin/items/${itemId}/approve`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      })
      loadData()
    } catch (error) {
      console.error("Failed to approve item:", error)
    }
  }

  const handleRejectItem = async (itemId: string) => {
    try {
      await fetch(`${API_URL}/admin/items/${itemId}/reject`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      })
      loadData()
    } catch (error) {
      console.error("Failed to reject item:", error)
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Delete this item?")) return
    try {
      await fetch(`${API_URL}/admin/items/${itemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      loadData()
    } catch (error) {
      console.error("Failed to delete item:", error)
    }
  }

  const handleSuspendUser = async (userId: string) => {
    if (!confirm("Suspend this user?")) return
    try {
      await fetch(`${API_URL}/admin/users/${userId}/suspend`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      })
      loadData()
    } catch (error) {
      console.error("Failed to suspend user:", error)
    }
  }

  const handleUnsuspendUser = async (userId: string) => {
    try {
      await fetch(`${API_URL}/admin/users/${userId}/unsuspend`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      })
      loadData()
    } catch (error) {
      console.error("Failed to unsuspend user:", error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("user")
    router.push("/")
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading authentication...</p>
        </div>
      </div>
    )
  }

  if (authError) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card className="p-8 max-w-md text-center">
          <p className="text-red-600 font-semibold mb-4">{authError}</p>
          <p className="text-sm text-muted-foreground mb-4">Redirecting...</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <AdminSidebar onLogout={handleLogout} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <DashboardHeader
          user={user}
          title="Dashboard"
          description="Welcome to your admin panel. Manage items, users, and platform metrics."
        />

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading dashboard data...</p>
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-8">
              {/* Stats Grid */}
              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatsCard
                    label="Total Users"
                    value={stats.totalUsers}
                    icon={<Users className="w-8 h-8" />}
                    trend={{ value: 12, isPositive: true }}
                  />
                  <StatsCard
                    label="Total Sellers"
                    value={stats.totalSellers}
                    icon={<Users className="w-8 h-8" />}
                    trend={{ value: 8, isPositive: true }}
                  />
                  <StatsCard
                    label="Active Items"
                    value={stats.totalItems}
                    icon={<Package className="w-8 h-8" />}
                    trend={{ value: 5, isPositive: true }}
                  />
                  <StatsCard
                    label="Pending Items"
                    value={stats.pendingItems}
                    icon={<AlertCircle className="w-8 h-8" />}
                    className="border-orange-200 bg-orange-50/50"
                  />
                </div>
              )}

              {/* Tab Navigation */}
              <div className="border-b border-border">
                <div className="flex gap-8">
                  <button
                    onClick={() => setTab("items")}
                    className={`px-4 py-3 font-medium transition-colors border-b-2 ${
                      tab === "items"
                        ? "text-primary border-primary"
                        : "text-muted-foreground hover:text-foreground border-transparent"
                    }`}
                  >
                    Pending Items ({pendingItems.length})
                  </button>
                  <button
                    onClick={() => setTab("users")}
                    className={`px-4 py-3 font-medium transition-colors border-b-2 ${
                      tab === "users"
                        ? "text-primary border-primary"
                        : "text-muted-foreground hover:text-foreground border-transparent"
                    }`}
                  >
                    Users ({users.length})
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              {tab === "items" && (
                <PendingItemsSection
                  items={pendingItems}
                  onApprove={handleApproveItem}
                  onReject={handleRejectItem}
                  onDelete={handleDeleteItem}
                  isLoading={loading}
                />
              )}

              {tab === "users" && (
                <div className="space-y-4">
                  {users.length === 0 ? (
                    <Card className="p-12 text-center">
                      <Users className="w-12 h-12 text-blue-600 mx-auto mb-3 opacity-50" />
                      <p className="text-muted-foreground text-lg font-medium">No users found</p>
                    </Card>
                  ) : (
                    <Card className="overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-muted/50 border-b border-border">
                            <tr>
                              <th className="text-left py-3 px-4 font-semibold">Name</th>
                              <th className="text-left py-3 px-4 font-semibold">Email</th>
                              <th className="text-left py-3 px-4 font-semibold">Type</th>
                              <th className="text-left py-3 px-4 font-semibold">Status</th>
                              <th className="text-left py-3 px-4 font-semibold">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {users.map((user) => (
                              <tr key={user._id} className="border-b border-border hover:bg-muted/50 transition-colors">
                                <td className="py-3 px-4 font-medium">
                                  {user.firstName} {user.lastName}
                                </td>
                                <td className="py-3 px-4 text-muted-foreground text-xs">{user.email}</td>
                                <td className="py-3 px-4">
                                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">
                                    {user.isSeller ? "Seller" : "Buyer"}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  <span
                                    className={`text-xs px-2 py-1 rounded font-medium ${
                                      user.isSuspended ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                                    }`}
                                  >
                                    {user.isSuspended ? "Suspended" : "Active"}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  {user.isSuspended ? (
                                    <Button
                                      onClick={() => handleUnsuspendUser(user._id)}
                                      size="sm"
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      Unsuspend
                                    </Button>
                                  ) : (
                                    <Button
                                      onClick={() => handleSuspendUser(user._id)}
                                      size="sm"
                                      variant="destructive"
                                      className="text-xs flex items-center gap-1"
                                    >
                                      <Ban className="w-3 h-3" />
                                      Suspend
                                    </Button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </Card>
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
