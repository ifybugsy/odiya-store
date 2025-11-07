"use client"

import type React from "react"

import { useState } from "react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Mail, Phone, MapPin } from "lucide-react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  const [sent, setSent] = useState(false)

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // In production, send to your email service
    console.log("Contact form submitted:", formData)
    setSent(true)
    setFormData({ name: "", email: "", subject: "", message: "" })
    setTimeout(() => setSent(false), 3000)
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-8">Contact Us</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Contact Info */}
            <div className="space-y-6">
              <Card className="p-6 flex gap-4">
                <Mail className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold mb-1">Email</h3>
                  <p className="text-muted-foreground">support@odiyastore.com</p>
                  <p className="text-muted-foreground">info@odiyastore.com</p>
                </div>
              </Card>

              <Card className="p-6 flex gap-4">
                <Phone className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold mb-1">Phone</h3>
                  <p className="text-muted-foreground">+234 9160007661</p>
                  <p className="text-muted-foreground">+234 9047994155</p>
                </div>
              </Card>

              <Card className="p-6 flex gap-4">
                <MapPin className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold mb-1">Office</h3>
                  <p className="text-muted-foreground">Port Harcourt, Nigeria</p>
                  <p className="text-muted-foreground">Nigeria's leading marketplace</p>
                </div>
              </Card>
            </div>

            {/* Contact Form */}
            <Card className="p-6">
              {sent && (
                <div className="bg-green-50 border border-green-200 rounded p-3 mb-4 text-green-800 text-sm">
                  Thank you! We'll get back to you soon.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input placeholder="Your Name" name="name" value={formData.name} onChange={handleChange} required />
                <Input
                  placeholder="Your Email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <Input placeholder="Subject" name="subject" value={formData.subject} onChange={handleChange} required />
                <textarea
                  placeholder="Your Message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full border border-border rounded-md p-2"
                  rows={5}
                  required
                />
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                  Send Message
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
