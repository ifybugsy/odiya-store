"use client"

/**
 * API utility functions for handling domain migration issues
 * Provides clear error messages and debugging information
 */

export function getApiUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
  return apiUrl
}

export function getBackendUrl(): string {
  return getApiUrl().replace("/api", "")
}

/**
 * Check if the response is a 404 HTML page instead of JSON
 */
export async function handleApiResponse(response: Response, endpoint: string) {
  const contentType = response.headers.get("content-type")

  // Check if we got HTML instead of JSON (common 404 error)
  if (contentType?.includes("text/html")) {
    console.error("[v0] API Error: Received HTML instead of JSON", {
      endpoint,
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      contentType,
    })

    throw new Error(
      `API Connection Failed: Backend not deployed or endpoint incorrect. ` +
        `Tried to reach: ${response.url}. ` +
        `Please ensure: 1) Backend server is running, ` +
        `2) NEXT_PUBLIC_API_URL is set correctly (currently: ${getApiUrl()}), ` +
        `3) The endpoint exists on your backend.`,
    )
  }

  // Try to parse JSON
  try {
    const data = await response.json()

    if (!response.ok) {
      console.error("[v0] API Error:", {
        endpoint,
        status: response.status,
        error: data.error || data.message,
      })

      throw new Error(data.error || data.message || `HTTP ${response.status}: ${response.statusText}`)
    }

    return data
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error("[v0] JSON Parse Error:", {
        endpoint,
        error: error.message,
        url: response.url,
      })

      throw new Error(
        `Invalid JSON response from ${endpoint}. ` +
          `This typically means: ` +
          `1) Backend API is not deployed at ${getApiUrl()}, ` +
          `2) CORS is blocking the request, or ` +
          `3) The endpoint doesn't exist on the backend.`,
      )
    }
    throw error
  }
}

/**
 * Make an API call with proper error handling
 */
export async function apiRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
  const apiUrl = getApiUrl()
  const url = endpoint.startsWith("http") ? endpoint : `${apiUrl}${endpoint}`

  console.log("[v0] API Request:", {
    endpoint,
    method: options.method || "GET",
    url,
  })

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // Increased timeout to 30 seconds

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    })

    clearTimeout(timeoutId)

    return await handleApiResponse(response, endpoint)
  } catch (error: any) {
    if (error.name === "AbortError") {
      console.error("[v0] API Timeout:", endpoint)
      throw new Error(
        `Request timeout for ${endpoint}. ` +
          `The backend server at ${apiUrl} is not responding. ` +
          `Please verify: 1) Backend server is running, ` +
          `2) NEXT_PUBLIC_API_URL is correct.`,
      )
    }

    if (error.message?.includes("Failed to fetch") || error.message?.includes("NetworkError")) {
      console.error("[v0] Network Error:", {
        endpoint,
        apiUrl,
        error: error.message,
      })

      throw new Error(
        `Cannot connect to backend at ${apiUrl}. ` +
          `Please verify: ` +
          `1) Backend server is running and accessible, ` +
          `2) NEXT_PUBLIC_API_URL environment variable is correct (current: ${apiUrl}), ` +
          `3) No firewall or network issues blocking the connection, ` +
          `4) CORS is properly configured on backend.`,
      )
    }

    throw error
  }
}

/**
 * Validate API configuration
 */
export function validateApiConfig(): {
  isValid: boolean
  apiUrl: string
  backendUrl: string
  warnings: string[]
} {
  const apiUrl = getApiUrl()
  const backendUrl = getBackendUrl()
  const warnings: string[] = []

  // Check if using localhost in production
  if (typeof window !== "undefined" && window.location.hostname !== "localhost" && apiUrl.includes("localhost")) {
    warnings.push(
      "⚠️ Production app is pointing to localhost. " +
        "Set NEXT_PUBLIC_API_URL environment variable to your deployed backend URL.",
    )
  }

  // Check if properly formatted
  if (!apiUrl.endsWith("/api")) {
    warnings.push(`⚠️ API URL should end with /api. Current value: ${apiUrl}`)
  }

  if (!apiUrl.startsWith("http://") && !apiUrl.startsWith("https://")) {
    warnings.push(`⚠️ API URL must start with http:// or https://. Current value: ${apiUrl}`)
  }

  const isValid = warnings.length === 0

  console.log("[v0] API Configuration:", {
    apiUrl,
    backendUrl,
    isValid,
    warnings,
    environment: typeof window !== "undefined" ? window.location.hostname : "server",
  })

  return { isValid, apiUrl, backendUrl, warnings }
}

export async function testApiConnection(): Promise<{
  connected: boolean
  message: string
  details?: any
}> {
  try {
    const apiUrl = getApiUrl()
    console.log("[v0] Testing API connection to:", apiUrl)

    const response = await fetch(`${apiUrl}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    const contentType = response.headers.get("content-type")

    if (contentType?.includes("text/html")) {
      return {
        connected: false,
        message: `Backend returned HTML (404 page). Backend not deployed or endpoint incorrect.`,
        details: {
          status: response.status,
          contentType,
          url: response.url,
        },
      }
    }

    if (response.ok) {
      const data = await response.json()
      return {
        connected: true,
        message: "Successfully connected to backend API",
        details: data,
      }
    }

    return {
      connected: false,
      message: `Backend responded with error: ${response.status} ${response.statusText}`,
      details: {
        status: response.status,
        statusText: response.statusText,
      },
    }
  } catch (error: any) {
    console.error("[v0] Connection test failed:", error)
    return {
      connected: false,
      message: `Failed to connect to backend: ${error.message}`,
      details: {
        error: error.message,
        apiUrl: getApiUrl(),
      },
    }
  }
}
