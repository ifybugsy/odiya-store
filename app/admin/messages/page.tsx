"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AdminSidebar from "@/components/admin/admin-sidebar"
import DashboardHeader from "@/components/admin/dashboard-header"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Mail, Search, User } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

interface Message {
  _id: string
  buyerId: {
    firstName: string
    lastName: string
    email: string
  }
  vendorId: {
    storeName: string
  }
  subject: string
  message: string
  createdAt: string
  isRead: boolean
  sender: string
}

export default function AdminMessagesPage() {
  const { user, token, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (authLoading) return

    if (!user?.isAdmin || !token) {
      router.push("/admin-login")
      return
    }

    loadMessages()
  }, [user, token, authLoading, router])

  const loadMessages = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error("Failed to load messages:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("user")
    router.push("/")
  }

  const filteredMessages = messages.filter(
    (msg) =>
      msg.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.buyerId?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.buyerId?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.vendorId?.storeName?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar onLogout={handleLogout} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader
          user={user}
          title="Messages Management"
          description="Monitor and manage all vendor-customer communications"
        />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Search Bar */}
            <Card className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Messages</p>
                    <p className="text-2xl font-bold">{messages.length}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Unread Messages</p>
                    <p className="text-2xl font-bold">{messages.filter((m) => !m.isRead).length}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-500/10 rounded-lg">
                    <Mail className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Today</p>
                    <p className="text-2xl font-bold">
                      {
                        messages.filter((m) => new Date(m.createdAt).toDateString() === new Date().toDateString())
                          .length
                      }
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Messages List */}
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">All Messages</h2>
                <div className="space-y-4">
                  {filteredMessages.length === 0 ? (
                    <div className="text-center py-12">
                      <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="text-muted-foreground">No messages found</p>
                    </div>
                  ) : (
                    filteredMessages.map((msg) => (
                      <div
                        key={msg._id}
                        className={`p-4 border border-border rounded-lg ${
                          !msg.isRead ? "bg-primary/5" : "bg-background"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">
                                {msg.buyerId?.firstName} {msg.buyerId?.lastName}
                              </p>
                              <p className="text-sm text-muted-foreground">{msg.buyerId?.email}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            {!msg.isRead && (
                              <Badge variant="secondary" className="bg-primary text-white mb-1">
                                Unread
                              </Badge>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {new Date(msg.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="ml-13">
                          <p className="text-sm text-muted-foreground mb-1">
                            To: <span className="font-medium">{msg.vendorId?.storeName || "Unknown Vendor"}</span>
                          </p>
                          <p className="font-medium text-foreground mb-2">{msg.subject}</p>
                          <p className="text-sm text-muted-foreground">{msg.message}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
