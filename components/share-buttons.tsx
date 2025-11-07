"use client"

import { Facebook, MessageCircle, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { shareToFacebook, shareToWhatsApp, canShare, nativeShare } from "@/lib/share-utils"

interface ShareButtonsProps {
  title: string
  description: string
  price: string
  itemId: string
}

export function ShareButtons({ title, description, price, itemId }: ShareButtonsProps) {
  const currentUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/item/${itemId}`
      : `${process.env.NEXT_PUBLIC_APP_URL || "https://marketplace.local"}/item/${itemId}`

  const handleShareFacebook = () => {
    shareToFacebook({
      title,
      description,
      url: currentUrl,
      price,
    })
  }

  const handleShareWhatsApp = () => {
    shareToWhatsApp({
      title,
      description,
      url: currentUrl,
      price,
    })
  }

  const handleNativeShare = async () => {
    if (canShare()) {
      await nativeShare({
        title,
        description,
        url: currentUrl,
      })
    }
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleShareFacebook}
        className="flex items-center gap-2 bg-transparent"
        title="Share to Facebook"
      >
        <Facebook className="w-4 h-4" />
        <span className="hidden sm:inline">Facebook</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleShareWhatsApp}
        className="flex items-center gap-2 bg-transparent"
        title="Share to WhatsApp"
      >
        <MessageCircle className="w-4 h-4" />
        <span className="hidden sm:inline">WhatsApp</span>
      </Button>

      {canShare() && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleNativeShare}
          className="flex items-center gap-2 bg-transparent"
          title="Share"
        >
          <Share2 className="w-4 h-4" />
          <span className="hidden sm:inline">Share</span>
        </Button>
      )}
    </div>
  )
}
