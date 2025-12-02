"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useVendorAuth } from "@/lib/vendor-auth-context"
import { ArrowLeft, Trash2, Eye } from "lucide-react"
import Link from "next/link"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

interface VendorItem {
  _id: string
  title: string
  description: string
  price: number
  category: string
  image: string
  isApproved: boolean
  createdAt: string
}

export default function VendorItemsPage() {
  const params = useParams()
  const router = useRouter()
  const vendorId = params.id as string
  const { vendor, vendorToken } = useVendorAuth()

  const [items, setItems] = useState<VendorItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    if (!vendor || !vendorToken) {
      router.push("/vendor/login")
      return
    }

    if (vendor.id !== vendorId && vendor._id !== vendorId) {
      setError("Unauthorized: You can only view your own products")
      return
    }

    loadItems()
  }, [vendor, vendorToken, vendorId])

  const loadItems = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/vendors/${vendorId}/items`, {
        headers: { Authorization: `Bearer ${vendorToken}` },
      })

      if (res.ok) {
        const data = await res.json()
        setItems(data.items || [])
      } else {
        setError("Failed to load items")
      }
    } catch (err) {
      console.error("Failed to load items:", err)
      setError("Failed to load items")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (itemId: string) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return

    setDeleting(itemId)
    try {
      const res = await fetch(`${API_URL}/vendors/${vendorId}/items/${itemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${vendorToken}` },
      })

      if (res.ok) {
        setItems(items.filter((item) => item._id !== itemId))
      } else {
        alert("Failed to delete item")
      }
    } catch (err) {
      console.error("Failed to delete item:", err)
      alert("Failed to delete item")
    } finally {
      setDeleting(null)
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background py-8">
        <div className="max-w-6xl mx-auto px-4">
          <Link href="/vendor/dashboard">
            <Button variant="outline" size="sm" className="mb-6 bg-transparent">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Manage Your Products</h1>
            <p className="text-muted-foreground">
              You have {items.length} product{items.length !== 1 ? "s" : ""} listed
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
              {error}
            </div>
          )}

          {items.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground mb-4">You haven't listed any products yet</p>
              <Link href="/upload-item">
                <Button className="bg-primary hover:bg-primary/90">Upload Your First Item</Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <Card key={item._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-48 bg-muted overflow-hidden">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                    <Badge
                      className={`absolute top-3 right-3 ${
                        item.isApproved ? "bg-green-500 hover:bg-green-600" : "bg-yellow-500 hover:bg-yellow-600"
                      }`}
                    >
                      {item.isApproved ? "Approved" : "Pending"}
                    </Badge>
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-foreground line-clamp-2 mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.description}</p>

                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg font-bold text-primary">₦{item.price.toLocaleString()}</span>
                      <Badge variant="outline">{item.category}</Badge>
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/item/${item._id}`} className="flex-1">
                        <Button variant="outline" className="w-full bg-transparent" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(item._id)}
                        disabled={deleting === item._id}
                        className="flex-1"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {deleting === item._id ? "Deleting..." : "Delete"}
                      </Button>
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
