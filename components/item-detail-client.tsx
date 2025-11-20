"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Star, MapPin, AlertTriangle, Phone, ChevronLeft, ChevronRight } from "lucide-react"
import { ShareButtons } from "@/components/share-buttons"
import { SaveButton } from "@/components/save-button"
import RelatedItems from "@/components/related-items"
import InteractiveStarRating from "@/components/interactive-star-rating"
import { useAuth } from "@/lib/auth-context"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export function ItemDetailClient({ id }: { id: string }) {
  const { user, token } = useAuth()
  const router = useRouter()
  const [item, setItem] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showContactForm, setShowContactForm] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [contactData, setContactData] = useState({
    senderName: "",
    senderPhone: "",
    senderEmail: "",
    message: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState("")
  const [ratingLoading, setRatingLoading] = useState(false)

  useEffect(() => {
    const loadItem = async () => {
      try {
        console.log("[v0] Loading item with id:", id)
        console.log("[v0] ID type:", typeof id)
        console.log("[v0] ID length:", id?.length)

        if (!id || typeof id !== "string" || id.trim() === "") {
          console.error("[v0] Invalid item ID: empty or not a string")
          throw new Error("Invalid item ID")
        }

        const trimmedId = id.trim()

        const isValidObjectId = /^[a-f\d]{24}$/i.test(trimmedId)
        if (!isValidObjectId) {
          console.error("[v0] Invalid ObjectId format. ID must be 24 hex characters:", trimmedId)
          throw new Error(`Invalid item ID format. Please check the URL.`)
        }

        console.log("[v0] API URL:", API_URL)
        console.log("[v0] Full request URL:", `${API_URL}/items/${trimmedId}`)

        const res = await fetch(`${API_URL}/items/${trimmedId}`)

        console.log("[v0] Response status:", res.status)
        console.log("[v0] Response ok:", res.ok)

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ error: "Unknown error" }))
          console.error("[v0] Failed to fetch item, status:", res.status, "error:", errorData)
          throw new Error(`Failed to fetch item: ${res.status} - ${errorData.error || "Unknown error"}`)
        }

        const data = await res.json()
        console.log("[v0] Item data received:", {
          id: data._id,
          title: data.title,
          price: data.price,
          hasSeller: !!data.sellerId,
        })

        if (!data || typeof data !== "object") {
          console.error("[v0] Invalid item data structure")
          throw new Error("Invalid item data")
        }

        if (data.price !== undefined && data.price !== null) {
          data.price = Number(data.price)
          if (isNaN(data.price)) {
            console.error("[v0] Invalid price value:", data.price)
            data.price = 0
          }
        } else {
          console.warn("[v0] Price is missing, setting to 0")
          data.price = 0
        }

        if (!data.sellerId || typeof data.sellerId !== "object") {
          console.error("[v0] Seller data not populated:", data.sellerId)
        } else {
          console.log("[v0] Seller data:", {
            id: data.sellerId._id,
            name: `${data.sellerId.firstName} ${data.sellerId.lastName}`,
            rating: data.sellerId.rating,
          })
        }

        setItem(data)
      } catch (error) {
        console.error("[v0] Failed to load item:", error)
        setItem(null)
      } finally {
        setLoading(false)
      }
    }
    loadItem()
  }, [id])

  const handleRatingSubmit = async (rating: number) => {
    if (!user || !token) {
      router.push("/login")
      return
    }

    if (!item || !item.sellerId || !item.sellerId._id) {
      console.error("[v0] Cannot submit rating: seller information is missing")
      alert("Unable to rate seller. Seller information is not available.")
      return
    }

    setRatingLoading(true)
    try {
      console.log("[v0] Submitting rating:", rating, "for seller:", item.sellerId._id)
      const res = await fetch(`${API_URL}/users/${item.sellerId._id}/rate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to submit rating")
      }

      const data = await res.json()

      setItem((prev: any) => ({
        ...prev,
        sellerId: {
          ...prev.sellerId,
          rating: data.averageRating,
        },
      }))

      console.log("[v0] Rating submitted successfully")
    } catch (error: any) {
      console.error("[v0] Rating submission error:", error)
      alert(error.message || "Failed to submit rating")
    } finally {
      setRatingLoading(false)
    }
  }

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitMessage("")

    try {
      if (
        !contactData.senderName.trim() ||
        !contactData.senderPhone.trim() ||
        !contactData.senderEmail.trim() ||
        !contactData.message.trim()
      ) {
        setSubmitMessage("Please fill in all fields")
        setSubmitting(false)
        return
      }

      const res = await fetch(`${API_URL}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemId: id,
          ...contactData,
        }),
      })

      const contentType = res.headers.get("content-type")
      let data

      if (contentType && contentType.includes("application/json")) {
        data = await res.json()
      } else {
        const text = await res.text()
        console.error("[v0] Non-JSON response received:", text.substring(0, 200))
        throw new Error(`Server returned ${res.status}: Invalid response format`)
      }

      if (res.ok) {
        setSubmitMessage("✓ Message sent successfully!")
        setTimeout(() => {
          setContactData({ senderName: "", senderPhone: "", senderEmail: "", message: "" })
          setShowContactForm(false)
          setSubmitMessage("")
        }, 1500)
      } else {
        setSubmitMessage(data.error || "Failed to send message. Please try again.")
      }
    } catch (error: any) {
      const errorMsg = error.message || "Error sending message. Please check your connection and try again."
      setSubmitMessage(errorMsg)
      console.error("[v0] Failed to send message:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const handlePrevImage = () => {
    if (item?.images?.length) {
      setCurrentImageIndex((prev) => (prev === 0 ? item.images.length - 1 : prev - 1))
    }
  }

  const handleNextImage = () => {
    if (item?.images?.length) {
      setCurrentImageIndex((prev) => (prev === item.images.length - 1 ? 0 : prev + 1))
    }
  }

  const handlePhoneClick = async (e: React.MouseEvent) => {
    e.preventDefault()

    try {
      const res = await fetch(`${API_URL}/users/${item.sellerId._id}/track-contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (res.ok) {
        const data = await res.json()
        console.log("[v0] Contact tracked successfully:", data.contactCount)

        // Update the item data with new contact count
        setItem((prevItem: any) => ({
          ...prevItem,
          sellerId: {
            ...prevItem.sellerId,
            contactCount: data.contactCount,
          },
        }))
      }
    } catch (error) {
      console.error("[v0] Failed to track contact:", error)
    }

    // Still allow the phone call to proceed
    window.location.href = `tel:${sellerPhone}`
  }

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

  if (!item) {
    return (
      <>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <p className="text-lg text-muted-foreground">Item not found</p>
        </div>
      </>
    )
  }

  const formattedPrice =
    item.price && !isNaN(item.price)
      ? new Intl.NumberFormat("en-NG", {
          style: "currency",
          currency: "NGN",
        }).format(item.price)
      : "₦0"

  const hasMultipleImages = item.images && item.images.length > 1
  const currentImage = item.images?.[currentImageIndex]?.trim() || "/placeholder.svg"

  const sellerFirstName = item.sellerId?.firstName || "Unknown"
  const sellerLastName = item.sellerId?.lastName || "Seller"
  const sellerPhone = item.sellerId?.phone || null
  const sellerRating = item.sellerId?.rating || 0
  const sellerProfileImage = item.sellerId?.profileImage || null
  const sellerId = item.sellerId?._id || null

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Images */}
            <div className="lg:col-span-2">
              <div className="relative">
                <div className="bg-muted rounded-lg overflow-hidden h-96 flex items-center justify-center mb-4">
                  <img
                    src={currentImage || "/placeholder.svg"}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg"
                    }}
                  />
                </div>

                {hasMultipleImages && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded text-sm">
                      {currentImageIndex + 1} / {item.images.length}
                    </div>
                  </>
                )}
              </div>

              {item.images && item.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {item.images.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`bg-muted rounded h-20 flex items-center justify-center overflow-hidden border-2 transition ${
                        idx === currentImageIndex ? "border-primary" : "border-transparent"
                      }`}
                    >
                      <img
                        src={img?.trim() || "/placeholder.svg"}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg"
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div>
              <Card className="p-6 space-y-6">
                <div>
                  <h1 className="text-2xl font-bold mb-2">{item.title}</h1>
                  <p className="text-3xl font-bold text-primary mb-2">{formattedPrice}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {item.location || "Location not specified"}
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <p className="text-sm font-semibold mb-3">Share & Save</p>
                  <div className="space-y-2">
                    <ShareButtons
                      title={item.title}
                      description={item.description}
                      price={formattedPrice}
                      itemId={item._id}
                    />
                    <SaveButton itemId={item._id} showLabel={true} variant="outline" />
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    Condition: <span className="font-semibold">{item.condition || "Not specified"}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Views: <span className="font-semibold">{item.views || 0}</span>
                  </p>
                </div>

                <div className="border-t border-border pt-4">
                  <p className="text-sm font-semibold mb-3">Seller Information</p>
                  <div className="flex items-center gap-3 mb-4">
                    {sellerProfileImage ? (
                      <img
                        src={sellerProfileImage || "/placeholder.svg"}
                        alt={`${sellerFirstName} ${sellerLastName}`}
                        className="w-10 h-10 rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg"
                        }}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
                        {sellerFirstName[0]}
                        {sellerLastName[0]}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-sm">
                        {sellerFirstName} {sellerLastName}
                      </p>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < Math.floor(sellerRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                          />
                        ))}
                        <span className="text-xs text-muted-foreground ml-1">({sellerRating.toFixed(1)})</span>
                      </div>
                    </div>
                  </div>

                  {user && sellerId && user.id !== sellerId && (
                    <div className="bg-muted/50 rounded-lg p-3 mb-4">
                      <p className="text-xs font-medium mb-2">Rate this seller</p>
                      <InteractiveStarRating
                        onSubmit={handleRatingSubmit}
                        isLoading={ratingLoading}
                        currentRating={0}
                        sellerId={sellerId}
                        itemId={item._id}
                      />
                    </div>
                  )}

                  {sellerPhone && (
                    <div className="bg-blue-50 rounded p-3 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Phone className="w-4 h-4 text-blue-600" />
                        <p className="text-xs font-medium text-blue-600">Contact Seller</p>
                      </div>
                      <a
                        href={`tel:${sellerPhone}`}
                        className="text-sm font-semibold text-blue-700 hover:underline"
                        onClick={handlePhoneClick}
                      >
                        {sellerPhone}
                      </a>
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => setShowContactForm(!showContactForm)}
                  className="w-full bg-primary hover:bg-primary/90 text-white"
                >
                  {showContactForm ? "Close" : "Contact Seller"}
                </Button>
              </Card>

              {showContactForm && (
                <Card className="p-6 mt-4">
                  <h3 className="font-semibold mb-4">Send Message</h3>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                    <div className="flex gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-semibold text-amber-900 mb-1">Buyer Safety & Caution Notice</p>
                        <ul className="text-amber-800 space-y-1 text-xs">
                          <li>• Verify goods before making payment</li>
                          <li>• Meet in safe, public places</li>
                          <li>• Never share personal banking details</li>
                          <li>• Use secure payment methods only</li>
                          <li>• Check item authenticity and quality</li>
                          <li>• Keep communication records for safety</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleContactSubmit} className="space-y-3">
                    <Input
                      placeholder="Your Name"
                      value={contactData.senderName}
                      onChange={(e) => setContactData({ ...contactData, senderName: e.target.value })}
                      required
                      disabled={submitting}
                    />
                    <Input
                      placeholder="Your Phone"
                      value={contactData.senderPhone}
                      onChange={(e) => setContactData({ ...contactData, senderPhone: e.target.value })}
                      required
                      disabled={submitting}
                    />
                    <Input
                      placeholder="Your Email"
                      type="email"
                      value={contactData.senderEmail}
                      onChange={(e) => setContactData({ ...contactData, senderEmail: e.target.value })}
                      required
                      disabled={submitting}
                    />
                    <textarea
                      placeholder="Your Message"
                      value={contactData.message}
                      onChange={(e) => setContactData({ ...contactData, message: e.target.value })}
                      className="w-full border border-border rounded-md p-2 text-sm disabled:opacity-50"
                      rows={4}
                      required
                      disabled={submitting}
                    />

                    {submitMessage && (
                      <div
                        className={`text-sm p-2 rounded ${submitMessage.includes("✓") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
                      >
                        {submitMessage}
                      </div>
                    )}

                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={submitting}>
                      {submitting ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                </Card>
              )}
            </div>
          </div>

          <div className="mt-8 bg-white rounded-lg p-6 border border-border">
            <h2 className="text-xl font-bold mb-4">Description</h2>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {item.description || "No description available"}
            </p>
          </div>

          {item.category && (
            <div className="mt-12">
              <RelatedItems category={item.category} currentItemId={item._id} limit={6} />
            </div>
          )}
        </div>
      </main>
    </>
  )
}
