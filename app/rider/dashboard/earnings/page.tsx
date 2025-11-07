"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRiderAuth } from "@/lib/rider-auth-context"
import { DollarSign, TrendingUp } from "lucide-react"

interface EarningRecord {
  _id: string
  deliveryId: string
  amount: number
  status: "pending" | "paid"
  createdAt: string
  paidAt?: string
}

export default function EarningsPage() {
  const router = useRouter()
  const { rider, token } = useRiderAuth()
  const [earnings, setEarnings] = useState<EarningRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [totalEarnings, setTotalEarnings] = useState(0)
  const [pendingEarnings, setPendingEarnings] = useState(0)

  useEffect(() => {
    if (!rider || !token) {
      router.push("/rider/login")
      return
    }
    loadEarnings()
  }, [rider, token])

  const loadEarnings = async () => {
    try {
      const response = await fetch("/api/rider/earnings", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setEarnings(data.records || [])
        setTotalEarnings(data.totalEarnings || 0)
        setPendingEarnings(data.pendingEarnings || 0)
      }
    } catch (error) {
      console.error("Failed to load earnings:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading earnings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Earnings</h1>
        <p className="text-muted-foreground mt-1">Track your delivery earnings and payment history</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">₦{totalEarnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payment</CardTitle>
            <TrendingUp className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">₦{pendingEarnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting payout</p>
          </CardContent>
        </Card>
      </div>

      {/* Earnings History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          {earnings.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No earnings yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold">Delivery ID</th>
                    <th className="text-left py-3 px-4 font-semibold">Amount</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {earnings.map((earning) => (
                    <tr key={earning._id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4 font-mono text-xs text-muted-foreground">
                        {earning.deliveryId.substring(0, 8)}...
                      </td>
                      <td className="py-3 px-4 font-semibold text-foreground">₦{earning.amount.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <Badge
                          className={
                            earning.status === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {earning.status.charAt(0).toUpperCase() + earning.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {new Date(earning.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
