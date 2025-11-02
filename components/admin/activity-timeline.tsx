"use client"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { ShoppingBag, LogIn, Eye, MessageCircle, Star, User } from "lucide-react"

interface Activity {
  _id: string
  userId: string
  userName: string
  type: "purchase" | "login" | "view" | "review" | "message"
  title: string
  description: string
  timestamp: string
  metadata?: Record<string, any>
}

interface ActivityTimelineProps {
  activities: Activity[]
}

export default function ActivityTimeline({ activities }: ActivityTimelineProps) {
  const getActivityIcon = (type: string) => {
    const iconClass = "w-4 h-4"
    switch (type) {
      case "purchase":
        return <ShoppingBag className={iconClass} />
      case "login":
        return <LogIn className={iconClass} />
      case "view":
        return <Eye className={iconClass} />
      case "review":
        return <Star className={iconClass} />
      case "message":
        return <MessageCircle className={iconClass} />
      default:
        return <User className={iconClass} />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case "purchase":
        return "bg-green-100 text-green-800"
      case "login":
        return "bg-blue-100 text-blue-800"
      case "view":
        return "bg-purple-100 text-purple-800"
      case "review":
        return "bg-yellow-100 text-yellow-800"
      case "message":
        return "bg-pink-100 text-pink-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getActivityLabel = (type: string) => {
    const labels: Record<string, string> = {
      purchase: "Purchase",
      login: "Login",
      view: "View",
      review: "Review",
      message: "Message",
    }
    return labels[type] || "Activity"
  }

  if (activities.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground text-lg">No activity found</p>
        <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters</p>
      </Card>
    )
  }

  return (
    <div className="space-y-0 border border-border rounded-lg overflow-hidden">
      {activities.map((activity, index) => (
        <div
          key={activity._id}
          className={`p-4 flex gap-4 hover:bg-muted/50 transition-colors ${
            index !== activities.length - 1 ? "border-b border-border" : ""
          }`}
        >
          {/* Timeline Icon */}
          <div className="flex flex-col items-center gap-2">
            <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
              {getActivityIcon(activity.type)}
            </div>
            {index !== activities.length - 1 && <div className="w-0.5 h-12 bg-border" />}
          </div>

          {/* Activity Details */}
          <div className="flex-1 pt-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold text-foreground">{activity.title}</p>
              <Badge className={getActivityColor(activity.type)} variant="outline">
                {getActivityLabel(activity.type)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{activity.description}</p>
            <div className="mt-2 flex items-center gap-4">
              <p className="text-xs text-muted-foreground">By: {activity.userName}</p>
              <p className="text-xs text-muted-foreground">{new Date(activity.timestamp).toLocaleString()}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
