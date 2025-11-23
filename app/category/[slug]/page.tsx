"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import ItemCard from "@/components/item-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter, AlertCircle, ChevronLeft } from "lucide-react"
import { apiRequest } from "@/lib/api-utils"

const ITEM_CONDITIONS = ["New", "Like New", "Good", "Fair", "Foreign Used"]

// Map category slugs to API category names
const CATEGORY_MAP: Record<string, string> = {
  vehicles: "Cars",
  "phones-tablets": "Phones",
  "electronics-computers": "Electronics",
  furniture: "Furniture",
  fashion: "Clothing",
  jobs: "Jobs",
  services: "Services",
  "health-beauty": "Health & Beauty",
  "babies-children": "Babies & Children",
  "construction-repair": "Construction & Repair",
  "food-agriculture": "Food & Beverages",
  artisan: "Artisan",
  "real-estate": "Real Estate",
  "animals-pets": "Animals & Pets",
  beverages: "Food & Beverages",
}

// Map API names back to display names
const DISPLAY_NAME_MAP: Record<string, string> = {
  Cars: "Vehicles",
  Phones: "Phones & Tablets",
  Electronics: "Electronics & Computers",
  Furniture: "Furniture",
  Clothing: "Fashion",
  Jobs: "Jobs",
  Services: "Services",
  "Health & Beauty": "Health & Beauty",
  "Babies & Children": "Babies & Children",
  "Construction & Repair": "Construction & Repair",
  "Food & Beverages": "Food & Agriculture",
  Artisan: "Artisan",
  "Real Estate": "Real Estate",
  "Animals & Pets": "Animals & Pets",
}

export default function CategoryPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [items, setItems] = useState([])
  const [selectedCondition, setSelectedCondition] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [categoryName, setCategoryName] = useState("")

  useEffect(() => {
    const apiCategoryName = CATEGORY_MAP[slug] || slug
    const displayName = DISPLAY_NAME_MAP[apiCategoryName] || apiCategoryName
    setCategoryName(displayName)
  }, [slug])

  const loadItems = useCallback(
    async (pageNum: number, append = false) => {
      setError("")
      setIsLoading(true)
      try {
        const apiCategoryName = CATEGORY_MAP[slug] || slug
        let endpoint = `/items?page=${pageNum}&category=${encodeURIComponent(apiCategoryName)}`
        if (selectedCondition) endpoint += `&condition=${encodeURIComponent(selectedCondition)}`
        if (searchQuery) endpoint += `&search=${encodeURIComponent(searchQuery)}`

        const data = await apiRequest(endpoint)

        let itemsList = []
        if (Array.isArray(data?.items)) {
          itemsList = data.items
        } else if (Array.isArray(data)) {
          itemsList = data
        } else if (data && typeof data === "object") {
          itemsList = Object.values(data).find((v) => Array.isArray(v)) || []
        }

        if (append) {
          setItems((prev) => [...prev, ...itemsList])
        } else {
          setItems(itemsList)
        }

        setHasMore(pageNum < (data.pages || 1))
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to load items"
        setError(errorMessage)
        if (!append) {
          setItems([])
        }
      } finally {
        setIsLoading(false)
      }
    },
    [slug, selectedCondition, searchQuery],
  )

  useEffect(() => {
    setPage(1)
    loadItems(1, false)
  }, [slug, selectedCondition, searchQuery, loadItems])

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
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <section className="bg-white border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center gap-3 mb-4">
              <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2">
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
            </div>
            <h1 className="text-3xl font-bold text-foreground text-balance">{categoryName}</h1>
          </div>
        </section>

        <section className="bg-white border-b border-border sticky top-16 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex gap-4 flex-col md:flex-row">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search items in this category..."
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

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error && (
            <div className="mb-4 p-4 bg-destructive/10 border border-destructive text-destructive rounded-md">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Error loading items</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
            {items.map((item) => (
              <div key={item._id} className="animate-item-entrance">
                <ItemCard item={item} />
              </div>
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
              <p className="text-muted-foreground text-lg">
                {error ? "Error loading items" : `No items found in ${categoryName}`}
              </p>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  )
}
