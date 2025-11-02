"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import AdminSidebar from "@/components/admin/admin-sidebar"
import DashboardHeader from "@/components/admin/dashboard-header"
import ActivityFilterBar from "@/components/admin/activity-filter-bar"
import ActivityTimeline from "@/components/admin/activity-timeline"
import ActivityStatsComponent from "@/components/admin/activity-stats"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

interface Activity {
  _id: string
  userId: string
  userName: string
  type: "purchase" | "login" | "view" | "review" | "message"
  title: string
  description: string
  timestamp: string
  metadata?: Record<string, any>
}

interface ActivityStats {
  totalActivities: number
  purchasesCount: number
  activeUsers: number
  messagesCount: number
}

export default function ActivityTrackingPage() {
  const { user, token, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [activities, setActivities] = useState<Activity[]>([])
  const [stats, setStats] = useState<ActivityStats>({
    totalActivities: 0,
    purchasesCount: 0,
    activeUsers: 0,
    messagesCount: 0,
  })
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)

  // Filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [dateRangeFilter, setDateRangeFilter] = useState("all")

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

    loadActivity()
  }, [user, token, authLoading, router])

  const loadActivity = async () => {
    setLoading(true)
    try {
      const [activitiesRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/admin/activity`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/admin/activity/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      if (activitiesRes.ok) {
        setActivities(await activitiesRes.json())
      }
      if (statsRes.ok) {
        setStats(await statsRes.json())
      }
    } catch (error) {
      console.error("Failed to load activity:", error)
    } finally {
      setLoading(false)
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
    setDateRangeFilter("all")
  }

  // Filter activities based on search and filters
  const filteredActivities = useMemo(() => {
    const now = new Date()
    const getDateRange = (range: string) => {
      const startDate = new Date(now)
      switch (range) {
        case "today":
          startDate.setHours(0, 0, 0, 0)
          break
        case "week":
          startDate.setDate(now.getDate() - 7)
          break
        case "month":
          startDate.setMonth(now.getMonth() - 1)
          break
        case "quarter":
          startDate.setMonth(now.getMonth() - 3)
          break
        default:
          return null
      }
      return startDate
    }

    const dateLimit = getDateRange(dateRangeFilter)

    return activities.filter((activity) => {
      const matchesSearch =
        activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.description.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesType = typeFilter === "all" || activity.type === typeFilter

      const matchesDate = dateRangeFilter === "all" || !dateLimit || new Date(activity.timestamp) >= dateLimit

      return matchesSearch && matchesType && matchesDate
    })
  }, [activities, searchQuery, typeFilter, dateRangeFilter])

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
          title="Activity Tracking"
          description="Monitor user activity, purchases, and engagement across the platform"
        />

        <main className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Stats Cards */}
            {!loading && (
              <ActivityStatsComponent
                totalActivities={stats.totalActivities}
                purchasesCount={stats.purchasesCount}
                activeUsers={stats.activeUsers}
                messagesCount={stats.messagesCount}
                trend={{ value: 15, isPositive: true }}
              />
            )}

            {/* Filter Bar */}
            <ActivityFilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              typeFilter={typeFilter}
              onTypeChange={setTypeFilter}
              dateRangeFilter={dateRangeFilter}
              onDateRangeChange={setDateRangeFilter}
              onReset={handleResetFilters}
            />

            {/* Activity Timeline */}
            {loading ? (
              <Card className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading activities...</p>
              </Card>
            ) : (
              <ActivityTimeline activities={filteredActivities} />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
