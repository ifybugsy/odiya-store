"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import ItemCard from "@/components/item-card"
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { apiRequest } from "@/lib/api-utils"

interface PopularAdsSectionProps {
  selectedCategory?: string
}

export default function PopularAdsSection({ selectedCategory }: PopularAdsSectionProps) {
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadPopularItems = async () => {
      setIsLoading(true)
      setError("")
      try {
        let endpoint = "/items?page=1&limit=8"
        if (selectedCategory && selectedCategory.trim() !== "") {
          endpoint += `&category=${encodeURIComponent(selectedCategory)}`
        }

        console.log("[v0] PopularAdsSection fetching:", endpoint)
        const data = await apiRequest(endpoint)
        console.log("[v0] PopularAdsSection API response:", data)

        let itemsList = []
        if (Array.isArray(data?.items)) {
          itemsList = data.items
        } else if (Array.isArray(data?.data)) {
          itemsList = data.data
        } else if (Array.isArray(data)) {
          itemsList = data
        } else if (data && typeof data === "object") {
          // Try to find an array in the response object
          itemsList = Object.values(data).find((v) => Array.isArray(v)) || []
        }

        itemsList = Array.isArray(itemsList) ? itemsList.slice(0, 8) : []

        console.log("[v0] PopularAdsSection processed items count:", itemsList.length)
        setItems(itemsList)
      } catch (err) {
        console.error("[v0] Failed to load popular ads:", err)
        setError("Failed to load popular items")
        setItems([])
      } finally {
        setIsLoading(false)
      }
    }

    loadPopularItems()
  }, [selectedCategory])

  if (!selectedCategory || selectedCategory.trim() === "") {
    return null
  }

  const displayTitle = `Popular in ${selectedCategory}`
  const displayDescription = `Check out these trending items in ${selectedCategory}`

  return (
    <section className="bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground text-balance">{displayTitle}</h2>
            <p className="text-muted-foreground text-sm mt-2">{displayDescription}</p>
          </div>
          <Link href={`/?category=${encodeURIComponent(selectedCategory)}`}>
            <Button variant="outline" className="gap-2 hidden md:flex bg-transparent">
              View All <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Items Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-muted rounded-lg animate-pulse h-48" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{error}</p>
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {items.map((item) => (
              <div key={item._id} className="animate-item-entrance">
                <ItemCard item={item} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No items found in {selectedCategory}</p>
          </div>
        )}

        {/* View All Button for Mobile */}
        <div className="mt-8 md:hidden">
          <Link href={`/?category=${encodeURIComponent(selectedCategory)}`} className="block">
            <Button className="w-full" size="lg">
              View All Items
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
