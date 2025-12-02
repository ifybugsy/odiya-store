"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import BoostButtonSeller from "@/components/boost-button-seller"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export default function ApprovedItemsPage() {
  const { user, token, isLoading } = useAuth()
  const router = useRouter()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && (!user || !user.isSeller)) {
      router.push("/auth/login")
      return
    }

    if (user && user.isSeller && token) {
      loadApprovedItems()
    }
  }, [user, token, isLoading, router])

  const loadApprovedItems = async () => {
    if (!token) return

    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/items/seller/approved`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        const data = await res.json()
        setItems(data)
      }
    } catch (error) {
      console.error("[v0] Failed to load approved items:", error)
    } finally {
      setLoading(false)
    }
  }

  if (isLoading || loading) {
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
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-foreground mb-8">My Approved Items</h1>

          {items.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No approved items yet</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <Card key={item._id} className="overflow-hidden">
                  <div className="relative h-48">
                    <img
                      src={item.images[0] || "/placeholder.svg"}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    {item.isPromoted && item.promotedUntil && new Date(item.promotedUntil) > new Date() && (
                      <Badge className="absolute top-2 right-2 bg-gradient-to-r from-orange-500 to-pink-500">
                        Promoted
                      </Badge>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold line-clamp-2 mb-2">{item.title}</h3>
                    <p className="text-primary font-bold text-lg mb-3">₦{item.price.toLocaleString()}</p>

                    {!item.isPromoted || !item.promotedUntil || new Date(item.promotedUntil) <= new Date() ? (
                      <div className="mb-3">
                        <BoostButtonSeller
                          itemId={item._id}
                          isPromoted={false}
                          onBoostSuccess={() => loadApprovedItems()}
                        />
                      </div>
                    ) : null}

                    <div className="flex gap-2">
                      <Link href={`/edit-item/${item._id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full bg-transparent">
                          Edit
                        </Button>
                      </Link>
                      <Link href={`/item/${item._id}`} className="flex-1">
                        <Button size="sm" className="w-full">
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
