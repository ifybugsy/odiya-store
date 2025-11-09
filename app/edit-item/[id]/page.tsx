"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { Upload } from "lucide-react"
import { CATEGORIES } from "@/lib/categories"
import { isDataUrl, validateImageUrl } from "@/lib/image-utils"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export default function EditItemPage() {
  const { user, token } = useAuth()
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Electronics",
    price: "",
    location: "",
    condition: "Good",
    images: [] as string[],
    existingImages: [] as string[], // Track existing backend images separately
  })

  useEffect(() => {
    if (!user || !token) {
      router.push("/login")
      return
    }

    const loadItem = async () => {
      try {
        const res = await fetch(`${API_URL}/items/${params.id}`)
        if (!res.ok) {
          setError("Item not found")
          setLoading(false)
          return
        }

        const item = await res.json()
        // Verify the user owns this item
        if (item.sellerId._id !== user.id) {
          setError("You don't have permission to edit this item")
          setLoading(false)
          return
        }

        const backendImages = (item.images || []).map(validateImageUrl)

        setFormData({
          title: item.title,
          description: item.description,
          category: item.category,
          price: item.price.toString(),
          location: item.location,
          condition: item.condition,
          images: [], // Start with empty new images
          existingImages: backendImages, // Keep backend images
        })
        setLoading(false)
      } catch (err: any) {
        console.error("[v0] Failed to load item:", err)
        setError("Failed to load item")
        setLoading(false)
      }
    }

    loadItem()
  }, [user, token, router, params.id])

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    for (let i = 0; i < files.length; i++) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, result],
        }))
      }
      reader.onerror = () => {
        console.error(`[v0] Failed to read file: ${files[i].name}`)
      }
      reader.readAsDataURL(files[i])
    }
  }

  const handleRemoveImage = (index: number, isExisting: boolean) => {
    if (isExisting) {
      setFormData((prev) => ({
        ...prev,
        existingImages: prev.existingImages.filter((_, i) => i !== index),
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSubmitting(true)

    try {
      const allImages = [...formData.existingImages, ...formData.images]

      if (!allImages.length) {
        setError("Please keep or upload at least one image")
        setSubmitting(false)
        return
      }

      if (!formData.title || !formData.price) {
        setError("Title and price are required")
        setSubmitting(false)
        return
      }

      const res = await fetch(`${API_URL}/items/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          price: Number.parseFloat(formData.price),
          images: allImages.filter((img) => !isDataUrl(img)),
        }),
      })

      if (!res.ok) {
        const contentType = res.headers.get("content-type")
        if (contentType?.includes("application/json")) {
          const data = await res.json()
          setError(data.error || "Failed to update item")
        } else {
          setError(`Error: ${res.status} ${res.statusText}`)
        }
        setSubmitting(false)
        return
      }

      const contentType = res.headers.get("content-type")
      if (contentType?.includes("application/json")) {
        await res.json()
      }

      alert("Item updated successfully!")
      router.push("/dashboard")
    } catch (err: any) {
      console.error("[v0] Submit error:", err)
      setError(err.message)
    } finally {
      setSubmitting(false)
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
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Card className="p-8">
            <h1 className="text-3xl font-bold mb-8">Edit Item</h1>

            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 mb-4 text-destructive">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-2">Item Title*</label>
                <Input
                  placeholder="e.g., Samsung Galaxy S23 Ultra"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Category and Condition */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category*</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full border border-border rounded-md p-2"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Condition*</label>
                  <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleChange}
                    className="w-full border border-border rounded-md p-2"
                  >
                    <option value="New">New</option>
                    <option value="Like New">Like New</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                  </select>
                </div>
              </div>

              {/* Price and Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Price (NGN)*</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    step="100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <Input
                    placeholder="e.g., Lagos, Nigeria"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  placeholder="Describe your item in detail..."
                  name="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-border rounded-md p-2"
                  rows={5}
                />
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-medium mb-2">Images</label>

                {/* Existing Images */}
                {formData.existingImages.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-muted-foreground mb-2">Current Images</p>
                    <div className="grid grid-cols-4 gap-2">
                      {formData.existingImages.map((img, idx) => (
                        <div key={`existing-${idx}`} className="relative">
                          <img
                            src={img || "/placeholder.svg"}
                            alt={`Existing ${idx}`}
                            className="w-full h-20 object-cover rounded border border-border"
                            onError={(e) => {
                              console.error(`[v0] Failed to load existing image ${idx}: ${img}`)
                              e.currentTarget.src = "/placeholder.svg"
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx, true)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload New Images */}
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center mb-4">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="w-full" />
                  <p className="text-sm text-muted-foreground mt-2">Click to add more images</p>
                </div>

                {formData.images.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">New Images</p>
                    <div className="grid grid-cols-4 gap-2">
                      {formData.images.map((img, idx) => (
                        <div key={`new-${idx}`} className="relative">
                          <img
                            src={img || "/placeholder.svg"}
                            alt={`Preview ${idx}`}
                            className="w-full h-20 object-cover rounded border border-green-200"
                            onError={(e) => {
                              console.error(`[v0] Failed to load preview image ${idx}`)
                              e.currentTarget.src = "/placeholder.svg"
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx, false)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary/90 h-12 text-base"
                  disabled={submitting}
                >
                  {submitting ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-12 text-base bg-transparent"
                  onClick={() => router.push("/dashboard")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </main>
    </>
  )
}
