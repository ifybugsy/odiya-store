"use client"

import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useWishlist } from "@/lib/wishlist-context"

interface SaveButtonProps {
  itemId: string
  size?: "sm" | "md" | "lg"
  showLabel?: boolean
  variant?: "default" | "outline" | "ghost"
}

export function SaveButton({ itemId, size = "md", showLabel = true, variant = "outline" }: SaveButtonProps) {
  const { isItemSaved, toggleSaveItem } = useWishlist()
  const isSaved = isItemSaved(itemId)

  return (
    <Button
      variant={variant}
      size={size}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggleSaveItem(itemId)
      }}
      className={`flex items-center gap-2 transition-colors ${
        isSaved
          ? "bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
          : "hover:bg-red-50 hover:text-red-600 hover:border-red-200"
      }`}
      title={isSaved ? "Remove from saved" : "Save for later"}
    >
      <Heart className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
      {showLabel && <span className="hidden sm:inline">{isSaved ? "Saved" : "Save"}</span>}
    </Button>
  )
}
