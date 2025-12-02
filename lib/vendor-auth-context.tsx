"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface Vendor {
  id: string
  userId: string
  storeName: string
  storeDescription: string
  status: "pending" | "approved" | "rejected" | "suspended"
  email: string
  phone?: string
}

interface VendorAuthContextType {
  vendor: Vendor | null
  vendorToken: string | null
  loginVendor: (token: string, vendor: Vendor) => void
  logoutVendor: () => void
  setVendor: (vendor: Vendor) => void
  refreshVendorAuth: (vendor: Vendor) => void
  isVendorLoading: boolean
}

const VendorAuthContext = createContext<VendorAuthContextType | undefined>(undefined)

export function VendorAuthProvider({ children }: { children: React.ReactNode }) {
  const [vendor, setVendorState] = useState<Vendor | null>(null)
  const [vendorToken, setVendorToken] = useState<string | null>(null)
  const [isVendorLoading, setIsVendorLoading] = useState(true)

  useEffect(() => {
    // Load from localStorage on mount
    const stored = localStorage.getItem("vendor_auth")
    if (stored) {
      try {
        const { vendor, token } = JSON.parse(stored)
        setVendorState(vendor)
        setVendorToken(token)
      } catch (e) {
        console.error("[v0] Failed to load vendor auth:", e)
      }
    }
    setIsVendorLoading(false)
  }, [])

  const loginVendor = (newToken: string, newVendor: Vendor) => {
    setVendorToken(newToken)
    setVendorState(newVendor)
    localStorage.setItem("vendor_auth", JSON.stringify({ token: newToken, vendor: newVendor }))
    console.log("[v0] Vendor logged in successfully:", newVendor.storeName)
  }

  const logoutVendor = () => {
    setVendorToken(null)
    setVendorState(null)
    localStorage.removeItem("vendor_auth")
    console.log("[v0] Vendor logged out")
  }

  const setVendor = (newVendor: Vendor) => {
    setVendorState(newVendor)
    if (vendorToken) {
      localStorage.setItem("vendor_auth", JSON.stringify({ token: vendorToken, vendor: newVendor }))
    }
  }

  const refreshVendorAuth = (newVendor: Vendor) => {
    setVendorState(newVendor)
    if (vendorToken) {
      localStorage.setItem("vendor_auth", JSON.stringify({ token: vendorToken, vendor: newVendor }))
    }
  }

  return (
    <VendorAuthContext.Provider
      value={{ vendor, vendorToken, loginVendor, logoutVendor, setVendor, refreshVendorAuth, isVendorLoading }}
    >
      {children}
    </VendorAuthContext.Provider>
  )
}

export function useVendorAuth() {
  const context = useContext(VendorAuthContext)
  if (!context) {
    throw new Error("useVendorAuth must be used within VendorAuthProvider")
  }
  return context
}
