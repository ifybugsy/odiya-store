"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { AlertCircle, CheckCircle } from "lucide-react"

export default function AdminLoginPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isLoading && mounted && user?.isAdmin) {
      router.push("/admin")
    }
  }, [user, isLoading, mounted, router])

  if (!mounted || isLoading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">Admin Access</h1>

          <Card className="p-8 mb-6">
            {user?.isAdmin ? (
              <>
                <div className="flex items-start gap-4 mb-6">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h2 className="text-2xl font-bold text-green-600 mb-2">You Are Admin</h2>
                    <p className="text-foreground mb-4">
                      Welcome, {user.firstName} {user.lastName}! You have admin privileges.
                    </p>
                    <Button onClick={() => router.push("/admin")} className="bg-primary hover:bg-primary/90">
                      Go to Admin Dashboard
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start gap-4 mb-6">
                  <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                  <div>
                    <h2 className="text-2xl font-bold text-orange-600 mb-2">Admin Access Required</h2>
                    <p className="text-foreground mb-4">
                      {user
                        ? "Your account does not have admin privileges. Please login with an admin account."
                        : "You are not logged in. Please login with your admin account to access the admin dashboard."}
                    </p>
                  </div>
                </div>

                <div className="bg-muted p-6 rounded-lg mb-6">
                  <h3 className="font-semibold mb-4">To access the admin dashboard:</h3>
                  <ol className="space-y-3 text-sm">
                    <li className="flex gap-3">
                      <span className="font-bold text-primary flex-shrink-0">1.</span>
                      <span>
                        Go to{" "}
                        <a href="/login" className="text-primary hover:underline font-semibold">
                          Login
                        </a>{" "}
                        page
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold text-primary flex-shrink-0">2.</span>
                      <span>Use the admin credentials provided to you</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold text-primary flex-shrink-0">3.</span>
                      <span>After login, visit the admin dashboard</span>
                    </li>
                  </ol>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="font-semibold text-blue-900 mb-3">Default Admin Credentials:</h3>
                  <p className="text-sm text-blue-800 mb-2">
                    <span className="font-mono bg-white px-2 py-1 rounded">Email: admin@test.com</span>
                  </p>
                  <p className="text-sm text-blue-800">
                    <span className="font-mono bg-white px-2 py-1 rounded">Password: test123</span>
                  </p>
                </div>

                <div className="mt-6 flex gap-3">
                  <Button onClick={() => router.push("/login")} className="flex-1 bg-primary hover:bg-primary/90">
                    Login as Admin
                  </Button>
                  <Button onClick={() => router.push("/")} variant="outline" className="flex-1">
                    Back to Home
                  </Button>
                </div>
              </>
            )}
          </Card>
        </div>
      </main>
    </>
  )
}
