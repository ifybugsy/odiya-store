"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Package, DollarSign, FileText, User, LogOut } from "lucide-react"
import { useRiderAuth } from "@/lib/rider-auth-context"
import { Button } from "@/components/ui/button"

const navItems = [
  {
    label: "Deliveries",
    href: "/rider/dashboard/deliveries",
    icon: Package,
  },
  {
    label: "Earnings",
    href: "/rider/dashboard/earnings",
    icon: DollarSign,
  },
  {
    label: "Documents",
    href: "/rider/dashboard/documents",
    icon: FileText,
  },
  {
    label: "Profile",
    href: "/rider/dashboard/profile",
    icon: User,
  },
]

export function RiderSidebar() {
  const pathname = usePathname()
  const { logout } = useRiderAuth()

  return (
    <aside className="w-64 border-r border-border bg-sidebar h-screen flex flex-col fixed left-0 top-0 pt-20">
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={cn("w-full justify-start gap-3", isActive && "bg-primary text-primary-foreground")}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Button>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <Button variant="outline" className="w-full justify-start gap-3 bg-transparent" onClick={logout}>
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </aside>
  )
}
