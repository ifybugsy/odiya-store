"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, MapPin, ShoppingBag, Star } from "lucide-react"
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

export default function OurVendorsSection() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [following, setFollowing] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadVendors()
  }, [])

  const loadVendors = async () => {
    try {
      const res = await fetch(`${API_URL}/vendors?limit=8&sort=followers_count`)
      const data = await res.json()
      setVendors(data.vendors || [])
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

  if (loading) {
    return (
      <section className="bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-8 text-balance">Our Vendors</h2>
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2 text-balance">Our Vendors</h2>
          <p className="text-muted-foreground">Discover trusted vendors and their exclusive products</p>
        </div>

        {vendors.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {vendors.map((vendor) => (
              <Link key={vendor._id} href={`/vendor/${vendor._id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer h-full flex flex-col">
                  <div className="relative w-full h-32 bg-gradient-to-br from-primary/10 to-secondary/10 overflow-hidden flex-shrink-0">
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
                    <h3 className="font-bold text-sm text-foreground line-clamp-1 mb-2">{vendor.storeName}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                      {vendor.storeDescription || "Quality products and great service"}
                    </p>

                    <div className="space-y-1.5 mb-3">
                      <div className="flex items-center gap-2 text-xs">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">{vendor.ratings?.toFixed(1) || "N/A"}</span>
                          <span className="text-muted-foreground">({vendor.ratingCount || 0})</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" /> {vendor.followers_count}
                        </span>
                        <span>{vendor.totalSales} sales</span>
                      </div>
                    </div>

                    <div className="mb-3 pb-3 border-t border-border pt-2 text-xs">
                      <p className="font-semibold text-foreground mb-1 line-clamp-1">
                        {vendor.userId?.firstName} {vendor.userId?.lastName}
                      </p>
                      <p className="text-muted-foreground flex items-center gap-1 line-clamp-1">
                        <MapPin className="w-3 h-3" />
                        {vendor.userId?.city || "Location not specified"}
                      </p>
                    </div>

                    <div className="flex gap-2 mt-auto">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs h-7 bg-transparent"
                        onClick={(e) => handleFollow(vendor._id, e)}
                      >
                        <Heart className="w-3 h-3 mr-1" fill={following.has(vendor._id) ? "currentColor" : "none"} />
                        {following.has(vendor._id) ? "Following" : "Follow"}
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 text-xs h-7 bg-primary hover:bg-primary/90"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                        }}
                      >
                        Visit
                      </Button>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No vendors available yet</p>
          </Card>
        )}

        <div className="text-center mt-8">
          <Link href="/vendors">
            <Button variant="outline" size="lg">
              View All Vendors
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
