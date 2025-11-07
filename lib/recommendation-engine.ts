import Recommendation from "@/models/Recommendation"
import User from "@/models/User"
import Wishlist from "@/models/Wishlist"
import mongoose from "mongoose"

interface RecommendationCriteria {
  userId: string
  limit?: number
  excludeIds?: string[]
}

interface ItemData {
  _id: string
  category: string
  price: number
  rating: number
  description: string
}

export async function generateRecommendations(criteria: RecommendationCriteria) {
  try {
    const { userId, limit = 10, excludeIds = [] } = criteria

    // Get user's purchase history and preferences from wishlist
    const wishlist = await Wishlist.find({ userId }).populate("itemId")
    const userCategories = new Map<string, number>()
    const userPriceRanges: number[] = []

    wishlist.forEach((item: any) => {
      if (item.itemId) {
        const category = item.itemId.category
        userCategories.set(category, (userCategories.get(category) || 0) + 1)
        userPriceRanges.push(item.itemId.price)
      }
    })

    // Calculate user's preferred price range
    const avgPrice = userPriceRanges.length ? userPriceRanges.reduce((a, b) => a + b, 0) / userPriceRanges.length : 0
    const priceRangeMin = avgPrice * 0.6
    const priceRangeMax = avgPrice * 1.4

    const recommendations: Array<{ itemId: string; score: number; reason: string }> = []

    // 1. Category-based recommendations
    if (userCategories.size > 0) {
      const topCategories = Array.from(userCategories.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([category]) => category)

      // Get high-rated items from user's favorite categories
      const categoryItems = await getItemsByCategories(topCategories, excludeIds, 5)
      categoryItems.forEach((item) => {
        recommendations.push({
          itemId: item._id.toString(),
          score: 70 + (item.rating || 0) * 5,
          reason: "category_match",
        })
      })
    }

    // 2. Rating-based recommendations (trending high-rated items)
    const highRatedItems = await getHighRatedItems(excludeIds, 3)
    highRatedItems.forEach((item) => {
      recommendations.push({
        itemId: item._id.toString(),
        score: 60 + (item.rating || 0) * 8,
        reason: "rating",
      })
    })

    // 3. Price-range recommendations
    if (priceRangeMin > 0) {
      const priceRangeItems = await getItemsByPriceRange(priceRangeMin, priceRangeMax, excludeIds, 3)
      priceRangeItems.forEach((item) => {
        recommendations.push({
          itemId: item._id.toString(),
          score: 50 + (item.rating || 0) * 4,
          reason: "price_range",
        })
      })
    }

    // 4. Trending items
    const trendingItems = await getTrendingItems(excludeIds, 2)
    trendingItems.forEach((item) => {
      recommendations.push({
        itemId: item._id.toString(),
        score: 65,
        reason: "trending",
      })
    })

    // Deduplicate and sort by score
    const uniqueRecommendations = deduplicateRecommendations(recommendations)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)

    // Save recommendations to database
    const savedRecommendations = await Promise.all(
      uniqueRecommendations.map((rec) =>
        Recommendation.findOneAndUpdate(
          { userId, itemId: rec.itemId },
          { userId, itemId: rec.itemId, score: rec.score, reason: rec.reason },
          { upsert: true, new: true },
        ),
      ),
    )

    return savedRecommendations
  } catch (error) {
    console.error("[v0] Error generating recommendations:", error)
    return []
  }
}

async function getItemsByCategories(categories: string[], excludeIds: string[], limit: number) {
  try {
    return await getItemsFromDB({
      category: { $in: categories },
      _id: { $nin: excludeIds.map((id) => new mongoose.Types.ObjectId(id)) },
    })
      .sort({ rating: -1, createdAt: -1 })
      .limit(limit)
  } catch (error) {
    console.error("[v0] Error getting items by categories:", error)
    return []
  }
}

async function getHighRatedItems(excludeIds: string[], limit: number) {
  try {
    return await getItemsFromDB({
      rating: { $gte: 4 },
      _id: { $nin: excludeIds.map((id) => new mongoose.Types.ObjectId(id)) },
    })
      .sort({ rating: -1, reviews: -1 })
      .limit(limit)
  } catch (error) {
    console.error("[v0] Error getting high-rated items:", error)
    return []
  }
}

async function getItemsByPriceRange(minPrice: number, maxPrice: number, excludeIds: string[], limit: number) {
  try {
    return await getItemsFromDB({
      price: { $gte: minPrice, $lte: maxPrice },
      _id: { $nin: excludeIds.map((id) => new mongoose.Types.ObjectId(id)) },
    })
      .sort({ rating: -1, createdAt: -1 })
      .limit(limit)
  } catch (error) {
    console.error("[v0] Error getting items by price range:", error)
    return []
  }
}

async function getTrendingItems(excludeIds: string[], limit: number) {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    return await getItemsFromDB({
      createdAt: { $gte: thirtyDaysAgo },
      _id: { $nin: excludeIds.map((id) => new mongoose.Types.ObjectId(id)) },
    })
      .sort({ rating: -1, createdAt: -1 })
      .limit(limit)
  } catch (error) {
    console.error("[v0] Error getting trending items:", error)
    return []
  }
}

function getItemsFromDB(filter: Record<string, any>) {
  // This assumes you have an Item model; adjust based on your actual model name
  const Item = mongoose.model("Item")
  return Item.find(filter)
}

function deduplicateRecommendations(recommendations: Array<{ itemId: string; score: number; reason: string }>) {
  const seen = new Set<string>()
  const deduplicated: Array<{ itemId: string; score: number; reason: string }> = []

  recommendations.forEach((rec) => {
    if (!seen.has(rec.itemId)) {
      seen.add(rec.itemId)
      deduplicated.push(rec)
    }
  })

  return deduplicated
}

export async function getRecommendationsForUser(userId: string, limit = 10) {
  try {
    const recommendations = await Recommendation.find({ userId }).sort({ score: -1 }).limit(limit).populate("itemId")

    return recommendations
  } catch (error) {
    console.error("[v0] Error fetching user recommendations:", error)
    return []
  }
}

export async function markRecommendationAsViewed(recommendationId: string) {
  try {
    return await Recommendation.findByIdAndUpdate(recommendationId, { viewed: true }, { new: true })
  } catch (error) {
    console.error("[v0] Error marking recommendation as viewed:", error)
  }
}

export async function generateScheduledRecommendations() {
  try {
    // This would be called by a cron job
    const users = await User.find({ isActive: true })

    console.log(`[v0] Generating recommendations for ${users.length} users`)

    for (const user of users) {
      await generateRecommendations({
        userId: user._id.toString(),
        limit: 15,
      })
    }

    console.log("[v0] Recommendations generation completed")
  } catch (error) {
    console.error("[v0] Error in scheduled recommendations:", error)
  }
}
