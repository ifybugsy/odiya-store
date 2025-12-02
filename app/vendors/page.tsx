"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Heart, ShoppingBag, Star, Search } from "lucide-react"
import Link from "next/link"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

interface Vendor {
  _id: string
  userId: any
  storeName: string
  storeDescription: string
  storeImage: string
  ratings: number
  ratingCount: number
  followers_count: number
  totalSales: number
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [following, setFollowing] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    loadVendors(1)
  }, [searchQuery])

  const loadVendors = async (pageNum: number) => {
    try {
      setLoading(true)
      let url = `${API_URL}/vendors?page=${pageNum}&limit=12&sort=followers_count`
      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`
      }

      const res = await fetch(url)
      const data = await res.json()

      if (pageNum === 1) {
        setVendors(data.vendors || [])
      } else {
        setVendors((prev) => [...prev, ...(data.vendors || [])])
      }

      setPage(pageNum)
      setHasMore(data.pagination.page < (data.pagination.total / data.pagination.limit || 1))
    } catch (error) {
      console.error("Failed to load vendors:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFollow = async (vendorId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const isFollowing = following.has(vendorId)
    try {
      const method = isFollowing ? "DELETE" : "POST"
      const token = localStorage.getItem("token")

      if (!token) {
        alert("Please log in to follow vendors")
        return
      }

      const res = await fetch(`${API_URL}/vendors/${vendorId}/follow`, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        const newFollowing = new Set(following)
        if (isFollowing) {
          newFollowing.delete(vendorId)
        } else {
          newFollowing.add(vendorId)
        }
        setFollowing(newFollowing)
      }
    } catch (error) {
      console.error("Failed to toggle follow:", error)
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Our Vendors</h1>
            <p className="text-muted-foreground">Explore our trusted vendors and find quality products</p>
          </div>

          {/* Search */}
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search vendors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Vendors Grid */}
          {loading && page === 1 ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : vendors.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
                {vendors.map((vendor) => (
                  <Link key={vendor._id} href={`/vendor/${vendor._id}`}>
                    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer h-auto flex flex-col border border-border hover:border-primary/50">
                      <div className="relative w-full h-32 bg-gradient-to-br from-primary/20 to-secondary/20 flex-shrink-0">
                        {vendor.storeImage ? (
                          <img
                            src={vendor.storeImage || "/placeholder.svg"}
                            alt={vendor.storeName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="w-12 h-12 text-muted-foreground/30" />
                          </div>
                        )}
                      </div>

                      <div className="p-3 flex-1 flex flex-col">
                        <h3 className="font-bold text-sm text-foreground line-clamp-1 mb-1">{vendor.storeName}</h3>

                        {vendor.storeDescription && (
                          <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{vendor.storeDescription}</p>
                        )}

                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <div className="flex items-center justify-center gap-1 p-1.5 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                            <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                            <span className="text-xs font-bold text-foreground">
                              {vendor.ratings?.toFixed(1) || "N/A"}
                            </span>
                          </div>
                          <div className="flex items-center justify-center gap-1 p-1.5 rounded-lg bg-primary/10">
                            <Heart className="w-3 h-3 text-primary" />
                            <span className="text-xs font-bold text-foreground">{vendor.followers_count || 0}</span>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          className="w-full bg-primary hover:bg-primary/90 text-xs mt-auto py-1.5"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                          }}
                        >
                          Visit Store
                        </Button>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>

              {/* Load More */}
              {hasMore && (
                <div className="text-center">
                  <Button variant="outline" size="lg" onClick={() => loadVendors(page + 1)} disabled={loading}>
                    {loading ? "Loading..." : "Load More Vendors"}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No vendors found</p>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
