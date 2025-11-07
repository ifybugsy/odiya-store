import { type NextRequest, NextResponse } from "next/server"

const API_URL = process.env.BACKEND_API_URL || "http://localhost:5000/api"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const response = await fetch(`${API_URL}/riders/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Rider login error:", error)
    return NextResponse.json({ message: "Login failed" }, { status: 500 })
  }
}
