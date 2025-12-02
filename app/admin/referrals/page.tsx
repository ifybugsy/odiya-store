"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AdminSidebar from "@/components/admin-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { Users, DollarSign, TrendingUp, CheckCircle, Clock } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

interface ReferralStats {
  totalReferrals: number
  activeReferrals: number
  totalCommissions: number
  pendingCommissions: number
  paidCommissions: number
}

interface Referral {
  _id: string
  referrerId: {
    _id: string
    firstName: string
    lastName: string
    email: string
  }
  referredUserId: {
    _id: string
    firstName: string
    lastName: string
    email: string
  }
  referralCode: string
  status: string
  totalEarnings: number
  createdAt: string
}

interface Commission {
  _id: string
  referrerId: {
    _id: string
    firstName: string
    lastName: string
    email: string
  }
  referredUserId: {
    firstName: string
    lastName: string
  }
  boostType: string
  boostAmount: number
  commissionAmount: number
  status: string
  createdAt: string
  paidAt?: string
}

export default function AdminReferralsPage() {
  const { user, token } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.isAdmin || !token) {
      router.push("/admin/login")
      return
    }

    loadReferralData()
  }, [user, token, router])

  const loadReferralData = async () => {
    if (!token) return

    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/admin/referrals`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        const data = await res.json()
        setStats(data.stats)
        setReferrals(data.referrals)
        setCommissions(data.commissions)
      }
    } catch (error) {
      console.error("[v0] Failed to load referral data:", error)
    } finally {
      setLoading(false)
    }
  }

  const markCommissionAsPaid = async (commissionId: string) => {
    if (!token) return

    setProcessingId(commissionId)
    try {
      const res = await fetch(`${API_URL}/admin/referrals/commission/${commissionId}/pay`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        await loadReferralData()
      }
    } catch (error) {
      console.error("[v0] Failed to mark commission as paid:", error)
    } finally {
      setProcessingId(null)
    }
  }

  const statCards = [
    {
      label: "Total Referrals",
      value: stats?.totalReferrals || 0,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Active Referrals",
      value: stats?.activeReferrals || 0,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Total Commissions",
      value: `₦${(stats?.totalCommissions || 0).toFixed(2)}`,
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      label: "Pending Payments",
      value: `₦${(stats?.pendingCommissions || 0).toFixed(2)}`,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ]

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <AdminSidebar />
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Referral Management</h1>
            <p className="text-muted-foreground">Monitor referrals and manage commission payments</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

          {/* Tab Navigation */}
          <div className="mb-6 bg-white rounded-xl shadow-sm border border-border p-2">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("overview")}
                className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === "overview" ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:bg-muted"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("referrals")}
                className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === "referrals" ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:bg-muted"
                }`}
              >
                All Referrals
              </button>
              <button
                onClick={() => setActiveTab("commissions")}
                className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === "commissions"
                    ? "bg-primary text-white shadow-md"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                Commissions
              </button>
            </div>
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Referrals */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Recent Referrals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {referrals.slice(0, 5).map((referral) => (
                      <div key={referral._id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-semibold">
                            {referral.referredUserId.firstName} {referral.referredUserId.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Referred by {referral.referrerId.firstName} {referral.referrerId.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">Code: {referral.referralCode}</p>
                        </div>
                        <Badge
                          className={`${referral.status === "active" ? "bg-green-600" : "bg-gray-500"} text-white`}
                        >
                          {referral.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Pending Commissions */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-600" />
                    Pending Commissions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {commissions
                      .filter((c) => c.status === "pending")
                      .slice(0, 5)
                      .map((commission) => (
                        <div key={commission._id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <p className="font-semibold">
                              {commission.referrerId.firstName} {commission.referrerId.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {commission.boostType === "item" ? "Item Boost" : "Vendor Boost"}
                            </p>
                            <p className="text-sm font-bold text-green-600 mt-1">
                              ₦{commission.commissionAmount.toFixed(2)}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => markCommissionAsPaid(commission._id)}
                            disabled={processingId === commission._id}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {processingId === commission._id ? "Processing..." : "Mark Paid"}
                          </Button>
                        </div>
                      ))}
                    {commissions.filter((c) => c.status === "pending").length === 0 && (
                      <div className="text-center py-8">
                        <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                        <p className="text-muted-foreground">No pending commissions</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* All Referrals Tab */}
          {activeTab === "referrals" && (
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>All Referrals ({referrals.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {referrals.map((referral) => (
                    <div key={referral._id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground font-medium mb-1">Referrer</p>
                              <p className="font-semibold">
                                {referral.referrerId.firstName} {referral.referrerId.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground">{referral.referrerId.email}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground font-medium mb-1">Referred User</p>
                              <p className="font-semibold">
                                {referral.referredUserId.firstName} {referral.referredUserId.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground">{referral.referredUserId.email}</p>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center gap-4 flex-wrap">
                            <div>
                              <p className="text-xs text-muted-foreground">Referral Code</p>
                              <p className="font-mono font-semibold">{referral.referralCode}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Total Earnings</p>
                              <p className="font-bold text-green-600">₦{referral.totalEarnings.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Joined</p>
                              <p className="text-sm">{new Date(referral.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                        <Badge
                          className={`${referral.status === "active" ? "bg-green-600" : "bg-gray-500"} text-white`}
                        >
                          {referral.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Commissions Tab */}
          {activeTab === "commissions" && (
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>All Commissions ({commissions.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {commissions.map((commission) => (
                    <div key={commission._id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="font-semibold">
                                {commission.referrerId.firstName} {commission.referrerId.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground">{commission.referrerId.email}</p>
                            </div>
                            <Badge
                              className={`${
                                commission.status === "paid"
                                  ? "bg-green-600"
                                  : commission.status === "pending"
                                    ? "bg-orange-500"
                                    : "bg-gray-500"
                              } text-white`}
                            >
                              {commission.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-xs text-muted-foreground">Commission</p>
                              <p className="font-bold text-green-600">₦{commission.commissionAmount.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Boost Type</p>
                              <p className="font-medium">
                                {commission.boostType === "item" ? "Item Boost" : "Vendor Boost"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Boost Amount</p>
                              <p className="font-medium">₦{commission.boostAmount.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">From</p>
                              <p className="font-medium">
                                {commission.referredUserId.firstName} {commission.referredUserId.lastName}
                              </p>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Created: {new Date(commission.createdAt).toLocaleDateString()}</span>
                            {commission.paidAt && <span>Paid: {new Date(commission.paidAt).toLocaleDateString()}</span>}
                          </div>
                        </div>
                        {commission.status === "pending" && (
                          <Button
                            size="sm"
                            onClick={() => markCommissionAsPaid(commission._id)}
                            disabled={processingId === commission._id}
                            className="bg-green-600 hover:bg-green-700 flex-shrink-0"
                          >
                            {processingId === commission._id ? "Processing..." : "Mark Paid"}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
