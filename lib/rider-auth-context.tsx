"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { RiderUser } from "./rider-types"

interface RiderAuthContextType {
  rider: RiderUser | null
  token: string | null
  isLoading: boolean
  isVerified: boolean
  login: (token: string, rider: RiderUser) => void
  logout: () => void
  updateRider: (rider: RiderUser) => void
  setIsVerified: (verified: boolean) => void
}

const RiderAuthContext = createContext<RiderAuthContextType | undefined>(undefined)

export function RiderAuthProvider({ children }: { children: React.ReactNode }) {
  const [rider, setRiderState] = useState<RiderUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isVerified, setIsVerified] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("rider_auth")
    if (stored) {
      try {
        const { rider: storedRider, token: storedToken, isVerified: storedVerified } = JSON.parse(stored)
        setRiderState(storedRider)
        setToken(storedToken)
        setIsVerified(storedVerified)
      } catch (e) {
        console.error("Failed to load rider auth:", e)
      }
    }
    setIsLoading(false)
  }, [])

  const login = (newToken: string, newRider: RiderUser) => {
    setToken(newToken)
    setRiderState(newRider)
    setIsVerified(newRider.verificationStatus === "verified")
    localStorage.setItem(
      "rider_auth",
      JSON.stringify({
        token: newToken,
        rider: newRider,
        isVerified: newRider.verificationStatus === "verified",
      }),
    )
  }

  const logout = () => {
    setToken(null)
    setRiderState(null)
    setIsVerified(false)
    localStorage.removeItem("rider_auth")
  }

  const updateRider = (newRider: RiderUser) => {
    setRiderState(newRider)
    setIsVerified(newRider.verificationStatus === "verified")
    if (token) {
      localStorage.setItem(
        "rider_auth",
        JSON.stringify({
          token,
          rider: newRider,
          isVerified: newRider.verificationStatus === "verified",
        }),
      )
    }
  }

  const setIsVerifiedState = (verified: boolean) => {
    setIsVerified(verified)
    if (rider && token) {
      localStorage.setItem(
        "rider_auth",
        JSON.stringify({
          token,
          rider,
          isVerified: verified,
        }),
      )
    }
  }

  return (
    <RiderAuthContext.Provider
      value={{
        rider,
        token,
        isLoading,
        isVerified,
        login,
        logout,
        updateRider,
        setIsVerified: setIsVerifiedState,
      }}
    >
      {children}
    </RiderAuthContext.Provider>
  )
}

export function useRiderAuth() {
  const context = useContext(RiderAuthContext)
  if (!context) {
    throw new Error("useRiderAuth must be used within RiderAuthProvider")
  }
  return context
}
