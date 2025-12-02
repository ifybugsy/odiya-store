"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import {
  Users,
  Package,
  AlertCircle,
  LayoutDashboard,
  Settings,
  LogOut,
  Bell,
  X,
  Truck,
  Store,
  MessageSquare,
  Star,
  TrendingUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Badge } from "@/components/ui/badge"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

// Inline AdminSidebar Component
function AdminSidebar({ onLogout }: { onLogout: () => void }) {
  const pathname = usePathname()

  const menuItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/items", label: "Item Management", icon: Package },
    { href: "/admin/vendors", label: "Vendors", icon: Store },
    { href: "/admin/users", label: "User Management", icon: Users },
    { href: "/admin/boosts", label: "Boost Requests", icon: TrendingUp },
    { href: "/admin/messages", label: "Messages", icon: MessageSquare },
    { href: "/admin/ratings", label: "Ratings & Reviews", icon: Star },
    { href: "/admin/activity", label: "Activity Tracking", icon: AlertCircle },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ]

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border h-screen sticky top-0 flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <h2 className="text-lg font-bold text-sidebar-foreground">Admin Panel</h2>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start gap-3 ${
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Button>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <Button
          onClick={onLogout}
          variant="outline"
          className="w-full justify-start gap-2 text-sidebar-foreground bg-transparent"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </Button>
      </div>
    </aside>
  )
}

