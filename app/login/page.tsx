"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { useAuth } from "@/lib/auth-context"
import { useVendorAuth } from "@/lib/vendor-auth-context"
import { AlertCircle, Loader2, ShoppingBag, Building2 } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
const API_TIMEOUT = 15000

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  // CHANGE: added userRole state to select between Vendor, Seller, or User
  const [userRole, setUserRole] = useState<"user" | "seller" | "vendor">("user")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [debugInfo, setDebugInfo] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()
  const { loginVendor } = useVendorAuth()

  useEffect(() => {
    if (searchParams.get("role") === "vendor") {
      setUserRole("vendor")
    }
  }, [searchParams])

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
      // CHANGE: handle vendor login/signup separately
      if (userRole === "vendor") {
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

          console.log("[v0] Vendor registered successfully:", { email: data.vendor?.email })
          loginVendor(data.token, data.vendor)
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

          console.log("[v0] Vendor logged in successfully:", { email: data.vendor?.email })
          loginVendor(data.token, data.vendor)
        }

        router.push("/vendor/dashboard")
      } else {
        // Original user/seller login flow
        const endpoint = isSignUp ? "/auth/register" : "/auth/login"
        const normalizedEmail = formData.email.toLowerCase().trim()

        console.log("[v0] User authentication attempt:", { endpoint, email: normalizedEmail, role: userRole })

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
            console.error("[v0] Registration failed:", { status: response.status, error: data.error })
            setError(data.error || "Registration failed")
            setDebugInfo(`Status: ${response.status}`)
            setLoading(false)
            return
          }

          console.log("[v0] Registration successful:", { email: data.user?.email })
          login(data.token, data.user)
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
            console.error("[v0] Login failed:", { status: response.status, error: data.error })
            setError(data.error || "Login failed")
            setDebugInfo(`Status: ${response.status}`)
            setLoading(false)
            return
          }

          console.log("[v0] Login successful:", { email: data.user?.email })
          login(data.token, data.user)
        }

        const redirect = searchParams.get("redirect") || "dashboard"
        const from = searchParams.get("from")
        const redirectPath = `/${redirect}${from ? `?from=${from}` : ""}`

        console.log("[v0] Redirecting to:", redirectPath)
        router.push(redirectPath)
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
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground text-center">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </h1>
            <p className="text-center text-muted-foreground mt-2">
              {isSignUp ? "Join Odiya Store today" : "Login to your account"}
            </p>
          </div>

          {/* CHANGE: added role selection buttons */}
          <div className="mb-6 flex gap-2">
            <Button
              type="button"
              variant={userRole === "user" ? "default" : "outline"}
              className="flex-1 flex items-center justify-center gap-2"
              onClick={() => setUserRole("user")}
              disabled={loading}
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">User</span>
            </Button>
            <Button
              type="button"
              variant={userRole === "seller" ? "default" : "outline"}
              className="flex-1 flex items-center justify-center gap-2"
              onClick={() => setUserRole("seller")}
              disabled={loading}
            >
              <Building2 className="w-4 h-4" />
              <span className="hidden sm:inline">Seller</span>
            </Button>
            <Button
              type="button"
              variant={userRole === "vendor" ? "default" : "outline"}
              className="flex-1 flex items-center justify-center gap-2"
              onClick={() => setUserRole("vendor")}
              disabled={loading}
            >
              <Building2 className="w-4 h-4" />
              <span className="hidden sm:inline">Vendor</span>
            </Button>
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
                "Create Account"
              ) : (
                "Login"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground text-sm">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setError("")
                  setDebugInfo("")
                }}
                className="text-primary hover:underline font-semibold"
                disabled={loading}
              >
                {isSignUp ? "Login" : "Sign Up"}
              </button>
            </p>
          </div>
        </Card>
      </main>
      <Footer />
    </>
  )
}
