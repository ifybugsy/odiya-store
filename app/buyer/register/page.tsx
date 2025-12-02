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

export default function UnifiedRegisterPage() {
  const router = useRouter()
  const { login: buyerLogin } = useBuyerAuth()
  const { login: userLogin } = useAuth()
  const { loginVendor } = useVendorAuth()
  const { login: riderLogin } = useRiderAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [selectedRole, setSelectedRole] = useState<"user" | "seller" | "vendor" | "rider">("user")

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    storeName: "",
    storeDescription: "",
    vehicleType: "",
    vehicleNumber: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      setIsLoading(false)
      return
    }

    try {
      const normalizedEmail = formData.email.toLowerCase().trim()

      if (selectedRole === "vendor") {
        if (!formData.storeName || !formData.storeDescription) {
          setError("Store name and description are required for vendors")
          setIsLoading(false)
          return
        }

        const response = await fetch(`${API_URL}/auth/vendor/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: normalizedEmail,
            phone: formData.phone,
            password: formData.password,
            storeName: formData.storeName,
            storeDescription: formData.storeDescription,
          }),
        })

        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || "Vendor registration failed")
        }

        loginVendor(data.token, data.vendor)
        router.push("/vendor/dashboard")
      } else if (selectedRole === "rider") {
        if (!formData.vehicleType || !formData.vehicleNumber) {
          setError("Vehicle type and number are required for riders")
          setIsLoading(false)
          return
        }

        const response = await fetch(`${API_URL}/auth/rider/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: normalizedEmail,
            phone: formData.phone,
            password: formData.password,
            vehicleType: formData.vehicleType,
            vehicleNumber: formData.vehicleNumber,
          }),
        })

        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || "Rider registration failed")
        }

        riderLogin(data.token, data.rider)
        router.push("/rider/dashboard")
      } else {
        // User or Seller registration
        const response = await fetch(`${API_URL}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: normalizedEmail,
            phone: formData.phone,
            password: formData.password,
            isSeller: selectedRole === "seller",
          }),
        })

        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || "Registration failed")
        }

        if (selectedRole === "seller") {
          userLogin(data.token, data.user)
          router.push("/dashboard")
        } else {
          buyerLogin(data.token, data.user)
          router.push("/buyer/dashboard")
        }
      }
    } catch (err) {
      console.error("[v0] Registration error:", err)
      setError(err instanceof Error ? err.message : "An error occurred during registration")
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
            <CardTitle className="text-2xl">Create Your Account</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">Join Bugsymart today</p>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <Label className="mb-3 block">Register as:</Label>
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="John"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Doe"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

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
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 000-0000"
                  required
                  disabled={isLoading}
                />
              </div>

              {selectedRole === "vendor" && (
                <>
                  <div>
                    <Label htmlFor="storeName">Store Name</Label>
                    <Input
                      id="storeName"
                      name="storeName"
                      value={formData.storeName}
                      onChange={handleInputChange}
                      placeholder="My Awesome Store"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="storeDescription">Store Description</Label>
                    <Input
                      id="storeDescription"
                      name="storeDescription"
                      value={formData.storeDescription}
                      onChange={handleInputChange}
                      placeholder="Brief description of your store"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </>
              )}

              {selectedRole === "rider" && (
                <>
                  <div>
                    <Label htmlFor="vehicleType">Vehicle Type</Label>
                    <Input
                      id="vehicleType"
                      name="vehicleType"
                      value={formData.vehicleType}
                      onChange={handleInputChange}
                      placeholder="e.g., Motorcycle, Bicycle, Car"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="vehicleNumber">Vehicle Number</Label>
                    <Input
                      id="vehicleNumber"
                      name="vehicleNumber"
                      value={formData.vehicleNumber}
                      onChange={handleInputChange}
                      placeholder="ABC-1234"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </>
              )}

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

              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
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
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Already have an account?{" "}
              <Link href="/buyer/login" className="text-primary hover:underline font-semibold">
                Sign In
              </Link>
            </p>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </>
  )
}
