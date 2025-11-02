"use client"

import { Card } from "@/components/ui/card"
import { Star, Flag, Trash2, CheckCircle } from "lucide-react"

interface ReviewsStatsProps {
  totalReviews: number
  averageRating: number
  flaggedCount: number
  removedCount: number
}

export default function ReviewsStats({ totalReviews, averageRating, flaggedCount, removedCount }: ReviewsStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">Total Reviews</p>
            <p className="text-3xl font-bold text-foreground mt-2">{totalReviews}</p>
          </div>
          <CheckCircle className="w-8 h-8 text-muted-foreground/50" />
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">Avg. Rating</p>
            <div className="flex items-center gap-2 mt-2">
              <p className="text-3xl font-bold text-foreground">{averageRating.toFixed(1)}</p>
              <Star className="w-5 h-5 text-yellow-500 fill-current" />
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 border-yellow-200 bg-yellow-50/50">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-yellow-900 font-medium">Flagged Reviews</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">{flaggedCount}</p>
          </div>
          <Flag className="w-8 h-8 text-yellow-600/50" />
        </div>
      </Card>

      <Card className="p-6 border-red-200 bg-red-50/50">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-red-900 font-medium">Removed Reviews</p>
            <p className="text-3xl font-bold text-red-600 mt-2">{removedCount}</p>
          </div>
          <Trash2 className="w-8 h-8 text-red-600/50" />
        </div>
      </Card>
    </div>
  )
}
