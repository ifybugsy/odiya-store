"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { Badge, type BadgeProps } from "@/components/ui/badge"
import { CheckCircle, XCircle, Pause, Trash2, Eye } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

interface Vendor {
  _id: string
  userId: any
  storeName: string
  storeDescription: string
  status: string
  isApproved: boolean
  followers_count: number
  totalSales: number
  createdAt: string
}

export default function VendorManagementPage() {
  const { user, token, isLoading } = useAuth()
  const router = useRouter()
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    if (isLoading) return

    if (!user?.isAdmin) {
      router.push("/")
      return
    }

    loadVendors()
  }, [user, token, isLoading, statusFilter, router])

  const loadVendors = async () => {
    if (!token) return

    try {
      setLoading(true)
      let url = `${API_URL}/admin/vendors?page=1&limit=20`
      if (statusFilter !== "all") {
        url += `&status=${statusFilter}`
      }

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        const data = await res.json()
        setVendors(data.vendors || [])
      }
    } catch (error) {
      console.error("Failed to load vendors:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (vendorId: string) => {
    setActionLoading(vendorId)
    try {
      const res = await fetch(`${API_URL}/admin/vendors/${vendorId}/approve`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        await loadVendors()
      }
    } catch (error) {
      console.error("Failed to approve vendor:", error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (vendorId: string) => {
    if (!confirm("Reject this vendor application?")) return

    setActionLoading(vendorId)
    try {
      const res = await fetch(`${API_URL}/admin/vendors/${vendorId}/reject`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason: "Rejected by admin" }),
      })

      if (res.ok) {
        await loadVendors()
      }
    } catch (error) {
      console.error("Failed to reject vendor:", error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleSuspend = async (vendorId: string) => {
    if (!confirm("Suspend this vendor?")) return

    setActionLoading(vendorId)
    try {
      const res = await fetch(`${API_URL}/admin/vendors/${vendorId}/suspend`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason: "Suspended by admin" }),
      })

      if (res.ok) {
        await loadVendors()
      }
    } catch (error) {
      console.error("Failed to suspend vendor:", error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleUnsuspend = async (vendorId: string) => {
    setActionLoading(vendorId)
    try {
      const res = await fetch(`${API_URL}/admin/vendors/${vendorId}/unsuspend`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        await loadVendors()
      }
    } catch (error) {
      console.error("Failed to unsuspend vendor:", error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (vendorId: string) => {
    if (!confirm("Delete this vendor permanently?")) return

    setActionLoading(vendorId)
    try {
      const res = await fetch(`${API_URL}/admin/vendors/${vendorId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        await loadVendors()
      }
    } catch (error) {
      console.error("Failed to delete vendor:", error)
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusBadge = (status: string): BadgeProps => {
    switch (status) {
      case "approved":
        return { className: "bg-green-100 text-green-800" }
      case "pending":
        return { className: "bg-yellow-100 text-yellow-800" }
      case "suspended":
        return { className: "bg-red-100 text-red-800" }
      case "rejected":
        return { className: "bg-gray-100 text-gray-800" }
      default:
        return { className: "bg-gray-100 text-gray-800" }
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8 text-foreground">Vendor Management</h1>

          {/* Filter Tabs */}
          <div className="flex gap-3 mb-6 flex-wrap">
            {["all", "pending", "approved", "suspended", "rejected"].map((filter) => (
              <Button
                key={filter}
                variant={statusFilter === filter ? "default" : "outline"}
                onClick={() => setStatusFilter(filter)}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Button>
            ))}
          </div>

          {/* Vendors Table */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : vendors.length > 0 ? (
            <div className="space-y-4">
              {vendors.map((vendor) => (
                <Card key={vendor._id} className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex gap-6 mb-4 items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-lg text-foreground">{vendor.storeName}</h3>
                        <Badge {...getStatusBadge(vendor.status)}>{vendor.status}</Badge>
                      </div>

                      <p className="text-muted-foreground text-sm mb-3">
                        {vendor.storeDescription || "No description provided"}
                      </p>

                      <div className="flex gap-4 text-sm flex-wrap">
                        <span className="text-muted-foreground">
                          Owner: {vendor.userId?.firstName} {vendor.userId?.lastName}
                        </span>
                        <span className="text-muted-foreground">Email: {vendor.userId?.email}</span>
                        <span className="text-muted-foreground">Followers: {vendor.followers_count}</span>
                        <span className="text-muted-foreground">Sales: {vendor.totalSales}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/admin/vendors/${vendor._id}`)}
                      disabled={actionLoading === vendor._id}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>

                    {vendor.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleApprove(vendor._id)}
                          disabled={actionLoading === vendor._id}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          className="bg-red-600 hover:bg-red-700 text-white"
                          onClick={() => handleReject(vendor._id)}
                          disabled={actionLoading === vendor._id}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </>
                    )}

                    {vendor.status === "approved" && (
                      <Button
                        size="sm"
                        className="bg-orange-600 hover:bg-orange-700 text-white"
                        onClick={() => handleSuspend(vendor._id)}
                        disabled={actionLoading === vendor._id}
                      >
                        <Pause className="w-4 h-4 mr-2" />
                        Suspend
                      </Button>
                    )}

                    {vendor.status === "suspended" && (
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => handleUnsuspend(vendor._id)}
                        disabled={actionLoading === vendor._id}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Unsuspend
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(vendor._id)}
                      disabled={actionLoading === vendor._id}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No vendors found</p>
            </Card>
          )}
        </div>
      </main>
    </>
  )
}
