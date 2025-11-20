"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Star, MapPin, MessageCircle, Phone, Mail } from "lucide-react"
import Link from "next/link"
import { SellerBadgeComponent } from "@/components/seller-badge"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export default function SellerProfilePage() {
  const params = useParams()
  const [seller, setSeller] = useState<any>(null)
  const [sellerItems, setSellerItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSellerData = async () => {
      try {
        const res = await fetch(`${API_URL}/users/${params.id}`)
        if (res.ok) {
          const data = await res.json()
          setSeller(data)

          const itemsRes = await fetch(`${API_URL}/items?sellerId=${params.id}`)
          if (itemsRes.ok) {
            const itemsData = await itemsRes.json()
            setSellerItems(itemsData.slice(0, 6))
          }
        }
      } catch (error) {
        console.error("[v0] Failed to load seller data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadSellerData()
  }, [params.id])

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </>
    )
  }

  if (!seller) {
    return (
      <>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <p className="text-lg text-muted-foreground">Seller not found</p>
        </div>
      </>
    )
  }

  const averageRating = Math.round(seller.rating || 0)
  const totalReviews = seller.totalReviews || 0

  const handlePhoneClick = async () => {
    try {
      const res = await fetch(`${API_URL}/users/${params.id}/track-contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (res.ok) {
        const data = await res.json()
        console.log("[v0] Contact tracked successfully:", data.contactCount)

        // Update the seller state with new contact count
        setSeller((prevSeller: any) => ({
          ...prevSeller,
          contactCount: data.contactCount,
        }))
      }
    } catch (error) {
      console.error("[v0] Failed to track contact:", error)
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Seller Profile Header */}
          <Card className="p-8 mb-8">
            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
              {/* Profile Image */}
              <div className="flex-shrink-0">
                {seller.profileImage ? (
                  <img
                    src={seller.profileImage || "/placeholder.svg"}
                    alt={`${seller.firstName} ${seller.lastName}`}
                    className="w-32 h-32 rounded-full object-cover border-4 border-primary"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-primary flex items-center justify-center text-white text-4xl font-bold">
                    {seller.firstName?.[0]}
                    {seller.lastName?.[0]}
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-bold">
                    {seller.firstName} {seller.lastName}
                  </h1>
                  <SellerBadgeComponent seller={seller} size="md" />
                </div>

                {/* Rating */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${i < averageRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-semibold">{averageRating}.0</span>
                  <span className="text-muted-foreground">({totalReviews} reviews)</span>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 text-muted-foreground mb-4">
                  <MapPin className="w-5 h-5" />
                  <span>{seller.city || seller.location || "Location not specified"}</span>
                </div>

                {/* Bio */}
                {seller.bio && <p className="text-foreground mb-6 max-w-2xl">{seller.bio}</p>}

                {/* Contact Info with tracking */}
                <div className="space-y-3 mb-6">
                  {seller.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-primary" />
                      <a
                        href={`tel:${seller.phone}`}
                        onClick={handlePhoneClick}
                        className="font-semibold hover:underline"
                      >
                        {seller.phone}
                      </a>
                    </div>
                  )}
                  {seller.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-primary" />
                      <a href={`mailto:${seller.email}`} className="font-semibold hover:underline">
                        {seller.email}
                      </a>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button className="bg-primary hover:bg-primary/90 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Contact Seller
                  </Button>
                  {sellerItems.length > 0 && (
                    <Button variant="outline" className="bg-transparent">
                      View All Items ({sellerItems.length}+)
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Seller Stats - Updated */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-6 text-center">
              <p className="text-muted-foreground text-sm">Total Items Listed</p>
              <p className="text-3xl font-bold text-primary">{seller.totalItemsListed || 0}</p>
            </Card>
            <Card className="p-6 text-center">
              <p className="text-muted-foreground text-sm">Items Sold</p>
              <p className="text-3xl font-bold text-green-600">{seller.itemsSold || 0}</p>
            </Card>
            <Card className="p-6 text-center">
              <p className="text-muted-foreground text-sm">Contacts Made</p>
              <p className="text-3xl font-bold text-blue-600">{seller.contactCount || 0}</p>
            </Card>
            <Card className="p-6 text-center">
              <p className="text-muted-foreground text-sm">Member Since</p>
              <p className="text-lg font-bold text-primary">
                {new Date(seller.createdAt).toLocaleDateString("en-NG", {
                  year: "numeric",
                  month: "short",
                })}
              </p>
            </Card>
          </div>

          {/* Seller's Items */}
          {sellerItems.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Featured Items</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sellerItems.map((item: any) => (
                  <Link key={item._id} href={`/item/${item._id}`}>
                    <Card className="overflow-hidden hover:shadow-lg transition cursor-pointer h-full">
                      <div className="h-40 bg-muted relative">
                        {item.images?.[0] && (
                          <img
                            src={item.images[0] || "/placeholder.svg"}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                        {item.isSold && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">Sold</span>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold line-clamp-2 mb-2">{item.title}</h3>
                        <p className="text-primary font-bold text-lg">₦{item.price.toLocaleString()}</p>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
