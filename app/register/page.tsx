"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function RegisterRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/buyer/register")
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Redirecting to registration...</p>
    </div>
  )
}
