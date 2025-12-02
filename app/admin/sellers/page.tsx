"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AdminSidebar from "@/components/admin/admin-sidebar"
import DashboardHeader from "@/components/admin/dashboard-header"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle, MoreVertical, Zap } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

interface Seller {
  _id: string
  firstName: string
  lastName: string
  email: string
  businessName: string
  phone: string
  status: string
  totalItemsListed: number
  itemsSold: number
  rating: number
  ratingCount: number
  isSuspended: boolean
  createdAt: string
}

export default function SellersAdminPage() {
  const { user, token, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [sellers, setSellers] = useState<Seller[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSellers, setSelectedSellers] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState("all")
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!authLoading && !user?.isAdmin) {
      router.push("/")
    }
  }, [authLoading, user, router])

  useEffect(() => {
    if (token) {
      loadSellers()
      const interval = setInterval(loadSellers, 15000)
      return () => clearInterval(interval)
    }
  }, [token, statusFilter])

  const loadSellers = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/sellers?status=${statusFilter}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setSellers(data.sellers || [])
      }
    } catch (error) {
      console.error("[v0] Failed to load sellers:", error)
      toast({
        title: "Error",
        description: "Failed to load sellers",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSellers(sellers.map((s) => s._id))
    } else {
      setSelectedSellers([])
    }
  }

  const handleSelectSeller = (sellerId: string) => {
    setSelectedSellers((prev) => (prev.includes(sellerId) ? prev.filter((id) => id !== sellerId) : [...prev, sellerId]))
  }

  const handleBulkAction = async (action: string) => {
    if (selectedSellers.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one seller",
        variant: "destructive",
      })
      return
    }

    setProcessingIds(new Set(selectedSellers))
    try {
      const res = await fetch(`${API_URL}/admin/sellers/bulk-action`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sellerIds: selectedSellers,
          action,
        }),
      })

      if (res.ok) {
        toast({
          title: "Success",
          description: `${selectedSellers.length} seller(s) ${action} successfully`,
        })
        setSelectedSellers([])
        await loadSellers()
      } else {
        const err = await res.json()
        toast({
          title: "Error",
          description: err.error || `Failed to ${action} sellers`,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("[v0] Failed to perform bulk action:", error)
      toast({
        title: "Error",
        description: `Failed to ${action} sellers. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setProcessingIds(new Set())
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
        <DashboardHeader user={user} title="Sellers Management" description="Monitor and manage seller accounts" />

        <main className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4">
            {/* Filter and Bulk Actions Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === "all" ? "default" : "outline"}
                  onClick={() => setStatusFilter("all")}
                  size="sm"
                >
                  All
                </Button>
                <Button
                  variant={statusFilter === "active" ? "default" : "outline"}
                  onClick={() => setStatusFilter("active")}
                  size="sm"
                >
                  Active
                </Button>
                <Button
                  variant={statusFilter === "suspended" ? "default" : "outline"}
                  onClick={() => setStatusFilter("suspended")}
                  size="sm"
                >
                  Suspended
                </Button>
              </div>

              {selectedSellers.length > 0 && (
                <div className="flex gap-2 w-full sm:w-auto">
                  <span className="text-sm text-muted-foreground py-2">{selectedSellers.length} selected</span>
                  <Button size="sm" onClick={() => handleBulkAction("suspend")} disabled={processingIds.size > 0}>
                    <Zap className="w-3 h-3 mr-1" />
                    Suspend
                  </Button>
                  <Button size="sm" onClick={() => handleBulkAction("unsuspend")} disabled={processingIds.size > 0}>
                    Unsuspend
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedSellers([])}
                    disabled={processingIds.size > 0}
                  >
                    Clear
                  </Button>
                </div>
              )}
            </div>

            {/* Sellers List */}
            {loading ? (
              <Card className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading sellers...</p>
              </Card>
            ) : sellers.length === 0 ? (
              <Card className="p-12 text-center">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No sellers found</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {/* Header with Select All */}
                <div className="flex items-center gap-3 px-4 py-2 bg-muted/50 rounded-lg">
                  <Checkbox
                    checked={selectedSellers.length === sellers.length && sellers.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-sm font-medium">
                    {selectedSellers.length > 0 ? `${selectedSellers.length} selected` : `${sellers.length} sellers`}
                  </span>
                </div>

                {/* Sellers Cards */}
                {sellers.map((seller) => (
                  <Card
                    key={seller._id}
                    className={`p-4 hover:shadow-md transition-shadow ${
                      processingIds.has(seller._id) ? "opacity-60" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedSellers.includes(seller._id)}
                        onCheckedChange={() => handleSelectSeller(seller._id)}
                        disabled={processingIds.size > 0}
                      />

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{seller.businessName || "N/A"}</h3>
                          <Badge
                            variant={seller.isSuspended ? "destructive" : "default"}
                            className={seller.isSuspended ? "bg-red-600" : "bg-green-600"}
                          >
                            {seller.isSuspended ? "Suspended" : "Active"}
                          </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground mb-2">
                          {seller.firstName} {seller.lastName} ({seller.email})
                        </p>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          <div>
                            <p className="text-muted-foreground">Items Listed</p>
                            <p className="font-semibold">{seller.totalItemsListed}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Items Sold</p>
                            <p className="font-semibold">{seller.itemsSold}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Rating</p>
                            <p className="font-semibold">
                              {seller.rating?.toFixed(1) || "N/A"} ({seller.ratingCount || 0})
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Joined</p>
                            <p className="font-semibold">{new Date(seller.createdAt).toLocaleDateString("en-NG")}</p>
                          </div>
                        </div>
                      </div>

                      <Button variant="ghost" size="icon" disabled={processingIds.size > 0}>
                        <MoreVertical className="w-4 h-4" />
                      </Button>
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
