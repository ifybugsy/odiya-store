"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useVendorAuth } from "@/lib/vendor-auth-context"
import { Upload, AlertCircle, CheckCircle2, X } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

interface PaymentModalState {
  isOpen: boolean
}

export default function VendorRegistrationPage() {
  const { vendor, vendorToken, loginVendor } = useVendorAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    storeName: "",
    storeDescription: "",
    idCard: "",
  })
  const [idCardPreview, setIdCardPreview] = useState("")
  const [paymentModal, setPaymentModal] = useState<PaymentModalState>({ isOpen: false })

  useEffect(() => {
    if (vendor && vendor.status === "approved") {
      router.push("/vendor/dashboard")
    }
  }, [vendor, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

    // Validate all required fields
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError("First name and last name are required")
      return
    }

    if (!formData.email.trim()) {
      setError("Email is required")
      return
    }

    if (!formData.phone.trim()) {
      setError("Phone number is required")
      return
    }

    if (!formData.password) {
      setError("Password is required")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (!formData.storeName.trim()) {
      setError("Store name is required")
      return
    }

    if (!formData.idCard) {
      setError("Valid ID card is required for vendor registration")
      return
    }

    setPaymentModal({ isOpen: true })
  }

  const handleConfirmSubmission = async () => {
    setLoading(true)

    try {
      const normalizedEmail = formData.email.toLowerCase().trim()

      // Register vendor account with all details
      const res = await fetch(`${API_URL}/auth/vendor/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: normalizedEmail,
          phone: formData.phone,
          password: formData.password,
          storeName: formData.storeName,
          storeDescription: formData.storeDescription,
          idCard: formData.idCard,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Failed to register as vendor")
        setPaymentModal({ isOpen: false })
        setLoading(false)
        return
      }

      const data = await res.json()

      loginVendor(data.token, data.vendor)

      setPaymentModal({ isOpen: false })
      alert(
        "✅ Vendor registration submitted! Your ID has been sent for verification.\n\nNext: Please proceed to payment.",
      )
      router.push("/vendor-fee-payment")
    } catch (err: any) {
      setError(err.message || "An error occurred during registration")
      setPaymentModal({ isOpen: false })
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
            <p className="text-muted-foreground mb-8">
              Create your vendor account and online store on Bugsymart.shop. Fill in all your details to get started.
            </p>

            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 mb-4 text-destructive flex items-start gap-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="border-b border-border pb-6">
                <h2 className="text-xl font-semibold mb-4 text-foreground">Account Information</h2>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-foreground">First Name*</label>
                      <Input
                        placeholder="First Name"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-foreground">Last Name*</label>
                      <Input
                        placeholder="Last Name"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">Email Address*</label>
                    <Input
                      placeholder="your.email@example.com"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">Phone Number*</label>
                    <Input
                      placeholder="080XXXXXXXX"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-foreground">Password*</label>
                      <Input
                        placeholder="Create a strong password"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-foreground">Confirm Password*</label>
                      <Input
                        placeholder="Re-enter your password"
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-b border-border pb-6">
                <h2 className="text-xl font-semibold mb-4 text-foreground">Store Information</h2>

                <div className="space-y-4">
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
                      placeholder="Tell customers about your store and what you sell"
                      name="storeDescription"
                      value={formData.storeDescription}
                      onChange={handleChange}
                      className="w-full border border-border rounded-md p-2 font-sans"
                      rows={4}
                    />
                  </div>
                </div>
              </div>

              {/* ID Upload Section */}
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Valid ID Card* (Required)</label>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="font-semibold text-blue-900 mb-2 text-sm">Why We Need Your ID</p>
                  <ul className="text-blue-800 space-y-1 list-disc list-inside text-xs">
                    <li>Verify your identity and build trust with customers</li>
                    <li>Ensure secure marketplace transactions</li>
                    <li>Comply with business registration requirements</li>
                    <li>Protect both vendors and buyers from fraud</li>
                    <li>Your ID information is kept confidential and secure</li>
                  </ul>
                </div>

                <p className="text-xs text-muted-foreground mb-3">
                  Upload a clear image of your valid ID (National ID, International Passport, Driver's License, Voter's
                  Card, etc.)
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
                        <p className="text-sm font-medium text-foreground">Click to upload or drag and drop</p>
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

              {/* Registration Info */}
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-sm">
                <p className="font-semibold mb-2 text-foreground">Registration Process:</p>
                <ul className="space-y-1 text-muted-foreground list-disc list-inside text-xs">
                  <li>Complete all fields to create your vendor account</li>
                  <li>Valid ID card is required and will be verified by our admin team</li>
                  <li>Registration fee: ₦2,000 (one-time payment)</li>
                  <li>You'll receive approval email once verified</li>
                </ul>
              </div>

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 h-12" disabled={loading}>
                {loading ? "Processing..." : "Complete Vendor Registration"}
              </Button>
            </form>
          </Card>
        </div>
      </main>

      {paymentModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md p-6">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-2xl font-bold text-foreground">Payment Required</h2>
              <button
                onClick={() => setPaymentModal({ isOpen: false })}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-muted-foreground">
                To activate your vendor account, you'll need to pay a one-time registration fee of:
              </p>

              <div className="bg-primary/10 border-2 border-primary rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">Registration Fee</p>
                <p className="text-4xl font-bold text-primary">₦2,000</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-900 font-medium mb-2">What's Included:</p>
                <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                  <li>Fully customizable vendor storefront</li>
                  <li>Direct customer messaging system</li>
                  <li>Analytics and sales tracking</li>
                  <li>Priority vendor support</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setPaymentModal({ isOpen: false })}
                  variant="outline"
                  className="flex-1 bg-transparent"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmSubmission}
                  className="flex-1 bg-primary hover:bg-primary/90"
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Continue to Payment"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  )
}
