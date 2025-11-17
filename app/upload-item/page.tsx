"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from 'next/navigation'
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { Upload, Copy, Check } from 'lucide-react'

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
  const [copiedField, setCopiedField] = useState<string>("")
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

      console.log("[upload-item] Starting image uploads to Vercel Blob...")
      const uploadedImageUrls: string[] = []
      let uploadedCount = 0
      let firstError = ""

      for (let i = 0; i < imageFiles.length; i++) {
        const { file } = imageFiles[i]
        const uploadFormData = new FormData()
        uploadFormData.append("file", file)

        try {
          // Upload to Vercel Blob via Next.js API route
          const uploadRes = await fetch("/api/upload", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: uploadFormData,
          })

          if (!uploadRes.ok) {
            const error = await uploadRes.json()
            console.error(`[upload-item] Image ${i + 1} failed:`, error)
            if (!firstError) {
              firstError = `Image ${i + 1}: ${error.error || "Upload failed"}`
            }
            continue
          }

          const uploadData = await uploadRes.json()
          console.log(`[upload-item] Image ${i + 1} uploaded to Blob:`, uploadData.url)

          // Store the permanent Blob URL
          uploadedImageUrls.push(uploadData.url)
          uploadedCount++
          setUploadProgress(Math.round(((i + 1) / imageFiles.length) * 100))
        } catch (err: any) {
          console.error(`[upload-item] Error uploading image ${i + 1}:`, err)
          if (!firstError) {
            firstError = `Image ${i + 1}: ${err.message}`
          }
        }
      }

      if (uploadedCount === 0) {
        setError(firstError || "Failed to upload any images")
        setLoading(false)
        return
      }

      console.log(`[upload-item] Successfully uploaded ${uploadedCount} images to Vercel Blob`)
      console.log("[upload-item] Permanent Blob URLs:", uploadedImageUrls)

      const createRes = await fetch(`${API_URL}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          price: Number.parseFloat(formData.price),
          images: uploadedImageUrls, // Permanent Blob URLs
        }),
      })

      if (!createRes.ok) {
        const data = await createRes.json()
        console.error("[upload-item] Item creation failed:", data)
        setError(data.error || "Failed to create item")
        setLoading(false)
        return
      }

      const itemData = await createRes.json()
      console.log("[upload-item] Item created successfully with permanent images:", itemData)

      const accountNumber = "1028301845"
      const accountName = "Ifybugsy Digital Technologies Ltd"
      const bankName = "UBA"
      
      // Create custom modal/alert instead of browser alert
      const modal = document.createElement("div")
      modal.style.cssText = "position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px;"
      
      const content = document.createElement("div")
      content.style.cssText = "background:white;border-radius:12px;padding:32px;max-width:500px;width:100%;box-shadow:0 20px 25px -5px rgba(0,0,0,0.1);position:relative;"
      
      content.innerHTML = `
        <div style="text-align:center;margin-bottom:24px;">
          <div style="width:56px;height:56px;background:#10b981;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">
            <svg style="width:32px;height:32px;color:white;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 style="font-size:24px;font-weight:bold;margin-bottom:8px;color:#111827;">Item Uploaded Successfully!</h2>
          <p style="color:#6b7280;font-size:14px;">Please pay the upload fee of ₦150 to confirm listing.</p>
        </div>
        
        <div style="background:#f9fafb;border-radius:8px;padding:20px;margin-bottom:24px;">
          <h3 style="font-weight:600;margin-bottom:16px;color:#111827;font-size:16px;">Bank Account Details</h3>
          
          <div style="margin-bottom:12px;">
            <label style="display:block;font-size:12px;color:#6b7280;margin-bottom:4px;font-weight:500;">Account Number</label>
            <div style="display:flex;align-items:center;gap:8px;">
              <input readonly value="${accountNumber}" style="flex:1;padding:10px 12px;border:1px solid #e5e7eb;border-radius:6px;font-size:15px;font-weight:600;color:#111827;background:white;" id="accountNumberInput" />
              <button onclick="copyField('${accountNumber}', 'accountNumber')" style="padding:10px 12px;background:#3b82f6;color:white;border:none;border-radius:6px;cursor:pointer;display:flex;align-items:center;gap:6px;font-size:13px;font-weight:500;transition:background 0.2s;" id="copyAccountBtn">
                <svg style="width:16px;height:16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24" id="copyAccountIcon">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                </svg>
                <span id="copyAccountText">Copy</span>
              </button>
            </div>
          </div>
          
          <div style="margin-bottom:12px;">
            <label style="display:block;font-size:12px;color:#6b7280;margin-bottom:4px;font-weight:500;">Account Name</label>
            <div style="display:flex;align-items:center;gap:8px;">
              <input readonly value="${accountName}" style="flex:1;padding:10px 12px;border:1px solid #e5e7eb;border-radius:6px;font-size:15px;font-weight:600;color:#111827;background:white;" id="accountNameInput" />
              <button onclick="copyField('${accountName}', 'accountName')" style="padding:10px 12px;background:#3b82f6;color:white;border:none;border-radius:6px;cursor:pointer;display:flex;align-items:center;gap:6px;font-size:13px;font-weight:500;transition:background 0.2s;" id="copyNameBtn">
                <svg style="width:16px;height:16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24" id="copyNameIcon">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                </svg>
                <span id="copyNameText">Copy</span>
              </button>
            </div>
          </div>
          
          <div style="margin-bottom:16px;">
            <label style="display:block;font-size:12px;color:#6b7280;margin-bottom:4px;font-weight:500;">Bank Name</label>
            <input readonly value="${bankName}" style="width:100%;padding:10px 12px;border:1px solid #e5e7eb;border-radius:6px;font-size:15px;font-weight:600;color:#111827;background:white;" />
          </div>
          
          <div style="margin-bottom:12px;padding:12px;background:#fef3c7;border-left:4px solid #f59e0b;border-radius:4px;">
            <p style="font-size:13px;color:#92400e;font-weight:500;">Purpose: bugsymart Upload Fee</p>
          </div>
          
          <div style="padding:12px;background:#dbeafe;border-left:4px solid #3b82f6;border-radius:4px;">
            <p style="font-size:13px;color:#1e40af;font-weight:500;">All payments receipts should be forwarded to whatsapp 09160007661</p>
          </div>
        </div>
        
        <p style="color:#6b7280;font-size:13px;margin-bottom:24px;text-align:center;">After payment, your item will be pending admin approval.</p>
        
        <button onclick="closeModal()" style="width:100%;padding:12px;background:#10b981;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600;font-size:15px;transition:background 0.2s;">
          Got it, thanks!
        </button>
      `
      
      modal.appendChild(content)
      document.body.appendChild(modal)
      
      // Add global functions for the modal
      ;(window as any).copyField = (text: string, field: string) => {
        navigator.clipboard.writeText(text).then(() => {
          const btn = document.getElementById(`copy${field === 'accountNumber' ? 'Account' : 'Name'}Btn`) as HTMLButtonElement
          const text = document.getElementById(`copy${field === 'accountNumber' ? 'Account' : 'Name'}Text`) as HTMLSpanElement
          const icon = document.getElementById(`copy${field === 'accountNumber' ? 'Account' : 'Name'}Icon`) as SVGElement
          
          if (btn && text && icon) {
            btn.style.background = "#10b981"
            text.textContent = "Copied!"
            icon.innerHTML = '<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>'
            
            setTimeout(() => {
              btn.style.background = "#3b82f6"
              text.textContent = "Copy"
              icon.innerHTML = '<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>'
            }, 2000)
          }
        })
      }
      
      ;(window as any).closeModal = () => {
        document.body.removeChild(modal)
        delete (window as any).copyField
        delete (window as any).closeModal
        router.push("/dashboard")
      }
    } catch (err: any) {
      console.error("[upload-item] Upload error:", err)
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
                    <option value="Foreign Used">Foreign Used</option>
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
                  <p className="text-xs text-muted-foreground mt-1">Images are stored permanently in Vercel Blob</p>
                </div>

                {uploadProgress > 0 && (
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Uploading to Vercel Blob: {uploadProgress}%</p>
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