function DashboardHeader({ user, title, description }: any) {
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [notificationCount, setNotificationCount] = useState(0)

  useEffect(() => {
    const mockNotifications = [
      { id: 1, message: "New item pending approval", timestamp: new Date() },
      { id: 2, message: "3 new user registrations", timestamp: new Date(Date.now() - 3600000) },
      { id: 3, message: "System backup completed", timestamp: new Date(Date.now() - 7200000) },
    ]
    setNotifications(mockNotifications)
    setNotificationCount(mockNotifications.length)
  }, [])

  return (
    <div className="bg-background border-b border-border px-6 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      <div className="flex items-center gap-2 relative">
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground relative"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell className="w-5 h-5" />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            )}
          </Button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-border rounded-lg shadow-lg z-50">
              <div className="p-4 border-b border-border flex justify-between items-center">
                <h3 className="font-semibold">Notifications ({notificationCount})</h3>
                <button onClick={() => setShowNotifications(false)} className="p-1 hover:bg-muted rounded">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground text-center">
                    <p>No new notifications</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {notifications.map((notif) => (
                      <div key={notif.id} className="p-3 hover:bg-muted/50 transition-colors">
                        <p className="text-sm text-foreground">{notif.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{notif.timestamp.toLocaleTimeString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <Link href="/admin/settings">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <Star className="w-5 h-5" />
          </Button>
        </Link>
      </div>
    </div>
  )
}

// Inline StatsCard Component
function StatsCard({ label, value, icon, trend, className = "" }: any) {
  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground font-medium">{label}</p>
          <p className="text-3xl font-bold text-foreground mt-2">{value}</p>
          {trend && (
            <p className={`text-xs font-medium mt-2 ${trend.isPositive ? "text-green-600" : "text-red-600"}`}>
              {trend.isPositive ? "+" : ""}
              {trend.value}% from last month
            </p>
          )}
        </div>
        <div className="text-muted-foreground/50">{icon}</div>
      </div>
    </Card>
  )
}

// Inline PendingItemsSection Component
function PendingItemsSection({ items, onApprove, onReject, onDelete, onTogglePromoted, isLoading = false }: any) {
  if (items.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Package className="w-12 h-12 text-green-600 mx-auto mb-3 opacity-50" />
        <p className="text-muted-foreground text-lg font-medium">No pending items</p>
        <p className="text-sm text-muted-foreground mt-1">All items have been reviewed</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {items.map((item: any) => (
        <Card key={item._id} className="p-6 hover:shadow-md transition-shadow">
          <div className="flex gap-6 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-bold text-lg text-foreground">{item.title}</h3>
                {item.isPromoted && (
                  <Badge className="bg-gradient-to-r from-pink-500 to-red-500 text-white">Promoted</Badge>
                )}
              </div>
              <p className="text-muted-foreground text-sm mb-3">{item.description?.substring(0, 100)}...</p>
              <div className="flex gap-4 text-sm flex-wrap">
                <span className="font-semibold text-primary">₦{item.price?.toLocaleString()}</span>
                <span className="text-muted-foreground">{item.category}</span>
                <span className="text-muted-foreground">
                  Seller: {item.sellerId?.firstName} {item.sellerId?.lastName}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() => onApprove(item._id)}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Approve
            </Button>
            <Button onClick={() => onReject(item._id)} disabled={isLoading} variant="outline">
              Reject
            </Button>
            <Button
              onClick={() => onTogglePromoted(item._id)}
              disabled={isLoading}
              className={`transition-all ${
                item.isPromoted
                  ? "bg-gray-500 hover:bg-gray-600 text-white"
                  : "bg-orange-600 hover:bg-orange-700 text-white"
              }`}
              variant="default"
            >
              {item.isPromoted ? "✓ Promoted" : "🚀 Promote"}
            </Button>
            <Button onClick={() => onDelete(item._id)} disabled={isLoading} variant="destructive">
              Delete
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )
}

// Inline ApprovedItemsSection Component
function ApprovedItemsSection({ items, onTogglePromoted, isLoading = false }: any) {
  if (items.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Package className="w-12 h-12 text-blue-600 mx-auto mb-3 opacity-50" />
        <p className="text-muted-foreground text-lg font-medium">No approved items</p>
        <p className="text-sm text-muted-foreground mt-1">Items will appear here once approved</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {items.map((item: any) => (
        <Card key={item._id} className="p-6 hover:shadow-md transition-shadow">
          <div className="flex gap-6 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-bold text-lg text-foreground">{item.title}</h3>
                {item.isPromoted && (
                  <Badge className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white animate-pulse">
                    ✨ Promoted
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground text-sm mb-3">{item.description?.substring(0, 100)}...</p>
              <div className="flex gap-4 text-sm flex-wrap">
                <span className="font-semibold text-primary">₦{item.price?.toLocaleString()}</span>
                <span className="text-muted-foreground">{item.category}</span>
                <span className="text-muted-foreground">
                  Seller: {item.sellerId?.firstName} {item.sellerId?.lastName}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() => onTogglePromoted(item._id)}
              disabled={isLoading}
              className={`transition-all ${
                item.isPromoted
                  ? "bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white"
                  : "bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white animate-bounce"
              }`}
              variant="default"
            >
              {item.isPromoted ? "✓ Promoted" : "🚀 Promote Now"}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )
}

export default function AdminPage() {
  const { user, token, isLoading } = useAuth()
  const router = useRouter()
  const [tab, setTab] = useState("items")
  const [stats, setStats] = useState<any>(null)
  const [pendingItems, setPendingItems] = useState([])
  const [approvedItems, setApprovedItems] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    if (isLoading) {
      return
    }

    if (!user) {
      setAuthError("Please log in to access admin dashboard")
      setTimeout(() => router.push("/admin-login"), 1000)
      return
    }

    if (!user.isAdmin) {
      setAuthError("You do not have admin privileges")
      setTimeout(() => router.push("/"), 1000)
      return
    }

    if (!token) {
      setAuthError("Authentication token missing")
      setTimeout(() => router.push("/admin-login"), 1000)
      return
    }

    loadData()
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [user, token, isLoading, router])

  const loadData = async () => {
    setLoading(true)
    try {
      const [statsRes, itemsRes, approvedItemsRes, usersRes] = await Promise.all([
        fetch(`${API_URL}/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/admin/pending-items`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/admin/approved-items`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      if (statsRes.ok) setStats(await statsRes.json())
      if (itemsRes.ok) setPendingItems(await itemsRes.json())
      if (approvedItemsRes.ok) setApprovedItems(await approvedItemsRes.json())
      if (usersRes.ok) setUsers(await usersRes.json())
    } catch (error) {
      console.error("[v0] Failed to load admin data:", error)
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

  const handleTogglePromoted = async (itemId: string) => {
    try {
      const response = await fetch(`${API_URL}/items/${itemId}/promoted`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("[v0] Promote API error:", response.status, errorData)
        alert(`Failed to toggle promoted status: ${errorData.message || response.statusText}`)
        return
      }

      await loadData()
      console.log("[v0] Item promotion status toggled successfully:", itemId)
    } catch (error) {
      console.error("[v0] Failed to toggle promoted status:", error)
      alert("Failed to toggle promoted status. Please try again.")
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
      <AdminSidebar onLogout={handleLogout} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader
          user={user}
          title="Dashboard"
          description="Welcome to your admin panel. Manage items, vendors, users, and platform metrics."
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-8 gap-4">
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
                    label="Total Riders"
                    value={stats.totalRiders || 0}
                    icon={<Truck className="w-8 h-8" />}
                    trend={{ value: 15, isPositive: true }}
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
                  <StatsCard
                    label="Total Revenue"
                    value={`₦${(stats.totalRevenue || 0).toLocaleString("en-NG", { maximumFractionDigits: 0 })}`}
                    icon={<AlertCircle className="w-8 h-8" />}
                    className="border-green-200 bg-green-50/50"
                  />
                  <StatsCard
                    label="Completed Payments"
                    value={stats.totalPaymentsCompleted || 0}
                    icon={<AlertCircle className="w-8 h-8" />}
                    className="border-blue-200 bg-blue-50/50"
                  />
                  <StatsCard
                    label="Avg Payment"
                    value={`₦${(stats.averagePayment || 0).toLocaleString("en-NG", { maximumFractionDigits: 0 })}`}
                    icon={<AlertCircle className="w-8 h-8" />}
                    className="border-purple-200 bg-purple-50/50"
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
                    onClick={() => setTab("approved")}
                    className={`px-4 py-3 font-medium transition-colors border-b-2 ${
                      tab === "approved"
                        ? "text-primary border-primary"
                        : "text-muted-foreground hover:text-foreground border-transparent"
                    }`}
                  >
                    Approved Items ({approvedItems.length})
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
                  onTogglePromoted={handleTogglePromoted}
                  isLoading={loading}
                />
              )}

              {tab === "approved" && (
                <ApprovedItemsSection
                  items={approvedItems}
                  onTogglePromoted={handleTogglePromoted}
                  isLoading={loading}
                />
              )}

              {tab === "users" && (
                <div className="space-y-4">
                  {users.length === 0 ? (
                    <Card className="p-12 text-center">
                      <Users className="w-12 h-12 text-gray-600 mx-auto mb-3 opacity-50" />
                      <p className="text-muted-foreground text-lg font-medium">No users found</p>
                    </Card>
                  ) : (
                    users.map((user: any) => (
                      <Card key={user._id} className="p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-bold">
                              {user.firstName} {user.lastName}
                            </h3>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                          <div className="flex gap-2">
                            {user.isSuspended ? (
                              <Button onClick={() => handleUnsuspendUser(user._id)} size="sm" className="bg-green-600">
                                Unsuspend
                              </Button>
                            ) : (
                              <Button onClick={() => handleSuspendUser(user._id)} size="sm" variant="destructive">
                                Suspend
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))
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
