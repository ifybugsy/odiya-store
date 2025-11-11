"use client"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

// Check if API URL is properly configured
const isProduction = typeof window !== "undefined" && window.location.hostname !== "localhost"
const isConfigured = API_URL !== "http://localhost:5000/api" || !isProduction

if (!isConfigured && typeof window !== "undefined") {
  console.error("[v0] CRITICAL: NEXT_PUBLIC_API_URL is not configured for production. Current value:", API_URL)
  console.error("[v0] Please set NEXT_PUBLIC_API_URL environment variable to your deployed backend URL")
  console.error("[v0] Example: https://your-backend-api.com/api")
}

export const apiConfig = {
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // Increased to 10 seconds for slower connections
}

export async function apiCall(endpoint: string, options: RequestInit & { method?: string } = {}) {
  const url = `${API_URL}${endpoint}`
  const token = typeof window !== "undefined" ? localStorage.getItem("auth") : null
  let authToken: string | null = null

  // Extract token from auth JSON
  if (token) {
    try {
      const parsed = JSON.parse(token)
      authToken = parsed.token
    } catch (e) {
      console.error("[v0] Failed to parse auth token:", e)
    }
  }

  const headers: HeadersInit = {
    ...apiConfig.headers,
    ...options.headers,
  }

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`
  }

  console.log("[v0] API Call:", {
    endpoint,
    method: options.method || "GET",
    url,
    headers: { ...headers, Authorization: authToken ? "Bearer [REDACTED]" : "none" },
  })

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), apiConfig.timeout)

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    console.log("[v0] API Response:", {
      endpoint,
      status: response.status,
      statusText: response.statusText,
      contentType: response.headers.get("content-type"),
    })

    const contentType = response.headers.get("content-type")
    if (contentType && contentType.includes("text/html")) {
      console.error("[v0] Received HTML instead of JSON - API endpoint not found")
      throw new Error(
        `API endpoint not found: ${endpoint}. Backend may not be deployed or NEXT_PUBLIC_API_URL is incorrect.`,
      )
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: `HTTP ${response.status}`,
      }))

      console.error("[v0] API Error:", {
        endpoint,
        status: response.status,
        error: error.message || error,
      })

      if (response.status === 401) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth")
          window.location.href = "/login"
        }
      }

      throw new Error(error.message || `API error: ${response.status}`)
    }

    const data = await response.json()
    console.log("[v0] API Success:", { endpoint, dataKeys: Object.keys(data) })
    return data
  } catch (error) {
    clearTimeout(timeoutId)

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        console.error("[v0] API Timeout:", { endpoint, timeout: apiConfig.timeout })
        throw new Error(`Request timeout after ${apiConfig.timeout}ms`)
      }
      if (error.message.includes("Failed to fetch")) {
        throw new Error(
          `Cannot connect to backend API at ${API_URL}. Please ensure the backend is running and accessible.`,
        )
      }
      console.error("[v0] API Error:", error.message)
      throw error
    } else {
      console.error("[v0] API Error:", error)
      throw new Error("An unexpected error occurred")
    }
  }
}

export async function apiCallWithRetry(
  endpoint: string,
  options: RequestInit & { method?: string } = {},
  maxRetries = 2,
) {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[v0] API Call Attempt ${attempt + 1}/${maxRetries + 1}:`, endpoint)
      return await apiCall(endpoint, options)
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (attempt < maxRetries) {
        const delayMs = Math.pow(2, attempt) * 1000
        console.log(`[v0] Retrying after ${delayMs}ms...`)
        await new Promise((resolve) => setTimeout(resolve, delayMs))
      }
    }
  }

  throw lastError || new Error("API call failed after retries")
}

export function getApiBaseUrl() {
  return API_URL
}
