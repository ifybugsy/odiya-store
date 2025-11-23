import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/lib/auth-context"
import { WishlistProvider } from "@/lib/wishlist-context"
import { RiderAuthProvider } from "@/lib/rider-auth-context"
import { BuyerAuthProvider } from "@/lib/buyer-auth-context"
import "./globals.css"

export const metadata: Metadata = {
  title: "Bugsy Mart - Buy & Sell Online",
  description: "Bugsy marketplace for buying and selling items",
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
        <AuthProvider>
          <BuyerAuthProvider>
            <RiderAuthProvider>
              <WishlistProvider>{children}</WishlistProvider>
            </RiderAuthProvider>
          </BuyerAuthProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
