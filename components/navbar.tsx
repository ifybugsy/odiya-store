"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Menu, X, LogOut } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/")
    setIsOpen(false)
  }

  const handleBecomeSeller = () => {
    if (user) {
      router.push("/become-seller")
    } else {
      router.push("/login?redirect=become-seller")
    }
    setIsOpen(false)
  }

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/odiya-logo.png"
              alt="Odiya Store - Buy & Sell Online"
              width={280}
              height={92}
              className="h-20 sm:h-28 md:h-36 w-auto"
              priority
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <Link href="/dashboard" className="text-foreground hover:text-primary transition">
                  Dashboard
                </Link>
                {user.isSeller && (
                  <Link href="/seller" className="text-foreground hover:text-primary transition">
                    My Store
                  </Link>
                )}
                {user.isAdmin && (
                  <Link href="/admin" className="text-foreground hover:text-primary transition">
                    Admin
                  </Link>
                )}
                <Button onClick={handleLogout} variant="outline" size="sm">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Button onClick={handleBecomeSeller} size="sm" className="bg-primary hover:bg-primary/90">
                  Become a Seller
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2">
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 border-t border-border">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="block py-2 px-4 text-foreground hover:bg-muted rounded"
                >
                  Dashboard
                </Link>
                {user.isSeller && (
                  <Link
                    href="/seller"
                    onClick={() => setIsOpen(false)}
                    className="block py-2 px-4 text-foreground hover:bg-muted rounded"
                  >
                    My Store
                  </Link>
                )}
                {user.isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setIsOpen(false)}
                    className="block py-2 px-4 text-foreground hover:bg-muted rounded"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full text-left py-2 px-4 text-foreground hover:bg-muted rounded flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="block py-2 px-4 text-foreground hover:bg-muted rounded"
                >
                  Login
                </Link>
                <button
                  onClick={handleBecomeSeller}
                  className="w-full text-left py-2 px-4 text-white bg-primary hover:bg-primary/90 rounded mt-2"
                >
                  Become a Seller
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
