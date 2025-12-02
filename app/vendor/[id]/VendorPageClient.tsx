"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import VendorImageCarousel from "@/components/vendor-image-carousel"
import VendorRating from "@/components/vendor-rating"
import {
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  Star,
  Globe,
  Instagram,
  Facebook,
  Twitter,
  Award,
  CheckCircle2,
  Share2,
  Heart,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useBuyerAuth } from "@/lib/buyer-auth-context"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export default function VendorPageClient({ id: vendorId }: { id: string }) {
  const router = useRouter()
  const { user } = useAuth()
  const { buyer } = useBuyerAuth()
  const [vendor, setVendor] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<any>(null)
  const [isFollowing, setIsFollowing] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [reviews, setReviews] = useState<any[]>([])
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState("")
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${API_URL}/vendors/${vendorId}`)

        if (!response.ok) {
          throw new Error("Failed to fetch vendor details")
        }

        const data = await response.json()
        setVendor(data)
        setItems(data.items || [])

        if (user || buyer) {
          const token =
            localStorage.getItem("token") ||
            (localStorage.getItem("buyer_auth") && JSON.parse(localStorage.getItem("buyer_auth")!).token)

          if (token) {
            const followRes = await fetch(`${API_URL}/vendors/${vendorId}/follow/status`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            if (followRes.ok) {
              const followData = await followRes.json()
              setIsFollowing(followData.isFollowing)
            }
          }
        }

        const reviewsRes = await fetch(`${API_URL}/vendors/${vendorId}/reviews`)
        if (reviewsRes.ok) {
          const reviewsData = await reviewsRes.json()
          setReviews(reviewsData)
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [vendorId, user, buyer])

  const handleRatingSubmitted = (newRating: number) => {
    setVendor((prev: any) => ({
      ...prev,
      averageRating: newRating,
      totalReviews: (prev.totalReviews || 0) + 1,
    }))
  }

  const handleFollowToggle = async () => {
    if (!user && !buyer) {
      router.push("/buyer/login")
      return
    }

    try {
      const token =
        localStorage.getItem("token") ||
        (localStorage.getItem("buyer_auth") && JSON.parse(localStorage.getItem("buyer_auth")!).token)

      if (!token) {
        router.push("/buyer/login")
        return
      }

      const method = isFollowing ? "DELETE" : "POST"
      const response = await fetch(`${API_URL}/vendors/${vendorId}/follow`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setIsFollowing(!isFollowing)
        // Update vendor follower count
        if (vendor) {
          setVendor({
            ...vendor,
            followers_count: isFollowing ? (vendor.followers_count || 1) - 1 : (vendor.followers_count || 0) + 1,
          })
        }
      }
    } catch (error) {
      console.error("[v0] Error toggling follow:", error)
    }
  }

  const handleShare = async () => {
    const url = window.location.href
    const text = `Check out ${vendor?.businessName} on Bugsymart!`

    if (navigator.share) {
      try {
        await navigator.share({ title: vendor?.businessName, text, url })
      } catch (error) {
        console.log("[v0] Share cancelled or failed")
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(url)
      setShowShareDialog(true)
      setTimeout(() => setShowShareDialog(false), 3000)
    }
  }

  const handleSubmitReview = async () => {
    if (!user && !buyer) {
      router.push("/buyer/login")
      return
    }

    if (!reviewComment.trim()) {
      return
    }

    try {
      setSubmittingReview(true)
      const token =
        localStorage.getItem("token") ||
        (localStorage.getItem("buyer_auth") && JSON.parse(localStorage.getItem("buyer_auth")!).token)

      if (!token) {
        router.push("/buyer/login")
        return
      }

      const response = await fetch(`${API_URL}/vendors/${vendorId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating: reviewRating,
          comment: reviewComment,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setReviews([data.review, ...reviews])
        setShowReviewDialog(false)
        setReviewComment("")
        setReviewRating(5)

        // Refresh vendor data to get updated ratings
        const vendorRes = await fetch(`${API_URL}/vendors/${vendorId}`)
        if (vendorRes.ok) {
          const vendorData = await vendorRes.json()
          setVendor(vendorData)
        }
      } else {
        const error = await response.json()
        alert(error.error || "Failed to submit review")
      }
    } catch (error) {
      console.error("[v0] Error submitting review:", error)
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="container mx-auto py-8 px-4 min-h-screen">
          <p>Loading vendor information...</p>
        </main>
        <Footer />
      </>
    )
  }

  if (error) {
    return (
      <>
        <Navbar />
        <main className="container mx-auto py-8 px-4 min-h-screen flex items-center justify-center">
          <Card className="w-full max-w-md text-center">
            <CardContent className="p-6">
              <h1 className="text-2xl font-bold mb-4">Error Loading Vendor</h1>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button asChild>
                <Link href="/">Go to Homepage</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </>
    )
  }

  if (!vendor) {
    return (
      <>
        <Navbar />
        <main className="container mx-auto py-8 px-4 min-h-screen flex items-center justify-center">
          <Card className="w-full max-w-md text-center">
            <CardContent className="p-6">
              <h1 className="text-2xl font-bold mb-4">Vendor Not Found</h1>
              <p className="text-gray-600">The vendor you are looking for could not be found.</p>
              <Button asChild>
                <Link href="/">Go to Homepage</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </>
    )
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://bugsymart.shop"

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow bg-background">
        {/* Cover Photo Section */}
        <div className="relative w-full">
          {/* Cover Photo */}
          <div className="w-full h-48 md:h-64 lg:h-80 bg-gradient-to-br from-primary/20 via-secondary/10 to-primary/5 relative overflow-hidden group">
            <img
              src={vendor.storeBanner || `${appUrl}/placeholder-banner.png`}
              alt={`${vendor.storeName} Cover`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e: any) => {
                e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 400'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23667eea;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23764ba2;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1200' height='400' fill='url(%23grad)' /%3E%3C/svg%3E`
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
          </div>

          {/* Profile Info Container */}
          <div className="relative bg-background border-b border-border">
            <div className="container mx-auto px-4 py-8 md:py-0">
              <div className="flex flex-col md:flex-row md:items-end md:gap-6 -mt-16 md:-mt-20 md:mb-6">
                {/* Store Logo - Positioned over cover */}
                <div className="flex-shrink-0 mb-4 md:mb-0">
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden ring-4 ring-background bg-card shadow-xl">
                    <img
                      src={vendor.storeLogo || `${appUrl}/placeholder-store.png`}
                      alt={`${vendor.storeName} Logo`}
                      className="w-full h-full object-cover"
                      width={160}
                      height={160}
                    />
                  </div>
                </div>

                {/* Store Header Info */}
                <div className="flex-1 mb-4 md:mb-2">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between md:gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl md:text-4xl font-bold text-foreground">{vendor.storeName}</h1>
                        {vendor.isVerified && (
                          <div className="flex items-center gap-1 bg-blue-500/15 text-blue-600 px-3 py-1 rounded-full">
                            <CheckCircle2 className="h-5 w-5" />
                            <span className="text-sm font-semibold">Verified</span>
                          </div>
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm md:text-base">
                        {vendor.storeCategory || "Category not specified"}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-4 md:mt-0">
                      <Button asChild size="lg" className="flex-1 md:flex-none">
                        <Link
                          href={
                            user || buyer
                              ? `/send-message?vendorId=${vendorId}`
                              : `/buyer/login?redirect=/send-message?vendorId=${vendorId}`
                          }
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Message
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={handleFollowToggle}
                        className="flex-1 md:flex-none bg-transparent"
                      >
                        <Heart className={`h-4 w-4 mr-2 ${isFollowing ? "fill-red-500 text-red-500" : ""}`} />
                        {isFollowing ? "Following" : "Follow"}
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        className="flex-1 md:flex-none bg-transparent"
                        onClick={handleShare}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-3 md:grid-cols-5 gap-4 md:gap-6 py-6 border-t border-border">
                <div className="text-center md:text-left">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1">Rating</p>
                  <p className="text-2xl font-bold text-foreground flex items-center justify-center md:justify-start gap-1">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    {vendor.averageRating ? vendor.averageRating.toFixed(1) : "N/A"}
                  </p>
                </div>
                <div className="text-center md:text-left">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1">Reviews</p>
                  <p className="text-2xl font-bold text-foreground">{vendor.totalReviews || 0}</p>
                </div>
                <div className="text-center md:text-left">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1">Followers</p>
                  <p className="text-2xl font-bold text-foreground">{vendor.followers_count || 0}</p>
                </div>
                <div className="text-center md:text-left">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1">Sales</p>
                  <p className="text-2xl font-bold text-foreground">{vendor.totalSales || 0}</p>
                </div>
                <div className="text-center md:text-left">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1">Since</p>
                  <p className="text-2xl font-bold text-foreground">
                    {vendor.createdAt ? new Date(vendor.createdAt).getFullYear() : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Store Description */}
        <div className="bg-muted/30 border-b border-border">
          <div className="container mx-auto px-4 py-6">
            <p className="text-foreground leading-relaxed max-w-3xl">
              {vendor.storeDescription || "No description available."}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto py-12 px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Store Info & Products */}
            <div className="lg:col-span-2 space-y-8">
              {/* Store Information Card */}
              <Card className="border border-border">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-6 text-foreground">Contact Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Contact Info Items */}
                    <a href={`tel:${vendor.phoneNumber}`} className="group">
                      <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-primary/5 transition-colors border border-border/50 hover:border-primary/30">
                        <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                          <Phone className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Phone</p>
                          <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {vendor.phoneNumber || "Not provided"}
                          </p>
                        </div>
                      </div>
                    </a>

                    <a href={`mailto:${vendor.email}`} className="group">
                      <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-primary/5 transition-colors border border-border/50 hover:border-primary/30">
                        <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                          <Mail className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Email</p>
                          <p className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                            {vendor.email || "Not provided"}
                          </p>
                        </div>
                      </div>
                    </a>

                    <div>
                      <div className="flex items-start gap-4 p-4 rounded-lg border border-border/50">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <MapPin className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Location</p>
                          <p className="font-semibold text-foreground">{vendor.location || "Not provided"}</p>
                        </div>
                      </div>
                    </div>

                    {vendor.website && (
                      <Link href={vendor.website} target="_blank" rel="noopener noreferrer" className="group">
                        <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-primary/5 transition-colors border border-border/50 hover:border-primary/30">
                          <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                            <Globe className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Website</p>
                            <p className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                              {new URL(vendor.website).hostname}
                            </p>
                          </div>
                        </div>
                      </Link>
                    )}
                  </div>

                  {/* Social Links */}
                  {(vendor.socialLinks?.instagram || vendor.socialLinks?.facebook || vendor.socialLinks?.twitter) && (
                    <div className="mt-6 pt-6 border-t border-border">
                      <p className="text-sm font-semibold text-muted-foreground mb-3">Follow Us</p>
                      <div className="flex items-center gap-3">
                        {vendor.socialLinks?.instagram && (
                          <Link
                            href={vendor.socialLinks.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Instagram"
                            className="p-3 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 hover:shadow-lg transition-all hover:scale-110 text-white"
                          >
                            <Instagram className="h-5 w-5" />
                          </Link>
                        )}
                        {vendor.socialLinks?.facebook && (
                          <Link
                            href={vendor.socialLinks.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Facebook"
                            className="p-3 rounded-lg bg-blue-600 hover:shadow-lg transition-all hover:scale-110 text-white"
                          >
                            <Facebook className="h-5 w-5" />
                          </Link>
                        )}
                        {vendor.socialLinks?.twitter && (
                          <Link
                            href={vendor.socialLinks.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Twitter"
                            className="p-3 rounded-lg bg-sky-500 hover:shadow-lg transition-all hover:scale-110 text-white"
                          >
                            <Twitter className="h-5 w-5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Catalog Section */}
              {vendor.catalogImages && vendor.catalogImages.length > 0 && (
                <VendorImageCarousel catalogImages={vendor.catalogImages} storeName={vendor.storeName} />
              )}

              {/* Reviews Section */}
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="p-6 border-b border-border flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Customer Reviews</h2>
                  <Button onClick={() => setShowReviewDialog(true)}>
                    <Star className="h-4 w-4 mr-2" />
                    Write Review
                  </Button>
                </div>
                <div className="p-6">
                  {reviews.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No reviews yet. Be the first to review!</p>
                  ) : (
                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <div key={review._id} className="border-b border-border pb-6 last:border-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold">{review.userName}</p>
                              <div className="flex items-center gap-1 mt-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <p className="text-muted-foreground">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Stats & Highlights */}
            <div className="space-y-6">
              {user && vendor.userId && (
                <VendorRating
                  vendorId={vendorId}
                  vendorUserId={vendor.userId}
                  currentRating={vendor.averageRating || 0}
                  onRatingSubmitted={handleRatingSubmitted}
                />
              )}

              {/* Performance Highlights */}
              <Card className="border border-border">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold mb-4 text-foreground flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Performance
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/50">
                      <span className="text-sm text-muted-foreground">Customer Service</span>
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
                        {vendor.customerServiceRating ? vendor.customerServiceRating.toFixed(1) : "N/A"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/50">
                      <span className="text-sm text-muted-foreground">Delivery Speed</span>
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
                        {vendor.deliverySpeed || "Standard"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/50">
                      <span className="text-sm text-muted-foreground">Authenticity</span>
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
                        {vendor.authenticityGuarantee ? "Verified" : "Standard"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* About Store */}
              <Card className="border border-border">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold mb-4 text-foreground">About This Store</h3>
                  <div className="space-y-4 text-sm text-muted-foreground">
                    <p className="leading-relaxed">
                      This vendor is verified and trusted by {vendor.followers_count || 0}+ customers on Bugsymart.
                    </p>
                    <div className="pt-4 border-t border-border">
                      {vendor.totalSales > 0 ? (
                        <p className="text-foreground font-semibold flex items-center gap-2">
                          <Award className="h-4 w-4 text-primary" />
                          {vendor.totalSales}+ Successful Sales
                        </p>
                      ) : (
                        <p>New Store</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Review Dialog */}
      {showReviewDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Write a Review</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Rating</label>
                <div className="flex gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button key={i} onClick={() => setReviewRating(i + 1)} className="focus:outline-none">
                      <Star
                        className={`h-8 w-8 ${i < reviewRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Comment</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full p-3 border border-border rounded-lg min-h-[120px] bg-background"
                  placeholder="Share your experience with this vendor..."
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleSubmitReview}
                  disabled={submittingReview || !reviewComment.trim()}
                  className="flex-1"
                >
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowReviewDialog(false)
                    setReviewComment("")
                    setReviewRating(5)
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Success Toast */}
      {showShareDialog && (
        <div className="fixed bottom-4 right-4 bg-card border border-border rounded-lg p-4 shadow-lg z-50">
          <p className="text-sm font-medium">Link copied to clipboard!</p>
        </div>
      )}
    </div>
  )
}
