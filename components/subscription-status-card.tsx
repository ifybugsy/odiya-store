"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Clock, CheckCircle, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"

interface SubscriptionData {
  subscription: any
  daysUntilExpiry: number
  isExpiring: boolean
  isExpired: boolean
  status: string
  willPromotionBeRemoved: boolean
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export default function SubscriptionStatusCard() {
  const [data, setData] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchSubscriptionStatus()
    const interval = setInterval(fetchSubscriptionStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchSubscriptionStatus = async () => {
    try {
      const stored = localStorage.getItem("vendor_auth")
      let vendorToken = null

      if (stored) {
        try {
          const { token } = JSON.parse(stored)
          vendorToken = token
        } catch (e) {
          console.error("[v0] Failed to parse vendor_auth:", e)
        }
      }

      // Fallback to legacy keys if new format not available
      if (!vendorToken) {
        vendorToken = localStorage.getItem("vendorToken") || localStorage.getItem("authToken")
      }

      if (!vendorToken) {
        setError("Authentication required. Please log in again.")
        setLoading(false)
        return
      }

      const res = await fetch(`${API_URL}/subscriptions/vendor/status`, {
        headers: {
          Authorization: `Bearer ${vendorToken}`,
          "Content-Type": "application/json",
        },
      })

      if (!res.ok) {
        if (res.status === 401) {
          setError("Your session has expired. Please log in again.")
          localStorage.removeItem("vendor_auth")
          localStorage.removeItem("vendorToken")
          localStorage.removeItem("authToken")
        } else if (res.status === 404) {
          setError(null)
          setData({
            subscription: null,
            daysUntilExpiry: 0,
            isExpiring: false,
            isExpired: true,
            status: "not_active",
            willPromotionBeRemoved: false,
          })
        } else {
          const err = await res.json().catch(() => ({ error: "Unknown error" }))
          setError(err.error || "Failed to load subscription")
        }
        return
      }

      const data = await res.json()
      setData(data)
      setError(null)
    } catch (err: any) {
      console.error("[v0] Subscription fetch error:", err)
      setError("Unable to connect to server. Please check your connection.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-24 bg-gray-300 rounded"></div>
          <div className="h-3 w-40 bg-gray-200 rounded"></div>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-6 bg-red-50 border border-red-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-900">Subscription Error</p>
            <p className="text-xs text-red-800 mt-1">{error}</p>
            <Button size="sm" variant="outline" onClick={fetchSubscriptionStatus} className="mt-2 bg-white">
              <RefreshCw className="w-3 h-3 mr-1" />
              Retry
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  if (!data || !data.subscription) {
    return (
      <Card className="p-6 bg-amber-50 border border-amber-200">
        <div className="flex items-center justify-between flex-col sm:flex-row gap-4">
          <div className="flex items-start gap-3 flex-1">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-900">Monthly Subscription Required</p>
              <p className="text-xs text-amber-800 mt-1">
                Activate a monthly subscription plan to start boosting your store and accessing premium features.
                Automatic monthly renewal available.
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push("/vendor-fee-payment")}
            className="inline-flex items-center justify-center px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md font-medium text-sm whitespace-nowrap transition-colors"
          >
            Activate Plan
          </button>
        </div>
      </Card>
    )
  }

  const { subscription, daysUntilExpiry, isExpiring, isExpired, willPromotionBeRemoved } = data

  return (
    <Card
      className={`p-6 border-2 ${
        isExpired
          ? "bg-red-50 border-red-300"
          : isExpiring
            ? "bg-yellow-50 border-yellow-300"
            : "bg-green-50 border-green-300"
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            {isExpired ? (
              <>
                <AlertCircle className="w-5 h-5 text-red-600" />
                Subscription Expired
              </>
            ) : isExpiring ? (
              <>
                <Clock className="w-5 h-5 text-yellow-600" />
                Subscription Expiring Soon
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 text-green-600" />
                Active Subscription
              </>
            )}
          </h3>
        </div>
        <Badge
          variant={isExpired ? "destructive" : isExpiring ? "secondary" : "default"}
          className={isExpired ? "bg-red-600" : isExpiring ? "bg-yellow-600 text-white" : "bg-green-600 text-white"}
        >
          {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
        </Badge>
      </div>

      <div className="space-y-2 mb-4 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Plan:</span>
          <span className="font-semibold">{subscription.planName || "Standard Plan"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Monthly Fee:</span>
          <span className="font-semibold">₦{subscription.amount?.toLocaleString() || "2,000"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Expiry Date:</span>
          <span className="font-semibold">{new Date(subscription.expiryDate).toLocaleDateString("en-NG")}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Days Remaining:</span>
          <span
            className={`font-semibold ${
              isExpired ? "text-red-600" : isExpiring ? "text-yellow-600" : "text-green-600"
            }`}
          >
            {Math.max(0, daysUntilExpiry)} days
          </span>
        </div>
      </div>

      {willPromotionBeRemoved && isExpired && (
        <div className="bg-red-100 border border-red-300 rounded-lg p-3 mb-4 text-sm">
          <p className="text-red-900 font-semibold mb-1">Promotion Will Be Removed</p>
          <p className="text-red-800">Your vendor promotion will be removed when your subscription expires.</p>
        </div>
      )}

      {isExpiring && !isExpired && (
        <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3 mb-4 text-sm">
          <p className="text-yellow-900 font-semibold mb-1">Renew Your Subscription</p>
          <p className="text-yellow-800">
            Your subscription is expiring in {daysUntilExpiry} days. Renew now to avoid interruption.
          </p>
        </div>
      )}

      <div className="flex gap-2">
        <Button className="flex-1 bg-primary hover:bg-primary/90" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Renew Subscription
        </Button>
        {isExpired && (
          <Button variant="outline" size="sm" className="flex-1 bg-transparent">
            View Renewal Options
          </Button>
        )}
      </div>
    </Card>
  )
}
