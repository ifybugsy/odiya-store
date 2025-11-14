"use client"

import { getApiUrl, validateEnvironment } from "./env-config"

const API_URL = getApiUrl()

if (typeof window !== "undefined") {
  const config = validateEnvironment()

  if (!config.isConfigured) {
    // Only log once when page loads, not on every render
    if (!sessionStorage.getItem("api-config-error-shown")) {
      console.error("API Configuration Error - Backend not configured")
      console.error("Set NEXT_PUBLIC_API_URL in Vercel environment variables")
      sessionStorage.setItem("api-config-error-shown", "true")
    }
  }
}

export const apiConfig = {
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
}

export async function apiCall(endpoint: string, options: RequestInit & { method?: string } = {}) {
  const config = validateEnvironment()

  if (!config.isConfigured) {
    throw new Error(
      "API not configured. " + config.errors.join(" ") + " Please set NEXT_PUBLIC_API_URL environment variable.",
    )
  }

  const url = `${API_URL}${endpoint}`
  const token = typeof window !== "undefined" ? localStorage.getItem("auth") : null
  let authToken: string | null = null

  if (token) {
    try {
      const parsed = JSON.parse(token)
      authToken = parsed.token
    } catch (e) {
      // Silent - invalid token will be handled by 401 response
    }
  }

  const headers: HeadersInit = {
    ...apiConfig.headers,
    ...options.headers,
  }

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), apiConfig.timeout)

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    const contentType = response.headers.get("content-type")
    if (contentType && contentType.includes("text/html")) {
      throw new Error(
        `API endpoint not found: ${endpoint}. ` +
          `This usually means the backend is not deployed or NEXT_PUBLIC_API_URL is incorrect. ` +
          `Expected JSON but received HTML (likely a 404 page).`,
      )
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: `HTTP ${response.status}`,
      }))

      if (response.status === 401) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth")
          window.location.href = "/login"
        }
      }

      throw new Error(error.message || `API error: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    clearTimeout(timeoutId)

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error(`Request timeout after ${apiConfig.timeout}ms`)
      }
      if (error.message.includes("Failed to fetch")) {
        throw new Error(
          `Network error: Unable to reach backend at ${API_URL}. ` +
            `Please verify: 1) Backend is deployed, 2) NEXT_PUBLIC_API_URL environment variable is correct, 3) CORS is properly configured on backend.`,
        )
      }
      throw error
    } else {
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
      return await apiCall(endpoint, options)
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (attempt < maxRetries) {
        const delayMs = Math.pow(2, attempt) * 1000
        await new Promise((resolve) => setTimeout(resolve, delayMs))
      }
    }
  }

  throw lastError || new Error("API call failed after retries")
}

export function getApiBaseUrl() {
  return API_URL
}
