"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertCircle, ShoppingBag, Loader2, Mail, Phone } from "lucide-react"

interface Buyer {
  _id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  isActive: boolean
  isSuspended: boolean
  role: string
  createdAt: string
  totalOrders?: number
  totalSpent?: number
  lastOrderDate?: string
}

interface BuyerStats {
  totalBuyers: number
  activeBuyers: number
  suspendedBuyers: number
  totalOrders: number
  totalRevenue: number
  averageOrderValue: number
}

export function BuyersManagement() {
  const [buyers, setBuyers] = useState<Buyer[]>([])
  const [stats, setStats] = useState<BuyerStats | null>(null)
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "active" | "suspended" | "new">("all")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchBuyers()
    // Real-time polling every 15 seconds
    const interval = setInterval(fetchBuyers, 15000)
    return () => clearInterval(interval)
  }, [filter, searchQuery])

  const fetchBuyers = async () => {
    try {
      const token = localStorage.getItem("adminToken")
      const params = new URLSearchParams()
      params.append("filter", filter)
      if (searchQuery) params.append("search", searchQuery)

      const response = await fetch(`/api/admin/buyers?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setBuyers(data.buyers || [])
        setStats(data.stats)
      }
    } catch (error) {
      console.error("[v0] Error fetching buyers:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSuspendBuyer = async (buyerId: string) => {
    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch(`/api/admin/buyers/${buyerId}/suspend`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        fetchBuyers()
        setSelectedBuyer(null)
      }
    } catch (error) {
      console.error("[v0] Error suspending buyer:", error)
    }
  }

  const handleUnsuspendBuyer = async (buyerId: string) => {
    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch(`/api/admin/buyers/${buyerId}/unsuspend`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        fetchBuyers()
        setSelectedBuyer(null)
      }
    } catch (error) {
      console.error("[v0] Error unsuspending buyer:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Buyers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBuyers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.activeBuyers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Suspended</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.suspendedBuyers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Avg Order</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.averageOrderValue.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex gap-2">
          {["all", "active", "suspended", "new"].map((f) => (
            <Button key={f} variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f as any)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search by email or name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-3 py-2 border rounded-md text-sm flex-1 max-w-xs"
        />
      </div>

      {/* Buyers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Buyers</CardTitle>
          <CardDescription>Monitor and manage buyer accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Spent</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {buyers.map((buyer) => (
                  <TableRow key={buyer._id}>
                    <TableCell className="font-medium">
                      {buyer.firstName} {buyer.lastName}
                    </TableCell>
                    <TableCell className="text-sm">{buyer.email}</TableCell>
                    <TableCell className="text-sm">{buyer.phone}</TableCell>
                    <TableCell>
                      <Badge className={buyer.isSuspended ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}>
                        {buyer.isSuspended ? "Suspended" : "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <ShoppingBag className="w-4 h-4 text-gray-400" />
                        {buyer.totalOrders || 0}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">₹{(buyer.totalSpent || 0).toLocaleString()}</TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {new Date(buyer.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => setSelectedBuyer(buyer)}>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Buyer Details Modal */}
      <Dialog open={!!selectedBuyer} onOpenChange={(open) => !open && setSelectedBuyer(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Buyer Details</DialogTitle>
            <DialogDescription>Manage buyer account status</DialogDescription>
          </DialogHeader>

          {selectedBuyer && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">
                  {selectedBuyer.firstName} {selectedBuyer.lastName}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  {selectedBuyer.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  {selectedBuyer.phone}
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Status:</span>
                  <Badge
                    className={selectedBuyer.isSuspended ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}
                  >
                    {selectedBuyer.isSuspended ? "Suspended" : "Active"}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total Orders:</span>
                  <span className="font-semibold">{selectedBuyer.totalOrders || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total Spent:</span>
                  <span className="font-semibold">₹{(selectedBuyer.totalSpent || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Member Since:</span>
                  <span className="text-xs">{new Date(selectedBuyer.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="space-y-2">
                {selectedBuyer.isSuspended ? (
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => handleUnsuspendBuyer(selectedBuyer._id)}
                  >
                    Reactivate Account
                  </Button>
                ) : (
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => handleSuspendBuyer(selectedBuyer._id)}
                  >
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Suspend Account
                  </Button>
                )}
              </div>

              {selectedBuyer.isSuspended && (
                <div className="bg-red-50 border border-red-200 p-3 rounded text-sm text-red-700">
                  This account is currently suspended and cannot place new orders.
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
