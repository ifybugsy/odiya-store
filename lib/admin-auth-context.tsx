"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface AdminUser {
  id: string
  email: string
  name: string
  role: "admin" | "superadmin"
}

interface AdminAuthContextType {
  adminUser: AdminUser | null
  adminToken: string | null
  loginAdmin: (email: string, password: string) => Promise<void>
  logoutAdmin: () => void
  isLoading: boolean
  error: string | null
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

// Production credentials (in real app, validate against backend)
const ADMIN_CREDENTIALS = [
  { email: "admin@odiyastore.com", password: "SecureAdmin@2024", role: "superadmin" as const },
  { email: "moderator@odiyastore.com", password: "Moderator@2024", role: "admin" as const },
]

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [adminToken, setAdminToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Load admin session from localStorage
    const stored = localStorage.getItem("admin_auth")
    if (stored) {
      try {
        const { user, token } = JSON.parse(stored)
        setAdminUser(user)
        setAdminToken(token)
      } catch (e) {
        console.error("Failed to load admin auth:", e)
        localStorage.removeItem("admin_auth")
      }
    }
    setIsLoading(false)
  }, [])

  const loginAdmin = async (email: string, password: string) => {
    setIsLoading(true)
    setError(null)

    try {
      // Validate against credentials
      const validUser = ADMIN_CREDENTIALS.find((cred) => cred.email === email && cred.password === password)

      if (!validUser) {
        throw new Error("Invalid email or password")
      }

      // Generate token (in production, this would come from backend)
      const token = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      const user: AdminUser = {
        id: `admin_${Date.now()}`,
        email: validUser.email,
        name: validUser.email.split("@")[0],
        role: validUser.role,
      }

      setAdminUser(user)
      setAdminToken(token)
      localStorage.setItem("admin_auth", JSON.stringify({ user, token }))
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed"
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const logoutAdmin = () => {
    setAdminUser(null)
    setAdminToken(null)
    localStorage.removeItem("admin_auth")
  }

  return (
    <AdminAuthContext.Provider value={{ adminUser, adminToken, loginAdmin, logoutAdmin, isLoading, error }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (!context) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider")
  }
  return context
}
