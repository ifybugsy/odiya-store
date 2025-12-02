"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { useVendorAuth } from "@/lib/vendor-auth-context"
import { AlertCircle, Loader2, ArrowLeft } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
const API_TIMEOUT = 15000

export default function VendorLoginPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [debugInfo, setDebugInfo] = useState("")
  const router = useRouter()
  const { loginVendor } = useVendorAuth()

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setError("")
    setDebugInfo("")
    setLoading(true)

    try {
      const endpoint = isSignUp ? "/auth/vendor/register" : "/auth/vendor/login"
      const normalizedEmail = formData.email.toLowerCase().trim()

      console.log("[v0] Vendor authentication attempt:", { endpoint, email: normalizedEmail })

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT)

      if (isSignUp) {
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match")
          setLoading(false)
          return
        }

        const response = await fetch(`${API_URL}${endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: normalizedEmail,
            phone: formData.phone,
            password: formData.password,
          }),
          signal: controller.signal,
        })

        clearTimeout(timeoutId)
        const data = await response.json()

        if (!response.ok) {
          console.error("[v0] Vendor registration failed:", { status: response.status, error: data.error })
          setError(data.error || "Registration failed")
          setDebugInfo(`Status: ${response.status}`)
          setLoading(false)
          return
        }

        console.log("[v0] Vendor registered successfully:", { email: data.vendor?.email, status: data.vendor?.status })
        loginVendor(data.token, data.vendor)
        setError("")
        router.push("/vendor/approval-pending")
      } else {
        const response = await fetch(`${API_URL}${endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: normalizedEmail,
            password: formData.password,
          }),
          signal: controller.signal,
        })

        clearTimeout(timeoutId)
        const data = await response.json()

        if (!response.ok) {
          console.error("[v0] Vendor login failed:", { status: response.status, error: data.error })
          setError(data.error || "Login failed")
          setDebugInfo(`Status: ${response.status}`)
          setLoading(false)
          return
        }

        console.log("[v0] Vendor logged in successfully:", { email: data.vendor?.email, status: data.vendor?.status })
        loginVendor(data.token, data.vendor)
        setError("")

        if (data.vendor?.status === "pending") {
          console.log("[v0] Vendor is pending approval, redirecting to approval page")
          router.push("/vendor/approval-pending")
        } else if (data.vendor?.status === "approved") {
          console.log("[v0] Vendor is approved, redirecting to dashboard")
          router.push("/vendor/dashboard")
        } else if (data.vendor?.status === "suspended") {
          setError("Your vendor account has been suspended. Please contact support for assistance.")
          setTimeout(() => loginVendor("", { ...data.vendor, status: "suspended" }), 2000)
        } else if (data.vendor?.status === "rejected") {
          setError("Your vendor application was rejected. Please contact support for more information.")
          setTimeout(() => loginVendor("", { ...data.vendor, status: "rejected" }), 2000)
        }
      }
    } catch (err: any) {
      console.error("[v0] Authentication error:", err)

      if (err.name === "AbortError") {
        setError("Request timed out. Backend may be slow. Please try again.")
        setDebugInfo("Timeout after 15 seconds - check if backend is running")
      } else {
        setError(err.message || "An error occurred")
        setDebugInfo(`Network error: ${err.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md p-6">
          <Button
            variant="ghost"
            size="sm"
            className="mb-4 gap-2 -ml-2"
            onClick={() => router.push("/vendors")}
            disabled={loading}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground text-center">
              {isSignUp ? "Create Vendor Account" : "Vendor Login"}
            </h1>
            <p className="text-center text-muted-foreground mt-2">
              {isSignUp ? "Register your vendor store" : "Access your vendor dashboard"}
            </p>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 mb-4">
              <div className="flex gap-2 items-start">
                <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-destructive text-sm font-medium">{error}</p>
                  {debugInfo && <p className="text-xs text-destructive/70 mt-1">{debugInfo}</p>}
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <Input
                  placeholder="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
                <Input
                  placeholder="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
                <Input
                  placeholder="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </>
            )}

            <Input
              placeholder="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />

            <Input
              placeholder="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />

            {isSignUp && (
              <Input
                placeholder="Confirm Password"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={loading}
              />
            )}

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading...
                </>
              ) : isSignUp ? (
                "Create Vendor Account"
              ) : (
                "Login to Vendor Dashboard"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground text-sm">
              {isSignUp ? "Already have a vendor account?" : "Don't have a vendor account?"}{" "}
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setError("")
                  setDebugInfo("")
                }}
                className="text-primary hover:underline font-semibold"
                disabled={loading}
              >
                {isSignUp ? "Login" : "Register"}
              </button>
            </p>
          </div>
        </Card>
      </main>
      <Footer />
    </>
  )
}
