"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"

interface WishlistContextType {
  savedItems: string[]
  toggleSaveItem: (itemId: string) => void
  isItemSaved: (itemId: string) => boolean
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [savedItems, setSavedItems] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)

  // Load saved items from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("savedItems")
      if (saved) {
        setSavedItems(JSON.parse(saved))
      }
    } catch (error) {
      console.error("[v0] Failed to load saved items:", error)
    }
    setMounted(true)
  }, [])

  // Save to localStorage whenever savedItems changes
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem("savedItems", JSON.stringify(savedItems))
      } catch (error) {
        console.error("[v0] Failed to save items:", error)
      }
    }
  }, [savedItems, mounted])

  const toggleSaveItem = (itemId: string) => {
    setSavedItems((prev) => (prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]))
  }

  const isItemSaved = (itemId: string) => savedItems.includes(itemId)

  return (
    <WishlistContext.Provider value={{ savedItems, toggleSaveItem, isItemSaved }}>{children}</WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider")
  }
  return context
}
