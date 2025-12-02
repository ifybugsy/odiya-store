import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/lib/auth-context"
import { WishlistProvider } from "@/lib/wishlist-context"
import { RiderAuthProvider } from "@/lib/rider-auth-context"
import { BuyerAuthProvider } from "@/lib/buyer-auth-context"
import { VendorAuthProvider } from "@/lib/vendor-auth-context"
import { EnvStatusBanner } from "@/components/env-status-banner"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: "Bugsymart - Buy & Sell Online Marketplace",
    template: "%s | Bugsymart",
  },
  description:
    "Bugsymart is your trusted online marketplace for buying and selling quality items. Find great deals on electronics, fashion, home goods, and more.",
  keywords: ["marketplace", "buy", "sell", "online shopping", "Nigeria", "e-commerce", "Bugsymart"],
  authors: [{ name: "Bugsymart" }],
  creator: "Bugsymart",
  publisher: "Bugsymart",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://bugsymart.shop"),
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://bugsymart.shop",
    siteName: "Bugsymart",
    title: "Bugsymart - Buy & Sell Online Marketplace",
    description: "Your trusted online marketplace for buying and selling quality items",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Bugsymart Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bugsymart - Buy & Sell Online Marketplace",
    description: "Your trusted online marketplace for buying and selling quality items",
    images: ["/logo.png"],
  },
  icons: {
    icon: "/bugsymat-logo.png",
  },
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <EnvStatusBanner />
        <AuthProvider>
          <VendorAuthProvider>
            <BuyerAuthProvider>
              <RiderAuthProvider>
                <WishlistProvider>{children}</WishlistProvider>
              </RiderAuthProvider>
            </BuyerAuthProvider>
          </VendorAuthProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
