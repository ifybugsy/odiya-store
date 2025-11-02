"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import AdminSidebar from "@/components/admin/admin-sidebar"
import DashboardHeader from "@/components/admin/dashboard-header"
import ReviewsFilterBar from "@/components/admin/reviews-filter-bar"
import ReviewCard from "@/components/admin/review-card"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

interface Review {
  _id: string
  itemTitle: string
  reviewer: {
    firstName: string
    lastName: string
  }
  rating: number
  title: string
  comment: string
  status: "published" | "flagged" | "removed"
  createdAt: string
}

export default function ReviewsManagementPage() {
  const { user, token, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    flaggedCount: 0,
    removedCount: 0,
  })
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)

  // Filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [ratingFilter, setRatingFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

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

    loadReviews()
  }, [user, token, authLoading, router])

  const loadReviews = async () => {
    setLoading(true)
    try {
      const [reviewsRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/admin/reviews`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/admin/reviews/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      if (reviewsRes.ok) {
        setReviews(await reviewsRes.json())
      }
      if (statsRes.ok) {
        setStats(await statsRes.json())
      }
    } catch (error) {
      console.error("Failed to load reviews:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePublish = async (reviewId: string) => {
    try {
      await fetch(`${API_URL}/admin/reviews/${reviewId}/publish`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      })
      loadReviews()
    } catch (error) {
      console.error("Failed to publish review:", error)
    }
  }

  const handleFlag = async (reviewId: string) => {
    if (!confirm("Flag this review for moderation?")) return
    try {
      await fetch(`${API_URL}/admin/reviews/${reviewId}/flag`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      })
      loadReviews()
    } catch (error) {
      console.error("Failed to flag review:", error)
    }
  }

  const handleRemove = async (reviewId: string) => {
    if (!confirm("Remove this review permanently?")) return
    try {
      await fetch(`${API_URL}/admin/reviews/${reviewId}/remove`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      })
      loadReviews()
    } catch (error) {
      console.error("Failed to remove review:", error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("user")
    router.push("/")
  }

  const handleResetFilters = () => {
    setSearchQuery("")
    setRatingFilter("all")
    setStatusFilter("all")
  }

  // Filter reviews based on search and filters
  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      const matchesSearch =
        review.itemTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.reviewer?.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.reviewer?.lastName.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesRating = ratingFilter === "all" || review.rating === Number.parseInt(ratingFilter)
      const matchesStatus = statusFilter === "all" || review.status === statusFilter

      return matchesSearch && matchesRating && matchesStatus
    })
  }, [reviews, searchQuery, ratingFilter, statusFilter])

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
          title="Review Management"
          description="Monitor, moderate, and manage all user reviews and ratings"
        />

        <main className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Stats Cards */}
            {!loading && (
              <div>
                <p>Total Reviews: {stats.totalReviews}</p>
                <p>Average Rating: {stats.averageRating}</p>
                <p>Flagged Count: {stats.flaggedCount}</p>
                <p>Removed Count: {stats.removedCount}</p>
              </div>
            )}

            {/* Filter Bar */}
            <ReviewsFilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              ratingFilter={ratingFilter}
              onRatingChange={setRatingFilter}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              onReset={handleResetFilters}
            />

            {/* Reviews List */}
            {loading ? (
              <Card className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading reviews...</p>
              </Card>
            ) : filteredReviews.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground text-lg">No reviews found</p>
                <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredReviews.map((review) => (
                  <ReviewCard
                    key={review._id}
                    review={review}
                    onPublish={review.status === "flagged" ? handlePublish : undefined}
                    onFlag={review.status === "published" ? handleFlag : undefined}
                    onRemove={review.status !== "removed" ? handleRemove : undefined}
                    isLoading={loading}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
