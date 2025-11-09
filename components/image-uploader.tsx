"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X, Loader2 } from "lucide-react"
import Image from "next/image"

interface ImageUploaderProps {
  onUpload: (url: string) => void
  existingImage?: string
  label?: string
  maxSizeMB?: number
}

export function ImageUploader({ onUpload, existingImage, label = "Upload Image", maxSizeMB = 10 }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(existingImage || null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size
    const maxSize = maxSizeMB * 1024 * 1024
    if (file.size > maxSize) {
      setError(`File is too large. Maximum size is ${maxSizeMB}MB.`)
      return
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      setError("Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.")
      return
    }

    setError(null)
    setUploading(true)

    try {
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Upload to Vercel Blob via Next.js API route
      const formData = new FormData()
      formData.append("file", file)

      const token = localStorage.getItem("token")
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Upload failed")
      }

      const data = await response.json()
      console.log("[ImageUploader] Upload successful:", data.url)

      // Call parent callback with the permanent Blob URL
      onUpload(data.url)
    } catch (err: any) {
      console.error("[ImageUploader] Upload error:", err)
      setError(err.message || "Failed to upload image")
      setPreview(existingImage || null)
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    setError(null)
    onUpload("")
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          disabled={uploading}
          onClick={() => document.getElementById("image-upload")?.click()}
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              {label}
            </>
          )}
        </Button>

        {preview && (
          <Button type="button" variant="ghost" size="icon" onClick={handleRemove}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <input
        id="image-upload"
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileChange}
        className="hidden"
        disabled={uploading}
      />

      {error && <p className="text-sm text-destructive">{error}</p>}

      {preview && (
        <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-lg border">
          <Image src={preview || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
        </div>
      )}
    </div>
  )
}
