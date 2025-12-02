"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { Upload, AlertCircle, CheckCircle2, X } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export default function BecomeSellerPage() {
  const { user, token, login } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [formData, setFormData] = useState({
    businessName: "",
    businessDescription: "",
    idCard: "",
  })
  const [idCardPreview, setIdCardPreview] = useState("")

  useEffect(() => {
    if (user && user.isSeller) {
      router.push("/dashboard")
    }
  }, [user, router])

  if (user && user.isSeller) {
    return null
  }

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleIdCardUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please upload a valid image file")
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB")
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setIdCardPreview(result)
        setFormData({ ...formData, idCard: result })
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

    if (!user || !token) {
      setShowLoginPrompt(true)
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/auth/vendor/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          businessName: formData.businessName,
          businessDescription: formData.businessDescription,
          idCard: formData.idCard,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Failed to register as vendor")
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
        login(refreshData.token, refreshData.user)

        alert("✅ Vendor registration submitted! Your ID card has been sent for admin verification.")
        router.push("/vendor/approval-pending")
      } else {
        alert(`✅ Vendor registration submitted!

Your ID card has been sent to admins for verification. Please wait for approval.`)
        router.push("/vendor/approval-pending")
      }
    } catch (err: any) {
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
            <h1 className="text-3xl font-bold mb-2">Become a Vendor</h1>
            <p className="text-muted-foreground mb-8">
              Fill in your business details and upload your valid ID card to start selling on Bugsymart.shop
            </p>

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

            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 mb-4 text-destructive flex items-start gap-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
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

              <div>
                <label className="block text-sm font-medium mb-2">Valid ID Card* (Required)</label>
                <p className="text-xs text-muted-foreground mb-3">
                  Upload a clear image of your valid ID (National ID, International Passport, Driver's License, etc.)
                </p>
                <div className="border-2 border-dashed border-border rounded-lg p-6">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleIdCardUpload}
                    className="hidden"
                    id="id-card-input"
                    required
                  />
                  <label htmlFor="id-card-input" className="cursor-pointer">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <div className="text-center">
                        <p className="text-sm font-medium">Click to upload or drag and drop</p>
                        <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 5MB</p>
                      </div>
                    </div>
                  </label>
                </div>

                {idCardPreview && (
                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <p className="text-sm font-medium text-green-600">ID Card Uploaded Successfully</p>
                    </div>
                    <img
                      src={idCardPreview || "/placeholder.svg"}
                      alt="ID Card Preview"
                      className="max-h-48 rounded-lg border border-border object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                <p className="font-semibold mb-2">Verification Process:</p>
                <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                  <li>Valid ID card is required and will be verified by our admin team</li>
                  <li>You'll receive approval email once verified</li>
                  <li>Upload fee: ₦150 per item (applied when you list items)</li>
                </ul>
              </div>

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 h-12" disabled={loading}>
                {loading ? "Processing..." : user ? "Submit Vendor Application" : "Continue to Login"}
              </Button>
            </form>
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
                  onClick={() => router.push("/login?redirect=become-seller")}
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
