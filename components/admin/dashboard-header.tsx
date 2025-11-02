"use client"

import type { User } from "@/lib/auth-context"
import { Bell, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DashboardHeaderProps {
  user: User | null
  title: string
  description?: string
}

export default function DashboardHeader({ user, title, description }: DashboardHeaderProps) {
  return (
    <div className="bg-background border-b border-border px-6 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Bell className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Settings className="w-5 h-5" />
        </Button>
      </div>
    </div>
  )
}
