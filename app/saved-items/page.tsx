"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Navbar from "@/components/navbar"
import ItemCard from "@/components/item-card"
import { Button } from "@/components/ui/button"
import { useWishlist } from "@/lib/wishlist-context"
import { Heart, ArrowLeft } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export default function SavedItemsPage() {
  const { savedItems } = useWishlist()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSavedItems = async () => {
      if (savedItems.length === 0) {
        setLoading(false)
        return
      }

      try {
        const itemsData = await Promise.all(
          savedItems.map((id) =>
            fetch(`${API_URL}/items/${id}`)
              .then((res) => res.json())
              .catch(() => null),
          ),
        )
        setItems(itemsData.filter((item) => item !== null))
      } catch (error) {
        console.error("[v0] Failed to load saved items:", error)
      } finally {
        setLoading(false)
      }
    }

    loadSavedItems()
  }, [savedItems])

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Heart className="w-8 h-8 text-red-500 fill-red-500" />
                Saved Items
              </h1>
              <p className="text-muted-foreground mt-1">{items.length} item(s) saved</p>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex justify-center items-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
              <p className="text-lg font-medium text-muted-foreground mb-2">No saved items yet</p>
              <p className="text-sm text-muted-foreground mb-6">Start adding items to your wishlist to see them here</p>
              <Link href="/">
                <Button>Continue Shopping</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
              {items.map((item) => (
                <ItemCard key={item._id} item={item} />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
