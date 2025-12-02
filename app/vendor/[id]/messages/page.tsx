"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useVendorAuth } from "@/lib/vendor-auth-context"
import { Send, MessageSquare, User, RefreshCw } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

interface Message {
  _id: string
  message: string
  subject?: string
  sender: string
  buyerId: any
  isRead: boolean
  createdAt: string
}

export default function VendorMessagesPage() {
  const params = useParams()
  const router = useRouter()
  const vendorId = params.id as string
  const { vendor, vendorToken } = useVendorAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [replyText, setReplyText] = useState("")
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (!vendor || !vendorToken) {
      router.push("/vendor/login")
      return
    }

    // Verify the vendor ID matches the logged-in vendor
    if (vendor.id !== vendorId) {
      router.push(`/vendor/${vendor.id}/messages`)
      return
    }
  }, [vendor, vendorToken, vendorId, router])

  useEffect(() => {
    if (vendor && vendorToken) {
      loadMessages()
    }
  }, [vendorId, vendor, vendorToken])

  const loadMessages = async () => {
    if (!vendorToken) return

    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/vendors/${vendorId}/messages`, {
        headers: { Authorization: `Bearer ${vendorToken}` },
      })

      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
      } else {
        console.error("[v0] Failed to load messages:", res.status)
      }
    } catch (error) {
      console.error("[v0] Failed to load messages:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleReplyToMessage = async (messageId: string, buyerId: string) => {
    if (!replyText.trim() || !vendorToken) return

    setSending(true)
    try {
      const res = await fetch(`${API_URL}/vendors/${vendorId}/messages/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${vendorToken}`,
        },
        body: JSON.stringify({
          messageId,
          buyerId,
          message: replyText,
          subject: `Re: ${selectedMessage?.subject || "Your message"}`,
        }),
      })

      if (res.ok) {
        alert("Reply sent successfully!")
        setReplyText("")
        setSelectedMessage(null)
        await loadMessages()
      } else {
        const error = await res.json().catch(() => ({ error: "Failed to send reply" }))
        alert(error.error || "Failed to send reply")
      }
    } catch (error) {
      console.error("[v0] Failed to send reply:", error)
      alert("An error occurred while sending the reply")
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-foreground">Vendor Messages</h1>
            <Button onClick={loadMessages} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Messages List */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Inbox {messages.length > 0 && `(${messages.length})`}
              </h2>
              {messages.length > 0 ? (
                messages.map((message) => (
                  <Card
                    key={message._id}
                    className={`p-4 cursor-pointer transition-all ${
                      selectedMessage?._id === message._id
                        ? "border-primary bg-primary/5"
                        : !message.isRead
                          ? "bg-blue-50 border-blue-200"
                          : "hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedMessage(message)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-foreground truncate">
                            {message.buyerId?.firstName || "Unknown"} {message.buyerId?.lastName || "User"}
                          </h3>
                          {!message.isRead && (
                            <span className="bg-primary text-white text-xs px-2 py-0.5 rounded flex-shrink-0">New</span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground font-medium mb-1 truncate">
                          {message.subject || "No subject"}
                        </p>
                        <p className="text-xs text-muted-foreground">{new Date(message.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="p-12 text-center">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground">No messages yet</p>
                </Card>
              )}
            </div>

            {/* Message Detail & Reply */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">Message Details</h2>
              {selectedMessage ? (
                <Card className="p-6">
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground">
                          {selectedMessage.buyerId?.firstName || "Unknown"}{" "}
                          {selectedMessage.buyerId?.lastName || "User"}
                        </h3>
                        <p className="text-sm text-muted-foreground">{selectedMessage.buyerId?.email || "No email"}</p>
                      </div>
                    </div>

                    <div className="border-t border-border pt-4">
                      <p className="text-sm text-muted-foreground mb-2 font-semibold">
                        Subject: {selectedMessage.subject || "No subject"}
                      </p>
                      <p className="text-xs text-muted-foreground mb-4">
                        {new Date(selectedMessage.createdAt).toLocaleString()}
                      </p>
                      <div className="bg-muted/50 rounded-lg p-4">
                        <p className="text-foreground whitespace-pre-wrap">{selectedMessage.message}</p>
                      </div>
                    </div>
                  </div>

                  {/* Reply Form */}
                  <div className="border-t border-border pt-6">
                    <h4 className="text-sm font-semibold mb-3 text-foreground">Send Reply</h4>
                    <div className="space-y-4">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type your reply here..."
                        className="w-full border border-border rounded-md p-3 min-h-[120px] text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      />

                      <Button
                        onClick={() =>
                          handleReplyToMessage(
                            selectedMessage._id,
                            selectedMessage.buyerId?._id || selectedMessage.buyerId,
                          )
                        }
                        disabled={sending || !replyText.trim()}
                        className="w-full bg-primary hover:bg-primary/90"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        {sending ? "Sending..." : "Send Reply"}
                      </Button>
                    </div>
                  </div>
                </Card>
              ) : (
                <Card className="p-12 text-center">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground">Select a message to view details and reply</p>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
