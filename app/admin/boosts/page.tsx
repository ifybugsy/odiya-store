"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, TrendingUp, Package, Store, RefreshCw, Calendar } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

interface BoostRequest {
  _id: string
  userId: any
  itemId?: any
  vendorId?: any
  amount: number
  status: string
  type: "item" | "vendor"
  createdAt: string
  updatedAt: string
}

export default function AdminBoostsPage() {
  const { user, token, isLoading } = useAuth()
  const router = useRouter()
  const [boostRequests, setBoostRequests] = useState<BoostRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && (!user || !user.isAdmin)) {
      router.push("/admin-login")
      return
    }

    if (user && user.isAdmin && token) {
      loadBoostRequests()
    }
  }, [user, token, isLoading, router])

  const loadBoostRequests = async () => {
    if (!token) return

    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/admin/boost-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        const data = await res.json()
        setBoostRequests(data.boostRequests || [])
      }
    } catch (error) {
      console.error("[v0] Failed to load boost requests:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveBoost = async (paymentId: string, type: "item" | "vendor") => {
    if (!token) return

    setProcessing(paymentId)
    try {
      const res = await fetch(`${API_URL}/admin/approve-boost/${paymentId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type }),
      })

      if (res.ok) {
        const data = await res.json()
        alert(`✅ Boost approved! ${type === "item" ? "Item" : "Vendor"} is now promoted for 30 days.`)
        await loadBoostRequests()
      } else {
        const error = await res.json().catch(() => ({ error: "Failed to approve boost" }))
        alert(error.error || "Failed to approve boost")
      }
    } catch (error) {
      console.error("[v0] Failed to approve boost:", error)
      alert("An error occurred")
    } finally {
      setProcessing(null)
    }
  }

  const handleRejectBoost = async (paymentId: string) => {
    if (!token || !confirm("Are you sure you want to reject this boost request?")) return

    setProcessing(paymentId)
    try {
      const res = await fetch(`${API_URL}/admin/reject-boost/${paymentId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (res.ok) {
        alert("Boost request rejected")
        await loadBoostRequests()
      } else {
        const error = await res.json().catch(() => ({ error: "Failed to reject boost" }))
        alert(error.error || "Failed to reject boost")
      }
    } catch (error) {
      console.error("[v0] Failed to reject boost:", error)
      alert("An error occurred")
    } finally {
      setProcessing(null)
    }
  }

  if (isLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const pendingBoosts = boostRequests.filter((b) => b.status === "pending")
  const completedBoosts = boostRequests.filter((b) => b.status === "completed")

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Boost Requests</h1>
            <p className="text-muted-foreground mt-1">Manage item and vendor boost/promotion requests</p>
          </div>
          <Button onClick={loadBoostRequests} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Pending Boosts */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            Pending Approvals ({pendingBoosts.length})
          </h2>

          {pendingBoosts.length === 0 ? (
            <Card className="p-12 text-center">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground">No pending boost requests</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingBoosts.map((boost) => (
                <Card key={boost._id} className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        {boost.type === "item" ? (
                          <Package className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Store className="w-5 h-5 text-purple-600" />
                        )}
                        <h3 className="font-bold text-lg text-foreground">
                          {boost.type === "item" ? "Item Boost" : "Vendor Boost"}
                        </h3>
                        <Badge
                          variant="outline"
                          className="bg-yellow-50 text-yellow-800 border-yellow-300 animate-pulse"
                        >
                          🔔 Pending
                        </Badge>
                      </div>

                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="text-muted-foreground">User:</span>{" "}
                          <span className="font-medium">
                            {boost.userId?.firstName} {boost.userId?.lastName} ({boost.userId?.email})
                          </span>
                        </p>
                        {boost.itemId && (
                          <p>
                            <span className="text-muted-foreground">Item:</span>{" "}
                            <span className="font-medium">{boost.itemId?.title || boost.itemId}</span>
                          </p>
                        )}
                        {boost.vendorId && (
                          <p>
                            <span className="text-muted-foreground">Vendor:</span>{" "}
                            <span className="font-medium">{boost.vendorId?.storeName || boost.vendorId}</span>
                          </p>
                        )}
                        <p>
                          <span className="text-muted-foreground">Amount:</span>{" "}
                          <span className="font-bold text-green-600">₦{boost.amount?.toLocaleString()}</span>
                        </p>
                        <p>
                          <span className="text-muted-foreground">Requested:</span>{" "}
                          <span className="font-medium">{new Date(boost.createdAt).toLocaleString()}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={() => handleApproveBoost(boost._id, boost.type)}
                        disabled={processing === boost._id}
                        className="bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-bold shadow-lg"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {processing === boost._id ? "Processing..." : "✅ Approve & Promote"}
                      </Button>
                      <Button
                        onClick={() => handleRejectBoost(boost._id)}
                        disabled={processing === boost._id}
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Completed Boosts */}
        <div>
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-600" />
            Completed Boosts ({completedBoosts.length})
          </h2>

          {completedBoosts.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No completed boosts yet</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {completedBoosts.map((boost) => (
                <Card key={boost._id} className="p-4 bg-green-50/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {boost.type === "item" ? (
                        <Package className="w-4 h-4 text-green-600" />
                      ) : (
                        <Store className="w-4 h-4 text-green-600" />
                      )}
                      <div>
                        <p className="font-medium text-sm">
                          {boost.type === "item" ? boost.itemId?.title : boost.vendorId?.storeName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ₦{boost.amount?.toLocaleString()} • {new Date(boost.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-green-600 text-white">Completed</Badge>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
