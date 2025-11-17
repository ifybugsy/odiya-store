import type { Metadata } from "next"
import { ItemDetailClient } from "@/components/item-detail-client"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const res = await fetch(`${API_URL}/items/${params.id}`, { 
      cache: "no-store",
      next: { revalidate: 0 }
    })
    
    if (!res.ok) {
      return {
        title: "Item Not Found - Bugsymart",
        description: "The item you're looking for could not be found.",
      }
    }

    const item = await res.json()
    
    const formattedPrice = new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(item.price)

    const description = item.description 
      ? `${item.description.substring(0, 155)}...` 
      : `${item.title} - ${formattedPrice}. ${item.condition ? `Condition: ${item.condition}` : ""}`

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://bugsymart.shop"
    
    // Use the first image from the item, ensuring it's a full URL
    let imageUrl = "/placeholder.svg"
    if (item.images && item.images.length > 0) {
      const firstImage = item.images[0]
      // If image is already a full URL, use it; otherwise construct the full URL
      imageUrl = firstImage.startsWith("http") 
        ? firstImage 
        : `${appUrl}${firstImage}`
    }

    return {
      title: `${item.title} - ${formattedPrice} | Bugsymart`,
      description: description,
      openGraph: {
        title: `${item.title} - ${formattedPrice}`,
        description: description,
        url: `${appUrl}/item/${item._id}`,
        siteName: "Bugsymart - Buy & Sell Online",
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: item.title,
          },
        ],
        type: "website",
        locale: "en_NG",
      },
      twitter: {
        card: "summary_large_image",
        title: `${item.title} - ${formattedPrice}`,
        description: description,
        images: [imageUrl],
      },
      alternates: {
        canonical: `${appUrl}/item/${item._id}`,
      },
    }
  } catch (error) {
    console.error("Failed to generate metadata:", error)
    return {
      title: "Bugsymart - Buy & Sell Online",
      description: "Discover great deals on quality items at Bugsymart marketplace",
    }
  }
}

export default function ItemPage({ params }: { params: { id: string } }) {
  return <ItemDetailClient id={params.id} />
}
