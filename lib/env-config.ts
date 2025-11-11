"use client"

/**
 * Comprehensive Environment Configuration Manager
 * Handles API URL configuration, validation, and debugging for all environments
 */

export interface EnvironmentConfig {
  apiUrl: string
  backendUrl: string
  environment: "development" | "staging" | "production"
  isConfigured: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Get the current environment
 */
export function getEnvironment(): "development" | "staging" | "production" {
  if (typeof window === "undefined") return "development"

  const hostname = window.location.hostname

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "development"
  }

  if (hostname.includes("staging") || hostname.includes("preview")) {
    return "staging"
  }

  return "production"
}

/**
 * Get API URL with fallback logic
 */
export function getApiUrl(): string {
  // Priority 1: Environment variable
  const envApiUrl = process.env.NEXT_PUBLIC_API_URL

  if (envApiUrl) {
    return envApiUrl.trim()
  }

  // Priority 2: Development default
  if (getEnvironment() === "development") {
    return "http://localhost:5000/api"
  }

  // Priority 3: No configuration - return empty to trigger error
  return ""
}

/**
 * Get backend URL (API URL without /api suffix)
 */
export function getBackendUrl(): string {
  const apiUrl = getApiUrl()
  if (!apiUrl) return ""

  return apiUrl.replace(/\/api\/?$/, "")
}

/**
 * Validate environment configuration
 */
export function validateEnvironment(): EnvironmentConfig {
  const apiUrl = getApiUrl()
  const backendUrl = getBackendUrl()
  const environment = getEnvironment()
  const errors: string[] = []
  const warnings: string[] = []

  // Critical Error: No API URL in production
  if (!apiUrl) {
    errors.push(
      "NEXT_PUBLIC_API_URL is not set. " +
        "Please configure this environment variable in your Vercel project settings.",
    )
  }

  // Error: Using localhost in production
  if (environment === "production" && apiUrl.includes("localhost")) {
    errors.push(
      "Cannot use localhost API URL in production. " + "Update NEXT_PUBLIC_API_URL to your deployed backend URL.",
    )
  }

  // Error: Using HTTP in production
  if (environment === "production" && apiUrl.startsWith("http://") && !apiUrl.includes("localhost")) {
    errors.push("API URL uses insecure HTTP protocol in production. " + "Update to HTTPS for security.")
  }

  // Warning: Old domain reference
  if (apiUrl.includes("odiya.store")) {
    warnings.push("API URL references old domain 'odiya.store'. " + "Update to new backend domain if migrated.")
  }

  // Warning: Missing /api suffix
  if (apiUrl && !apiUrl.endsWith("/api")) {
    warnings.push("API URL should end with '/api'. " + `Current value: ${apiUrl}`)
  }

  // Warning: Using development mode in non-development environment
  if (environment !== "development" && apiUrl.includes("localhost")) {
    warnings.push("Using localhost API in non-development environment. " + "This will cause connection errors.")
  }

  const isConfigured = errors.length === 0

  return {
    apiUrl,
    backendUrl,
    environment,
    isConfigured,
    errors,
    warnings,
  }
}

/**
 * Log environment configuration for debugging
 */
export function logEnvironmentConfig(): void {
  const config = validateEnvironment()

  console.group("[v0] Environment Configuration")
  console.log("Environment:", config.environment)
  console.log("API URL:", config.apiUrl || "(not set)")
  console.log("Backend URL:", config.backendUrl || "(not set)")
  console.log("Configured:", config.isConfigured ? "✓" : "✗")

  if (config.errors.length > 0) {
    console.group("❌ Errors")
    config.errors.forEach((error) => console.error(error))
    console.groupEnd()
  }

  if (config.warnings.length > 0) {
    console.group("⚠️ Warnings")
    config.warnings.forEach((warning) => console.warn(warning))
    console.groupEnd()
  }

  console.groupEnd()
}

/**
 * Test API endpoint connectivity
 */
export async function testApiConnection(): Promise<{
  success: boolean
  message: string
  details?: any
}> {
  const config = validateEnvironment()

  if (!config.isConfigured) {
    return {
      success: false,
      message: "API not configured: " + config.errors.join(", "),
      details: config,
    }
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    const response = await fetch(config.apiUrl, {
      method: "GET",
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    const contentType = response.headers.get("content-type")

    if (contentType?.includes("text/html")) {
      return {
        success: false,
        message: "API returned HTML (404 page). Backend not deployed or endpoint incorrect.",
        details: {
          status: response.status,
          contentType,
          url: config.apiUrl,
        },
      }
    }

    return {
      success: true,
      message: "API connection successful",
      details: {
        status: response.status,
        contentType,
      },
    }
  } catch (error: any) {
    if (error.name === "AbortError") {
      return {
        success: false,
        message: "API request timed out. Backend server not responding.",
        details: { timeout: "5000ms", url: config.apiUrl },
      }
    }

    return {
      success: false,
      message: `Cannot connect to backend: ${error.message}`,
      details: { error: error.message, url: config.apiUrl },
    }
  }
}

/**
 * Get user-friendly error message for API configuration
 */
export function getConfigurationHelp(): string {
  const config = validateEnvironment()

  if (config.isConfigured) {
    return "✓ API configuration is valid"
  }

  let help = "❌ API Configuration Issues:\n\n"

  config.errors.forEach((error, index) => {
    help += `${index + 1}. ${error}\n`
  })

  help += "\n📝 How to Fix:\n\n"

  if (config.environment === "development") {
    help += "For Development:\n"
    help += "1. Make sure your backend server is running on http://localhost:5000\n"
    help += "2. Or update .env.local with: NEXT_PUBLIC_API_URL=http://localhost:5000/api\n\n"
  }

  if (config.environment === "production" || config.environment === "staging") {
    help += `For ${config.environment.charAt(0).toUpperCase() + config.environment.slice(1)}:\n`
    help += "1. Deploy your backend to a hosting service (Heroku, Railway, Render, etc.)\n"
    help += "2. Get your backend API URL (e.g., https://your-backend.herokuapp.com/api)\n"
    help += "3. In Vercel Dashboard:\n"
    help += "   - Go to your project settings\n"
    help += "   - Navigate to 'Environment Variables'\n"
    help += "   - Add: NEXT_PUBLIC_API_URL = https://your-backend.com/api\n"
    help += "   - Redeploy your application\n\n"
  }

  help += "🔗 Backend Deployment Guide:\n"
  help += "See BACKEND_DEPLOYMENT_GUIDE.md for detailed instructions\n"

  return help
}

// Initialize and log configuration on module load (client-side only)
if (typeof window !== "undefined") {
  logEnvironmentConfig()
}
