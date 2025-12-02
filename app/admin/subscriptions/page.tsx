"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AdminSidebar from "@/components/admin/admin-sidebar"
import DashboardHeader from "@/components/admin/dashboard-header"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Clock, TrendingUp, CheckCircle, Send } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

interface Subscription {
  _id: string
  vendorId: { _id: string; storeName: string; status: string; isPromoted: boolean }
  userId: { firstName: string; lastName: string; email: string }
  planName: string
  amount: number
  status: string
  expiryDate: string
  daysUntilExpiry: number
  isExpiring: boolean
  isExpired: boolean
}

export default function SubscriptionsPage() {
  const { user, token, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    if (!authLoading && !user?.isAdmin) {
      router.push("/")
    }
  }, [authLoading, user, router])

  useEffect(() => {
    if (token) {
      loadSubscriptions()
      loadStats()
      const interval = setInterval(() => {
        loadSubscriptions()
        loadStats()
      }, 20000)
      return () => clearInterval(interval)
    }
  }, [token, filterType, statusFilter])

  const loadSubscriptions = async () => {
    try {
      const res = await fetch(`${API_URL}/subscriptions?filterType=${filterType}&status=${statusFilter}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setSubscriptions(data.subscriptions)
      } else {
        console.error("[v0] Failed to load subscriptions:", res.status)
      }
    } catch (error) {
      console.error("[v0] Failed to load subscriptions:", error)
      toast({
        title: "Error",
        description: "Failed to load subscriptions",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const res = await fetch(`${API_URL}/subscriptions/stats/overview`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error("[v0] Failed to load stats:", error)
    }
  }

  const sendReminder = async (subscriptionId: string) => {
    try {
      const res = await fetch(`${API_URL}/subscriptions/${subscriptionId}/send-reminder`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        toast({
          title: "Success",
          description: "Reminder sent to vendor",
        })
        loadSubscriptions()
      }
    } catch (error) {
      console.error("[v0] Failed to send reminder:", error)
      toast({
        title: "Error",
        description: "Failed to send reminder",
        variant: "destructive",
      })
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("user")
    router.push("/")
  }

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar onLogout={handleLogout} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader
          user={user}
          title="Vendor Subscriptions"
          description="Monitor and manage vendor monthly subscriptions (All, Expired, Promoted Vendors)"
        />

        <main className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Statistics Cards */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4 bg-green-50 border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Subscriptions</p>
                      <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                </Card>

                <Card className="p-4 bg-yellow-50 border-yellow-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Expiring Soon</p>
                      <p className="text-2xl font-bold text-yellow-600">{stats.expiring}</p>
                    </div>
                    <Clock className="w-8 h-8 text-yellow-600" />
                  </div>
                </Card>

                <Card className="p-4 bg-red-50 border-red-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Expired</p>
                      <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
                    </div>
                    <AlertCircle className="w-8 h-8 text-red-600" />
                  </div>
                </Card>

                <Card className="p-4 bg-blue-50 border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                      <p className="text-2xl font-bold text-blue-600">₦{(stats.totalRevenue / 1000).toFixed(0)}k</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-blue-600" />
                  </div>
                </Card>
              </div>
            )}

            {/* Filters */}
            <div className="flex gap-3 flex-wrap">
              <Button variant={filterType === "all" ? "default" : "outline"} onClick={() => setFilterType("all")}>
                All ({subscriptions.length})
              </Button>
              <Button
                variant={filterType === "expiring" ? "default" : "outline"}
                onClick={() => setFilterType("expiring")}
              >
                Expiring Soon
              </Button>
              <Button
                variant={filterType === "expired" ? "default" : "outline"}
                onClick={() => setFilterType("expired")}
              >
                Expired
              </Button>
              <Button
                variant={filterType === "promoted" ? "default" : "outline"}
                onClick={() => setFilterType("promoted")}
              >
                Promoted Vendors
              </Button>
            </div>

            {/* Subscriptions List */}
            {loading ? (
              <Card className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading subscriptions...</p>
              </Card>
            ) : subscriptions.length === 0 ? (
              <Card className="p-12 text-center">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No subscriptions found</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {subscriptions.map((sub) => (
                  <Card key={sub._id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{sub.vendorId.storeName}</h3>
                          <Badge
                            variant={sub.isExpired ? "destructive" : sub.isExpiring ? "secondary" : "default"}
                            className={
                              sub.isExpired
                                ? "bg-red-600"
                                : sub.isExpiring
                                  ? "bg-yellow-600 text-white"
                                  : "bg-green-600 text-white"
                            }
                          >
                            {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                          </Badge>
                          {sub.vendorId.isPromoted && <Badge className="bg-pink-600 text-white">Promoted</Badge>}
                        </div>

                        <p className="text-sm text-muted-foreground mb-3">
                          {sub.userId.firstName} {sub.userId.lastName} ({sub.userId.email})
                        </p>

                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Plan</p>
                            <p className="font-semibold">{sub.planName}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Amount</p>
                            <p className="font-semibold">₦{sub.amount.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Expiry Date</p>
                            <p className="font-semibold">{new Date(sub.expiryDate).toLocaleDateString("en-NG")}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Days Left</p>
                            <p
                              className={`font-semibold ${
                                sub.isExpired ? "text-red-600" : sub.isExpiring ? "text-yellow-600" : "text-green-600"
                              }`}
                            >
                              {Math.max(0, sub.daysUntilExpiry)} days
                            </p>
                          </div>
                        </div>
                      </div>

                      {sub.isExpiring && !sub.isExpired && (
                        <Button size="sm" variant="outline" onClick={() => sendReminder(sub._id)} className="ml-4">
                          <Send className="w-4 h-4 mr-2" />
                          Send Reminder
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
