export type BadgeType = "bronze" | "silver" | "gold" | "diamond" | null

export interface SellerStats {
  contactCount: number
  itemsSold: number
  totalItemsListed: number
  rating: number
  ratingCount: number
  createdAt: Date
  lastListingDate: Date | null
}

/**
 * Determine seller badge based on activity metrics
 * Bronze: 10+ items listed or 5+ items sold
 * Silver: 25+ items listed or 15+ items sold
 * Gold: 50+ items listed or 30+ items sold or 4.5+ rating with 20+ reviews
 * Diamond: 100+ items listed or 50+ items sold or 4.8+ rating with 50+ reviews
 */
export function getSellerBadge(stats: SellerStats): BadgeType {
  const daysActive = stats.createdAt ? (Date.now() - new Date(stats.createdAt).getTime()) / (1000 * 60 * 60 * 24) : 0

  // Diamond: Highest tier
  if (stats.totalItemsListed >= 100 || stats.itemsSold >= 50 || (stats.rating >= 4.8 && stats.ratingCount >= 50)) {
    return "diamond"
  }

  // Gold: High activity
  if (
    stats.totalItemsListed >= 50 ||
    stats.itemsSold >= 30 ||
    (stats.rating >= 4.5 && stats.ratingCount >= 20 && daysActive >= 90)
  ) {
    return "gold"
  }

  // Silver: Moderate activity
  if (stats.totalItemsListed >= 25 || stats.itemsSold >= 15) {
    return "silver"
  }

  // Bronze: Starter level
  if (stats.totalItemsListed >= 10 || stats.itemsSold >= 5) {
    return "bronze"
  }

  return null
}

export const badgeColors = {
  bronze: "bg-amber-600",
  silver: "bg-slate-400",
  gold: "bg-yellow-500",
  diamond: "bg-cyan-400",
}

export const badgeTextColors = {
  bronze: "text-amber-600",
  silver: "text-slate-400",
  gold: "text-yellow-500",
  diamond: "text-cyan-400",
}
