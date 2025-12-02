"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  isSeller: boolean
  isAdmin: boolean
  isRider?: boolean
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (token: string, user: User) => void
  logout: () => void
  setUser: (user: User) => void
  refreshAuth: (user: User) => void
  updateUserRole: (updates: Partial<User>) => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load from localStorage on mount
    const stored = localStorage.getItem("auth")
    if (stored) {
      try {
        const { user, token } = JSON.parse(stored)
        setUserState(user)
        setToken(token)
        refreshUserData(token)
      } catch (e) {
        console.error("Failed to load auth:", e)
      }
    }
    setIsLoading(false)
  }, [])

  const refreshUserData = async (authToken: string) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
      const response = await fetch(`${API_URL}/auth/refresh-token`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log("[v0] User data refreshed. isSeller:", data.user.isSeller)

        const updatedUser = {
          id: data.user.id,
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          email: data.user.email,
          isSeller: data.user.isSeller,
          isAdmin: data.user.isAdmin,
          isRider: data.user.isRider,
        }

        setUserState(updatedUser)
        localStorage.setItem("auth", JSON.stringify({ token: data.token, user: updatedUser }))
        setToken(data.token)
      }
    } catch (error) {
      console.error("[v0] Failed to refresh user data:", error)
    }
  }

  const login = (newToken: string, newUser: User) => {
    setToken(newToken)
    setUserState(newUser)
    localStorage.setItem("auth", JSON.stringify({ token: newToken, user: newUser }))
    refreshUserData(newToken)
  }

  const logout = () => {
    setToken(null)
    setUserState(null)
    localStorage.removeItem("auth")
  }

  const setUser = (newUser: User) => {
    setUserState(newUser)
    if (token) {
      localStorage.setItem("auth", JSON.stringify({ token, user: newUser }))
    }
  }

  const refreshAuth = (newUser: User) => {
    setUserState(newUser)
    if (token) {
      localStorage.setItem("auth", JSON.stringify({ token, user: newUser }))
    }
  }

  const updateUserRole = async (updates: Partial<User>) => {
    if (!token || !user) return

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
      const response = await fetch(`${API_URL}/users/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        console.error("Failed to fetch updated user profile")
        return
      }

      const freshUserData = await response.json()

      // Update local state with fresh backend data
      const updatedUser = {
        id: freshUserData._id || freshUserData.id,
        firstName: freshUserData.firstName,
        lastName: freshUserData.lastName,
        email: freshUserData.email,
        isSeller: freshUserData.isSeller,
        isAdmin: freshUserData.isAdmin,
        isRider: freshUserData.isRider,
      }

      setUserState(updatedUser)
      localStorage.setItem("auth", JSON.stringify({ token, user: updatedUser }))
    } catch (error) {
      console.error("Error updating user role:", error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, setUser, refreshAuth, updateUserRole, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
