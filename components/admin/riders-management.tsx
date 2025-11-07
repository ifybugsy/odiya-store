"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CheckCircle2, XCircle, Phone, Loader2 } from "lucide-react"

interface Rider {
  _id: string
  userId: string
  licenseNumber: string
  vehicleType: string
  status: string
  verificationStatus: string
  totalDeliveries: number
  completedDeliveries: number
  rating: number
  isAvailable: boolean
  user?: {
    firstName: string
    lastName: string
    email: string
  }
}

interface RiderStats {
  totalRiders: number
  activeRiders: number
  pendingVerification: number
  totalDeliveries: number
  averageRating: number
}

export function RidersManagement() {
  const [riders, setRiders] = useState<Rider[]>([])
  const [stats, setStats] = useState<RiderStats | null>(null)
  const [selectedRider, setSelectedRider] = useState<Rider | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "active" | "pending" | "suspended">("all")

  useEffect(() => {
    fetchRiders()
    // Set up polling for real-time updates every 10 seconds
    const interval = setInterval(fetchRiders, 10000)
    return () => clearInterval(interval)
  }, [filter])

  const fetchRiders = async () => {
    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch(`/api/admin/riders?filter=${filter}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setRiders(data.riders || [])
        setStats(data.stats)
      }
    } catch (error) {
      console.error("[v0] Error fetching riders:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyRider = async (riderId: string) => {
    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch(`/api/admin/riders/${riderId}/verify`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ verificationStatus: "verified" }),
      })

      if (response.ok) {
        fetchRiders()
        setSelectedRider(null)
      }
    } catch (error) {
      console.error("[v0] Error verifying rider:", error)
    }
  }

  const handleRejectRider = async (riderId: string) => {
    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch(`/api/admin/riders/${riderId}/verify`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ verificationStatus: "rejected" }),
      })

      if (response.ok) {
        fetchRiders()
        setSelectedRider(null)
      }
    } catch (error) {
      console.error("[v0] Error rejecting rider:", error)
    }
  }

  const handleSuspendRider = async (riderId: string) => {
    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch(`/api/admin/riders/${riderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "suspended" }),
      })

      if (response.ok) {
        fetchRiders()
        setSelectedRider(null)
      }
    } catch (error) {
      console.error("[v0] Error suspending rider:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "suspended":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getVerificationColor = (status: string) => {
    switch (status) {
      case "verified":
        return "text-green-600"
      case "pending":
        return "text-yellow-600"
      case "rejected":
        return "text-red-600"
      default:
        return "text-gray-600"
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Riders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRiders}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.activeRiders}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingVerification}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Deliveries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDeliveries}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}★</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {["all", "active", "pending", "suspended"].map((f) => (
          <Button key={f} variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f as any)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Button>
        ))}
      </div>

      {/* Riders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Riders</CardTitle>
          <CardDescription>Manage and monitor all delivery riders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Verification</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Deliveries</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {riders.map((rider) => (
                  <TableRow key={rider._id}>
                    <TableCell className="font-medium">
                      {rider.user ? `${rider.user.firstName} ${rider.user.lastName}` : "Unknown"}
                    </TableCell>
                    <TableCell className="text-sm">{rider.user?.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{rider.vehicleType}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(rider.status)}>{rider.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className={`flex items-center gap-1 ${getVerificationColor(rider.verificationStatus)}`}>
                        {rider.verificationStatus === "verified" && <CheckCircle2 className="w-4 h-4" />}
                        {rider.verificationStatus === "rejected" && <XCircle className="w-4 h-4" />}
                        <span className="text-sm capitalize">{rider.verificationStatus}</span>
                      </div>
                    </TableCell>
                    <TableCell>{rider.rating.toFixed(1)}★</TableCell>
                    <TableCell>
                      {rider.completedDeliveries}/{rider.totalDeliveries}
                    </TableCell>
                    <TableCell>
                      <Badge variant={rider.isAvailable ? "default" : "secondary"}>
                        {rider.isAvailable ? "Yes" : "No"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => setSelectedRider(rider)}>
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

      {/* Rider Details Modal */}
      <Dialog open={!!selectedRider} onOpenChange={(open) => !open && setSelectedRider(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Rider Details</DialogTitle>
            <DialogDescription>Manage rider verification and status</DialogDescription>
          </DialogHeader>

          {selectedRider && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">
                  {selectedRider.user?.firstName} {selectedRider.user?.lastName}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  {selectedRider.user?.email}
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span>License:</span>
                  <span className="font-mono text-xs">{selectedRider.licenseNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Vehicle Type:</span>
                  <span className="capitalize">{selectedRider.vehicleType}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Rating:</span>
                  <span>{selectedRider.rating.toFixed(1)}★</span>
                </div>
              </div>

              <div className="space-y-2">
                {selectedRider.verificationStatus === "pending" && (
                  <>
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => handleVerifyRider(selectedRider._id)}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Verify Rider
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-red-200 bg-transparent"
                      onClick={() => handleRejectRider(selectedRider._id)}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </>
                )}

                {selectedRider.status === "active" && (
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => handleSuspendRider(selectedRider._id)}
                  >
                    Suspend Rider
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
