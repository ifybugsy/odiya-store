"use client"

import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Package,
  Users,
  Settings,
  TrendingUp,
  ShoppingBag,
  Star,
  MessageSquare,
  Gift,
  ArrowLeft,
} from "lucide-react"
import Link from "next/link"

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const menuItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/items", label: "Items", icon: Package },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/vendors", label: "Vendors", icon: ShoppingBag },
    { href: "/admin/boosts", label: "Boost Requests", icon: TrendingUp },
    { href: "/admin/messages", label: "Messages", icon: MessageSquare },
    { href: "/admin/ratings", label: "Ratings", icon: Star },
    { href: "/admin/referrals", label: "Referrals", icon: Gift },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ]

  return (
    <aside className="w-64 bg-card border-r border-border h-screen sticky top-0 flex flex-col">
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-bold text-foreground">Admin Panel</h2>
      </div>

      {pathname !== "/admin" && (
        <div className="px-4 pt-4">
          <Button variant="outline" onClick={() => router.back()} className="w-full justify-start gap-2 mb-2">
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
        </div>
      )}

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer ${
                  isActive
                    ? "bg-primary text-white shadow-md"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </div>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <Link href="/">
          <Button variant="outline" className="w-full bg-transparent">
            Back to Site
          </Button>
        </Link>
      </div>
    </aside>
  )
}
