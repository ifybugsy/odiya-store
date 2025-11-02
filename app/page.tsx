"use client"

import { useState, useEffect } from "react"
import Navbar from "@/components/navbar"
import HomePage from "@/components/pages/home-page"
import Footer from "@/components/footer"
import { AuthProvider } from "@/lib/auth-context"

export default function Page() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <AuthProvider>
      <Navbar />
      <HomePage />
      <Footer />
    </AuthProvider>
  )
}
