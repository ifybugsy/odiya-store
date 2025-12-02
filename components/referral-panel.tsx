"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Share2, Users, Loader } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useBuyerAuth } from "@/lib/buyer-auth-context"
import { useVendorAuth } from "@/lib/vendor-auth-context"
import { useRiderAuth } from "@/lib/rider-auth-context"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

interface ReferralStats {
  referralCode: string | null
  referralLink: string | null
  totalReferrals: number
  totalEarnings: number
  pendingEarnings: number
  paidEarnings: number
  referrals: any[]
  commissions: any[]
}

export default function ReferralPanel() {
  const { user, token } = useAuth()
  const { buyer, token: buyerToken } = useBuyerAuth()
  const { vendor, vendorToken } = useVendorAuth()
  const { rider, riderToken } = useRiderAuth()

  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [retrying, setRetrying] = useState(false)
  const [copied, setCopied] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currentUser = user || buyer || vendor || rider
  const currentToken = token || buyerToken || vendorToken || riderToken

  useEffect(() => {
    if (currentUser && currentToken) {
      loadReferralStats()
    }
  }, [currentUser, currentToken])

  const loadReferralStats = async () => {
    if (!currentToken) {
      setError("Not authenticated")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`${API_URL}/referrals/my-stats`, {
        headers: {
          Authorization: `Bearer ${currentToken}`,
          "Content-Type": "application/json",
        },
      })

      if (res.ok) {
        const data = await res.json()
        setStats(data)

        if (!data.referralCode) {
          await generateReferralCode()
        }
      } else if (res.status === 401) {
        setError("Session expired. Please log in again.")
      } else if (res.status === 500) {
        setError("Server error. Please try again in a moment.")
      } else {
        const errorData = await res.json().catch(() => ({ error: "Failed to load referral stats" }))
        setError(errorData.error || "Failed to load referral stats")
      }
    } catch (error) {
      console.error("[v0] Failed to load referral stats:", error)
      setError("Unable to load referral data. Please check your connection.")
    } finally {
      setLoading(false)
    }
  }

  const generateReferralCode = async () => {
    if (!currentToken) return

    setGenerating(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/referrals/generate-code`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${currentToken}`,
          "Content-Type": "application/json",
        },
      })

      if (res.ok) {
        await loadReferralStats()
      } else {
        const errorData = await res.json().catch(() => ({ error: "Failed to generate code" }))
        setError(errorData.error || "Failed to generate referral code")
      }
    } catch (error) {
      console.error("[v0] Failed to generate referral code:", error)
      setError("Unable to generate referral code. Please try again.")
    } finally {
      setGenerating(false)
    }
  }

  const copyReferralLink = () => {
    if (stats?.referralLink) {
      navigator.clipboard.writeText(stats.referralLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const shareReferralLink = async () => {
    if (stats?.referralLink && navigator.share) {
      try {
        await navigator.share({
          title: "Join Bugsymart with my referral link!",
          text: "Sign up using my link and I'll earn 10% commission when you boost items!",
          url: stats.referralLink,
        })
      } catch (error) {
        console.error("[v0] Share failed:", error)
        copyReferralLink()
      }
    } else {
      copyReferralLink()
    }
  }

  if (!currentUser) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-muted-foreground">Please log in to view referrals</p>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-destructive mb-4">{error}</p>
          <div className="flex gap-2 justify-center">
            <Button
              onClick={() => {
                setRetrying(true)
                loadReferralStats().finally(() => setRetrying(false))
              }}
              variant="outline"
              disabled={retrying}
            >
              {retrying ? <Loader className="w-4 h-4 animate-spin mr-2" /> : null}
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Coming Soon Section */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-2 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-blue-600" />
            Referral Program
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Badge className="bg-blue-600 text-white mb-4 text-base px-4 py-2">Coming Soon!</Badge>
            <p className="text-muted-foreground text-lg font-medium">
              The referral program is coming soon. Stay tuned for exciting ways to earn rewards!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
