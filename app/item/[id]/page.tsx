"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Star, MapPin } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export default function ItemPage() {
  const params = useParams()
  const [item, setItem] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showContactForm, setShowContactForm] = useState(false)
  const [contactData, setContactData] = useState({
    senderName: "",
    senderPhone: "",
    senderEmail: "",
    message: "",
  })

  useEffect(() => {
    const loadItem = async () => {
      try {
        const res = await fetch(`${API_URL}/items/${params.id}`)
        const data = await res.json()
        setItem(data)
      } catch (error) {
        console.error("Failed to load item:", error)
      } finally {
        setLoading(false)
      }
    }
    loadItem()
  }, [params.id])

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await fetch(`${API_URL}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: params.id,
          ...contactData,
        }),
      })
      alert("Message sent successfully!")
      setContactData({ senderName: "", senderPhone: "", senderEmail: "", message: "" })
      setShowContactForm(false)
    } catch (error) {
      console.error("Failed to send message:", error)
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </>
    )
  }

  if (!item) {
    return (
      <>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <p className="text-lg text-muted-foreground">Item not found</p>
        </div>
      </>
    )
  }

  const formattedPrice = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(item.price)

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Images */}
            <div className="lg:col-span-2">
              <div className="bg-muted rounded-lg overflow-hidden h-96 flex items-center justify-center mb-4">
                {item.images && item.images.length > 0 ? (
                  <img
                    src={item.images[0] || "/placeholder.svg"}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-muted-foreground">No image available</div>
                )}
              </div>
              {item.images && item.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {item.images.map((img: string, idx: number) => (
                    <div key={idx} className="bg-muted rounded h-20 flex items-center justify-center">
                      <img src={img || "/placeholder.svg"} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div>
              <Card className="p-6 space-y-6">
                <div>
                  <h1 className="text-2xl font-bold mb-2">{item.title}</h1>
                  <p className="text-3xl font-bold text-primary mb-2">{formattedPrice}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {item.location}
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    Condition: <span className="font-semibold">{item.condition}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Views: <span className="font-semibold">{item.views}</span>
                  </p>
                </div>

                {/* Seller Info */}
                <div className="border-t border-border pt-4">
                  <p className="text-sm font-semibold mb-3">Seller Information</p>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
                      {item.sellerId?.firstName[0]}
                      {item.sellerId?.lastName[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">
                        {item.sellerId?.firstName} {item.sellerId?.lastName}
                      </p>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < Math.floor(item.sellerId?.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => setShowContactForm(!showContactForm)}
                  className="w-full bg-primary hover:bg-primary/90 text-white"
                >
                  Contact Seller
                </Button>
              </Card>

              {showContactForm && (
                <Card className="p-6 mt-4">
                  <h3 className="font-semibold mb-4">Send Message</h3>
                  <form onSubmit={handleContactSubmit} className="space-y-3">
                    <Input
                      placeholder="Your Name"
                      value={contactData.senderName}
                      onChange={(e) => setContactData({ ...contactData, senderName: e.target.value })}
                      required
                    />
                    <Input
                      placeholder="Your Phone"
                      value={contactData.senderPhone}
                      onChange={(e) => setContactData({ ...contactData, senderPhone: e.target.value })}
                      required
                    />
                    <Input
                      placeholder="Your Email"
                      type="email"
                      value={contactData.senderEmail}
                      onChange={(e) => setContactData({ ...contactData, senderEmail: e.target.value })}
                      required
                    />
                    <textarea
                      placeholder="Your Message"
                      value={contactData.message}
                      onChange={(e) => setContactData({ ...contactData, message: e.target.value })}
                      className="w-full border border-border rounded-md p-2 text-sm"
                      rows={4}
                      required
                    />
                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                      Send Message
                    </Button>
                  </form>
                </Card>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="mt-8 bg-white rounded-lg p-6 border border-border">
            <h2 className="text-xl font-bold mb-4">Description</h2>
            <p className="text-muted-foreground whitespace-pre-wrap">{item.description}</p>
          </div>
        </div>
      </main>
    </>
  )
}
