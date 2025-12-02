"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AdminSidebar from "@/components/admin/admin-sidebar"
import DashboardHeader from "@/components/admin/dashboard-header"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Shield, User, Mail, Calendar, MoreVertical, X, Check, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

interface Admin {
  _id: string
  email: string
  firstName: string
  lastName: string
  adminRole: string
  adminSince: string
}

const ROLE_DESCRIPTIONS: Record<string, string> = {
  super_admin: "Super Administrator - Full system access",
  admin: "General Administrator",
  vendor_manager: "Manages vendors and their subscriptions",
  seller_manager: "Manages items and sellers",
  support_admin: "Limited access for support staff",
}

const ROLE_COLORS: Record<string, string> = {
  super_admin: "bg-red-600",
  admin: "bg-blue-600",
  vendor_manager: "bg-purple-600",
  seller_manager: "bg-green-600",
  support_admin: "bg-gray-600",
}

export default function AdminsPage() {
  const { user, token, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [accessDenied, setAccessDenied] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    adminRole: "admin",
  })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (!authLoading) {
      if (!user || (user.adminRole !== "super_admin" && user.adminRole !== "admin")) {
        setAccessDenied(true)
        setLoading(false)
        return
      }
      setAccessDenied(false)
      if (token && (user?.adminRole === "super_admin" || user?.adminRole === "admin")) {
        loadAdmins()
      }
    }
  }, [authLoading, user, token])

  const loadAdmins = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/roles/list`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setAdmins(data.admins || [])
      } else {
        console.error("[v0] Failed to load admins:", res.status)
      }
    } catch (error) {
      console.error("[v0] Failed to load admins:", error)
      toast({
        title: "Error",
        description: "Failed to load admin list",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAdmin = async () => {
    if (!formData.email || !formData.firstName || !formData.lastName) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setCreating(true)
    try {
      const res = await fetch(`${API_URL}/admin/roles/create-admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        const data = await res.json()
        toast({
          title: "Success",
          description: `Admin ${formData.firstName} created successfully`,
        })
        setFormData({
          email: "",
          firstName: "",
          lastName: "",
          adminRole: "admin",
        })
        setShowCreateModal(false)
        loadAdmins()
      } else {
        const err = await res.json()
        toast({
          title: "Error",
          description: err.error || "Failed to create admin",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("[v0] Failed to create admin:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create admin",
        variant: "destructive",
      })
    } finally {
      setCreating(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("user")
    router.push("/")
  }

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (accessDenied) {
    return (
      <div className="flex h-screen bg-background">
        <AdminSidebar onLogout={handleLogout} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader
            user={user}
            title="Admin Management"
            description="Create and manage admin accounts with different privilege levels"
          />
          <main className="flex-1 flex items-center justify-center p-6">
            <Card className="p-8 text-center max-w-md">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-600" />
              <p className="text-foreground font-semibold mb-2 text-lg">Access Denied</p>
              <p className="text-muted-foreground mb-6">
                You do not have permission to access this page. Only Super Admin and Admin roles can manage admin
                accounts.
              </p>
              <Button onClick={() => router.push("/admin")} className="bg-primary hover:bg-primary/90">
                Return to Dashboard
              </Button>
            </Card>
          </main>
        </div>
      </div>
    )
  }

  if (!user || !token) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Card className="p-6 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-600" />
          <p className="text-foreground font-semibold mb-2">Authentication Required</p>
          <p className="text-muted-foreground mb-4">You must be logged in as an admin to access this page</p>
          <Button onClick={() => router.push("/admin/login")} className="bg-primary hover:bg-primary/90">
            Go to Admin Login
          </Button>
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
          title="Admin Management"
          description="Create and manage admin accounts with different privilege levels"
        />

        <main className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Role Information */}
            <Card className="p-6 bg-blue-50 border-blue-200">
              <h3 className="text-lg font-semibold mb-4 text-blue-900">Admin Roles & Permissions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(ROLE_DESCRIPTIONS).map(([role, description]) => (
                  <div key={role} className="p-3 bg-white rounded-lg border border-blue-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={`${ROLE_COLORS[role]} text-white`}>
                        {role.replace("_", " ").toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{description}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Create Admin Button */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Active Admins</h2>
              <Button onClick={() => setShowCreateModal(true)} className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Create Admin
              </Button>
            </div>

            {/* Admins List */}
            {loading ? (
              <Card className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading admins...</p>
              </Card>
            ) : admins.length === 0 ? (
              <Card className="p-12 text-center">
                <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">No other admins created yet</p>
                <Button onClick={() => setShowCreateModal(true)} className="bg-primary hover:bg-primary/90">
                  Create First Admin
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {admins.map((admin) => (
                  <Card key={admin._id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold">
                            {admin.firstName} {admin.lastName}
                          </h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <Mail className="w-4 h-4" />
                            {admin.email}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className={`${ROLE_COLORS[admin.adminRole]} text-white`}>
                              {admin.adminRole.replace("_", " ").toUpperCase()}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Since {new Date(admin.adminSince).toLocaleDateString("en-NG")}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
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

      {/* Create Admin Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-foreground">Create New Admin</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <Input
                  type="email"
                  placeholder="admin@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">First Name *</label>
                  <Input
                    placeholder="First"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Last Name *</label>
                  <Input
                    placeholder="Last"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Admin Role *</label>
                <select
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  value={formData.adminRole}
                  onChange={(e) => setFormData({ ...formData, adminRole: e.target.value })}
                >
                  <option value="admin">General Administrator</option>
                  <option value="vendor_manager">Vendor Manager</option>
                  <option value="seller_manager">Seller Manager</option>
                  <option value="support_admin">Support Admin</option>
                </select>
                <p className="text-xs text-muted-foreground mt-2">
                  {ROLE_DESCRIPTIONS[formData.adminRole as keyof typeof ROLE_DESCRIPTIONS] || "Select a role"}
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                <p className="text-blue-900 font-semibold mb-1">Important</p>
                <ul className="text-blue-800 space-y-1 list-disc list-inside text-xs">
                  <li>Admin will receive an email to set their password</li>
                  <li>Different roles have different permission levels</li>
                  <li>Super Admin can modify any admin's permissions</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => setShowCreateModal(false)}
                  disabled={creating}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-primary hover:bg-primary/90"
                  onClick={handleCreateAdmin}
                  disabled={creating}
                >
                  {creating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Create Admin
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
