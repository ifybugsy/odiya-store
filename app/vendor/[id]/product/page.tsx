"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useVendorAuth } from "@/lib/vendor-auth-context"
import { ArrowLeft, Plus, Edit, Trash2, Eye } from "lucide-react"
import Link from "next/link"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

interface Product {
  _id: string
  title: string
  description: string
  price: number
  images: string[]
  category: string
  condition: string
  status: string
  views: number
  createdAt: string
}

export default function VendorProductsPage() {
  const params = useParams()
  const router = useRouter()
  const vendorId = params.id as string
  const { vendor, vendorToken } = useVendorAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    if (!vendor || !vendorToken) {
      router.push("/vendor/login")
      return
    }

    loadProducts()
  }, [vendor, vendorToken, vendorId])

  const loadProducts = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/vendors/${vendorId}/items`, {
        headers: { Authorization: `Bearer ${vendorToken}` },
      })

      if (res.ok) {
        const data = await res.json()
        setProducts(data.items || [])
      }
    } catch (error) {
      console.error("Failed to load products:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      const res = await fetch(`${API_URL}/vendors/${vendorId}/items/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${vendorToken}` },
      })

      if (res.ok) {
        loadProducts()
      }
    } catch (error) {
      console.error("Failed to delete product:", error)
    }
  }

  const filteredProducts =
    statusFilter === "all" ? products : products.filter((product) => product.status === statusFilter)

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
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <Link href="/vendor/dashboard">
              <Button variant="outline" size="sm" className="bg-transparent">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>

            <Link href="/upload-item">
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Add New Product
              </Button>
            </Link>
          </div>

          <h1 className="text-3xl font-bold mb-8 text-foreground">Products Management</h1>

          {/* Status Filter */}
          <div className="mb-6 flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant={statusFilter === "all" ? "default" : "outline"}
              onClick={() => setStatusFilter("all")}
            >
              All Products ({products.length})
            </Button>
            <Button
              size="sm"
              variant={statusFilter === "approved" ? "default" : "outline"}
              onClick={() => setStatusFilter("approved")}
            >
              Approved ({products.filter((p) => p.status === "approved").length})
            </Button>
            <Button
              size="sm"
              variant={statusFilter === "pending" ? "default" : "outline"}
              onClick={() => setStatusFilter("pending")}
            >
              Pending ({products.filter((p) => p.status === "pending").length})
            </Button>
          </div>

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <Card key={product._id} className="overflow-hidden">
                  <div className="h-48 bg-muted relative">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0] || "/placeholder.svg"}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        No image
                      </div>
                    )}
                    <div
                      className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-semibold ${
                        product.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : product.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {product.status}
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-lg text-foreground line-clamp-2 mb-2">{product.title}</h3>
                    <p className="text-primary font-bold text-xl mb-3">₦{product.price.toLocaleString()}</p>

                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                      <span>{product.category}</span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {product.views || 0} views
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/item/${product._id}`} className="flex-1">
                        <Button size="sm" variant="outline" className="w-full bg-transparent">
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                      </Link>
                      <Link href={`/edit-item/${product._id}`} className="flex-1">
                        <Button size="sm" variant="outline" className="w-full bg-transparent">
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-transparent text-destructive hover:text-destructive"
                        onClick={() => handleDelete(product._id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Plus className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground mb-4">No products found</p>
              <Link href="/upload-item">
                <Button className="bg-primary hover:bg-primary/90">Add Your First Product</Button>
              </Link>
            </Card>
          )}
        </div>
      </main>
    </>
  )
}
