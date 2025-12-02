"use client"

import type React from "react"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"
import { Send, ArrowLeft } from "lucide-react"
import Link from "next/link"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export default function SendMessagePage() {
  const params = useParams()
  const router = useRouter()
  const vendorId = params.id as string
  const { user, token } = useAuth()
  const [message, setMessage] = useState("")
  const [subject, setSubject] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center min-h-screen">
          <Card className="p-8 max-w-md text-center">
            <p className="mb-4 text-foreground font-medium">Please log in to send a message</p>
            <Link href={`/login?redirect=/vendor/${vendorId}/messages/send`}>
              <Button className="bg-primary hover:bg-primary/90">Login</Button>
            </Link>
          </Card>
        </div>
      </>
    )
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!message.trim() || !subject.trim()) {
      setError("Please fill in all fields")
      return
    }

    setSending(true)
    try {
      const res = await fetch(`${API_URL}/vendors/${vendorId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message, subject }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Failed to send message")
        return
      }

      alert("Message sent successfully!")
      router.back()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message")
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background py-8">
        <div className="max-w-2xl mx-auto px-4">
          <Link href={`/vendor/${vendorId}`}>
            <Button variant="outline" size="sm" className="mb-6 bg-transparent">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Vendor
            </Button>
          </Link>

          <Card className="p-8">
            <h1 className="text-2xl font-bold mb-6 text-foreground">Send Message to Vendor</h1>

            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 mb-4 text-destructive text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSendMessage} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Subject*</label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="What is your message about?"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Message*</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here..."
                  className="w-full border border-border rounded-md p-3 min-h-[200px]"
                  required
                />
              </div>

              <Button type="submit" disabled={sending} className="w-full bg-primary hover:bg-primary/90 h-12">
                <Send className="w-4 h-4 mr-2" />
                {sending ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </Card>
        </div>
      </main>
    </>
  )
}
