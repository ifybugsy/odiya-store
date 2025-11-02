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
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (token: string, user: User) => void
  logout: () => void
  setUser: (user: User) => void
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
      } catch (e) {
        console.error("Failed to load auth:", e)
      }
    }
    setIsLoading(false)
  }, [])

  const login = (newToken: string, newUser: User) => {
    setToken(newToken)
    setUserState(newUser)
    localStorage.setItem("auth", JSON.stringify({ token: newToken, user: newUser }))
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

  return (
    <AuthContext.Provider value={{ user, token, login, logout, setUser, isLoading }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
