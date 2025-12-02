"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { TrendingUp, Copy, X, CheckCircle, Store, MessageCircle } from "lucide-react"
import { useVendorAuth } from "@/lib/vendor-auth-context"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

interface BoostButtonVendorProps {
  vendorId: string
  isPromoted?: boolean
  onBoostSuccess?: () => void
}

export default function BoostButtonVendor({ vendorId, isPromoted, onBoostSuccess }: BoostButtonVendorProps) {
  const { vendor } = useVendorAuth()
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [paymentData, setPaymentData] = useState<any>(null)
  const [copied, setCopied] = useState(false)

  const handleBoostClick = async () => {
    if (!vendor) {
      alert("Please login as vendor to boost your store")
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/payments/boost/vendor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: vendor.userId,
          vendorId: vendorId,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setPaymentData(data)
        setShowPaymentModal(true)
      } else {
        alert("Failed to create boost payment. Please try again.")
      }
    } catch (error) {
      console.error("[v0] Vendor boost payment error:", error)
      alert("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleWhatsAppConfirmation = () => {
    const whatsappNumber = "2349160007661" // Format: country code + number without +
    const message = encodeURIComponent(
      `Hi, I have completed the vendor boost payment of ₦2,000 for ${vendor?.storeName || "my store"}. Payment Reference: ${paymentData?.payment?._id || "N/A"}. Please activate my premium vendor status.`,
    )
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`
    window.open(whatsappUrl, "_blank")

    setShowPaymentModal(false)
    if (onBoostSuccess) onBoostSuccess()
  }

  if (isPromoted) {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 rounded-lg font-semibold border-2 border-green-300">
        <CheckCircle className="w-5 h-5" />
        Premium Vendor
      </div>
    )
  }

  return (
    <>
      <Button
        onClick={handleBoostClick}
        disabled={loading}
        size="lg"
        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold flex items-center gap-2 shadow-lg"
      >
        <Store className="w-5 h-5" />
        {loading ? "Processing..." : "Boost Store (₦2,000)"}
      </Button>

      {showPaymentModal && paymentData && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full p-8 relative animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-4 right-4 p-1 hover:bg-muted rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Store className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Boost Your Vendor Store</h2>
              <p className="text-muted-foreground">
                Pay ₦2,000 to become a Premium Vendor and get priority visibility for 30 days!
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-5 mb-6 border-2 border-purple-200">
              <h3 className="font-semibold text-lg mb-4 text-center">Bank Transfer Details</h3>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wide block mb-1">
                    Account Number
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      readOnly
                      value={paymentData.bankDetails.accountNumber}
                      className="flex-1 px-4 py-3 border rounded-md font-mono font-bold text-xl bg-white"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(paymentData.bankDetails.accountNumber)}
                      className="bg-white"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wide block mb-1">
                    Account Name
                  </label>
                  <input
                    readOnly
                    value={paymentData.bankDetails.accountName}
                    className="w-full px-4 py-3 border rounded-md font-semibold bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wide block mb-1">
                    Bank Name
                  </label>
                  <input
                    readOnly
                    value={paymentData.bankDetails.bankName}
                    className="w-full px-4 py-3 border rounded-md font-semibold bg-white"
                  />
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                  <p className="text-sm font-semibold text-yellow-900">Purpose: {paymentData.bankDetails.purpose}</p>
                </div>
              </div>

              {copied && (
                <div className="mt-3 text-center text-sm text-green-600 font-medium">Copied to clipboard!</div>
              )}
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg p-5 mb-6">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-purple-900">
                  <p className="font-bold mb-2 text-base">Premium Vendor Benefits:</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Your store appears first in vendor listings</li>
                    <li>Priority visibility in search results</li>
                    <li>Special "Premium Vendor" badge</li>
                    <li>Increased customer trust and sales</li>
                    <li>30-day premium promotion period</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleWhatsAppConfirmation}
                className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-lg py-6 flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Send Payment Proof via WhatsApp
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                After payment, send your receipt to 09160007661 via WhatsApp for instant activation
              </p>

              <Button
                onClick={() => {
                  setShowPaymentModal(false)
                  if (onBoostSuccess) onBoostSuccess()
                }}
                variant="outline"
                className="w-full py-6"
              >
                I'll Send Receipt Later
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  )
}
