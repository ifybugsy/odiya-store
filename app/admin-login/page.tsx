"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"
import { Lock, Zap, ArrowRight, AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react"
import Navbar from "@/components/navbar"

const MIN_PASSWORD_LENGTH = 6
const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_DURATION_MS = 15 * 60 * 1000 // 15 minutes

interface LoginError {
  field?: "email" | "password" | "general"
  message: string
}

export default function AdminLoginPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  const [mounted, setMounted] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<LoginError[]>([])
  const [loginAttempts, setLoginAttempts] = useState(0)
  const [isLockedOut, setIsLockedOut] = useState(false)
  const [lockoutTimeRemaining, setLockoutTimeRemaining] = useState(0)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isLoading && mounted && user?.isAdmin) {
      router.push("/admin")
    }
  }, [user, isLoading, mounted, router])

  useEffect(() => {
    if (!isLockedOut) return

    const interval = setInterval(() => {
      setLockoutTimeRemaining((prev) => {
        if (prev <= 1000) {
          setIsLockedOut(false)
          setLoginAttempts(0)
          clearInterval(interval)
          return 0
        }
        return prev - 1000
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isLockedOut])

  const validateForm = (): boolean => {
    const newErrors: LoginError[] = []

    if (!email.trim()) {
      newErrors.push({ field: "email", message: "Email is required" })
    } else if (!email.includes("@")) {
      newErrors.push({ field: "email", message: "Please enter a valid email address" })
    }

    if (!password) {
      newErrors.push({ field: "password", message: "Password is required" })
    } else if (password.length < MIN_PASSWORD_LENGTH) {
      newErrors.push({ field: "password", message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` })
    }

    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (isLockedOut || isSubmitting) return

    if (!validateForm()) return

    setIsSubmitting(true)
    setErrors([])

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
      const normalizedEmail = email.trim().toLowerCase()

      console.log("[v0] Admin login attempt:", { email: normalizedEmail, apiUrl })

      const response = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: normalizedEmail, password }),
      })

      const data = await response.json()
      console.log("[v0] Login response status:", response.status, "data:", data)

      if (!response.ok) {
        if (response.status === 401) {
          const errorMsg =
            data.error === "Invalid credentials"
              ? "Invalid email or password. Please verify your credentials and try again."
              : data.error || "Authentication failed"

          console.error("[v0] Login failed with 401:", {
            email: normalizedEmail,
            error: data.error,
            timestamp: new Date().toISOString(),
          })

          setErrors([
            {
              field: "general",
              message: errorMsg,
            },
            {
              field: "general",
              message:
                "Troubleshooting tip: Check the console (F12) for detailed error logs. Admin user may need to be created using the backend script.",
            },
          ])

          setLoginAttempts((prev) => prev + 1)

          if (loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS) {
            setIsLockedOut(true)
            setLockoutTimeRemaining(LOCKOUT_DURATION_MS)
            setErrors([
              {
                field: "general",
                message: `Too many login attempts. Please try again in 15 minutes.`,
              },
            ])
          }
        } else if (response.status === 403) {
          console.error("[v0] Access denied - user is not admin:", data)
          setErrors([
            {
              field: "general",
              message: "Admin access denied. This user account does not have administrator privileges.",
            },
            {
              field: "general",
              message: "Contact your system administrator to grant admin access to this account.",
            },
          ])
        } else if (response.status === 400) {
          console.error("[v0] Bad request:", data)
          setErrors([{ field: "general", message: data.error || "Invalid request. Please check your input." }])
        } else if (response.status === 500) {
          console.error("[v0] Server error:", data)
          setErrors([
            {
              field: "general",
              message: "Server error. Please try again later or contact support.",
            },
          ])
        } else {
          console.error("[v0] Unknown error status:", response.status, data)
          setErrors([{ field: "general", message: "Login failed. Please try again later." }])
        }
        return
      }

      if (!data.user) {
        console.error("[v0] No user in response:", data)
        setErrors([{ field: "general", message: "Login response incomplete. Please try again." }])
        return
      }

      if (!data.user.isAdmin) {
        console.error("[v0] User is not admin:", { email: normalizedEmail, isAdmin: data.user.isAdmin })
        setErrors([
          {
            field: "general",
            message: "You do not have administrative privileges.",
          },
          {
            field: "general",
            message: `This account (${data.user.email}) is not registered as an administrator.`,
          },
        ])
        return
      }

      if (!data.token) {
        console.error("[v0] No token in response:", data)
        setErrors([{ field: "general", message: "Authentication failed. No token received." }])
        return
      }

      console.log("[v0] Admin login successful:", {
        email: data.user.email,
        isAdmin: data.user.isAdmin,
        timestamp: new Date().toISOString(),
      })

      localStorage.setItem("authToken", data.token)
      localStorage.setItem(
        "admin_auth",
        JSON.stringify({
          user: data.user,
          token: data.token,
          loginTime: new Date().toISOString(),
        }),
      )

      setEmail("")
      setPassword("")
      setLoginAttempts(0)

      // Navigate to admin dashboard
      router.push("/admin")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error"
      console.error("[v0] Admin login exception:", {
        error: errorMessage,
        stack: err instanceof Error ? err.stack : "No stack trace",
        timestamp: new Date().toISOString(),
      })

      setErrors([
        {
          field: "general",
          message: "Network error. Please check your connection and try again.",
        },
        {
          field: "general",
          message: `Technical details: ${errorMessage}. Check browser console (F12) for more information.`,
        },
      ])
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!mounted || isLoading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center min-h-screen bg-background">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent mx-auto mb-4" />
            <p className="text-muted-foreground">Loading admin portal...</p>
          </div>
        </div>
      </>
    )
  }

  const lockoutMinutes = Math.ceil(lockoutTimeRemaining / 60000)

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Side - Features */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  <span className="text-sm font-semibold text-primary">Admin Portal</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground">Marketplace Administration</h1>
                <p className="text-lg text-muted-foreground">
                  Manage items, approve sellers, suspend users, and monitor marketplace activity in real-time.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { title: "Approve Items", desc: "Review and approve pending marketplace listings" },
                  { title: "Manage Users", desc: "Suspend/unsuspend accounts and control access" },
                  { title: "Monitor Activity", desc: "Track user behavior and marketplace metrics" },
                  { title: "System Control", desc: "Configure settings and manage platform resources" },
                ].map((feature, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-primary">{idx + 1}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{feature.title}</p>
                      <p className="text-sm text-muted-foreground">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-xs font-semibold text-blue-900 mb-2">Security Notice</p>
                <p className="text-xs text-blue-800 leading-relaxed">
                  This admin portal is protected by secure authentication. Your login credentials are validated against
                  our secure backend database. Never share your admin credentials with anyone.
                </p>
              </div>
            </div>

            {/* Right Side - Login Form */}
            <div>
              <Card className="p-8 border border-border shadow-lg">
                <div className="flex items-center gap-2 mb-6">
                  <Lock className="w-5 h-5 text-primary" />
                  <h2 className="text-2xl font-bold text-foreground">Admin Login</h2>
                </div>

                {errors.some((e) => e.field === "general") && (
                  <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 mb-6 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div>
                      {errors
                        .filter((e) => e.field === "general")
                        .map((err, idx) => (
                          <p key={idx} className="text-sm text-destructive font-medium">
                            {err.message}
                          </p>
                        ))}
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  <div>
                    <label htmlFor="email" className="text-sm font-semibold text-foreground block mb-2">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@example.com"
                      disabled={isSubmitting || isLockedOut}
                      className={errors.some((e) => e.field === "email") ? "border-destructive" : ""}
                      autoComplete="email"
                      required
                    />
                    {errors.some((e) => e.field === "email") && (
                      <p className="text-xs text-destructive mt-1">
                        {errors.find((e) => e.field === "email")?.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="password" className="text-sm font-semibold text-foreground block mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        disabled={isSubmitting || isLockedOut}
                        className={errors.some((e) => e.field === "password") ? "border-destructive pr-10" : "pr-10"}
                        autoComplete="current-password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={!password || isSubmitting || isLockedOut}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-50"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.some((e) => e.field === "password") && (
                      <p className="text-xs text-destructive mt-1">
                        {errors.find((e) => e.field === "password")?.message}
                      </p>
                    )}
                  </div>

                  {isLockedOut && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-700 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-yellow-800">
                        Too many login attempts. Please try again in {lockoutMinutes} minute
                        {lockoutMinutes !== 1 ? "s" : ""}.
                      </p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isSubmitting || isLockedOut || !email || !password}
                    className="w-full font-semibold flex items-center justify-center gap-2 py-6"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Authenticating...
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-6 pt-6 border-t border-border space-y-3">
                  <p className="text-xs text-muted-foreground">
                    Having trouble? Contact system administrator for account access.
                  </p>
                  <Button variant="ghost" onClick={() => router.push("/")} className="w-full">
                    Return to Home
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
