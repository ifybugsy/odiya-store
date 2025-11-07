"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { useRiderAuth } from "@/lib/rider-auth-context"
import { Star, MessageSquare, User } from "lucide-react"

interface Rating {
  _id: string
  customerId: string
  customerName: string
  score: number
  comment: string
  createdAt: string
}

export default function RatingsPage() {
  const router = useRouter()
  const { rider, token } = useRiderAuth()
  const [ratings, setRatings] = useState<Rating[]>([])
  const [loading, setLoading] = useState(true)
  const [averageRating, setAverageRating] = useState(0)

  useEffect(() => {
    if (!rider || !token) {
      router.push("/rider/login")
      return
    }
    loadRatings()
  }, [rider, token])

  const loadRatings = async () => {
    try {
      const response = await fetch("/api/rider/ratings", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setRatings(data.ratings || [])
        setAverageRating(data.averageRating || 0)
      }
    } catch (error) {
      console.error("Failed to load ratings:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading ratings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Ratings & Reviews</h1>
        <p className="text-muted-foreground mt-1">See what customers say about your delivery service</p>
      </div>

      {/* Average Rating Card */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Average Rating</p>
              <p className="text-4xl font-bold text-foreground mt-2">{averageRating.toFixed(1)}</p>
              <p className="text-muted-foreground text-sm mt-1">out of 5.0 ({ratings.length} ratings)</p>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-8 h-8 ${
                    i < Math.floor(averageRating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                  }`}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {ratings.length === 0 ? (
          <Card className="p-12 text-center">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground text-lg font-medium">No reviews yet</p>
            <p className="text-sm text-muted-foreground mt-1">Complete more deliveries to receive reviews</p>
          </Card>
        ) : (
          ratings.map((rating) => (
            <Card key={rating._id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-foreground">{rating.customerName}</h3>
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < rating.score ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {rating.comment && <p className="text-muted-foreground text-sm">{rating.comment}</p>}
                    <p className="text-xs text-muted-foreground mt-3">
                      {new Date(rating.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
