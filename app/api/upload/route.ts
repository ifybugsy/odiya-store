import { type NextRequest, NextResponse } from "next/server"

export const maxDuration = 300 // 5 minutes for large file uploads
export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    // Disable automatic body parsing for this route
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type (not size, size limit is on backend)
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed." },
        { status: 400 },
      )
    }

    // Log file info for debugging
    console.log("[upload] Processing file:", {
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      type: file.type,
    })

    // Forward to backend API with streaming
    const backendFormData = new FormData()
    backendFormData.append("file", file)

    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "") || ""

    const backendUrl = process.env.BACKEND_API_URL || "http://localhost:5000"
    const backendResponse = await fetch(`${backendUrl}/api/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: backendFormData,
      // Allow longer timeout for large files
      signal: AbortSignal.timeout(300000), // 5 minutes
    })

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text()
      let errorData: any
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { error: errorText || "Backend upload failed" }
      }
      return NextResponse.json(errorData, { status: backendResponse.status })
    }

    const data = await backendResponse.json()
    console.log("[upload] Success:", data)
    return NextResponse.json(data, { status: 201 })
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
