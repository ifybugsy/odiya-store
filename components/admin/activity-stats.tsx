"use client"

import { Card } from "@/components/ui/card"
import { TrendingUp, ShoppingBag, Users, MessageCircle } from "lucide-react"

interface ActivityStatsProps {
  totalActivities: number
  purchasesCount: number
  activeUsers: number
  messagesCount: number
  trend?: {
    value: number
    isPositive: boolean
  }
}

export default function ActivityStats({
  totalActivities,
  purchasesCount,
  activeUsers,
  messagesCount,
  trend,
}: ActivityStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">Total Activities</p>
            <p className="text-3xl font-bold text-foreground mt-2">{totalActivities}</p>
            {trend && (
              <p className={`text-xs font-medium mt-2 ${trend.isPositive ? "text-green-600" : "text-red-600"}`}>
                {trend.isPositive ? "+" : ""}
                {trend.value}% from last period
              </p>
            )}
          </div>
          <TrendingUp className="w-8 h-8 text-muted-foreground/50" />
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">Purchases</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{purchasesCount}</p>
          </div>
          <ShoppingBag className="w-8 h-8 text-green-600/50" />
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">Active Users</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{activeUsers}</p>
          </div>
          <Users className="w-8 h-8 text-blue-600/50" />
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">Messages</p>
            <p className="text-3xl font-bold text-pink-600 mt-2">{messagesCount}</p>
          </div>
          <MessageCircle className="w-8 h-8 text-pink-600/50" />
        </div>
      </Card>
    </div>
  )
}
