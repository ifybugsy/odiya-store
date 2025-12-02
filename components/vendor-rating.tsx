"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

interface VendorRatingProps {
  vendorId: string
  vendorUserId: string
  currentRating?: number
  onRatingSubmitted?: (newRating: number) => void
}

export default function VendorRating({
  vendorId,
  vendorUserId,
  currentRating = 0,
  onRatingSubmitted,
}: VendorRatingProps) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const { user, token } = useAuth()
  const router = useRouter()

  const handleSubmit = async () => {
    if (!user || !token) {
      router.push(`/buyer/login?redirect=/vendor/${vendorId}`)
      return
    }

    if (rating === 0) return

    setSubmitting(true)
    try {
      const res = await fetch(`${API_URL}/vendors/${vendorId}/rate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating }),
      })

      if (res.ok) {
        const data = await res.json()
        setSubmitted(true)
        if (onRatingSubmitted) {
          onRatingSubmitted(data.averageRating)
        }
      } else {
        const data = await res.json()
        alert(data.error || "Failed to submit rating")
      }
    } catch (error) {
      console.error("Failed to submit rating:", error)
      alert("Failed to submit rating. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 p-6 border border-border rounded-lg bg-muted/30">
      <h3 className="text-lg font-semibold text-foreground">Rate This Vendor</h3>

      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => !submitted && setRating(star)}
            onMouseEnter={() => !submitted && setHoverRating(star)}
            onMouseLeave={() => !submitted && setHoverRating(0)}
            disabled={submitted || submitting}
            className="transition-transform hover:scale-110 disabled:cursor-not-allowed"
          >
            <Star
              className={`w-8 h-8 ${
                (hoverRating || rating) >= star ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>

      {rating > 0 && !submitted && (
        <p className="text-sm text-muted-foreground">
          You selected {rating} star{rating !== 1 ? "s" : ""}
        </p>
      )}

      {!submitted ? (
        <Button
          onClick={handleSubmit}
          disabled={rating === 0 || submitting}
          className="w-full bg-primary hover:bg-primary/90"
        >
          {submitting ? "Submitting..." : "Submit Rating"}
        </Button>
      ) : (
        <div className="text-center">
          <p className="text-sm font-semibold text-green-600">Rating submitted successfully!</p>
          <p className="text-xs text-muted-foreground mt-1">Thank you for your feedback</p>
        </div>
      )}
    </div>
  )
}
