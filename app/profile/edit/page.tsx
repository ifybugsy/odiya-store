"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://odiya-store.onrender.com/"

export default function EditProfilePage() {
  const { user, token, setUser } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
  })

  useEffect(() => {
    if (!user || !token) {
      router.push("/login")
      return
    }

    const loadProfile = async () => {
      try {
        const res = await fetch(`${API_URL}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const profile = await res.json()
          setFormData({
            firstName: profile.firstName,
            lastName: profile.lastName,
            phone: profile.phone,
            address: profile.address || "",
            city: profile.city || "",
            state: profile.state || "",
          })
        }
      } catch (err) {
        console.error("Failed to load profile:", err)
      }
    }

    loadProfile()
  }, [user, token, router])

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Failed to update profile")
        setLoading(false)
        return
      }

      const data = await res.json()
      setUser(data.user)
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Card className="p-8">
            <h1 className="text-3xl font-bold mb-2">Edit Profile</h1>
            <p className="text-muted-foreground mb-8">Update your personal information</p>

            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 mb-4 text-destructive">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">First Name</label>
                  <Input name="firstName" value={formData.firstName} onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Last Name</label>
                  <Input name="lastName" value={formData.lastName} onChange={handleChange} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <Input name="phone" value={formData.phone} onChange={handleChange} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Address</label>
                <Input name="address" value={formData.address} onChange={handleChange} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">City</label>
                  <Input name="city" value={formData.city} onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">State</label>
                  <Input name="state" value={formData.state} onChange={handleChange} />
                </div>
              </div>

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 h-12" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </Card>
        </div>
      </main>
    </>
  )
}
