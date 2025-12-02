"use client"

import type React from "react"

import Link from "next/link"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Star, Phone, Sparkles } from "lucide-react"
import { SaveButton } from "@/components/save-button"
import { getUserInitials } from "@/lib/user-utils"
import { getImageUrl, handleImageError } from "@/lib/image-utils"
import { SellerBadgeComponent } from "@/components/seller-badge"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export default function ItemCard({ item }: { item: any }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [contactCount, setContactCount] = useState(item.sellerId?.contactCount || 0)
  const [reportModalOpen, setReportModalOpen] = useState(false)

  if (!item || !item._id) {
    console.error("[v0] ItemCard received item without _id:", item)
    return null
  }

  const price = item?.price !== undefined && item.price !== null ? Number(item.price) : 0
  const formattedPrice =
    !isNaN(price) && price > 0
      ? new Intl.NumberFormat("en-NG", {
          style: "currency",
          currency: "NGN",
        }).format(price)
      : "₦0"

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

  const handlePhoneClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      const res = await fetch(`${API_URL}/users/${item.sellerId?._id}/track-contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (res.ok) {
        const data = await res.json()
        setContactCount(data.contactCount)
      }
    } catch (error) {
      console.error("[v0] Failed to track contact:", error)
    }
  }

  const hasMultipleImages = item.images && item.images.length > 1
  const currentImage = getImageUrl(item.images?.[currentImageIndex])

  const sellerFirstName = item.sellerId?.firstName || "Unknown"
  const sellerLastName = item.sellerId?.lastName || "Seller"
  const sellerRating = item.sellerId?.rating || 0
  const sellerProfileImage = item.sellerId?.profileImage
  const badge = item.sellerId ? <SellerBadgeComponent seller={item.sellerId} size="sm" /> : null

  const isCurrentlyPromoted =
    item.isPromoted || // Admin-promoted items
    (item.isBoosted && // Boost system promoted items
      item.boostStatus === "approved" &&
      item.boostExpiresAt &&
      new Date(item.boostExpiresAt) > new Date())

  return (
    <>
      <Link href={`/item/${item._id}`}>
        <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group relative animate-item-entrance">
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

                <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                  {currentImageIndex + 1}/{item.images.length}
                </div>
              </>
            )}

            {isCurrentlyPromoted && (
              <Badge className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white border-0 shadow-lg font-bold flex items-center gap-1 z-10 px-3 py-1.5 text-xs animate-pulse">
                <Sparkles className="w-3.5 h-3.5 fill-white" />
                PROMOTED
              </Badge>
            )}

            <Badge
              className={`absolute ${isCurrentlyPromoted ? "top-11" : "top-2"} right-2 bg-primary z-10 px-3 py-1.5 text-xs`}
            >
              {item.category || "General"}
            </Badge>
          </div>
          <div className="p-3">
            <h3 className="font-semibold text-sm line-clamp-2">{item.title || "Untitled Item"}</h3>
            <p className="text-primary font-bold text-lg my-2">{formattedPrice}</p>

            {isCurrentlyPromoted && (
              <div className="mb-2 bg-gradient-to-r from-pink-500 to-red-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-md inline-flex items-center gap-1">
                <Star className="w-3 h-3 fill-white" />
                Promoted
              </div>
            )}

            <p className="text-xs text-muted-foreground">{item.location || "Location not specified"}</p>
            {item.condition && (
              <div className="mt-2">
                <Badge variant="secondary" className="text-xs">
                  {item.condition}
                </Badge>
              </div>
            )}
            <div className="flex items-center gap-2 mt-2">
              {sellerProfileImage && sellerProfileImage.trim() ? (
                <img
                  src={getImageUrl(sellerProfileImage) || "/placeholder.svg"}
                  alt={`${sellerFirstName} ${sellerLastName}`}
                  className="w-6 h-6 rounded-full object-cover"
                  onError={handleImageError}
                />
              ) : null}
              <div
                data-fallback
                className={`w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-foreground ${
                  sellerProfileImage && sellerProfileImage.trim() ? "hidden" : ""
                }`}
              >
                {getUserInitials(sellerFirstName, sellerLastName)}
              </div>
              <div className="flex-1">
                <p className="text-xs truncate">
                  {sellerFirstName} {sellerLastName}
                </p>
                {item.sellerId?.createdAt && (
                  <p className="text-xs text-muted-foreground">
                    Joined bugsymart since {new Date(item.sellerId.createdAt).getFullYear()}
                  </p>
                )}
              </div>
              {badge}
              {sellerRating > 0 && (
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < Math.floor(sellerRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
            {contactCount > 0 && (
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <Phone className="w-3 h-3" />
                <span>
                  {contactCount} contact{contactCount !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>
        </Card>
      </Link>
    </>
  )
}
