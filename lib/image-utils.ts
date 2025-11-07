import type React from "react"
/**
 * Image utility functions for safe rendering and error handling
 */

export function getImageUrl(imagePath: string | undefined | null): string {
  if (!imagePath) return "/placeholder.svg"

  const trimmedPath = (imagePath as string).trim()

  // If it's already a full URL, return as-is
  if (trimmedPath.startsWith("http")) {
    return trimmedPath
  }

  // If it's a relative path, ensure it's valid
  if (trimmedPath.startsWith("/")) {
    return trimmedPath
  }

  // For other cases, treat as storage path and return as-is
  return trimmedPath || "/placeholder.svg"
}

export function handleImageError(event: React.SyntheticEvent<HTMLImageElement>) {
  event.currentTarget.src = "/placeholder.svg"
  event.currentTarget.style.opacity = "0.5"
}

export const imageProps = {
  onError: handleImageError,
  decoding: "async" as const,
  loading: "lazy" as const,
}
