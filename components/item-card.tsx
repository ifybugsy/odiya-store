"use client"

import type React from "react"

import Link from "next/link"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { SaveButton } from "@/components/save-button"
import { getUserInitials } from "@/lib/user-utils"
import { getImageUrl, handleImageError } from "@/lib/image-utils"

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
  const currentImage = getImageUrl(item.images?.[currentImageIndex])

  return (
    <Link href={`/item/${item._id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
        <div className="relative w-full h-40 bg-muted overflow-hidden">
          <img
            src={currentImage || "/placeholder.svg"}
            alt={`${item.title} - Image ${currentImageIndex + 1}`}
            className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-90"
            onError={handleImageError}
          />

          <div className="absolute top-2 left-2 z-10">
            <div
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
            >
              <SaveButton itemId={item._id} size="sm" showLabel={false} variant="ghost" />
            </div>
          </div>

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
          {item.condition && (
            <div className="mt-2">
              <Badge variant="secondary" className="text-xs">
                {item.condition}
              </Badge>
            </div>
          )}
          <div className="flex items-center gap-2 mt-2">
            {item.sellerId?.profileImage && item.sellerId.profileImage.trim() ? (
              <img
                src={getImageUrl(item.sellerId.profileImage) || "/placeholder.svg"}
                alt={`${item.sellerId?.firstName} ${item.sellerId?.lastName}`}
                className="w-6 h-6 rounded-full object-cover"
                onError={handleImageError}
              />
            ) : null}
            <div
              data-fallback
              className={`w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-foreground ${
                item.sellerId?.profileImage && item.sellerId.profileImage.trim() ? "hidden" : ""
              }`}
            >
              {getUserInitials(item.sellerId?.firstName, item.sellerId?.lastName)}
            </div>
            <p className="text-xs truncate flex-1">
              {item.sellerId?.firstName} {item.sellerId?.lastName}
            </p>
            {item.sellerId?.rating > 0 && (
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < Math.floor(item.sellerId?.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  )
}
