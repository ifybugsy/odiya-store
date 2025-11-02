"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Trash2, Flag, CheckCircle } from "lucide-react"

interface ReviewCardProps {
  review: {
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
  onPublish?: (reviewId: string) => void
  onFlag?: (reviewId: string) => void
  onRemove?: (reviewId: string) => void
  isLoading?: boolean
}

export default function ReviewCard({ review, onPublish, onFlag, onRemove, isLoading = false }: ReviewCardProps) {
  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "text-green-600"
    if (rating >= 3) return "text-yellow-600"
    return "text-red-600"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800"
      case "flagged":
        return "bg-yellow-100 text-yellow-800"
      case "removed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-bold text-lg text-foreground">{review.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">Item: {review.itemTitle}</p>
            <p className="text-sm text-muted-foreground">
              By {review.reviewer.firstName} {review.reviewer.lastName}
            </p>
          </div>
          <Badge className={`${getStatusColor(review.status)}`}>
            {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
          </Badge>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < review.rating ? getRatingColor(review.rating) : "text-muted-foreground"
                } ${i < review.rating ? "fill-current" : ""}`}
              />
            ))}
          </div>
          <span className={`font-bold ${getRatingColor(review.rating)}`}>{review.rating}.0</span>
        </div>

        {/* Comment */}
        <p className="text-foreground text-sm leading-relaxed">{review.comment}</p>

        {/* Meta */}
        <p className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</p>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t border-border">
          {review.status === "flagged" && onPublish && (
            <Button
              onClick={() => onPublish(review._id)}
              disabled={isLoading}
              size="sm"
              className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Approve
            </Button>
          )}
          {review.status === "published" && onFlag && (
            <Button
              onClick={() => onFlag(review._id)}
              disabled={isLoading}
              size="sm"
              variant="outline"
              className="flex items-center gap-2"
            >
              <Flag className="w-4 h-4" />
              Flag
            </Button>
          )}
          {review.status !== "removed" && onRemove && (
            <Button
              onClick={() => onRemove(review._id)}
              disabled={isLoading}
              size="sm"
              variant="destructive"
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Remove
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
