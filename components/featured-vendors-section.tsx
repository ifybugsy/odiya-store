"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, TrendingUp, Award, ChevronRight, Store, CheckCircle, Users, Sparkles } from "lucide-react"
import Link from "next/link"
import { getImageUrl, handleImageError } from "@/lib/image-utils"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

interface Vendor {
  _id: string
  userId: any
  storeName: string
  storeDescription: string
  storeImage: string
  storeBanner?: string
  storeLogo?: string
  ratings: number
  ratingCount: number
  followers_count: number
  totalSales: number
  isVerified?: boolean
  isPromoted?: boolean
  promotedUntil?: string
}

export default function FeaturedVendorsSection() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadVendors()
  }, [])

  const loadVendors = async () => {
    try {
      const res = await fetch(`${API_URL}/vendors?limit=8&sort=-ratings,-followers_count`)
      const data = await res.json()
      setVendors(data.vendors || [])
    } catch (error) {
      console.error("[v0] Failed to load featured vendors:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="bg-gradient-to-br from-background via-secondary/5 to-background py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </section>
    )
  }

  if (vendors.length === 0) {
    return null
  }

  return (
    <section className="bg-gradient-to-br from-background via-secondary/5 to-background py-16 border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
            <Award className="w-4 h-4" />
            <span className="text-sm font-semibold">Featured Vendors</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">Top Rated Vendor Stores</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover our most trusted and popular vendors offering quality products and exceptional service
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
          {vendors.map((vendor, index) => {
            const isCurrentlyPromoted =
              vendor.isPromoted && vendor.promotedUntil && new Date(vendor.promotedUntil) > new Date()

            return (
              <Link key={vendor._id} href={`/vendor/${vendor._id}`}>
                <Card className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer h-auto flex flex-col border border-border hover:border-primary/50">
                  {isCurrentlyPromoted && (
                    <div className="absolute top-2 left-2 z-20 flex items-center gap-1">
                      <Badge className="bg-gradient-to-r from-pink-500 to-red-500 text-white font-bold px-2 py-0.5 text-xs shadow-lg animate-pulse flex items-center gap-1">
                        <Sparkles className="w-3 h-3 fill-white" />
                        PROMOTED
                      </Badge>
                    </div>
                  )}

                  {index < 4 && !isCurrentlyPromoted && (
                    <div className="absolute top-2 left-2 z-10 flex flex-wrap gap-1">
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold px-2 py-0.5 text-xs shadow-lg">
                        #{index + 1}
                      </Badge>
                      {vendor.isVerified && (
                        <Badge className="bg-blue-500 text-white font-bold px-1.5 py-0.5 text-xs shadow-lg flex items-center gap-1">
                          <CheckCircle className="w-2.5 h-2.5" />
                          Verified
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Store Logo */}
                  <div className="relative w-full h-32 bg-gradient-to-br from-primary/20 to-secondary/20 overflow-hidden flex-shrink-0">
                    {vendor.storeLogo || vendor.storeImage ? (
                      <img
                        src={getImageUrl(vendor.storeLogo || vendor.storeImage) || "/placeholder.svg"}
                        alt={vendor.storeName}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={handleImageError}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Store className="w-12 h-12 text-muted-foreground/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                  </div>

                  {/* Card Content */}
                  <div className="p-3 flex-1 flex flex-col">
                    <h3 className="font-bold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                      {vendor.storeName}
                    </h3>

                    {/* Store Description */}
                    {vendor.storeDescription && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2 mt-1">{vendor.storeDescription}</p>
                    )}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-2 my-2">
                      <div className="flex items-center justify-center gap-1 p-1.5 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                        <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                        <span className="text-xs font-bold text-foreground">{vendor.ratings?.toFixed(1) || "N/A"}</span>
                      </div>
                      <div className="flex items-center justify-center gap-1 p-1.5 rounded-lg bg-primary/10">
                        <TrendingUp className="w-3 h-3 text-primary" />
                        <span className="text-xs font-bold text-foreground">{vendor.followers_count || 0}</span>
                      </div>
                    </div>

                    {isCurrentlyPromoted && (
                      <div className="mb-2 bg-gradient-to-r from-pink-500 to-red-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-md inline-flex items-center justify-center gap-1 w-full">
                        <Star className="w-3 h-3 fill-white" />
                        Promoted
                      </div>
                    )}

                    <Button
                      size="sm"
                      className="w-full bg-primary hover:bg-primary/90 text-xs mt-auto group-hover:shadow-lg transition-all py-1.5"
                    >
                      Visit
                      <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
                    </Button>
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>

        <div className="text-center">
          <Link href="/vendors">
            <Button
              size="lg"
              className="px-8 py-6 text-base font-semibold bg-primary hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl"
            >
              <Users className="w-5 h-5 mr-2" />
              View All Vendors
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
