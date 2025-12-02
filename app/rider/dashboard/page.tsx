"use client"

import { useRiderAuth } from "@/lib/rider-auth-context"
import { useDeliveries, useRiderEarnings } from "@/lib/rider-hooks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { VerificationStatusCard } from "@/components/rider/verification-status-card"
import { Package, DollarSign, TrendingUp, Star } from "lucide-react"
import UserMessagesPanel from "@/components/user-messages-panel"
import ReferralPanel from "@/components/referral-panel"

export default function RiderDashboardPage() {
  const { rider } = useRiderAuth()
  const { deliveries } = useDeliveries()
  const { totalEarnings } = useRiderEarnings()

  const activeDeliveries = deliveries.filter((d) => d.status === "in_transit" || d.status === "accepted").length

  const stats = [
    {
      label: "Active Deliveries",
      value: activeDeliveries,
      icon: Package,
      color: "text-blue-600",
    },
    {
      label: "Total Earnings",
      value: `₹${totalEarnings.toFixed(2)}`,
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      label: "Completed",
      value: rider?.totalDeliveries || 0,
      icon: TrendingUp,
      color: "text-purple-600",
    },
    {
      label: "Rating",
      value: (rider?.averageRating || 5).toFixed(1),
      icon: Star,
      color: "text-yellow-600",
    },
  ]

  return (
    <div className="space-y-6">
      <VerificationStatusCard />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Referral Section */}
      <Card>
        <CardHeader>
          <CardTitle>Referral Program</CardTitle>
        </CardHeader>
        <CardContent>
          <ReferralPanel />
        </CardContent>
      </Card>

      {/* Messages Section */}
      <Card>
        <CardHeader>
          <CardTitle>Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <UserMessagesPanel />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Welcome, {rider?.fullName}!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {rider?.verificationStatus === "pending"
              ? "Your documents are being verified. You'll be able to accept deliveries once approved."
              : "You're all set! Browse available deliveries and start earning."}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
