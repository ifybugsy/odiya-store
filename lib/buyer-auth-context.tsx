"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface BuyerUser {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string
  createdAt: string
}

interface BuyerAuthContextType {
  buyer: BuyerUser | null
  token: string | null
  isLoading: boolean
  login: (token: string, buyer: BuyerUser) => void
  logout: () => void
  updateBuyer: (buyer: BuyerUser) => void
}

const BuyerAuthContext = createContext<BuyerAuthContextType | undefined>(undefined)

export function BuyerAuthProvider({ children }: { children: React.ReactNode }) {
  const [buyer, setBuyerState] = useState<BuyerUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem("buyer_auth")
    if (stored) {
      try {
        const { buyer: storedBuyer, token: storedToken } = JSON.parse(stored)
        setBuyerState(storedBuyer)
        setToken(storedToken)
      } catch (e) {
        console.error("[v0] Failed to load buyer auth:", e)
      }
    }
    setIsLoading(false)
  }, [])

  const login = (newToken: string, newBuyer: BuyerUser) => {
    setToken(newToken)
    setBuyerState(newBuyer)
    localStorage.setItem(
      "buyer_auth",
      JSON.stringify({
        token: newToken,
        buyer: newBuyer,
      }),
    )
  }

  const logout = () => {
    setToken(null)
    setBuyerState(null)
    localStorage.removeItem("buyer_auth")
  }

  const updateBuyer = (newBuyer: BuyerUser) => {
    setBuyerState(newBuyer)
    if (token) {
      localStorage.setItem(
        "buyer_auth",
        JSON.stringify({
          token,
          buyer: newBuyer,
        }),
      )
    }
  }

  return (
    <BuyerAuthContext.Provider
      value={{
        buyer,
        token,
        isLoading,
        login,
        logout,
        updateBuyer,
      }}
    >
      {children}
    </BuyerAuthContext.Provider>
  )
}

export function useBuyerAuth() {
  const context = useContext(BuyerAuthContext)
  if (!context) {
    throw new Error("useBuyerAuth must be used within BuyerAuthProvider")
  }
  return context
}
