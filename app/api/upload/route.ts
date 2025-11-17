import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"

export const maxDuration = 300
export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN

    if (!token) {
      console.error("[upload] BLOB_READ_WRITE_TOKEN not found in environment variables")
      return NextResponse.json(
        { error: "Blob storage not configured. Please set BLOB_READ_WRITE_TOKEN environment variable." },
        { status: 500 },
      )
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/jpg"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed." },
        { status: 400 },
      )
    }

    // Validate file size (10MB limit for profile images)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File is too large. Maximum size is 10MB." }, { status: 413 })
    }

    // Check if file is actually an image by reading first bytes
    const buffer = await file.arrayBuffer()
    const bytes = new Uint8Array(buffer)
    
    // Simple image format validation
    const isJPEG = bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF
    const isPNG = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47
    const isGIF = bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46
    const isWEBP = bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50

    if (!isJPEG && !isPNG && !isGIF && !isWEBP) {
      return NextResponse.json(
        { error: "File content does not match image format. Please upload a valid image." },
        { status: 400 },
      )
    }

    console.log("[upload] Processing file:", {
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      type: file.type,
    })

    // Create blob from buffer
    const blob = await put(file.name, buffer, {
      access: "public",
      addRandomSuffix: true,
      token: token,
      contentType: file.type,
    })

    console.log("[upload] File uploaded to Vercel Blob:", {
      url: blob.url,
      pathname: blob.pathname,
      size: `${(blob.size / 1024 / 1024).toFixed(2)}MB`,
    })

    return NextResponse.json(
      {
        message: "File uploaded successfully",
        url: blob.url,
        filename: file.name,
        size: file.size,
        type: file.type,
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error("[upload] Error:", error)

    if (error.name === "AbortError") {
      return NextResponse.json(
        { error: "Upload timeout - file may be too large or connection too slow" },
        { status: 408 },
      )
    }

    return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 })
  }
}
