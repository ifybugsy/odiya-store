"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Send, User, RefreshCw } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

interface Message {
  _id: string
  conversationId: string
  senderId: any
  receiverId: any
  subject: string
  message: string
  isRead: boolean
  createdAt: string
}

interface Conversation {
  _id: string
  conversationId: string
  senderId: any
  receiverId: any
  subject: string
  message: string
  isRead: boolean
  createdAt: string
}

export default function UserMessagesPanel() {
  const { user, token } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [replyText, setReplyText] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (user && token) {
      loadConversations()
      loadUnreadCount()
    }
  }, [user, token])

  const loadConversations = async () => {
    if (!token) return

    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/user-messages/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        const data = await res.json()
        setConversations(data.conversations || [])
      }
    } catch (error) {
      console.error("[v0] Failed to load conversations:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadUnreadCount = async () => {
    if (!token) return

    try {
      const res = await fetch(`${API_URL}/user-messages/unread-count`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        const data = await res.json()
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (error) {
      console.error("[v0] Failed to load unread count:", error)
    }
  }

  const loadConversationMessages = async (conversation: Conversation) => {
    if (!token) return

    try {
      setSelectedConversation(conversation)
      const res = await fetch(`${API_URL}/user-messages/conversation/${conversation.conversationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
        await loadUnreadCount()
      }
    } catch (error) {
      console.error("[v0] Failed to load conversation messages:", error)
    }
  }

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedConversation || !token) return

    setSending(true)
    try {
      const otherUser =
        selectedConversation.senderId._id === user?.id ? selectedConversation.receiverId : selectedConversation.senderId

      const res = await fetch(`${API_URL}/user-messages/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiverId: otherUser._id,
          conversationId: selectedConversation.conversationId,
          message: replyText,
        }),
      })

      if (res.ok) {
        setReplyText("")
        await loadConversationMessages(selectedConversation)
        await loadConversations()
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

  if (!user) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-muted-foreground">Please log in to view messages</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Conversations List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>Messages</CardTitle>
            {unreadCount > 0 && <Badge className="bg-red-500 text-white">{unreadCount}</Badge>}
          </div>
          <Button onClick={loadConversations} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : conversations.length > 0 ? (
            <div className="space-y-2">
              {conversations.map((conv) => {
                const otherUser = conv.senderId._id === user.id ? conv.receiverId : conv.senderId
                const isUnread = !conv.isRead && conv.receiverId._id === user.id

                return (
                  <div
                    key={conv._id}
                    onClick={() => loadConversationMessages(conv)}
                    className={`p-4 rounded-lg cursor-pointer transition-all ${
                      selectedConversation?.conversationId === conv.conversationId
                        ? "border-primary bg-primary/5 border-2"
                        : isUnread
                          ? "bg-blue-50 border-blue-200 border"
                          : "hover:border-primary/50 border border-border"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-sm truncate">
                            {otherUser.firstName} {otherUser.lastName}
                          </h3>
                          {isUnread && (
                            <span className="bg-primary text-white text-xs px-2 py-0.5 rounded flex-shrink-0">New</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{conv.subject}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(conv.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground">No messages yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Message Thread */}
      <Card>
        <CardHeader>
          <CardTitle>Conversation</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedConversation ? (
            <div className="space-y-4">
              <div className="max-h-96 overflow-y-auto space-y-3 p-4 bg-muted/30 rounded-lg">
                {messages.map((msg) => {
                  const isSent = msg.senderId._id === user.id
                  return (
                    <div key={msg._id} className={`flex ${isSent ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          isSent ? "bg-primary text-white" : "bg-white border border-border"
                        }`}
                      >
                        <p className="text-sm font-semibold mb-1">
                          {isSent ? "You" : `${msg.senderId.firstName} ${msg.senderId.lastName}`}
                        </p>
                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                        <p className="text-xs mt-2 opacity-70">{new Date(msg.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Reply Form */}
              <div className="space-y-3">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply..."
                  className="w-full border border-border rounded-md p-3 min-h-[100px] text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button
                  onClick={handleSendReply}
                  disabled={sending || !replyText.trim()}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {sending ? "Sending..." : "Send Reply"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground">Select a conversation to view messages</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
