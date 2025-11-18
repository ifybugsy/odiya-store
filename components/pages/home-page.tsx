"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import ItemCard from "@/components/item-card"
import HeroSlider from "@/components/hero-slider"
import { Search, Filter, AlertCircle } from 'lucide-react'
import { apiRequest, validateApiConfig } from "@/lib/api-utils"

const FALLBACK_CATEGORIES = ["Electronics", "Furniture", "Fashion", "Books", "Sports", "Home"]
const ITEM_CONDITIONS = ["New", "Like New", "Good", "Fair", "Foreign Used"]

export default function HomePage() {
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedCondition, setSelectedCondition] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [configWarning, setConfigWarning] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const config = validateApiConfig()
    if (!config.isValid && config.warnings.length > 0) {
      setConfigWarning(config.warnings[0])
    }
  }, [])

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await apiRequest("/items/categories")
        setCategories(data.categories || FALLBACK_CATEGORIES)
        setConfigWarning("") // Clear warning if successful
      } catch (error) {
        console.error("[v0] Failed to load categories:", error instanceof Error ? error.message : String(error))
        setCategories(FALLBACK_CATEGORIES)

        if (error instanceof Error) {
          setConfigWarning(error.message)
        }
      }
    }

    loadCategories()
  }, [])

  const loadItems = useCallback(
    async (pageNum: number, append = false) => {
      setError("")
      setIsLoading(true)
      try {
        let endpoint = `/items?page=${pageNum}`
        if (selectedCategory) endpoint += `&category=${selectedCategory}`
        if (selectedCondition) endpoint += `&condition=${encodeURIComponent(selectedCondition)}`
        if (searchQuery) endpoint += `&search=${encodeURIComponent(searchQuery)}`

        const data = await apiRequest(endpoint)

        console.log("[v0] Loaded items count:", data.items?.length)
        console.log("[v0] First item ID:", data.items?.[0]?._id)
        console.log("[v0] Items sample:", data.items?.slice(0, 2).map((item: any) => ({
          id: item._id,
          title: item.title,
          hasId: !!item._id
        })))

        if (append) {
          setItems((prev) => [...prev, ...data.items])
        } else {
          setItems(data.items)
        }

        setHasMore(pageNum < data.pages)
        setConfigWarning("") // Clear warning if successful
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to load items"
        console.error("[v0] Failed to load items:", errorMessage)
        setError(errorMessage)
        if (!append) {
          setItems([])
        }
      } finally {
        setIsLoading(false)
      }
    },
    [selectedCategory, selectedCondition, searchQuery],
  )

  useEffect(() => {
    setPage(1)
    loadItems(1, false)
  }, [selectedCategory, selectedCondition, searchQuery, loadItems])

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 500 && hasMore && !isLoading) {
        setPage((prev) => {
          const nextPage = prev + 1
          loadItems(nextPage, true)
          return nextPage
        })
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [hasMore, isLoading, loadItems])

  return (
    <main className="min-h-screen bg-background">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <HeroSlider />
      </section>

      {configWarning && (
        <section className="bg-yellow-50 border-b border-yellow-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800">Network issue</p>
                <p className="text-xs text-yellow-700 mt-1">{configWarning}</p>
                <p className="text-xs text-yellow-600 mt-1">
                  please be patient <code className="bg-yellow-100 px-1 rounded">Loading</code> try refreshing
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Search Section */}
      <section className="bg-white border-b border-border sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex gap-4 flex-col md:flex-row">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button 
              variant={showFilters ? "default" : "outline"} 
              className="flex items-center gap-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4" />
              Filter
            </Button>
          </div>
          
          {showFilters && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h3 className="text-sm font-semibold mb-3">Item Condition</h3>
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant={selectedCondition === "" ? "default" : "outline"}
                  onClick={() => setSelectedCondition("")}
                >
                  All Conditions
                </Button>
                {ITEM_CONDITIONS.map((condition) => (
                  <Button
                    key={condition}
                    size="sm"
                    variant={selectedCondition === condition ? "default" : "outline"}
                    onClick={() => setSelectedCondition(condition)}
                  >
                    {condition}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="bg-white border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <Button
                variant={selectedCategory === "" ? "default" : "outline"}
                onClick={() => setSelectedCategory("")}
                className="whitespace-nowrap flex-shrink-0"
              >
                All
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  className="whitespace-nowrap flex-shrink-0"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Items Grid */}
      <section id="items" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 p-4 bg-destructive/10 border border-destructive text-destructive rounded-md">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Error loading items might be your network, try refreshing</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
          {items.map((item) => (
            <ItemCard key={item._id} item={item} />
          ))}
        </div>

        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}

        {!hasMore && items.length > 0 && (
          <div className="text-center py-8 text-muted-foreground">No more items to load</div>
        )}

        {items.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">{error ? "Error loading items" : "No items found"}</p>
          </div>
        )}
      </section>
    </main>
  )
}
