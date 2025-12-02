"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Store, Mail, Phone, MapPin, Star, Users, ShoppingBag, Globe, Instagram, Facebook, Twitter, TrendingUp, Award, X, ExternalLink } from 'lucide-react'
import Link from "next/link"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

interface VendorDetailsModalProps {
  vendorId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function VendorDetailsModal({ vendorId, open, onOpenChange }: VendorDetailsModalProps) {
  const [vendor, setVendor] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (vendorId && open) {
      console.log("[v0] Loading vendor details for:", vendorId)
      fetchVendorData()
    }
  }, [vendorId, open])

  const fetchVendorData = async () => {
    if (!vendorId) return

    setLoading(true)
    setError(null)

    try {
      console.log("[v0] Fetching vendor from:", `${API_URL}/vendors/${vendorId}`)
      const res = await fetch(`${API_URL}/vendors/${vendorId}`)

      if (!res.ok) {
        throw new Error(`Failed to load vendor: ${res.status}`)
      }

      const data = await res.json()
      console.log("[v0] Vendor data loaded successfully:", data.storeName)
      setVendor(data)
    } catch (err: any) {
      console.error("[v0] Error loading vendor:", err)
      setError(err.message || "Failed to load vendor information")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchVendorData}>Try Again</Button>
          </div>
        )}

        {!loading && !error && vendor && (
          <div className="space-y-6">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      vendor.storeLogo ||
                      vendor.storeImage ||
                      "/placeholder.svg?height=80&width=80&query=store logo"
                     || "/placeholder.svg"}
                    alt={`${vendor.storeName} Logo`}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      {vendor.storeName}
                      {vendor.isVerified && <Award className="h-5 w-5 text-blue-500" />}
                    </h2>
                    <p className="text-sm text-muted-foreground">{vendor.storeCategory || "General Store"}</p>
                  </div>
                </div>
                <Link href={`/vendor/${vendorId}`} target="_blank">
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Full Page
                  </Button>
                </Link>
              </DialogTitle>
            </DialogHeader>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                <span className="font-semibold text-foreground">
                  {vendor.averageRating ? vendor.averageRating.toFixed(1) : "N/A"}
                </span>
                <span>({vendor.totalReviews || 0} reviews)</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{vendor.followers_count || 0} followers</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-1">
                <ShoppingBag className="h-4 w-4" />
                <span>{vendor.totalSales || 0} sales</span>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold text-lg mb-2">About This Store</h3>
              <p className="text-muted-foreground leading-relaxed">
                {vendor.storeDescription || "No description available."}
              </p>
            </div>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Store className="h-5 w-5" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {vendor.phoneNumber && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-primary" />
                      <a href={`tel:${vendor.phoneNumber}`} className="hover:underline">
                        {vendor.phoneNumber}
                      </a>
                    </div>
                  )}
                  {vendor.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-primary" />
                      <a href={`mailto:${vendor.email}`} className="hover:underline">
                        {vendor.email}
                      </a>
                    </div>
                  )}
                  {vendor.storeLocation && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>{vendor.storeLocation}</span>
                    </div>
                  )}
                  {vendor.website && (
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="h-4 w-4 text-primary" />
                      <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {new URL(vendor.website).hostname}
                      </a>
                    </div>
                  )}
                </div>

                {(vendor.socialLinks?.instagram ||
                  vendor.socialLinks?.facebook ||
                  vendor.socialLinks?.twitter) && (
                  <>
                    <Separator className="my-4" />
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-semibold">Follow Us:</span>
                      {vendor.socialLinks?.instagram && (
                        <a
                          href={vendor.socialLinks.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary transition-colors"
                        >
                          <Instagram className="h-5 w-5" />
                        </a>
                      )}
                      {vendor.socialLinks?.facebook && (
                        <a
                          href={vendor.socialLinks.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary transition-colors"
                        >
                          <Facebook className="h-5 w-5" />
                        </a>
                      )}
                      {vendor.socialLinks?.twitter && (
                        <a
                          href={vendor.socialLinks.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary transition-colors"
                        >
                          <Twitter className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="
