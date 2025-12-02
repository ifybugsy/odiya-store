"use client"

import { useRouter } from "next/navigation"
import { useVendorAuth } from "@/lib/vendor-auth-context"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, ArrowLeft, LogOut, RefreshCw, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { useEffect, useState } from "react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export default function ApprovalPendingPage() {
  const { vendor, vendorToken, logoutVendor, refreshVendorAuth } = useVendorAuth()
  const router = useRouter()
  const [checking, setChecking] = useState(false)
  const [statusMessage, setStatusMessage] = useState("")

  useEffect(() => {
    console.log("[v0] Approval Pending - Current vendor:", vendor?.storeName, "Status:", vendor?.status)

    if (vendor?.status === "approved") {
      console.log("[v0] Vendor is already approved, redirecting to dashboard")
      router.push("/vendor/dashboard")
    } else if (!vendor) {
      console.log("[v0] No vendor found, redirecting to login")
      router.push("/vendor/login")
    }

    // Auto-check status every 30 seconds
    const interval = setInterval(() => {
      console.log("[v0] Auto-checking vendor approval status...")
      checkApprovalStatus()
    }, 30000)

    return () => clearInterval(interval)
  }, [vendor, router])

  const checkApprovalStatus = async () => {
    if (!vendorToken || !vendor) {
      console.log("[v0] Cannot check status - missing token or vendor")
      return
    }

    try {
      setChecking(true)
      console.log("[v0] Fetching vendor profile to check approval status from:", `${API_URL}/vendors/my-store/profile`)

      const res = await fetch(`${API_URL}/vendors/my-store/profile`, {
        headers: { Authorization: `Bearer ${vendorToken}` },
      })

      console.log("[v0] Status check response:", res.status)

      if (res.ok) {
        const data = await res.json()
        console.log("[v0] Status check result - Vendor:", data.storeName, "Status:", data.status)

        if (data.status === "approved") {
          console.log("[v0] Vendor has been APPROVED! Updating context and redirecting...")
          setStatusMessage(
            "Congratulations! Your vendor account has been approved. You now have seller permissions to upload items!",
          )

          refreshVendorAuth({
            id: data._id,
            userId: data.userId._id || data.userId,
            storeName: data.storeName,
            storeDescription: data.storeDescription,
            status: "approved",
            email: data.userId?.email || vendor.email,
          })

          if (typeof window !== "undefined") {
            const authData = localStorage.getItem("auth")
            if (authData) {
              try {
                const { token } = JSON.parse(authData)
                // Call token refresh to get updated isSeller status
                const refreshRes = await fetch(`${API_URL}/auth/refresh-token`, {
                  method: "POST",
                  headers: { Authorization: `Bearer ${token}` },
                })

                if (refreshRes.ok) {
                  const refreshData = await refreshRes.json()
                  console.log("[v0] Auth refreshed. User now has isSeller:", refreshData.user.isSeller)
                  // Update localStorage with new token and user data
                  localStorage.setItem(
                    "auth",
                    JSON.stringify({
                      token: refreshData.token,
                      user: refreshData.user,
                    }),
                  )
                }
              } catch (error) {
                console.error("[v0] Failed to refresh auth:", error)
              }
            }
          }

          setTimeout(() => {
            router.push("/vendor/dashboard")
          }, 2000)
        } else if (data.status === "rejected") {
          console.log("[v0] Vendor application was REJECTED")
          setStatusMessage("Your vendor application has been rejected. Please contact support.")

          refreshVendorAuth({
            ...vendor,
            status: "rejected",
          })
        } else if (data.status === "suspended") {
          console.log("[v0] Vendor account has been SUSPENDED")
          setStatusMessage("Your vendor account has been suspended. Please contact support.")

          refreshVendorAuth({
            ...vendor,
            status: "suspended",
          })
        } else {
          console.log("[v0] Vendor still pending approval")
          setStatusMessage("Your application is still under review.")
        }
      } else {
        const errorData = await res.json().catch(() => ({ error: "Unknown error" }))
        console.error("[v0] Status check failed:", res.status, errorData)
        setStatusMessage("Unable to check status. Please try again later.")
      }
    } catch (error) {
      console.error("[v0] Status check error:", error)
      setStatusMessage("Network error. Please check your connection and try again.")
    } finally {
      setChecking(false)
    }
  }

  if (!vendor) {
    return null
  }

  const handleLogout = () => {
    console.log("[v0] Vendor logging out from approval pending page")
    logoutVendor()
    router.push("/vendor/login")
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md p-8">
          <div className="flex justify-center mb-6">
            <div className="relative">
              {vendor.status === "pending" && (
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="w-8 h-8 text-yellow-600 animate-pulse" />
                </div>
              )}
              {vendor.status === "approved" && (
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              )}
              {vendor.status === "rejected" && (
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
              )}
              {vendor.status === "suspended" && (
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-orange-600" />
                </div>
              )}
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center text-foreground mb-2">
            {vendor.status === "pending" && "Pending Approval"}
            {vendor.status === "approved" && "Approved!"}
            {vendor.status === "rejected" && "Application Rejected"}
            {vendor.status === "suspended" && "Account Suspended"}
          </h1>

          {vendor.status === "pending" && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-900">
                Thank you for registering as a vendor. Your application is under review and will be processed within
                24-48 hours. You'll receive an email notification once approved.
              </p>
            </div>
          )}

          {vendor.status === "approved" && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-900">
                Congratulations! Your vendor account has been approved. Redirecting to your dashboard...
              </p>
            </div>
          )}

          {vendor.status === "rejected" && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-900">
                Unfortunately, your vendor application has been rejected. Please contact our support team for more
                information.
              </p>
            </div>
          )}

          {vendor.status === "suspended" && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-orange-900">
                Your vendor account has been suspended. Please contact our support team to resolve this issue.
              </p>
            </div>
          )}

          {statusMessage && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-blue-800">{statusMessage}</p>
            </div>
          )}

          <div className="space-y-3 mb-6 text-sm text-muted-foreground">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0" />
              <p>
                Store Name: <span className="font-semibold text-foreground">{vendor?.storeName}</span>
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0" />
              <p>
                Email: <span className="font-semibold text-foreground">{vendor?.email}</span>
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0" />
              <p>
                Status:{" "}
                <span
                  className={`font-semibold ${
                    vendor.status === "approved"
                      ? "text-green-600"
                      : vendor.status === "pending"
                        ? "text-yellow-600"
                        : vendor.status === "rejected"
                          ? "text-red-600"
                          : "text-orange-600"
                  }`}
                >
                  {vendor.status === "pending" && "Under Review"}
                  {vendor.status === "approved" && "Approved"}
                  {vendor.status === "rejected" && "Rejected"}
                  {vendor.status === "suspended" && "Suspended"}
                </span>
              </p>
            </div>
          </div>

          {vendor.status === "pending" && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-xs text-blue-900 font-medium mb-2">What happens next?</p>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>✓ Our team reviews your application</li>
                <li>✓ We verify your business information</li>
                <li>✓ You receive approval notification via email</li>
                <li>✓ Seller permissions automatically granted</li>
                <li>✓ Access your vendor dashboard immediately</li>
              </ul>
            </div>
          )}

          <div className="space-y-3">
            {vendor.status === "pending" && (
              <Button
                variant="outline"
                className="w-full bg-transparent gap-2"
                onClick={checkApprovalStatus}
                disabled={checking}
              >
                <RefreshCw className={`w-4 h-4 ${checking ? "animate-spin" : ""}`} />
                {checking ? "Checking..." : "Check Status Now"}
              </Button>
            )}
            <Button variant="outline" className="w-full bg-transparent" onClick={() => router.push("/")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return to Home
            </Button>
            <Button variant="destructive" className="w-full" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </Card>
      </main>
      <Footer />
    </>
  )
}
