"use client"

import { useState, useEffect } from "react"
import ItemCard from "./item-card"
import { apiRequest } from "@/lib/api-utils"

interface RelatedItemsProps {
  category: string
  currentItemId: string
  limit?: number
}

export default function RelatedItems({ category, currentItemId, limit = 6 }: RelatedItemsProps) {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchRelatedItems = async () => {
      try {
        setLoading(true)
        const data = await apiRequest(`/items?category=${encodeURIComponent(category)}&limit=${limit + 1}`)

        const itemsList = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : []

        // Filter out current item and sold items, then limit results
        const filtered = itemsList
          .filter((item: any) => {
            return item?._id !== currentItemId && !item?.isSold
          })
          .slice(0, limit)

        setItems(filtered)
        setError("")
      } catch (err) {
        console.error("[v0] Error fetching related items:", err)
        setError(err instanceof Error ? err.message : "Failed to load related items")
        setItems([])
      } finally {
        setLoading(false)
      }
    }

    if (category) {
      fetchRelatedItems()
    }
  }, [category, currentItemId, limit])

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Related Items</h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-muted rounded-lg h-64 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Related Items in {category}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <ItemCard key={item._id} item={item} />
        ))}
      </div>
    </div>
  )
}
