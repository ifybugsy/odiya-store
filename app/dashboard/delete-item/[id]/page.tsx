"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export default function DeleteItemPage() {
  const { user, token } = useAuth()
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    if (!user || !token) {
      router.push("/login")
      return
    }

    const deleteItem = async () => {
      try {
        const res = await fetch(`${API_URL}/items/${params.id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) {
          const contentType = res.headers.get("content-type")
          if (contentType?.includes("application/json")) {
            const data = await res.json()
            alert(data.error || "Failed to delete item")
          } else {
            alert(`Error: ${res.status} ${res.statusText}`)
          }
        } else {
          const contentType = res.headers.get("content-type")
          if (contentType?.includes("application/json")) {
            const data = await res.json()
            alert("Item deleted successfully!")
          } else {
            alert("Item deleted successfully!")
          }
        }

        router.push("/dashboard")
      } catch (error) {
        console.error("Error:", error)
        alert("An error occurred while deleting item")
        router.push("/dashboard")
      }
    }

    deleteItem()
  }, [user, token, router, params.id])

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  )
}
