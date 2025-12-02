import type { Metadata } from "next"
import VendorPageClient from "./VendorPageClient"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id: vendorId } = await params

  try {
    const res = await fetch(`${API_URL}/vendors/${vendorId}`, {
      cache: "no-store",
      next: { revalidate: 0 },
    })

    if (!res.ok) {
      return {
        title: "Vendor Not Found - Bugsymart",
        description: "The vendor you're looking for could not be found.",
      }
    }

    const vendor = await res.json()

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://bugsymart.shop"

    const imageUrl = vendor.storeLogo || vendor.storeImage || `${appUrl}/logo.png`

    const description =
      vendor.storeDescription ||
      `Shop from ${vendor.storeName} on Bugsymart. Trusted vendor with ${vendor.followers_count || 0} followers and ${vendor.totalSales || 0} sales.`

    return {
      title: `${vendor.storeName} - Vendor Store | Bugsymart`,
      description: description.substring(0, 160),
      keywords: [vendor.storeName, "vendor", "online store", "marketplace", "Nigeria", "Bugsymart", "buy online"],
      openGraph: {
        title: `${vendor.storeName} - Vendor Store`,
        description: description,
        url: `${appUrl}/vendor/${vendor._id}`,
        siteName: "Bugsymart",
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: vendor.storeName,
          },
        ],
        type: "website",
        locale: "en_NG",
      },
      twitter: {
        card: "summary_large_image",
        title: `${vendor.storeName} - Vendor Store`,
        description: description,
        images: [imageUrl],
      },
      alternates: {
        canonical: `${appUrl}/vendor/${vendor._id}`,
      },
    }
  } catch (error) {
    console.error("Failed to generate vendor metadata:", error)
    return {
      title: "Vendor Store - Bugsymart",
      description: "Discover quality vendors on Bugsymart marketplace",
    }
  }
}

export default async function VendorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: vendorId } = await params

  return <VendorPageClient id={vendorId} />
}
