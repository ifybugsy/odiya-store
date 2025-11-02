"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import AdminSidebar from "@/components/admin/admin-sidebar"
import DashboardHeader from "@/components/admin/dashboard-header"
import UsersFilterBar from "@/components/admin/users-filter-bar"
import UsersTable from "@/components/admin/users-table"
import UserDetailsModal from "@/components/admin/user-details-modal"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

interface User {
  _id: string
  firstName: string
  lastName: string
  email: string
  isSeller: boolean
  isSuspended: boolean
  createdAt: string
  itemsCount?: number
  purchasesCount?: number
}

export default function UsersManagementPage() {
  const { user, token, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)

  // Filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  // Modal state
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

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

    loadUsers()
  }, [user, token, authLoading, router])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setUsers(await res.json())
      }
    } catch (error) {
      console.error("Failed to load users:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSuspend = async (userId: string) => {
    if (!confirm("Suspend this user? They will not be able to access their account.")) return
    try {
      await fetch(`${API_URL}/admin/users/${userId}/suspend`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      })
      loadUsers()
    } catch (error) {
      console.error("Failed to suspend user:", error)
    }
  }

  const handleUnsuspend = async (userId: string) => {
    try {
      await fetch(`${API_URL}/admin/users/${userId}/unsuspend`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      })
      loadUsers()
    } catch (error) {
      console.error("Failed to unsuspend user:", error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("user")
    router.push("/")
  }

  const handleResetFilters = () => {
    setSearchQuery("")
    setTypeFilter("all")
    setStatusFilter("all")
  }

  // Filter users based on search and filters
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesType =
        typeFilter === "all" || (typeFilter === "seller" && user.isSeller) || (typeFilter === "buyer" && !user.isSeller)

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && !user.isSuspended) ||
        (statusFilter === "suspended" && user.isSuspended)

      return matchesSearch && matchesType && matchesStatus
    })
  }, [users, searchQuery, typeFilter, statusFilter])

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
          title="User Management"
          description={`Manage platform users and account suspension (${filteredUsers.length} total)`}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Filter Bar */}
            <UsersFilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              typeFilter={typeFilter}
              onTypeChange={setTypeFilter}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              onReset={handleResetFilters}
            />

            {/* Users Table */}
            {loading ? (
              <Card className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading users...</p>
              </Card>
            ) : (
              <UsersTable
                users={filteredUsers}
                onSuspend={handleSuspend}
                onUnsuspend={handleUnsuspend}
                isLoading={loading}
              />
            )}
          </div>
        </main>
      </div>

      {/* User Details Modal */}
      <UserDetailsModal
        user={selectedUser}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSuspend={handleSuspend}
        onUnsuspend={handleUnsuspend}
      />
    </div>
  )
}
