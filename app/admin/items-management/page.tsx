"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AdminSidebar from "@/components/admin/admin-sidebar"
import DashboardHeader from "@/components/admin/dashboard-header"
import ItemsFilterBar from "@/components/admin/items-filter-bar"
import ItemsTableEnhanced from "@/components/admin/items-table-enhanced"
import ItemPreviewModal from "@/components/admin/item-preview-modal"
import DeleteConfirmDialog from "@/components/admin/delete-confirm-dialog"
import BulkActionsBar from "@/components/admin/bulk-actions-bar"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

interface Item {
  _id: string
  title: string
  description: string
  price: number
  category: string
  status: "approved" | "pending" | "rejected" | "sold"
  images: string[]
  condition: string
  location: string
  views: number
  sellerId: {
    _id: string
    firstName: string
    lastName: string
    email: string
    phone?: string
  }
  createdAt: string
  updatedAt: string
  isApproved: boolean
}

export default function ItemsManagementPage() {
  const { user, token, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  // Preview Modal State
  const [previewItem, setPreviewItem] = useState<Item | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  // Delete Confirmation State
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")

  // Real-time refresh interval
  useEffect(() => {
    const interval = setInterval(() => {
      if (token && user?.isAdmin) {
        loadItems(true) // Silent refresh
      }
    }, 10000) // Refresh every 10 seconds

    return () => clearInterval(interval)
  }, [token, user])

  useEffect(() => {
    if (authLoading) return

    if (!user?.isAdmin) {
      setAuthError("Unauthorized access")
      setTimeout(() => router.push("/"), 1000)
      return
    }

    if (!token) {
      setAuthError("Authentication required")
      setTimeout(() => router.push("/admin-login"), 1000)
      return
    }

    loadItems()
  }, [user, token, authLoading, router])

  const loadItems = async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const res = await fetch(`${API_URL}/admin/items`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setItems(data)
      }
    } catch (error) {
      console.error("[v0] Failed to load items:", error)
      if (!silent) {
        toast({
          title: "Error",
          description: "Failed to load items",
          variant: "destructive",
        })
      }
    } finally {
      if (!silent) setLoading(false)
    }
  }

  const handleApprove = async (itemId: string) => {
    try {
      const res = await fetch(`${API_URL}/admin/items/${itemId}/approve`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        toast({
          title: "Success",
          description: "Item approved successfully",
        })
        loadItems()
      }
    } catch (error) {
      console.error("[v0] Failed to approve item:", error)
      toast({
        title: "Error",
        description: "Failed to approve item",
        variant: "destructive",
      })
    }
  }

  const handleReject = async (itemId: string) => {
    try {
      const res = await fetch(`${API_URL}/admin/items/${itemId}/reject`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        toast({
          title: "Success",
          description: "Item rejected",
        })
        loadItems()
      }
    } catch (error) {
      console.error("[v0] Failed to reject item:", error)
      toast({
        title: "Error",
        description: "Failed to reject item",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (itemId: string) => {
    setDeleteItemId(itemId)
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!deleteItemId) return

    try {
      const res = await fetch(`${API_URL}/admin/items/${deleteItemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        toast({
          title: "Success",
          description: "Item deleted permanently",
        })
        setSelectedItems((prev) => prev.filter((id) => id !== deleteItemId))
        loadItems()
      }
    } catch (error) {
      console.error("[v0] Failed to delete item:", error)
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      })
    } finally {
      setShowDeleteDialog(false)
      setDeleteItemId(null)
    }
  }

  const handleBulkApprove = async () => {
    try {
      await Promise.all(selectedItems.map((id) => handleApprove(id)))
      setSelectedItems([])
      toast({
        title: "Success",
        description: `${selectedItems.length} items approved`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve some items",
        variant: "destructive",
      })
    }
  }

  const handleBulkReject = async () => {
    try {
      await Promise.all(selectedItems.map((id) => handleReject(id)))
      setSelectedItems([])
      toast({
        title: "Success",
        description: `${selectedItems.length} items rejected`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject some items",
        variant: "destructive",
      })
    }
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedItems.length} items permanently?`)) return

    try {
      await Promise.all(
        selectedItems.map((id) =>
          fetch(`${API_URL}/admin/items/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }),
        ),
      )

      setSelectedItems([])
      loadItems()
      toast({
        title: "Success",
        description: `${selectedItems.length} items deleted`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete some items",
        variant: "destructive",
      })
    }
  }

  const handlePreview = (item: Item) => {
    setPreviewItem(item)
    setShowPreview(true)
  }

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("user")
    router.push("/")
  }

  const handleResetFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
    setCategoryFilter("all")
  }

  // Filter items based on search and filters
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sellerId?.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sellerId?.lastName.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || item.status === statusFilter
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter

    return matchesSearch && matchesStatus && matchesCategory
  })

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (authError) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <Card className="p-8 max-w-md text-center">
          <p className="text-destructive font-semibold mb-4">{authError}</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar onLogout={handleLogout} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader
          user={user}
          title="Real-Time Item Management"
          description={`Monitor and manage all marketplace items • ${filteredItems.length} items`}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4">
            {/* Filter Bar */}
            <ItemsFilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              categoryFilter={categoryFilter}
              onCategoryChange={setCategoryFilter}
              onReset={handleResetFilters}
            />

            {/* Bulk Actions Bar */}
            {selectedItems.length > 0 && (
              <BulkActionsBar
                selectedCount={selectedItems.length}
                onApprove={handleBulkApprove}
                onReject={handleBulkReject}
                onDelete={handleBulkDelete}
                onClear={() => setSelectedItems([])}
              />
            )}

            {/* Items Table */}
            {loading ? (
              <Card className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading items...</p>
              </Card>
            ) : (
              <ItemsTableEnhanced
                items={filteredItems}
                selectedItems={selectedItems}
                onSelectItems={setSelectedItems}
                onApprove={handleApprove}
                onReject={handleReject}
                onDelete={handleDelete}
                onPreview={handlePreview}
                isLoading={loading}
              />
            )}
          </div>
        </main>
      </div>

      {/* Item Preview Modal */}
      <ItemPreviewModal
        item={previewItem}
        open={showPreview}
        onClose={() => setShowPreview(false)}
        onApprove={() => {
          if (previewItem) handleApprove(previewItem._id)
          setShowPreview(false)
        }}
        onReject={() => {
          if (previewItem) handleReject(previewItem._id)
          setShowPreview(false)
        }}
        onDelete={() => {
          if (previewItem) handleDelete(previewItem._id)
          setShowPreview(false)
        }}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        itemTitle={items.find((i) => i._id === deleteItemId)?.title}
      />
    </div>
  )
}
