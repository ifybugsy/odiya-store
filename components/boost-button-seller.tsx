"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { TrendingUp, Copy, X, CheckCircle, AlertCircle, MessageCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

interface BoostButtonSellerProps {
  itemId: string
  isPromoted?: boolean
  onBoostSuccess?: () => void
}

export default function BoostButtonSeller({ itemId, isPromoted, onBoostSuccess }: BoostButtonSellerProps) {
  const { user } = useAuth()
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [paymentData, setPaymentData] = useState<any>(null)
  const [copied, setCopied] = useState(false)

  const handleBoostClick = async () => {
    if (!user) {
      alert("Please login to boost your item")
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/payments/boost/seller`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          itemId: itemId,
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
      console.error("[v0] Boost payment error:", error)
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
    const whatsappNumber = "2349160007661"
    const message = encodeURIComponent(
      `Hi, I have completed the item boost payment of ₦150. Payment Reference: ${paymentData?.payment?._id || "N/A"}. Item ID: ${itemId}. Please activate my item promotion.`,
    )
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`
    window.open(whatsappUrl, "_blank")

    setShowPaymentModal(false)
    if (onBoostSuccess) onBoostSuccess()
  }

  if (isPromoted) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
        <CheckCircle className="w-4 h-4" />
        Boosted
      </div>
    )
  }

  return (
    <>
      <Button
        onClick={handleBoostClick}
        disabled={loading}
        className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold flex items-center gap-2"
      >
        <TrendingUp className="w-4 h-4" />
        {loading ? "Processing..." : "Boost Item (₦150)"}
      </Button>

      {showPaymentModal && paymentData && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-4 right-4 p-1 hover:bg-muted rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Boost Your Item</h2>
              <p className="text-muted-foreground text-sm">
                Pay ₦150 to promote your item and reach more buyers for 30 days!
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-lg p-4 mb-6 border-2 border-orange-200">
              <h3 className="font-semibold text-lg mb-3 text-center">Bank Transfer Details</h3>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wide block mb-1">
                    Account Number
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      readOnly
                      value={paymentData.bankDetails.accountNumber}
                      className="flex-1 px-3 py-2 border rounded-md font-mono font-bold text-lg bg-white"
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
                    className="w-full px-3 py-2 border rounded-md font-semibold bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wide block mb-1">
                    Bank Name
                  </label>
                  <input
                    readOnly
                    value={paymentData.bankDetails.bankName}
                    className="w-full px-3 py-2 border rounded-md font-semibold bg-white"
                  />
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                  <p className="text-xs font-semibold text-yellow-900">Purpose: {paymentData.bankDetails.purpose}</p>
                </div>
              </div>

              {copied && (
                <div className="mt-3 text-center text-sm text-green-600 font-medium">Copied to clipboard!</div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-1">After Payment:</p>
                  <ul className="text-xs space-y-1 list-disc list-inside">
                    <li>Your item will be promoted automatically</li>
                    <li>It will appear first in search results</li>
                    <li>Promotion lasts for 30 days</li>
                    <li>Reach more buyers and sell faster!</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleWhatsAppConfirmation}
                className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 flex items-center justify-center gap-2"
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
                className="w-full"
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
