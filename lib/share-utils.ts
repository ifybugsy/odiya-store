export interface ShareOptions {
  title: string
  description: string
  url: string
  price?: string
}

export const shareToFacebook = (options: ShareOptions) => {
  const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(options.url)}&quote=${encodeURIComponent(`${options.title} - ${options.price || ""}`)}`
  window.open(shareUrl, "_blank", "width=600,height=400")
}

export const shareToWhatsApp = (options: ShareOptions) => {
  const text = `Check out: ${options.title}\n${options.description}\n${options.price ? `Price: ${options.price}\n` : ""}${options.url}`
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`
  window.open(whatsappUrl, "_blank")
}

export const canShare = () => {
  return typeof navigator !== "undefined" && "share" in navigator
}

export const nativeShare = async (options: ShareOptions) => {
  try {
    await navigator.share({
      title: options.title,
      text: options.description,
      url: options.url,
    })
  } catch (error) {
    if (error instanceof Error && error.name !== "AbortError") {
      console.error("[v0] Share failed:", error)
    }
  }
}
