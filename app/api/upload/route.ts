import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"

export const maxDuration = 300 // 5 minutes for large file uploads
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

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed." },
        { status: 400 },
      )
    }

    // Validate file size (500MB limit)
    const maxSize = 500 * 1024 * 1024 // 500MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File is too large. Maximum size is 500MB." }, { status: 413 })
    }

    console.log("[upload] Processing file:", {
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      type: file.type,
    })

    const blob = await put(file.name, file, {
      access: "public",
      addRandomSuffix: true, // Prevents filename conflicts
      token: token, // Explicitly pass the token
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
