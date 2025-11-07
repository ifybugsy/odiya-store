"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Phone, CheckCircle, AlertCircle, XCircle } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

interface Rider {
  _id: string
  fullName: string
  email: string
  phone: string
  vehicleType: string
  verificationStatus: "pending" | "verified" | "rejected"
  totalDeliveries: number
  averageRating: number
  createdAt: string
}

export default function AdminRidersPage() {
  const { user, token, isLoading } = useAuth()
  const router = useRouter()
  const [riders, setRiders] = useState<Rider[]>([])
  const [filteredRiders, setFilteredRiders] = useState<Rider[]>([])
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    if (isLoading) return

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

    loadRiders()
  }, [user, token, isLoading, router])

  const loadRiders = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/admin/riders`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setRiders(data)
        setFilteredRiders(data)
      }
    } catch (error) {
      console.error("Failed to load riders:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let filtered = riders

    if (searchTerm) {
      filtered = filtered.filter(
        (rider) =>
          rider.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rider.email.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((rider) => rider.verificationStatus === statusFilter)
    }

    setFilteredRiders(filtered)
  }, [searchTerm, statusFilter, riders])

  const handleVerifyRider = async (riderId: string) => {
    try {
      const response = await fetch(`${API_URL}/admin/riders/${riderId}/verify`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        loadRiders()
      }
    } catch (error) {
      console.error("Failed to verify rider:", error)
    }
  }

  const handleRejectRider = async (riderId: string) => {
    if (!confirm("Are you sure you want to reject this rider?")) return

    try {
      const response = await fetch(`${API_URL}/admin/riders/${riderId}/reject`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        loadRiders()
      }
    } catch (error) {
      console.error("Failed to reject rider:", error)
    }
  }

  const handleSuspendRider = async (riderId: string) => {
    if (!confirm("Suspend this rider?")) return

    try {
      const response = await fetch(`${API_URL}/admin/riders/${riderId}/suspend`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        loadRiders()
      }
    } catch (error) {
      console.error("Failed to suspend rider:", error)
    }
  }

  const getVerificationIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "pending":
        return <AlertCircle className="w-4 h-4 text-yellow-600" />
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return null
    }
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Rider Management</h1>
        <p className="text-muted-foreground mt-1">Manage and verify dispatch riders</p>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <Input
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 min-w-64"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground text-sm">Total Riders</p>
            <p className="text-3xl font-bold text-foreground mt-2">{riders.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground text-sm">Pending Verification</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">
              {riders.filter((r) => r.verificationStatus === "pending").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground text-sm">Verified</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {riders.filter((r) => r.verificationStatus === "verified").length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Riders Table */}
      {loading ? (
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading riders...</p>
          </div>
        </div>
      ) : filteredRiders.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-muted-foreground text-lg font-medium">No riders found</p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold">Name</th>
                  <th className="text-left py-3 px-4 font-semibold">Contact</th>
                  <th className="text-left py-3 px-4 font-semibold">Vehicle</th>
                  <th className="text-left py-3 px-4 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 font-semibold">Rating</th>
                  <th className="text-left py-3 px-4 font-semibold">Deliveries</th>
                  <th className="text-left py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRiders.map((rider) => (
                  <tr key={rider._id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 font-medium">{rider.fullName}</td>
                    <td className="py-3 px-4">
                      <div className="text-xs space-y-1">
                        <p className="text-muted-foreground">{rider.email}</p>
                        <p className="flex items-center gap-1 text-muted-foreground">
                          <Phone className="w-3 h-3" />
                          {rider.phone}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs capitalize text-muted-foreground">{rider.vehicleType}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {getVerificationIcon(rider.verificationStatus)}
                        <Badge
                          className={`${
                            rider.verificationStatus === "verified"
                              ? "bg-green-100 text-green-800"
                              : rider.verificationStatus === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {rider.verificationStatus.charAt(0).toUpperCase() + rider.verificationStatus.slice(1)}
                        </Badge>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-foreground">{rider.averageRating.toFixed(1)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-foreground">{rider.totalDeliveries}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1">
                        {rider.verificationStatus === "pending" && (
                          <>
                            <Button
                              onClick={() => handleVerifyRider(rider._id)}
                              size="sm"
                              className="text-xs bg-green-600 hover:bg-green-700"
                            >
                              Verify
                            </Button>
                            <Button
                              onClick={() => handleRejectRider(rider._id)}
                              size="sm"
                              variant="destructive"
                              className="text-xs"
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {rider.verificationStatus === "verified" && (
                          <Button
                            onClick={() => handleSuspendRider(rider._id)}
                            size="sm"
                            variant="destructive"
                            className="text-xs"
                          >
                            Suspend
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
