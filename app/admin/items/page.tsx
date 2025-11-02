"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import AdminSidebar from "@/components/admin/admin-sidebar"
import DashboardHeader from "@/components/admin/dashboard-header"
import ItemsFilterBar from "@/components/admin/items-filter-bar"
import ItemsTable from "@/components/admin/items-table"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

interface Item {
  _id: string
  title: string
  price: number
  category: string
  status: "approved" | "pending" | "rejected"
  images: string[]
  sellerId: {
    firstName: string
    lastName: string
    email: string
  }
  createdAt: string
}

export default function ItemsManagementPage() {
  const { user, token, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)

  // Filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")

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

  const loadItems = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/admin/items`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setItems(await res.json())
      }
    } catch (error) {
      console.error("Failed to load items:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (itemId: string) => {
    try {
      await fetch(`${API_URL}/admin/items/${itemId}/approve`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      })
      loadItems()
    } catch (error) {
      console.error("Failed to approve item:", error)
    }
  }

  const handleReject = async (itemId: string) => {
    try {
      await fetch(`${API_URL}/admin/items/${itemId}/reject`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      })
      loadItems()
    } catch (error) {
      console.error("Failed to reject item:", error)
    }
  }

  const handleDelete = async (itemId: string) => {
    if (!confirm("Delete this item permanently?")) return
    try {
      await fetch(`${API_URL}/admin/items/${itemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      loadItems()
    } catch (error) {
      console.error("Failed to delete item:", error)
    }
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
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sellerId?.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sellerId?.lastName.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === "all" || item.status === statusFilter
      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter

      return matchesSearch && matchesStatus && matchesCategory
    })
  }, [items, searchQuery, statusFilter, categoryFilter])

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (authError) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card className="p-8 max-w-md text-center">
          <p className="text-red-600 font-semibold mb-4">{authError}</p>
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
          title="Item Management"
          description={`Manage all marketplace items (${filteredItems.length} total)`}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
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

            {/* Items Table */}
            {loading ? (
              <Card className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading items...</p>
              </Card>
            ) : (
              <ItemsTable
                items={filteredItems}
                onApprove={handleApprove}
                onReject={handleReject}
                onDelete={handleDelete}
                isLoading={loading}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
