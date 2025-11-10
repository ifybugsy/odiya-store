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
    })

    throw new Error(
      `API endpoint not found: ${endpoint}. ` +
        `This usually means the backend is not deployed or NEXT_PUBLIC_API_URL is incorrect. ` +
        `Expected JSON but received HTML (likely a 404 page).`,
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

      throw new Error(data.error || data.message || `HTTP ${response.status}`)
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
        `Failed to parse API response from ${endpoint}. ` +
          `The server returned invalid JSON. This typically means: ` +
          `1) The backend API is not deployed at this URL, ` +
          `2) CORS is blocking the request, or ` +
          `3) The endpoint doesn't exist.`,
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
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

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
          `The backend server is not responding. ` +
          `Please verify NEXT_PUBLIC_API_URL is set correctly.`,
      )
    }

    if (error.message?.includes("Failed to fetch")) {
      console.error("[v0] Network Error:", {
        endpoint,
        apiUrl,
        error: error.message,
      })

      throw new Error(
        `Network error: Unable to reach backend at ${apiUrl}. ` +
          `Please verify: 1) Backend is deployed, ` +
          `2) NEXT_PUBLIC_API_URL environment variable is correct, ` +
          `3) CORS is properly configured on backend.`,
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

  // Check if using localhost
  if (apiUrl.includes("localhost")) {
    warnings.push(
      "Using localhost API URL. This will not work in production. " +
        "Set NEXT_PUBLIC_API_URL environment variable to your backend URL.",
    )
  }

  // Check if using old domain
  if (apiUrl.includes("odiya")) {
    warnings.push(
      'API URL contains old domain "odiya". ' + "Update NEXT_PUBLIC_API_URL to point to new backend domain.",
    )
  }

  // Check if properly formatted
  if (!apiUrl.endsWith("/api")) {
    warnings.push("API URL should end with /api. " + `Current value: ${apiUrl}`)
  }

  const isValid = warnings.length === 0

  console.log("[v0] API Configuration:", {
    apiUrl,
    backendUrl,
    isValid,
    warnings,
  })

  return { isValid, apiUrl, backendUrl, warnings }
}
