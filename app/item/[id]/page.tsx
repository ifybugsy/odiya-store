"use client"

import type React from "react"
import type { Metadata } from "next"
import { ItemDetailClient } from "@/components/item-detail-client"
import { useState, useEffect } from "react"
import { useParams } from 'next/navigation'
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Star, MapPin, AlertTriangle, Phone, ChevronLeft, ChevronRight } from 'lucide-react'
import { ShareButtons } from "@/components/share-buttons"
import { SaveButton } from "@/components/save-button"
import RelatedItems from "@/components/related-items"
import Head from "next/head"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const res = await fetch(`${API_URL}/items/${params.id}`, { cache: "no-store" })
    
    if (!res.ok) {
      return {
        title: "Item Not Found - Bugsymart",
      }
    }

    const item = await res.json()
    
    const formattedPrice = new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(item.price)

    const description = item.description 
      ? `${item.description.substring(0, 155)}...` 
      : `${item.title} - ${formattedPrice}`

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://bugsymart.shop"
    const imageUrl = item.images?.[0] || `${appUrl}/placeholder.svg`

    return {
      title: `${item.title} - Bugsymart`,
      description: description,
      openGraph: {
        title: item.title,
        description: description,
        url: `${appUrl}/item/${item._id}`,
        siteName: "Bugsymart",
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: item.title,
          },
        ],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: item.title,
        description: description,
        images: [imageUrl],
      },
    }
  } catch (error) {
    console.error("Failed to generate metadata:", error)
    return {
      title: "Bugsymart - Buy and Sell",
    }
  }
}

export default function ItemPage({ params }: { params: { id: string } }) {
  return <ItemDetailClient id={params.id} />
}
