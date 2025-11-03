"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://odiya-store.onrender.com/api"

export default function BecomeSellerPage() {
  const { user, token, setUser } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    businessName: "",
    businessDescription: "",
    bankAccountNumber: "",
    bankAccountName: "",
    bankName: "",
  })

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

      setUser({
        ...user!,
        isSeller: true,
      })

      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <p>Please login first</p>
        </div>
      </>
    )
  }

  if (user.isSeller) {
    router.push("/dashboard")
    return null
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <Card className="p-8">
            <h1 className="text-3xl font-bold mb-2">Become a Seller</h1>
            <p className="text-muted-foreground mb-8">Fill in your business details to start selling on Odiya Store</p>

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

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold mb-3 text-sm">Bank Account Details for Payments</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Bank Account Number*</label>
                    <Input
                      placeholder="e.g., 0123456789"
                      name="bankAccountNumber"
                      value={formData.bankAccountNumber}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Account Name*</label>
                    <Input
                      placeholder="Account Holder Name"
                      name="bankAccountName"
                      value={formData.bankAccountName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Bank Name*</label>
                    <Input
                      placeholder="e.g., First Bank, GTBank, Zenith Bank"
                      name="bankName"
                      value={formData.bankName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm">
                <p className="font-semibold mb-2">Upload Fee: ₦500 per item</p>
                <p className="text-muted-foreground">
                  Each time you list an item, you'll be charged ₦500 upload fee. Payment can be made via bank transfer.
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
