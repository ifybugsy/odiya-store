import type React from "react"

/**
 * Image utility functions for safe rendering and error handling
 * Handles domain migration by converting old domain URLs to new ones
 */

export function normalizeImageUrl(imagePath: string | undefined | null): string {
  if (!imagePath) return "/placeholder.svg"

  const trimmedPath = (imagePath as string).trim()

  if (!trimmedPath) return "/placeholder.svg"

  // Get the current backend URL from environment
  const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || ""

  // List of old domains that need to be replaced
  const oldDomains = [
    "api.odiya.store",
    "odiya.store",
    "http://api.odiya.store",
    "https://api.odiya.store",
    "http://odiya.store",
    "https://odiya.store",
  ]

  // Check if the image URL contains an old domain
  let imageUrl = trimmedPath
  for (const oldDomain of oldDomains) {
    if (imageUrl.includes(oldDomain)) {
      console.log("[v0] Converting old domain URL:", imageUrl)

      // Extract the path after /uploads/
      const uploadsIndex = imageUrl.indexOf("/uploads/")
      if (uploadsIndex !== -1) {
        const uploadPath = imageUrl.substring(uploadsIndex)
        imageUrl = backendUrl ? `${backendUrl}${uploadPath}` : uploadPath
        console.log("[v0] Converted to:", imageUrl)
      }
      break
    }
  }

  // If it's already a full URL with http/https, return as-is
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl
  }

  // If it's a relative path starting with /, return as-is
  if (imageUrl.startsWith("/")) {
    return imageUrl
  }

  // For other cases, treat as storage path
  return imageUrl || "/placeholder.svg"
}

export function getImageUrl(imagePath: string | undefined | null): string {
  return normalizeImageUrl(imagePath)
}

export function handleImageError(event: React.SyntheticEvent<HTMLImageElement>) {
  console.log("[v0] Image load error:", event.currentTarget.src)
  event.currentTarget.src = "/placeholder.svg"
  event.currentTarget.style.opacity = "0.5"
}

export const imageProps = {
  onError: handleImageError,
  decoding: "async" as const,
  loading: "lazy" as const,
}
