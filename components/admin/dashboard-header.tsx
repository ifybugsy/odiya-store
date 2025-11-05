"use client"

import type { User } from "@/lib/auth-context"
import { Bell, Settings, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import Link from "next/link"

interface DashboardHeaderProps {
  user: User | null
  title: string
  description?: string
}

export default function DashboardHeader({ user, title, description }: DashboardHeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [notificationCount, setNotificationCount] = useState(0)

  useEffect(() => {
    const mockNotifications = [
      { id: 1, message: "New item pending approval", timestamp: new Date() },
      { id: 2, message: "3 new user registrations", timestamp: new Date(Date.now() - 3600000) },
      { id: 3, message: "System backup completed", timestamp: new Date(Date.now() - 7200000) },
    ]
    setNotifications(mockNotifications)
    setNotificationCount(mockNotifications.length)
  }, [])

  return (
    <div className="bg-background border-b border-border px-6 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      <div className="flex items-center gap-2 relative">
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground relative"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell className="w-5 h-5" />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            )}
          </Button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-border rounded-lg shadow-lg z-50">
              <div className="p-4 border-b border-border flex justify-between items-center">
                <h3 className="font-semibold">Notifications ({notificationCount})</h3>
                <button onClick={() => setShowNotifications(false)} className="p-1 hover:bg-muted rounded">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground text-center">
                    <p>No new notifications</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {notifications.map((notif) => (
                      <div key={notif.id} className="p-3 hover:bg-muted/50 transition-colors">
                        <p className="text-sm text-foreground">{notif.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{notif.timestamp.toLocaleTimeString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <Link href="/admin/settings">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <Settings className="w-5 h-5" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
