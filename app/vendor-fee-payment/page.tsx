"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { useVendorAuth } from "@/lib/vendor-auth-context"
import { CheckCircle, Copy, AlertCircle } from "lucide-react"

export default function VendorFeePaymentPage() {
  const { user } = useAuth()
  const { vendor, vendorToken } = useVendorAuth()
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </>
    )
  }

  const currentUser = user || vendor
  const displayName = user?.firstName || vendor?.firstName || vendor?.storeName || "Vendor"

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 py-12">
        <div className="max-w-3xl mx-auto px-4">
          <Card className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Monthly Subscription</h1>
              <p className="text-muted-foreground">
                Activate your monthly subscription to unlock premium features and start boosting your store.
              </p>
            </div>

            {/* Fee Information */}
            <div className="bg-primary/5 border-2 border-primary/20 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-medium text-foreground">Monthly Subscription Fee</span>
                <span className="text-3xl font-bold text-primary">₦2,000</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Renews automatically every month. Cancel anytime. Unlock all premium features immediately upon payment.
              </p>
            </div>

            {/* What You Get */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-4">Premium Features Unlocked</h2>
              <div className="space-y-3">
                {[
                  "Boost Your Items - Get more visibility",
                  "Boost Your Store - Featured storefront",
                  "Advanced Analytics - Detailed insights",
                  "Priority Support - Fast response times",
                  "Auto-renewal - Never miss a month",
                  "Ad-free Storefront - Clean experience",
                  "Direct Messaging - Connect with buyers",
                  "Store Customization - Your brand",
                  "Monthly Reports - Sales tracking",
                  "Premium Badge - Stand out as trusted seller",
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Instructions */}
            <div className="border-t border-border pt-6 mb-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Payment Instructions</h2>
              <p className="text-muted-foreground mb-4">
                Transfer ₦2,000 to the account below. Your subscription activates immediately upon payment confirmation.
              </p>

              <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Bank Name</p>
                    <p className="font-semibold text-foreground">UBA</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard("Access Bank")}
                    className="text-primary"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Account Number</p>
                    <p className="font-semibold text-foreground text-xl">1028301845</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard("0727047327")}
                    className="text-primary"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Account Name</p>
                    <p className="font-semibold text-foreground">IFYBUGSY DIGITAL TECHNOLOGIES LIMITED</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard("OPUTA IFEANYICHUKWU CHARLES")}
                    className="text-primary"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-amber-900 mb-1">Payment Reference</p>
                      <p className="text-sm text-amber-800">Purpose: Bugsymart Monthly Subscription - {displayName}</p>
                    </div>
                  </div>
                </div>

                {copied && <div className="text-center text-sm text-green-600 font-medium">Copied to clipboard!</div>}
              </div>
            </div>

            {/* Important Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-900 font-medium mb-2">How It Works</p>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Make payment to the account above</li>
                <li>Premium features unlock immediately after payment</li>
                <li>Automatic monthly renewal on the same date</li>
                <li>You'll get renewal reminders 7 days before expiry</li>
                <li>Cancel anytime, no questions asked</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => router.push("/vendor/dashboard")}
                className="flex-1 bg-primary hover:bg-primary/90 h-12"
              >
                Back to Dashboard
              </Button>
              <Button onClick={() => router.push("/")} variant="outline" className="flex-1 bg-transparent h-12">
                Return to Home
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </>
  )
}
