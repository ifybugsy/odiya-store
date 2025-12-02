"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import { AlertCircle, X } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export default function BecomeVendorPage() {
  const { user, token } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showAlternative, setShowAlternative] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [formData, setFormData] = useState({
    storeName: "",
    storeDescription: "",
    idCard: "",
    socialLinks: {
      website: "",
      instagram: "",
      facebook: "",
      twitter: "",
    },
  })

  useEffect(() => {
    if (user && user.isVendor) {
      router.push("/vendor/dashboard")
    }
  }, [user, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (name.startsWith("social.")) {
      const socialKey = name.split(".")[1]
      setFormData({
        ...formData,
        socialLinks: { ...formData.socialLinks, [socialKey]: value },
      })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleIdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please upload a valid image file for ID card")
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("ID card file size must be less than 5MB")
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData({ ...formData, idCard: reader.result as string })
        setError("")
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.idCard) {
      setError("Valid ID card is required for vendor registration")
      return
    }

    if (!formData.storeName.trim()) {
      setError("Store name is required")
      return
    }

    if (!user || !token) {
      setShowLoginPrompt(true)
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/vendors/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Failed to register as vendor")
        setLoading(false)
        return
      }

      console.log("[v0] Vendor registration successful")
      router.push("/vendor-fee-payment")
    } catch (err: any) {
      console.error("[v0] Vendor registration error:", err)
      setError(err.message || "An error occurred during registration")
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
            <h1 className="text-3xl font-bold mb-2 text-foreground">Become a Vendor</h1>
            <p className="text-muted-foreground mb-8">Create your online store and reach more customers</p>

            {!user && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Account Required</p>
                  <p className="text-xs text-blue-800 mt-1">
                    Fill out the form below. You'll be prompted to log in or register before submitting.
                  </p>
                </div>
              </div>
            )}

            {!showAlternative ? (
              <>
                {/* Option 1: Register as new vendor */}
                <div className="space-y-6">
                  <div className="border border-primary/20 rounded-lg p-6 bg-primary/5">
                    <h2 className="text-xl font-semibold mb-4 text-foreground">Create Your Vendor Store</h2>

                    {error && (
                      <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 mb-4 text-destructive text-sm">
                        {error}
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-foreground">Store Name*</label>
                        <Input
                          placeholder="Your Store Name"
                          name="storeName"
                          value={formData.storeName}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 text-foreground">Store Description</label>
                        <textarea
                          placeholder="Tell customers about your store and products"
                          name="storeDescription"
                          value={formData.storeDescription}
                          onChange={handleChange}
                          className="w-full border border-border rounded-md p-2"
                          rows={4}
                        />
                      </div>

                      <div className="border-2 border-primary/20 rounded-lg p-4 bg-blue-50">
                        <label className="block text-sm font-medium mb-2 text-foreground">
                          Upload Valid ID Card* (Required)
                        </label>
                        <Input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleIdUpload}
                          required
                          className="mb-2 cursor-pointer"
                        />
                        <div className="bg-blue-100 rounded-md p-3 text-sm">
                          <p className="font-semibold text-blue-900 mb-1">Why We Need Your ID</p>
                          <ul className="text-blue-800 space-y-1 list-disc list-inside text-xs">
                            <li>Verify your identity and build trust with customers</li>
                            <li>Ensure secure marketplace transactions</li>
                            <li>Comply with business registration requirements</li>
                            <li>Protect both vendors and buyers from fraud</li>
                            <li>Your ID information is kept confidential and secure</li>
                          </ul>
                        </div>
                        {formData.idCard && (
                          <div className="mt-2">
                            <p className="text-xs text-green-600 font-medium">✓ ID uploaded successfully</p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <p className="text-sm font-medium text-foreground">Social Links (Optional)</p>
                        <Input
                          placeholder="Website URL"
                          name="social.website"
                          value={formData.socialLinks.website}
                          onChange={handleChange}
                        />
                        <Input
                          placeholder="Instagram Handle"
                          name="social.instagram"
                          value={formData.socialLinks.instagram}
                          onChange={handleChange}
                        />
                        <Input
                          placeholder="Facebook Page"
                          name="social.facebook"
                          value={formData.socialLinks.facebook}
                          onChange={handleChange}
                        />
                        <Input
                          placeholder="Twitter Handle"
                          name="social.twitter"
                          value={formData.socialLinks.twitter}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                        <p className="font-semibold mb-2 text-blue-900">About Vendor Registration</p>
                        <p className="text-blue-800">
                          Your vendor application with ID card will be reviewed by our admin team. Once approved, you'll
                          have access to a full vendor dashboard to customize your storefront and manage your business.
                        </p>
                      </div>

                      <Button type="submit" className="w-full bg-primary hover:bg-primary/90 h-12" disabled={loading}>
                        {loading ? "Processing..." : user ? "Apply to Become a Vendor" : "Continue to Login"}
                      </Button>
                    </form>
                  </div>

                  <p className="text-center text-sm text-muted-foreground">
                    Already have an approved vendor store?{" "}
                    <button
                      onClick={() => setShowAlternative(true)}
                      className="text-primary font-medium hover:underline"
                    >
                      Access your dashboard
                    </button>
                  </p>
                </div>
              </>
            ) : (
              <>
                {/* Option 2: Existing vendor */}
                <div className="text-center">
                  <p className="mb-4 text-foreground">Access your vendor dashboard</p>
                  <Link href="/vendor/dashboard">
                    <Button className="bg-primary hover:bg-primary/90">Go to Dashboard</Button>
                  </Link>
                  <button
                    onClick={() => setShowAlternative(false)}
                    className="mt-4 text-sm text-primary hover:underline"
                  >
                    Back to registration
                  </button>
                </div>
              </>
            )}
          </Card>
        </div>
      </main>

      {showLoginPrompt && !user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md p-6">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-2xl font-bold text-foreground">Login Required</h2>
              <button onClick={() => setShowLoginPrompt(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-muted-foreground">
                Please log in or create an account to submit your vendor application.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-900 font-medium mb-1">Your form data is ready!</p>
                <p className="text-xs text-blue-800">
                  After logging in, you'll be able to submit your vendor application with the information you've
                  entered.
                </p>
              </div>

              <div className="flex gap-3">
                <Button onClick={() => setShowLoginPrompt(false)} variant="outline" className="flex-1 bg-transparent">
                  Go Back
                </Button>
                <Button
                  onClick={() => router.push("/login?redirect=become-vendor")}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  Login / Register
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  )
}
