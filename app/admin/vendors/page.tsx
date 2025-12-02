"use client"

import { AlertDialogFooter } from "@/components/ui/alert-dialog"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"
import { Badge, type BadgeProps } from "@/components/ui/badge"
import {
  CheckCircle,
  XCircle,
  Pause,
  Play,
  Trash2,
  Eye,
  Search,
  Filter,
  AlertCircle,
  MoreVertical,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  RefreshCw,
  Clock,
  ShieldCheck,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

interface Vendor {
  _id: string
  userId: any
  storeName: string
  storeDescription: string
  status: "pending" | "approved" | "suspended" | "rejected"
  isApproved: boolean
  followers_count: number
  totalSales: number
  totalRevenue: number
  createdAt: string
  email?: string
  isPromoted?: boolean
  promotedUntil?: string
  isVerified?: boolean
}

export default function AdminVendorsPage() {
  const { user, token, isLoading } = useAuth()
  const router = useRouter()
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("pending")
  const [searchQuery, setSearchQuery] = useState("")
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalVendors, setTotalVendors] = useState(0)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    action: string
    vendorId?: string
    vendorName?: string
  }>({ isOpen: false, action: "" })
  const [refreshing, setRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const [stats, setStats] = useState({
    totalPending: 0,
    totalApproved: 0,
    totalSuspended: 0,
    totalRejected: 0,
  })

  useEffect(() => {
    if (isLoading) return

    if (!user?.isAdmin) {
      router.push("/")
      return
    }

    loadVendors()

    // Auto-refresh every 30 seconds when on pending filter
    const interval = setInterval(() => {
      if (statusFilter === "pending") {
        loadVendors(true)
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [user, token, isLoading, statusFilter, searchQuery, page, router])

  const loadVendors = useCallback(
    async (isSilentRefresh = false) => {
      if (!token) return

      try {
        if (!isSilentRefresh) setLoading(true)
        setRefreshing(true)

        let url = `${API_URL}/admin/vendors?page=${page}&limit=10`
        if (statusFilter !== "all") {
          url += `&status=${statusFilter}`
        }
        if (searchQuery.trim()) {
          url += `&search=${encodeURIComponent(searchQuery)}`
        }

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (res.ok) {
          const data = await res.json()
          console.log("[v0] Vendors loaded:", data)
          setVendors(data.vendors || [])
          setTotalPages(data.pagination?.totalPages || 1)
          setTotalVendors(data.pagination?.total || 0)
          setLastRefresh(new Date())

          if (statusFilter === "all" || statusFilter === "pending") {
            const allVendorsUrl = `${API_URL}/admin/vendors?limit=1000`
            const allRes = await fetch(allVendorsUrl, {
              headers: { Authorization: `Bearer ${token}` },
            })
            if (allRes.ok) {
              const allData = await allRes.json()
              const allVendors = allData.vendors || []
              setStats({
                totalPending: allVendors.filter((v: Vendor) => v.status === "pending").length,
                totalApproved: allVendors.filter((v: Vendor) => v.status === "approved").length,
                totalSuspended: allVendors.filter((v: Vendor) => v.status === "suspended").length,
                totalRejected: allVendors.filter((v: Vendor) => v.status === "rejected").length,
              })
            }
          }
        } else {
          console.error("[v0] Failed to load vendors:", res.status)
        }
      } catch (error) {
        console.error("[v0] Failed to load vendors:", error)
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [token, page, statusFilter, searchQuery],
  )

  const handleApprove = async () => {
    if (!confirmDialog.vendorId) return
    const vendorId = confirmDialog.vendorId
    setActionLoading(vendorId)
    setConfirmDialog({ isOpen: false, action: "" })

    try {
      const res = await fetch(`${API_URL}/admin/vendors/${vendorId}/approve`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        console.log("[v0] Vendor approved successfully")
        await loadVendors()
      }
    } catch (error) {
      console.error("[v0] Failed to approve vendor:", error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async () => {
    if (!confirmDialog.vendorId) return
    const vendorId = confirmDialog.vendorId
    setActionLoading(vendorId)
    setConfirmDialog({ isOpen: false, action: "" })

    try {
      const res = await fetch(`${API_URL}/admin/vendors/${vendorId}/reject`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason: "Rejected by admin" }),
      })

      if (res.ok) {
        console.log("[v0] Vendor rejected successfully")
        await loadVendors()
      }
    } catch (error) {
      console.error("[v0] Failed to reject vendor:", error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleSuspend = async () => {
    if (!confirmDialog.vendorId) return
    const vendorId = confirmDialog.vendorId
    setActionLoading(vendorId)
    setConfirmDialog({ isOpen: false, action: "" })

    try {
      const res = await fetch(`${API_URL}/admin/vendors/${vendorId}/suspend`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason: "Suspended by admin" }),
      })

      if (res.ok) {
        console.log("[v0] Vendor suspended successfully")
        await loadVendors()
      }
    } catch (error) {
      console.error("[v0] Failed to suspend vendor:", error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleUnsuspend = async () => {
    if (!confirmDialog.vendorId) return
    const vendorId = confirmDialog.vendorId
    setActionLoading(vendorId)
    setConfirmDialog({ isOpen: false, action: "" })

    try {
      const res = await fetch(`${API_URL}/admin/vendors/${vendorId}/unsuspend`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        console.log("[v0] Vendor unsuspended successfully")
        await loadVendors()
      }
    } catch (error) {
      console.error("[v0] Failed to unsuspend vendor:", error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async () => {
    if (!confirmDialog.vendorId) return
    const vendorId = confirmDialog.vendorId
    setActionLoading(vendorId)
    setConfirmDialog({ isOpen: false, action: "" })

    try {
      const res = await fetch(`${API_URL}/admin/vendors/${vendorId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        console.log("[v0] Vendor deleted successfully")
        await loadVendors()
      }
    } catch (error) {
      console.error("[v0] Failed to delete vendor:", error)
    } finally {
      setActionLoading(null)
    }
  }

  const handlePromote = async () => {
    if (!confirmDialog.vendorId) return
    const vendorId = confirmDialog.vendorId
    setActionLoading(vendorId)
    setConfirmDialog({ isOpen: false, action: "" })

    try {
      const vendor = vendors.find((v) => v._id === vendorId)
      const isPromoted = !vendor?.isPromoted

      const res = await fetch(`${API_URL}/admin/vendors/${vendorId}/promote`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isPromoted }),
      })

      if (res.ok) {
        console.log(`[v0] Vendor ${isPromoted ? "promoted" : "unpromoted"} successfully`)
        await loadVendors()
      }
    } catch (error) {
      console.error("[v0] Failed to toggle vendor promotion:", error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleVerify = async () => {
    if (!confirmDialog.vendorId) return
    const vendorId = confirmDialog.vendorId
    setActionLoading(vendorId)
    setConfirmDialog({ isOpen: false, action: "" })

    try {
      const vendor = vendors.find((v) => v._id === vendorId)
      const isVerified = !vendor?.isVerified

      const res = await fetch(`${API_URL}/admin/vendors/${vendorId}/verify`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isVerified }),
      })

      if (res.ok) {
        console.log(`[v0] Vendor ${isVerified ? "verified" : "unverified"} successfully`)
        await loadVendors()
      }
    } catch (error) {
      console.error("[v0] Failed to toggle vendor verification:", error)
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusBadge = (status: string): BadgeProps => {
    switch (status) {
      case "approved":
        return { className: "bg-green-100 text-green-800 border-green-200" }
      case "pending":
        return { className: "bg-yellow-100 text-yellow-800 border-yellow-200" }
      case "suspended":
        return { className: "bg-red-100 text-red-800 border-red-200" }
      case "rejected":
        return { className: "bg-gray-100 text-gray-800 border-gray-200" }
      default:
        return { className: "bg-gray-100 text-gray-800 border-gray-200" }
    }
  }

  const openConfirmDialog = (action: string, vendorId: string, vendorName: string) => {
    setConfirmDialog({ isOpen: true, action, vendorId, vendorName })
  }

  const executeAction = () => {
    switch (confirmDialog.action) {
      case "approve":
        handleApprove()
        break
      case "reject":
        handleReject()
        break
      case "suspend":
        handleSuspend()
        break
      case "unsuspend":
        handleUnsuspend()
        break
      case "delete":
        handleDelete()
        break
      case "promote":
        handlePromote()
        break
      case "verify":
        handleVerify()
        break
    }
  }

  const getConfirmDialogContent = () => {
    const { action, vendorName } = confirmDialog
    const titles: Record<string, string> = {
      approve: "Approve Vendor",
      reject: "Reject Vendor",
      suspend: "Suspend Vendor",
      unsuspend: "Unsuspend Vendor",
      delete: "Delete Vendor",
      promote: "Toggle Promotion",
      verify: "Toggle Verification",
    }

    const descriptions: Record<string, string> = {
      approve: `Are you sure you want to approve ${vendorName}? Their store will become visible to customers.`,
      reject: `Are you sure you want to reject the application from ${vendorName}? They will be notified of this decision.`,
      suspend: `Are you sure you want to suspend ${vendorName}? Their store will be taken offline temporarily.`,
      unsuspend: `Are you sure you want to unsuspend ${vendorName}? Their store will become visible again.`,
      delete: `Are you sure you want to permanently delete ${vendorName}? This action cannot be undone.`,
      promote: `Are you sure you want to toggle promotion status for ${vendorName}? Promoted vendors appear first in search results.`,
      verify: `Are you sure you want to toggle verification status for ${vendorName}? Verified vendors get a badge.`,
    }

    return {
      title: titles[action] || "Confirm Action",
      description: descriptions[action] || "This action cannot be undone.",
    }
  }

  const filteredVendors = vendors.filter(
    (vendor) =>
      vendor.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.email?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8 flex items-start justify-between flex-col md:flex-row md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-foreground">Vendor Management</h1>
              <p className="text-muted-foreground">
                Manage, approve, and control vendor accounts ({totalVendors} total)
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadVendors()}
              disabled={loading || refreshing}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="p-4 border-l-4 border-l-yellow-500">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Pending Approval</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{stats.totalPending}</p>
                  <p className="text-xs text-yellow-600 mt-2">Requires action</p>
                </div>
                <Clock className="w-5 h-5 text-yellow-500 opacity-50" />
              </div>
            </Card>

            <Card className="p-4 border-l-4 border-l-green-500">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Approved</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{stats.totalApproved}</p>
                  <p className="text-xs text-green-600 mt-2">Active stores</p>
                </div>
                <CheckCircle className="w-5 h-5 text-green-500 opacity-50" />
              </div>
            </Card>

            <Card className="p-4 border-l-4 border-l-red-500">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Suspended</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{stats.totalSuspended}</p>
                  <p className="text-xs text-red-600 mt-2">Offline</p>
                </div>
                <Pause className="w-5 h-5 text-red-500 opacity-50" />
              </div>
            </Card>

            <Card className="p-4 border-l-4 border-l-gray-500">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Rejected</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{stats.totalRejected}</p>
                  <p className="text-xs text-gray-600 mt-2">Declined</p>
                </div>
                <XCircle className="w-5 h-5 text-gray-500 opacity-50" />
              </div>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card className="p-4 mb-6 border border-border">
            <div className="flex gap-4 flex-col md:flex-row md:items-center md:justify-between flex-wrap">
              <div className="flex-1 min-w-64">
                <div className="flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-2">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by store name or email..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setPage(1)
                    }}
                    className="border-0 bg-transparent focus:outline-none focus:ring-0"
                  />
                </div>
              </div>

              <div className="flex gap-2 overflow-x-auto flex-wrap">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                </div>
                {["pending", "all", "approved", "suspended", "rejected"].map((filter) => (
                  <Button
                    key={filter}
                    size="sm"
                    variant={statusFilter === filter ? "default" : "outline"}
                    onClick={() => {
                      setStatusFilter(filter)
                      setPage(1)
                    }}
                    className="whitespace-nowrap"
                  >
                    {filter === "pending" &&
                      `${filter.charAt(0).toUpperCase() + filter.slice(1)} (${stats.totalPending})`}
                    {filter !== "pending" && filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
            {lastRefresh && (
              <p className="text-xs text-muted-foreground mt-3">Last refreshed: {lastRefresh.toLocaleTimeString()}</p>
            )}
          </Card>

          {/* Vendors List */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : filteredVendors.length > 0 ? (
            <>
              <div className="space-y-4 mb-8">
                {filteredVendors.map((vendor) => (
                  <Card key={vendor._id} className="p-6 hover:shadow-md transition-shadow border border-border">
                    <div className="flex gap-6 mb-4 items-start flex-col md:flex-row justify-between">
                      <div className="flex-1 w-full">
                        {/* Vendor Header */}
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                          <h3 className="font-bold text-lg text-foreground truncate">{vendor.storeName}</h3>
                          {/* Verification and Promotion Badges */}
                          {vendor.isVerified && (
                            <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0" title="Verified Vendor" />
                          )}
                          {vendor.isPromoted && vendor.promotedUntil && new Date(vendor.promotedUntil) > new Date() && (
                            <TrendingUp className="w-5 h-5 text-green-600 flex-shrink-0" title="Promoted Vendor" />
                          )}
                          <Badge {...getStatusBadge(vendor.status)} className="border">
                            {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
                          </Badge>
                        </div>

                        {/* Description */}
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                          {vendor.storeDescription || "No description provided"}
                        </p>

                        {/* Vendor Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">
                              Owner
                            </p>
                            <p className="text-sm text-foreground font-semibold">
                              {vendor.userId?.firstName || "N/A"} {vendor.userId?.lastName || ""}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">
                              Email
                            </p>
                            <p className="text-sm text-foreground break-all">
                              {vendor.userId?.email || vendor.email || "N/A"}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                                Followers
                              </p>
                              <p className="text-sm text-foreground font-semibold">{vendor.followers_count || 0}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Sales</p>
                              <p className="text-sm text-foreground font-semibold">{vendor.totalSales || 0}</p>
                            </div>
                          </div>

                          {vendor.totalRevenue > 0 && (
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                                  Revenue
                                </p>
                                <p className="text-sm text-foreground font-semibold">
                                  ₦{(vendor.totalRevenue / 1000000).toFixed(2)}M
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Joined Date */}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          Joined {new Date(vendor.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      {/* Action Menu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" disabled={actionLoading === vendor._id}>
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/admin/vendors/${vendor._id}`)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>

                          {/* Promote and Verify Menu Items */}
                          <DropdownMenuItem onClick={() => openConfirmDialog("promote", vendor._id, vendor.storeName)}>
                            <TrendingUp
                              className={`w-4 h-4 mr-2 ${vendor.isPromoted ? "text-green-600" : "text-gray-400"}`}
                            />
                            {vendor.isPromoted ? "Unpromote" : "Promote"}
                          </DropdownMenuItem>

                          <DropdownMenuItem onClick={() => openConfirmDialog("verify", vendor._id, vendor.storeName)}>
                            <ShieldCheck
                              className={`w-4 h-4 mr-2 ${vendor.isVerified ? "text-blue-600" : "text-gray-400"}`}
                            />
                            {vendor.isVerified ? "Unverify" : "Verify"}
                          </DropdownMenuItem>

                          {vendor.status === "pending" && (
                            <>
                              <DropdownMenuItem
                                onClick={() => openConfirmDialog("approve", vendor._id, vendor.storeName)}
                              >
                                <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => openConfirmDialog("reject", vendor._id, vendor.storeName)}
                              >
                                <XCircle className="w-4 h-4 mr-2 text-red-600" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}

                          {vendor.status === "approved" && (
                            <DropdownMenuItem
                              onClick={() => openConfirmDialog("suspend", vendor._id, vendor.storeName)}
                            >
                              <Pause className="w-4 h-4 mr-2 text-red-600" />
                              Suspend
                            </DropdownMenuItem>
                          )}

                          {vendor.status === "suspended" && (
                            <DropdownMenuItem
                              onClick={() => openConfirmDialog("unsuspend", vendor._id, vendor.storeName)}
                            >
                              <Play className="w-4 h-4 mr-2 text-green-600" />
                              Unsuspend
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuItem
                            onClick={() => openConfirmDialog("delete", vendor._id, vendor.storeName)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex justify-between items-center mt-8 mb-8">
                <Button
                  variant="outline"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1 || loading}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages || loading}
                >
                  Next
                </Button>
              </div>
            </>
          ) : (
            <Card className="p-12 text-center border border-border">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground mb-2">No vendors found</p>
              <p className="text-xs text-muted-foreground">
                {searchQuery ? "Try adjusting your search criteria" : "Check back later for new vendor applications"}
              </p>
            </Card>
          )}

          {/* Confirm Dialog */}
          <AlertDialog
            open={confirmDialog.isOpen}
            onOpenChange={(isOpen) => setConfirmDialog({ ...confirmDialog, isOpen })}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{getConfirmDialogContent().title}</AlertDialogTitle>
                <AlertDialogDescription>{getConfirmDialogContent().description}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={executeAction} className="bg-primary hover:bg-primary/90">
                  Confirm
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </main>
    </>
  )
}
