"use client"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export const apiConfig = {
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
}

export async function apiCall(endpoint: string, options: RequestInit & { method?: string } = {}) {
  const url = `${API_URL}${endpoint}`
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

  const headers: HeadersInit = {
    ...apiConfig.headers,
    ...options.headers,
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || `API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("[v0] API call failed:", error)
    throw error
  }
}
