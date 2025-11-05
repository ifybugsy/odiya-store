"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"

interface InteractiveStarRatingProps {
  onSubmit: (rating: number) => Promise<void>
  isLoading?: boolean
  currentRating?: number
  itemId?: string
  sellerId?: string
}

export default function InteractiveStarRating({
  onSubmit,
  isLoading = false,
  currentRating = 0,
  itemId,
  sellerId,
}: InteractiveStarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0)
  const [selectedRating, setSelectedRating] = useState(currentRating)
  const [submitted, setSubmitted] = useState(currentRating > 0)

  const handleSubmit = async () => {
    if (selectedRating === 0) return
    try {
      await onSubmit(selectedRating)
      setSubmitted(true)
    } catch (error) {
      console.error("Failed to submit rating:", error)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <button
            key={i}
            onClick={() => !submitted && setSelectedRating(i + 1)}
            onMouseEnter={() => !submitted && setHoverRating(i + 1)}
            onMouseLeave={() => setHoverRating(0)}
            disabled={submitted || isLoading}
            className="focus:outline-none transition-transform hover:scale-110 disabled:cursor-not-allowed"
            aria-label={`Rate ${i + 1} stars`}
          >
            <Star
              className={`w-5 h-5 transition-colors ${
                i < (hoverRating || selectedRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>

      {!submitted && (
        <Button
          onClick={handleSubmit}
          disabled={selectedRating === 0 || isLoading}
          size="sm"
          className="bg-primary hover:bg-primary/90"
        >
          {isLoading ? "Submitting..." : "Rate"}
        </Button>
      )}

      {submitted && <span className="text-sm text-green-600 font-medium">Rating submitted</span>}
    </div>
  )
}
