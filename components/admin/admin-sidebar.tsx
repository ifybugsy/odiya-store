"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Package,
  Users,
  Star,
  TrendingUp,
  Settings,
  LogOut,
  Truck,
  MessageSquare,
  Store,
  AlertCircle,
  CreditCard,
  Shield,
} from "lucide-react"

interface AdminSidebarProps {
  onLogout: () => void
}

export default function AdminSidebar({ onLogout }: AdminSidebarProps) {
  const pathname = usePathname()

  const menuItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/items-management", label: "Item Management", icon: Package },
    { href: "/admin/sellers", label: "Sellers", icon: Users },
    { href: "/admin/vendors", label: "Vendors", icon: Store },
    { href: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
    { href: "/admin/admins", label: "Admin Management", icon: Shield },
    { href: "/admin/boosts", label: "Boost Requests", icon: TrendingUp },
    { href: "/admin/messages", label: "Messages", icon: MessageSquare },
    { href: "/admin/ratings", label: "Ratings & Reviews", icon: Star },
    { href: "/admin/riders", label: "Rider Management", icon: Truck },
    { href: "/admin/activity", label: "Activity Tracking", icon: AlertCircle },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ]

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border h-screen sticky top-0 flex flex-col">
      {/* Logo/Branding */}
      <div className="p-6 border-b border-sidebar-border">
        <h2 className="text-lg font-bold text-sidebar-foreground">Admin Panel</h2>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start gap-3 ${
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Button>
            </Link>
          )
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-sidebar-border">
        <Button
          onClick={onLogout}
          variant="outline"
          className="w-full justify-start gap-2 text-sidebar-foreground bg-transparent"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </Button>
      </div>
    </aside>
  )
}
