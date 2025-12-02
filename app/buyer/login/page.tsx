"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { useBuyerAuth } from "@/lib/buyer-auth-context"
import { useAuth } from "@/lib/auth-context"
import { useVendorAuth } from "@/lib/vendor-auth-context"
import { useRiderAuth } from "@/lib/rider-auth-context"
import { AlertCircle, Loader2, ShoppingBag, Store, Truck, User } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export default function UnifiedLoginPage() {
  const router = useRouter()
  const { login: buyerLogin } = useBuyerAuth()
  const { login: userLogin } = useAuth()
  const { loginVendor } = useVendorAuth()
  const { login: riderLogin } = useRiderAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [selectedRole, setSelectedRole] = useState<"user" | "seller" | "vendor" | "rider">("user")

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const normalizedEmail = formData.email.toLowerCase().trim()

      if (selectedRole === "vendor") {
        const response = await fetch(`${API_URL}/auth/vendor/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: normalizedEmail,
            password: formData.password,
          }),
        })

        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || "Vendor login failed")
        }

        loginVendor(data.token, data.vendor)
        router.push("/vendor/dashboard")
      } else if (selectedRole === "rider") {
        const response = await fetch(`${API_URL}/auth/rider/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: normalizedEmail,
            password: formData.password,
          }),
        })

        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || "Rider login failed")
        }

        riderLogin(data.token, data.rider)
        router.push("/rider/dashboard")
      } else if (selectedRole === "seller") {
        const response = await fetch(`${API_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: normalizedEmail,
            password: formData.password,
          }),
        })

        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || "Seller login failed")
        }

        userLogin(data.token, data.user)
        router.push("/dashboard")
      } else {
        // User login (buyer)
        const response = await fetch(`${API_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: normalizedEmail,
            password: formData.password,
          }),
        })

        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || "Login failed")
        }

        buyerLogin(data.token, data.user)
        router.push("/buyer/dashboard")
      }
    } catch (err) {
      console.error("[v0] Login error:", err)
      setError(err instanceof Error ? err.message : "An error occurred during login")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4 py-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">Sign in to your account</p>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <Label className="mb-3 block">Login as:</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={selectedRole === "user" ? "default" : "outline"}
                  className="flex items-center justify-center gap-2"
                  onClick={() => setSelectedRole("user")}
                  disabled={isLoading}
                >
                  <User className="w-4 h-4" />
                  User
                </Button>
                <Button
                  type="button"
                  variant={selectedRole === "seller" ? "default" : "outline"}
                  className="flex items-center justify-center gap-2"
                  onClick={() => setSelectedRole("seller")}
                  disabled={isLoading}
                >
                  <ShoppingBag className="w-4 h-4" />
                  Seller
                </Button>
                <Button
                  type="button"
                  variant={selectedRole === "vendor" ? "default" : "outline"}
                  className="flex items-center justify-center gap-2"
                  onClick={() => setSelectedRole("vendor")}
                  disabled={isLoading}
                >
                  <Store className="w-4 h-4" />
                  Vendor
                </Button>
                <Button
                  type="button"
                  variant={selectedRole === "rider" ? "default" : "outline"}
                  className="flex items-center justify-center gap-2"
                  onClick={() => setSelectedRole("rider")}
                  disabled={isLoading}
                >
                  <Truck className="w-4 h-4" />
                  Rider
                </Button>
              </div>
            </div>

            {error && (
              <Alert className="mb-4 border-destructive bg-destructive/10">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <AlertDescription className="text-destructive">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="you@example.com"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
              </div>

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Don't have an account?{" "}
              <Link href="/buyer/register" className="text-primary hover:underline font-semibold">
                Sign Up
              </Link>
            </p>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </>
  )
}
