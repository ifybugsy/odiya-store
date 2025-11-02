"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { MessageCircle } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export default function SellerPage() {
  const { user, token } = useAuth()
  const router = useRouter()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState<any>(null)
  const [response, setResponse] = useState("")

  useEffect(() => {
    if (!user?.isSeller || !token) {
      router.push("/")
      return
    }

    loadMessages()
  }, [user, token, router])

  const loadMessages = async () => {
    try {
      const res = await fetch(`${API_URL}/messages/seller/${user?.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setMessages(await res.json())
      }
    } catch (error) {
      console.error("Failed to load messages:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRespond = async () => {
    if (!response.trim() || !selectedMessage) return

    try {
      await fetch(`${API_URL}/messages/${selectedMessage._id}/respond`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ response }),
      })
      setResponse("")
      setSelectedMessage(null)
      loadMessages()
    } catch (error) {
      console.error("Failed to send response:", error)
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

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
            <MessageCircle className="w-8 h-8" />
            Messages from Buyers
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Messages List */}
            <div className="lg:col-span-1">
              {messages.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No messages yet</p>
                </Card>
              ) : (
                <div className="space-y-2">
                  {messages.map((msg) => (
                    <Card
                      key={msg._id}
                      onClick={() => setSelectedMessage(msg)}
                      className={`p-4 cursor-pointer transition ${
                        selectedMessage?._id === msg._id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                      }`}
                    >
                      <p className="font-semibold text-sm">{msg.senderName}</p>
                      <p className="text-xs text-muted-foreground">{msg.itemId?.title}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{msg.message}</p>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Message Details */}
            <div className="lg:col-span-2">
              {selectedMessage ? (
                <Card className="p-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-bold mb-2">{selectedMessage.senderName}</h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="font-medium">Item:</span> {selectedMessage.itemId?.title}
                      </p>
                      <p>
                        <span className="font-medium">Phone:</span> {selectedMessage.senderPhone}
                      </p>
                      <p>
                        <span className="font-medium">Email:</span> {selectedMessage.senderEmail}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4 mb-6">
                    <p className="font-medium text-sm mb-2">Message:</p>
                    <p className="text-muted-foreground whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>

                  {selectedMessage.sellerResponse && (
                    <div className="bg-green-50 border border-green-200 rounded p-4 mb-6">
                      <p className="font-medium text-sm text-green-900 mb-2">Your Response:</p>
                      <p className="text-green-800 text-sm">{selectedMessage.sellerResponse}</p>
                    </div>
                  )}

                  {!selectedMessage.sellerResponse && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Send Response</label>
                      <textarea
                        value={response}
                        onChange={(e) => setResponse(e.target.value)}
                        placeholder="Type your response..."
                        className="w-full border border-border rounded-md p-2 mb-3"
                        rows={4}
                      />
                      <Button onClick={handleRespond} className="bg-primary hover:bg-primary/90">
                        Send Response
                      </Button>
                    </div>
                  )}
                </Card>
              ) : (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">Select a message to view details</p>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
