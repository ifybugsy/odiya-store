import Item from "../models/Item.js"
import UserInteraction from "../models/UserInteraction.js"
import RecommendationCache from "../models/RecommendationCache.js"

export const getRecommendations = async (productId, userId = null, limit = 8) => {
  try {
    console.log("[v0] Calculating recommendations for product:", productId)

    // Check cache first
    const cachedRecs = await RecommendationCache.findOne({ productId })
    if (cachedRecs && cachedRecs.recommendations.length > 0) {
      console.log("[v0] Using cached recommendations")
      return cachedRecs.recommendations.slice(0, limit)
    }

    // Get the product
    const product = await Item.findById(productId)
    if (!product) {
      throw new Error("Product not found")
    }

    // Get similar products
    const recommendations = await calculateRecommendations(product, userId)

    // Cache the results
    await RecommendationCache.updateOne({ productId }, { productId, recommendations }, { upsert: true })

    return recommendations.slice(0, limit)
  } catch (error) {
    console.error("[v0] Recommendation error:", error)
    return []
  }
}

const calculateRecommendations = async (product, userId) => {
  const categoryWeight = 0.35
  const priceWeight = 0.2
  const vendorWeight = 0.2
  const historyWeight = 0.15
  const trendingWeight = 0.1

  // 1. Category match products
  const categoryProducts = await Item.find({
    _id: { $ne: product._id },
    category: product.category,
    status: "approved",
    isSold: false,
  })
    .limit(50)
    .lean()

  // 2. Price range products (±30%)
  const minPrice = product.price * 0.7
  const maxPrice = product.price * 1.3
  const priceProducts = await Item.find({
    _id: { $ne: product._id },
    price: { $gte: minPrice, $lte: maxPrice },
    status: "approved",
    isSold: false,
  })
    .limit(30)
    .lean()

  // 3. Vendor related products
  const vendorProducts = await Item.find({
    _id: { $ne: product._id },
    sellerId: product.sellerId,
    status: "approved",
    isSold: false,
  })
    .limit(20)
    .lean()

  // 4. User purchase history (if userId provided)
  let historyProducts = []
  if (userId) {
    const userPurchases = await UserInteraction.find({
      userId,
      interactionType: { $in: ["purchase", "wishlist"] },
    })
      .select("productId")
      .limit(10)

    const purchasedCategories = await Item.find({
      _id: { $in: userPurchases.map((p) => p.productId) },
    }).select("category")

    const categories = purchasedCategories.map((p) => p.category)

    historyProducts = await Item.find({
      _id: { $ne: product._id },
      category: { $in: categories },
      status: "approved",
      isSold: false,
    })
      .limit(30)
      .lean()
  }

  // 5. Trending products in category
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const trendingProducts = await Item.aggregate([
    {
      $match: {
        _id: { $ne: product._id },
        category: product.category,
        status: "approved",
        isSold: false,
        createdAt: { $gte: thirtyDaysAgo },
      },
    },
    {
      $group: {
        _id: "$_id",
        viewCount: { $sum: 1 },
        doc: { $first: "$$ROOT" },
      },
    },
    { $sort: { viewCount: -1 } },
    { $limit: 20 },
  ])

  // Score calculation
  const scoreMap = new Map()

  categoryProducts.forEach((p) => {
    const score = (scoreMap.get(p._id.toString()) || 0) + categoryWeight
    scoreMap.set(p._id.toString(), score)
  })

  priceProducts.forEach((p) => {
    const score = (scoreMap.get(p._id.toString()) || 0) + priceWeight
    scoreMap.set(p._id.toString(), score)
  })

  vendorProducts.forEach((p) => {
    const score = (scoreMap.get(p._id.toString()) || 0) + vendorWeight
    scoreMap.set(p._id.toString(), score)
  })

  historyProducts.forEach((p) => {
    const score = (scoreMap.get(p._id.toString()) || 0) + historyWeight
    scoreMap.set(p._id.toString(), score)
  })

  trendingProducts.forEach((p) => {
    const score = (scoreMap.get(p._id.toString()) || 0) + trendingWeight
    scoreMap.set(p._id.toString(), score)
  })

  // Sort by score and return
  const sorted = Array.from(scoreMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([id, score]) => ({
      productId: id,
      score,
      reason: "Recommended based on your interests",
    }))

  return sorted
}

export const trackUserInteraction = async (userId, productId, interactionType) => {
  try {
    const product = await Item.findById(productId).select("category sellerId price")
    if (!product) throw new Error("Product not found")

    await UserInteraction.create({
      userId,
      productId,
      interactionType,
      category: product.category,
      vendorId: product.sellerId,
      price: product.price,
    })

    console.log("[v0] Interaction tracked:", interactionType)
  } catch (error) {
    console.error("[v0] Error tracking interaction:", error)
  }
}
