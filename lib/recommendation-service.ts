interface RecommendationRequest {
  productId: string
  userId?: string
  category?: string
  limit?: number
}

interface RecommendedProduct {
  id: string
  title: string
  price: number
  category: string
  image: string
  vendorId: string
  matchScore: number
  matchReason: string
}

export const getRecommendations = async (request: RecommendationRequest): Promise<RecommendedProduct[]> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

  try {
    const response = await fetch(`${apiUrl}/api/recommendations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productId: request.productId,
        userId: request.userId,
        category: request.category,
        limit: request.limit || 8,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch recommendations: ${response.status}`)
    }

    const data = await response.json()
    return data.recommendations || []
  } catch (error) {
    console.error("[v0] Error fetching recommendations:", error)
    return []
  }
}

export const trackInteraction = async (
  userId: string,
  productId: string,
  interactionType: "view" | "click" | "purchase" | "wishlist" | "compare",
): Promise<void> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

  try {
    await fetch(`${apiUrl}/api/interactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        productId,
        interactionType,
        timestamp: new Date().toISOString(),
      }),
    })
  } catch (error) {
    console.error("[v0] Error tracking interaction:", error)
  }
}
