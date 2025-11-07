import { type NextRequest, NextResponse } from "next/server"

const API_URL = process.env.BACKEND_API_URL || "http://localhost:5000/api"

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization")
    if (!authHeader) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()

    const response = await fetch(`${API_URL}/riders/documents`, {
      method: "POST",
      headers: {
        Authorization: authHeader,
      },
      body: formData,
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Document upload error:", error)
    return NextResponse.json({ message: "Upload failed" }, { status: 500 })
  }
}
