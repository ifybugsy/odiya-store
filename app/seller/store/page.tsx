"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import { Plus, Edit, Trash2, CheckCircle, AlertCircle } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export default function SellerStorePage() {
  const { user, token } = useAuth()
  const router = useRouter()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    if (!user?.isSeller || !token) {
      router.push("/")
      return
    }

    loadItems()
    const interval = setInterval(loadItems, 10000)
    return () => clearInterval(interval)
  }, [user, token, router])

  const loadItems = async () => {
    try {
      const res = await fetch(`${API_URL}/users/my-items`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setItems(data)
      }
    } catch (error) {
      console.error("[v0] Failed to load items:", error)
    } finally {
      setLoading(false)
    }
  }

  const deleteItem = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return

    try {
      const res = await fetch(`${API_URL}/items/${itemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setItems(items.filter((i) => i._id !== itemId))
      }
    } catch (error) {
      console.error("[v0] Failed to delete item:", error)
    }
  }

  const getFilteredItems = () => {
    switch (filter) {
      case "active":
        return items.filter((i) => !i.isSold)
      case "sold":
        return items.filter((i) => i.isSold)
      case "pending":
        return items.filter((i) => i.status === "pending")
      default:
        return items
    }
  }

  const filteredItems = getFilteredItems()
  const stats = {
    total: items.length,
    active: items.filter((i) => !i.isSold).length,
    sold: items.filter((i) => i.isSold).length,
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
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">My Store</h1>
              <p className="text-muted-foreground mt-1">Manage your uploaded items</p>
            </div>
            <Link href="/upload-item">
              <Button className="bg-primary hover:bg-primary/90 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Upload Item
              </Button>
            </Link>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="p-6 text-center">
              <p className="text-muted-foreground text-sm">Total Items</p>
              <p className="text-3xl font-bold text-primary">{stats.total}</p>
            </Card>
            <Card className="p-6 text-center">
              <p className="text-muted-foreground text-sm">Active Items</p>
              <p className="text-3xl font-bold text-green-600">{stats.active}</p>
            </Card>
            <Card className="p-6 text-center">
              <p className="text-muted-foreground text-sm">Sold Items</p>
              <p className="text-3xl font-bold text-red-600">{stats.sold}</p>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {["all", "active", "sold", "pending"].map((f) => (
              <Button
                key={f}
                onClick={() => setFilter(f)}
                variant={filter === f ? "default" : "outline"}
                size="sm"
                className={filter === f ? "bg-primary" : "bg-transparent"}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Button>
            ))}
          </div>

          {/* Items Grid */}
          {filteredItems.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground mb-4">
                {filter === "all" ? "No items uploaded yet" : `No ${filter} items`}
              </p>
              <Link href="/upload-item">
                <Button className="bg-primary hover:bg-primary/90">Upload Your First Item</Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item: any) => (
                <Card key={item._id} className="overflow-hidden hover:shadow-lg transition">
                  <div className="h-40 bg-muted relative">
                    {item.images?.[0] && (
                      <img
                        src={item.images[0] || "/placeholder.svg"}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div
                      className={`absolute top-2 right-2 px-2 py-1 rounded text-xs text-white font-semibold flex items-center gap-1 ${
                        item.isSold ? "bg-red-500" : item.status === "pending" ? "bg-yellow-500" : "bg-green-500"
                      }`}
                    >
                      {item.isSold ? (
                        <>
                          <CheckCircle className="w-3 h-3" /> Sold
                        </>
                      ) : item.status === "pending" ? (
                        <>
                          <AlertCircle className="w-3 h-3" /> Pending
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-3 h-3" /> Active
                        </>
                      )}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold line-clamp-2 mb-2">{item.title}</h3>
                    <p className="text-primary font-bold text-lg mb-3">₦{item.price.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground mb-4">
                      📍 {item.location} • Views: {item.views}
                    </p>
                    <div className="flex gap-2">
                      {!item.isSold && (
                        <>
                          <Link href={`/edit-item/${item._id}`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full bg-transparent">
                              <Edit className="w-3 h-3 mr-1" /> Edit
                            </Button>
                          </Link>
                          <Link href={`/dashboard/mark-sold/${item._id}`} className="flex-1">
                            <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                              <CheckCircle className="w-3 h-3 mr-1" /> Sold
                            </Button>
                          </Link>
                        </>
                      )}
                      <Button onClick={() => deleteItem(item._id)} variant="destructive" size="sm" className="flex-1">
                        <Trash2 className="w-3 h-3 mr-1" /> Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
