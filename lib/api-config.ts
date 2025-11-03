"use client"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://odiya-store.onrender.com/"

export const apiConfig = {
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 5000, // 5 second timeout
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
    })

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
      console.error("[v0] API Error:", error.message)
    } else {
      console.error("[v0] API Error:", error)
    }

    throw error
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
