import { Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { getSellerBadge, badgeColors, type BadgeType } from "@/lib/seller-badge"

interface SellerBadgeProps {
  seller: any
  size?: "sm" | "md" | "lg"
}

const badgeLabels: Record<BadgeType, string> = {
  bronze: "Bronze Seller",
  silver: "Silver Seller",
  gold: "Gold Seller",
  diamond: "Diamond Seller",
}

export function SellerBadgeComponent({ seller, size = "md" }: SellerBadgeProps) {
  if (!seller) return null

  const badge = getSellerBadge({
    contactCount: seller.contactCount || 0,
    itemsSold: seller.itemsSold || 0,
    totalItemsListed: seller.totalItemsListed || 0,
    rating: seller.rating || 0,
    ratingCount: seller.ratingCount || 0,
    createdAt: seller.createdAt,
    lastListingDate: seller.lastListingDate,
  })

  if (!badge) return null

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-2 text-base",
  }

  return (
    <Badge className={`${badgeColors[badge]} text-white flex items-center gap-1 ${sizeClasses[size]}`}>
      <Star className={`${size === "sm" ? "w-3 h-3" : size === "md" ? "w-4 h-4" : "w-5 h-5"} fill-current`} />
      <span>{badgeLabels[badge]}</span>
    </Badge>
  )
}
