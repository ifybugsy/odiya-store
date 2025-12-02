"use client"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ShoppingBag, Truck, Building2, ChevronRight } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRiderAuth } from "@/lib/rider-auth-context"
import { useVendorAuth } from "@/lib/vendor-auth-context"

export default function RoleSelectionPage() {
  const { user } = useAuth()
  const { rider } = useRiderAuth()
  const { vendor } = useVendorAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)

  const redirect = searchParams.get("redirect") || null
  const from = searchParams.get("from") || null

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    if (from === "pick-a-ride" || from === "rider-button") {
      if (rider) {
        console.log("[v0] User is already a rider, redirecting to rider dashboard")
        router.push("/rider/dashboard")
        return
      }
      if (user) {
        console.log("[v0] Logged in user from pick-a-ride, redirecting to rider register")
        router.push("/rider/register")
        return
      }
    }

    // If user is already a seller and came from seller button, redirect to become-seller
    if (user && user.isSeller && from === "seller-button") {
      console.log("[v0] User is already a seller, redirecting to become-seller")
      router.push("/become-seller")
    }

    // If vendor is logged in, redirect to vendor dashboard
    if (vendor && from === "vendor-button") {
      console.log("[v0] User is already a vendor, redirecting to vendor dashboard")
      router.push("/vendor/dashboard")
    }
  }, [user, rider, vendor, mounted, from, router])

  if (!mounted) return null

  // If not logged in and has redirect parameter, user came from login
  const showLoginInfo = !user && !rider && redirect

  const handleBecomeSeller = () => {
    if (user) {
      console.log("[v0] Logged in user proceeding to become-seller")
      router.push("/become-seller")
    } else {
      // If unauthenticated, go to login with redirect back to this page
      console.log("[v0] Unauthenticated user redirecting to login, then back to role-selection")
      router.push(`/login?redirect=role-selection&from=seller-button`)
    }
  }

  // CHANGE: added vendor registration handler
  const handleBecomeVendor = () => {
    if (vendor) {
      console.log("[v0] Already a vendor, redirecting to dashboard")
      router.push("/vendor/dashboard")
    } else {
      console.log("[v0] Proceeding to vendor login/registration")
      router.push("/vendor/login")
    }
  }

  const handleBecomeRider = () => {
    if (rider) {
      console.log("[v0] Already a rider, redirecting to dashboard")
      router.push("/rider/dashboard")
    } else if (user) {
      console.log("[v0] Logged in user proceeding to rider register")
      router.push("/rider/register")
    } else {
      // If unauthenticated, go to login with redirect back to this page
      console.log("[v0] Unauthenticated user redirecting to login, then back to role-selection")
      router.push(`/login?redirect=role-selection&from=rider-button`)
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              {user || rider || vendor ? "Choose Your Role" : "Join Odiya Store"}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {user || rider || vendor
                ? "Select how you want to participate in our marketplace"
                : "Create an account and choose your role as a seller, vendor, or rider"}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Seller Option */}
            <Card
              className="p-8 hover:shadow-lg transition-all border-2 border-transparent hover:border-primary cursor-pointer group"
              onClick={handleBecomeSeller}
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <ShoppingBag className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">Become a Seller</h2>
                </div>

                <p className="text-muted-foreground mb-6 flex-grow">
                  List items for sale, manage your inventory, and reach customers across the marketplace
                </p>

                <div className="space-y-3 mb-6">
                  <div className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-green-700">✓</span>
                    </div>
                    <span className="text-sm text-foreground">Upload and manage product listings</span>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-green-700">✓</span>
                    </div>
                    <span className="text-sm text-foreground">Track sales and customer feedback</span>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-green-700">✓</span>
                    </div>
                    <span className="text-sm text-foreground">Receive payments directly to your account</span>
                  </div>
                </div>

                <Button
                  onClick={handleBecomeSeller}
                  className="w-full bg-primary hover:bg-primary/90 h-11 flex items-center justify-center gap-2 group-hover:gap-3 transition-all"
                >
                  Get Started
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </Card>

            {/* CHANGE: added vendor option */}
            {/* Vendor Option */}
            <Card
              className="p-8 hover:shadow-lg transition-all border-2 border-transparent hover:border-secondary cursor-pointer group"
              onClick={handleBecomeVendor}
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                    <Building2 className="w-6 h-6 text-secondary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">Become a Vendor</h2>
                </div>

                <p className="text-muted-foreground mb-6 flex-grow">
                  Create your branded storefront, customize your store, and build customer relationships
                </p>

                <div className="space-y-3 mb-6">
                  <div className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-blue-700">✓</span>
                    </div>
                    <span className="text-sm text-foreground">Customize your branded storefront</span>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-blue-700">✓</span>
                    </div>
                    <span className="text-sm text-foreground">Direct messaging with customers</span>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-blue-700">✓</span>
                    </div>
                    <span className="text-sm text-foreground">Build your brand and customer base</span>
                  </div>
                </div>

                <Button
                  onClick={handleBecomeVendor}
                  className="w-full bg-secondary hover:bg-secondary/90 h-11 flex items-center justify-center gap-2 group-hover:gap-3 transition-all"
                >
                  Get Started
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </Card>

            {/* Rider Option */}
            <Card
              className="p-8 hover:shadow-lg transition-all border-2 border-transparent hover:border-amber-500 cursor-pointer group"
              onClick={handleBecomeRider}
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                    <Truck className="w-6 h-6 text-amber-700" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">Become a Rider</h2>
                </div>

                <p className="text-muted-foreground mb-6 flex-grow">
                  Deliver items for sellers and earn money on your own schedule with flexible delivery opportunities
                </p>

                <div className="space-y-3 mb-6">
                  <div className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-amber-700">✓</span>
                    </div>
                    <span className="text-sm text-foreground">Accept delivery jobs and manage schedule</span>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-amber-700">✓</span>
                    </div>
                    <span className="text-sm text-foreground">Earn money per delivery completed</span>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-amber-700">✓</span>
                    </div>
                    <span className="text-sm text-foreground">Real-time tracking and customer ratings</span>
                  </div>
                </div>

                <Button
                  onClick={handleBecomeRider}
                  className="w-full bg-amber-600 hover:bg-amber-700 h-11 flex items-center justify-center gap-2 group-hover:gap-3 transition-all"
                >
                  Get Started
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </div>

          {/* Info Section */}
          <Card className="p-6 bg-blue-50 border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-3">Can I switch roles later?</h3>
            <p className="text-sm text-blue-800">
              Yes! You can become a seller, vendor, or rider. After completing one registration, you can access the role
              selection page again to register for additional roles.
            </p>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  )
}
