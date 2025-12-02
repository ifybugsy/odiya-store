"use client"

import { useState, useEffect } from "react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { useAuth } from "@/lib/auth-context"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

interface Vendor {
  _id: string
  userId: {
    _id: string
    firstName: string
    lastName: string
    email: string
    phone: string
    businessName: string
    profileImage?: string
  }
  storeName: string
  storeDescription: string
  storeImage?: string
  storeBanner?: string
  storeLogo?: string
  catalogImages?: string[]
  isVerified?: boolean
  isPromoted?: boolean
  socialLinks?: {
    website?: string
    instagram?: string
    facebook?: string
    twitter?: string
  }
  ratings: number
  ratingCount: number
  followers_count: number
  totalSales: number
  itemsCount: number
  status: string
}

export default function VendorPageClient({ id }: { id: string }) {
  const { user } = useAuth()
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)

  useEffect(() => {
    loadVendorData()
  }, [id])

  const loadVendorData = async () => {
    try {
      const vendorRes = await fetch(`${API_URL}/vendors/${id}`)
      const vendorData = await vendorRes.json()
      setVendor(vendorData)
    } catch (error) {
      console.error("[v0] Failed to load vendor data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFollow = async () => {
    if (!user) {
      alert("Please login to follow vendors")
      return
    }

    try {
      const token = localStorage.getItem("token")
      const method = isFollowing ? "DELETE" : "POST"

      await fetch(`${API_URL}/vendors/${id}/follow`, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      })

      setIsFollowing(!isFollowing)
      if (vendor) {
        setVendor({
          ...vendor,
          followers_count: isFollowing ? vendor.followers_count - 1 : vendor.followers_count + 1,
        })
      }
    } catch (error) {
      console.error("[v0] Failed to follow/unfollow vendor:", error)
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </>
    )
  }

  if (!vendor) {
    return (
      <>
        <Navbar />
        <div className="text-center py-12">
          <p className="text-muted-foreground">Vendor not found</p>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        {/* Banner and rest of content from previous implementation */}
      </main>
      <Footer />
    </>
  )
}
