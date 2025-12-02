"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { useBuyerAuth } from "@/lib/buyer-auth-context"
import { Send, AlertCircle, CheckCircle, ChevronLeft } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export default function MessagesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, token } = useAuth()
  const { buyer, token: buyerToken } = useBuyerAuth()
  const vendorId = searchParams.get("vendorId")

  const currentUser = user || buyer
  const currentToken = token || buyerToken

  const [vendor, setVendor] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    subject: "",
    message: "",
  })

  useEffect(() => {
    if (!currentUser || !currentToken) {
      router.push(`/buyer/login?redirect=/messages${vendorId ? `?vendorId=${vendorId}` : ""}`)
      return
    }

    if (vendorId) {
      loadVendorData()
    } else {
      setLoading(false)
    }
  }, [currentUser, currentToken, vendorId, router])

  const loadVendorData = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/vendors/${vendorId}`, {
        cache: "no-store",
      })

      if (res.ok) {
        const data = await res.json()
        setVendor(data)
      } else {
        setError("Failed to load vendor information")
      }
    } catch (err) {
      console.error("Failed to load vendor:", err)
      setError("Failed to load vendor information")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.subject.trim() || !formData.message.trim()) {
      setError("Please fill in all fields")
      return
    }

    setSending(true)
    setError("")

    try {
      const res = await fetch(`${API_URL}/vendors/${vendorId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentToken}`,
        },
        body: JSON.stringify({
          subject: formData.subject,
          message: formData.message,
        }),
      })

      if (res.ok) {
        setSubmitted(true)
        setFormData({ subject: "", message: "" })
        setTimeout(() => {
          setSubmitted(false)
          router.push("/")
        }, 3000)
      } else {
        const data = await res.json()
        setError(data.error || "Failed to send message")
      }
    } catch (err) {
      console.error("Failed to send message:", err)
      setError("Failed to send message. Please try again.")
    } finally {
      setSending(false)
    }
  }

  if (!currentUser || !currentToken) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background py-12">
          <div className="max-w-md mx-auto px-4">
            <Card className="text-center">
              <CardContent className="p-8">
                <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                <h1 className="text-2xl font-bold mb-2 text-foreground">Sign In Required</h1>
                <p className="text-muted-foreground mb-6">You need to sign in to send messages to vendors.</p>
                <Button onClick={() => router.push("/buyer/login")} className="w-full bg-primary hover:bg-primary/90">
                  Sign In
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background py-12">
          <div className="max-w-2xl mx-auto px-4">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (!vendorId) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background py-12">
          <div className="max-w-md mx-auto px-4">
            <Card className="text-center">
              <CardContent className="p-8">
                <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                <h1 className="text-2xl font-bold mb-2 text-foreground">No Vendor Selected</h1>
                <p className="text-muted-foreground mb-6">Please select a vendor to message.</p>
                <Button onClick={() => router.push("/vendors")} className="w-full bg-primary hover:bg-primary/90">
                  Browse Vendors
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="mb-6">
            <Button variant="outline" size="sm" onClick={() => router.back()} className="gap-2">
              <ChevronLeft className="w-4 h-4" />
              Go Back
            </Button>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Send Message to Vendor</h1>
            <p className="text-muted-foreground">Connect with vendors and get the information you need</p>
          </div>

          {submitted && (
            <Card className="mb-6 border-green-200 bg-green-50 dark:bg-green-950/30">
              <CardContent className="p-4 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-green-800 dark:text-green-200">Message Sent Successfully!</p>
                  <p className="text-sm text-green-700 dark:text-green-300">The vendor will respond to you shortly.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {error && (
            <Card className="mb-6 border-red-200 bg-red-50 dark:bg-red-950/30">
              <CardContent className="p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-800 dark:text-red-200">Error</p>
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {vendor && (
            <Card className="mb-6 border-primary/20 bg-primary/5">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                  <img
                    src={vendor.storeLogo || "/placeholder.svg?height=64&width=64"}
                    alt={vendor.storeName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">{vendor.storeName}</h2>
                  <p className="text-sm text-muted-foreground">Message vendor directly</p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-foreground">Subject*</label>
                  <Input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="What is your message about?"
                    disabled={sending}
                    className="h-10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-foreground">Message*</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Type your message here..."
                    disabled={sending}
                    className="w-full border border-border rounded-md p-3 min-h-[200px] text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 font-sans"
                  />
                  <p className="text-xs text-muted-foreground mt-2">{formData.message.length}/1000 characters</p>
                </div>

                <Button
                  type="submit"
                  disabled={sending || !formData.subject.trim() || !formData.message.trim()}
                  className="w-full bg-primary hover:bg-primary/90 h-12"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {sending ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  )
}
