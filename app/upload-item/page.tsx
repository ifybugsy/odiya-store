"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { Upload } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

const CATEGORIES = [
  "Electronics",
  "Phones",
  "Laptops",
  "Computers",
  "Cars",
  "Car Parts",
  "Motorcycles",
  "Furniture",
  "Clothing",
  "Hair Accessories",
  "Fashion Accessories",
  "Books",
  "Sports",
  "Sports Equipment",
  "Real Estate",
  "Services",
  "Food & Beverages",
  "Home & Garden",
  "Toys & Games",
  "Health & Beauty",
]

interface ImagePreview {
  file: File
  preview: string
  size: string
}

export default function UploadItemPage() {
  const { user, token } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [imageFiles, setImageFiles] = useState<ImagePreview[]>([])
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Electronics",
    price: "",
    location: "",
    condition: "Good",
  })

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    setError("")
    const newPreviews: ImagePreview[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      // Validate file type
      const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
      if (!allowedTypes.includes(file.type)) {
        setError(`${file.name}: Invalid file type`)
        continue
      }

      // Validate file size (max 100MB per file)
      const maxSize = 100 * 1024 * 1024
      if (file.size > maxSize) {
        setError(`${file.name}: File too large (${(file.size / 1024 / 1024).toFixed(2)}MB > 100MB)`)
        continue
      }

      // Create preview
      const preview = URL.createObjectURL(file)
      const sizeMB = (file.size / 1024 / 1024).toFixed(2)

      newPreviews.push({
        file,
        preview,
        size: `${sizeMB}MB`,
      })
    }

    setImageFiles((prev) => [...prev, ...newPreviews])
  }

  const removeImage = (index: number) => {
    setImageFiles((prev) => {
      const updated = [...prev]
      URL.revokeObjectURL(updated[index].preview)
      updated.splice(index, 1)
      return updated
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (!imageFiles.length) {
        setError("Please upload at least one image")
        setLoading(false)
        return
      }

      if (!formData.title || !formData.price) {
        setError("Title and price are required")
        setLoading(false)
        return
      }

      const uploadedImageUrls: string[] = []
      let firstError = ""

      for (let i = 0; i < imageFiles.length; i++) {
        const { file } = imageFiles[i]
        const uploadFormData = new FormData()
        uploadFormData.append("file", file)

        try {
          const uploadRes = await fetch("/api/upload", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: uploadFormData,
          })

          if (!uploadRes.ok) {
            const error = await uploadRes.json()
            console.error(`[upload] Image ${i + 1} failed:`, error)
            if (!firstError) {
              firstError = `Image ${i + 1}: ${error.error || "Upload failed"}`
            }
            continue
          }

          const uploadData = await uploadRes.json()
          uploadedImageUrls.push(uploadData.url)
          setUploadProgress(Math.round(((i + 1) / imageFiles.length) * 100))
        } catch (err: any) {
          console.error(`[upload] Error uploading image ${i + 1}:`, err)
          if (!firstError) {
            firstError = `Image ${i + 1}: ${err.message}`
          }
        }
      }

      if (uploadedImageUrls.length === 0) {
        setError(firstError || "Failed to upload any images")
        setLoading(false)
        return
      }

      // Now create the item WITH the uploaded image URLs
      const createRes = await fetch(`${API_URL}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          price: Number.parseFloat(formData.price),
          images: uploadedImageUrls, // Include uploaded image URLs
        }),
      })

      if (!createRes.ok) {
        const data = await createRes.json()
        setError(data.error || "Failed to create item")
        setLoading(false)
        return
      }

      alert(`Item uploaded successfully! 

Please pay the upload fee of ₦150 to confirm listing.

Bank Account Details:
Account Number: 1028301845
Account Name: Ifybugsy Digital Technologies Ltd
Bank Name: UBA

Purpose: Odiya Store Upload Fee

After payment, your item will be pending admin approval.`)

      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
      setUploadProgress(0)
    }
  }

  if (!user?.isSeller) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <Card className="p-6 text-center">
            <p className="mb-4">You need to be a seller to upload items</p>
            <Button onClick={() => router.push("/become-seller")} className="bg-primary hover:bg-primary/90">
              Become a Seller
            </Button>
          </Card>
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
            <h1 className="text-3xl font-bold mb-2">Upload Item</h1>
            <p className="text-muted-foreground mb-8">Upload fee: ₦150 per item</p>

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
                <label className="block text-sm font-medium mb-2">Upload Images*</label>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="w-full" />
                  <p className="text-sm text-muted-foreground mt-2">Click to upload images (Max 100MB per file)</p>
                </div>

                {uploadProgress > 0 && (
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Uploading images: {uploadProgress}%</p>
                  </div>
                )}

                {imageFiles.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Images ({imageFiles.length})</p>
                    <div className="grid grid-cols-4 gap-2">
                      {imageFiles.map((img, idx) => (
                        <div key={idx} className="relative">
                          <img
                            src={img.preview || "/placeholder.svg"}
                            alt={`Preview ${idx}`}
                            className="w-full h-20 object-cover rounded"
                          />
                          <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs rounded px-1">
                            {img.size}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
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

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 h-12 text-base" disabled={loading}>
                {loading ? "Uploading..." : "Upload Item (₦150)"}
              </Button>
            </form>
          </Card>
        </div>
      </main>
    </>
  )
}
