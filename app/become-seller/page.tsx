"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export default function BecomeSellerPage() {
  const { user, token, login } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    businessName: "",
    businessDescription: "",
  })

  useEffect(() => {
    if (user && user.isSeller) {
      router.push("/dashboard")
    }
  }, [user, router])

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <Card className="p-6 text-center max-w-md">
            <p className="mb-4 text-foreground font-medium">Authentication Required</p>
            <p className="text-sm text-muted-foreground mb-6">Please log in or register first to become a seller</p>
            <div className="flex gap-2">
              <Button
                onClick={() => router.push("/login?redirect=become-seller")}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                Login/Register
              </Button>
              <Button onClick={() => router.push("/")} variant="outline" className="flex-1 bg-transparent">
                Go Back
              </Button>
            </div>
          </Card>
        </div>
      </>
    )
  }

  if (user.isSeller) {
    return null
  }

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/users/become-seller`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Failed to become a seller")
        setLoading(false)
        return
      }

      const data = await res.json()

      const refreshRes = await fetch(`${API_URL}/auth/refresh-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (refreshRes.ok) {
        const refreshData = await refreshRes.json()
        // Update auth context with new token that has isSeller: true
        login(refreshData.token, refreshData.user)
        
        alert("✅ You are now registered as a seller! You can now upload items.")
        router.push("/upload-item")
      } else {
        alert(`✅ You are now registered as a seller!

Please log out and log back in to activate your seller permissions.`)
        router.push("/login")
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <Card className="p-8">
            <h1 className="text-3xl font-bold mb-2">Become a Seller</h1>
            <p className="text-muted-foreground mb-8">
              Fill in your business details to start selling on Bugsymat.shop
            </p>

            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 mb-4 text-destructive">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Business Name*</label>
                <Input
                  placeholder="Your Business Name"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Business Description</label>
                <textarea
                  placeholder="Tell customers about your business"
                  name="businessDescription"
                  value={formData.businessDescription}
                  onChange={(e) => setFormData({ ...formData, businessDescription: e.target.value })}
                  className="w-full border border-border rounded-md p-2"
                  rows={4}
                />
              </div>


              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm">
                <p className="font-semibold mb-2">Upload Fee: ₦150 per item</p>
                <p className="text-muted-foreground">
                  Each time you list an item, you'll be charged ₦150 upload fee. Payment can be made via bank transfer.
                </p>
              </div>

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 h-12" disabled={loading}>
                {loading ? "Processing..." : "Become a Seller"}
              </Button>
            </form>
          </Card>
        </div>
      </main>
    </>
  )
}
