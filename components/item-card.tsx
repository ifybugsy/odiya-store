"use client"

import type React from "react"

import Link from "next/link"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function ItemCard({ item }: { item: any }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const formattedPrice = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(item.price)

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev === 0 ? (item.images?.length || 1) - 1 : prev - 1))
  }

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev === (item.images?.length || 1) - 1 ? 0 : prev + 1))
  }

  const hasMultipleImages = item.images && item.images.length > 1
  const currentImage = item.images?.[currentImageIndex] || "/placeholder.svg"

  return (
    <Link href={`/item/${item._id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
        <div className="relative w-full h-40 bg-muted group">
          <img
            src={currentImage || "/placeholder.svg"}
            alt={`${item.title} - Image ${currentImageIndex + 1}`}
            className="w-full h-full object-cover transition-opacity duration-300"
          />

          {/* Image navigation buttons - only show if multiple images */}
          {hasMultipleImages && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-1 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Previous image"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-1 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Next image"
              >
                <ChevronRight size={16} />
              </button>

              {/* Image counter indicator */}
              <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                {currentImageIndex + 1}/{item.images.length}
              </div>
            </>
          )}

          <Badge className="absolute top-2 right-2 bg-primary">{item.category}</Badge>
        </div>
        <div className="p-3">
          <h3 className="font-semibold text-sm line-clamp-2">{item.title}</h3>
          <p className="text-primary font-bold text-lg my-2">{formattedPrice}</p>
          <p className="text-xs text-muted-foreground">{item.location}</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-6 h-6 rounded-full bg-muted" />
            <p className="text-xs truncate">
              {item.sellerId?.firstName} {item.sellerId?.lastName}
            </p>
          </div>
        </div>
      </Card>
    </Link>
  )
}
