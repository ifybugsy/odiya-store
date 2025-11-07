"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useRiderAuth } from "@/lib/rider-auth-context"
import { RiderSidebar } from "@/components/rider/rider-sidebar"
import { RiderNavbar } from "@/components/rider/rider-navbar"
import { Spinner } from "@/components/ui/spinner"

export default function RiderDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { rider, isLoading } = useRiderAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !rider) {
      router.push("/rider/register")
    }
  }, [rider, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="w-8 h-8" />
      </div>
    )
  }

  if (!rider) {
    return null
  }

  return (
    <div>
      <RiderNavbar />
      <div className="flex">
        <RiderSidebar />
        <main className="flex-1 ml-64 p-8 bg-muted/50 min-h-screen">{children}</main>
      </div>
    </div>
  )
}
