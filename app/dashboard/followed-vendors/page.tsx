"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { Heart, Store, Star, TrendingUp, ChevronLeft } from "lucide-react"
import Link from "next/link"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

interface Vendor {
  _id: string
  storeName: string
  storeDescription: string
  storeImage: string
  ratings: number
  ratingCount: number
  followers_count: number
  totalSales: number
}

export default function FollowedVendorsPage() {
  const { user, token, isLoading } = useAuth()
  const router = useRouter()
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
      return
    }

    if (user && token) {
      loadFollowedVendors()
    }
  }, [user, token, isLoading, router])

  const loadFollowedVendors = async () => {
    if (!token) return

    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/users/followed-vendors`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) {
        throw new Error("Failed to load followed vendors")
      }

      const data = await res.json()
      setVendors(data.vendors || [])
    } catch (err) {
      console.error("Error loading followed vendors:", err)
      setError("Failed to load followed vendors")
    } finally {
      setLoading(false)
    }
  }

  const handleUnfollow = async (vendorId: string) => {
    if (!token) return

    try {
      const res = await fetch(`${API_URL}/vendors/${vendorId}/follow`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        setVendors((prev) => prev.filter((v) => v._id !== vendorId))
      }
    } catch (error) {
      console.error("Failed to unfollow vendor:", error)
    }
  }

  if (isLoading || loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-6">
            <Button variant="outline" size="sm" onClick={() => router.back()} className="gap-2">
              <ChevronLeft className="w-4 h-4" />
              Go Back
            </Button>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Followed Vendors</h1>
            <p className="text-muted-foreground">Manage vendors you're following</p>
          </div>

          {error && (
            <Card className="p-6 mb-6 border-destructive">
              <p className="text-destructive">{error}</p>
            </Card>
          )}

          {vendors.length === 0 ? (
            <Card className="p-12 text-center">
              <Store className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-bold text-foreground mb-2">No Followed Vendors Yet</h2>
              <p className="text-muted-foreground mb-6">Start following vendors to see them here</p>
              <Link href="/vendors">
                <Button className="bg-primary hover:bg-primary/90">Browse Vendors</Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vendors.map((vendor) => (
                <Card key={vendor._id} className="p-6 hover:shadow-lg transition-shadow">
                  <Link href={`/vendor/${vendor._id}`}>
                    <div className="mb-4">
                      {vendor.storeImage && (
                        <img
                          src={vendor.storeImage || "/placeholder.svg"}
                          alt={vendor.storeName}
                          className="w-full h-40 object-cover rounded-lg mb-4"
                        />
                      )}
                      <h3 className="text-lg font-bold text-foreground mb-2">{vendor.storeName}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{vendor.storeDescription}</p>

                      <div className="flex gap-4 text-xs text-muted-foreground mb-4">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span>
                            {vendor.ratings?.toFixed(1) || "N/A"} ({vendor.ratingCount || 0})
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          <span>{vendor.followers_count} followers</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          <span>{vendor.totalSales} sales</span>
                        </div>
                      </div>
                    </div>
                  </Link>

                  <div className="flex gap-2">
                    <Link href={`/vendor/${vendor._id}`} className="flex-1">
                      <Button variant="outline" className="w-full bg-transparent">
                        View Store
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      onClick={() => handleUnfollow(vendor._id)}
                      className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Heart className="w-4 h-4" fill="currentColor" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
