"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Menu, X, LogOut } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useWishlist } from "@/lib/wishlist-context"
import { useRiderAuth } from "@/lib/rider-auth-context"
import { useBuyerAuth } from "@/lib/buyer-auth-context"
import NewsTicker from "@/components/news-ticker"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuth()
  const { rider, logout: riderLogout } = useRiderAuth()
  const { buyer, logout: buyerLogout } = useBuyerAuth()
  const { savedItems } = useWishlist()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/")
    setIsOpen(false)
  }

  const handleRiderLogout = () => {
    riderLogout()
    router.push("/")
    setIsOpen(false)
  }

  const handleBuyerLogout = () => {
    buyerLogout()
    router.push("/")
    setIsOpen(false)
  }

  const handleBecomeSeller = () => {
    router.push("/login")
    setIsOpen(false)
  }

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/bugsymat-logo.png"
                alt="Bugsymat.shop - Buy & Sell Online"
                width={280}
                height={92}
                className="h-12 sm:h-18 md:h-20 w-auto"
                priority
              />
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-4">
              <Link href="/saved-items" className="text-foreground hover:text-primary transition relative">
                {savedItems.length > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {savedItems.length > 9 ? "9+" : savedItems.length}
                  </span>
                )}
              </Link>

              {user ? (
                <>
                  <Link href="/dashboard" className="text-foreground hover:text-primary transition">
                    Dashboard
                  </Link>
                  {user.isSeller && (
                    <Link href="/seller/store" className="text-foreground hover:text-primary transition">
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
              ) : rider ? (
                <>
                  <Link href="/rider/dashboard" className="text-foreground hover:text-primary transition">
                    Rider Dashboard
                  </Link>
                  <Button onClick={handleRiderLogout} variant="outline" size="sm">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : buyer ? (
                <>
                  <Link href="/buyer/dashboard" className="text-foreground hover:text-primary transition">
                    Find Rides
                  </Link>
                  <Button onClick={handleBuyerLogout} variant="outline" size="sm">
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

              {/* 
              <Button
                onClick={handlePickARide}
                size="sm"
                variant="outline"
                className="flex items-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200"
              >
                <Truck className="w-4 h-4" />
                <span className="hidden lg:inline">Pick a Ride</span>
                <span className="lg:hidden">Ride</span>
              </Button>
              */}

              {/* 
              {!user && !rider && !buyer && (
                <Button
                  onClick={handleBecomeRider}
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-2 bg-transparent"
                >
                  <Truck className="w-4 h-4" />
                  <span className="hidden lg:inline">Become a Rider</span>
                </Button>
              )}
              */}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-2">
              <Link href="/saved-items" className="text-foreground hover:text-primary transition relative p-2">
                {savedItems.length > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {savedItems.length > 9 ? "9+" : savedItems.length}
                  </span>
                )}
              </Link>
              <button onClick={() => setIsOpen(!isOpen)} className="p-2">
                {isOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isOpen && (
            <div className="md:hidden pb-4 border-t border-border">
              <Link
                href="/saved-items"
                onClick={() => setIsOpen(false)}
                className="block py-2 px-4 text-foreground hover:bg-muted rounded flex items-center gap-2"
              >
                {savedItems.length > 0 && <span className="text-red-500 font-bold">•</span>}
                Saved Items {savedItems.length > 0 && `(${savedItems.length})`}
              </Link>
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
                      href="/seller/store"
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
              ) : rider ? (
                <>
                  <Link
                    href="/rider/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="block py-2 px-4 text-foreground hover:bg-muted rounded"
                  >
                    Rider Dashboard
                  </Link>
                  <button
                    onClick={handleRiderLogout}
                    className="w-full text-left py-2 px-4 text-foreground hover:bg-muted rounded flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : buyer ? (
                <>
                  <Link
                    href="/buyer/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="block py-2 px-4 text-foreground hover:bg-muted rounded"
                  >
                    Find Rides
                  </Link>
                  <button
                    onClick={handleBuyerLogout}
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

              {/* 
              <button
                onClick={handlePickARide}
                className="w-full text-left py-2 px-4 text-amber-900 bg-amber-50 hover:bg-amber-100 rounded mt-2 flex items-center gap-2 border border-amber-200"
              >
                <Truck className="w-4 h-4" />
                Pick a Ride
              </button>
              */}

              {/* 
              {!user && !rider && !buyer && (
                <button
                  onClick={handleBecomeRider}
                  className="w-full text-left py-2 px-4 text-foreground hover:bg-muted rounded mt-2 flex items-center gap-2"
                >
                  <Truck className="w-4 h-4" />
                  Become a Rider
                </button>
              )}
              */}
            </div>
          )}
        </div>
      </nav>
      <NewsTicker />
    </>
  )
}
