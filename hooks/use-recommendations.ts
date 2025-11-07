"use client"

import { useEffect, useState } from "react"
import { getRecommendations, trackInteraction } from "@/lib/recommendation-service"

interface Product {
  id: string
  title: string
  price: number
  category: string
  image: string
}

export const useRecommendations = (productId: string, userId?: string, limit = 8) => {
  const [recommendations, setRecommendations] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true)
        const data = await getRecommendations({
          productId,
          userId,
          limit,
        })
        setRecommendations(data as Product[])
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"))
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      fetchRecommendations()
      // Track view interaction
      if (userId) {
        trackInteraction(userId, productId, "view")
      }
    }
  }, [productId, userId, limit])

  return { recommendations, loading, error }
}
