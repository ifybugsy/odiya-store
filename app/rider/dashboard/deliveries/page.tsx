"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useRiderAuth } from "@/lib/rider-auth-context"
import { Package, MapPin, Phone, Clock } from "lucide-react"

interface Delivery {
  _id: string
  itemTitle: string
  pickupLocation: string
  deliveryLocation: string
  customerPhone: string
  paymentAmount: number
  status: "pending" | "in-transit" | "delivered" | "cancelled"
  createdAt: string
}

export default function DeliveriesPage() {
  const router = useRouter()
  const { rider, token } = useRiderAuth()
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "pending" | "in-transit" | "delivered">("all")

  useEffect(() => {
    if (!rider || !token) {
      router.push("/rider/login")
      return
    }
    loadDeliveries()
  }, [rider, token])

  const loadDeliveries = async () => {
    try {
      const response = await fetch("/api/rider/deliveries", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setDeliveries(data)
      }
    } catch (error) {
      console.error("Failed to load deliveries:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredDeliveries = filter === "all" ? deliveries : deliveries.filter((d) => d.status === filter)

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    "in-transit": "bg-blue-100 text-blue-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading deliveries...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Deliveries</h1>
        <p className="text-muted-foreground mt-1">Track and manage your delivery assignments</p>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "pending", "in-transit", "delivered"] as const).map((status) => (
          <Button
            key={status}
            onClick={() => setFilter(status)}
            variant={filter === status ? "default" : "outline"}
            className="capitalize"
          >
            {status.replace("-", " ")}
          </Button>
        ))}
      </div>

      {/* Deliveries List */}
      <div className="space-y-4">
        {filteredDeliveries.length === 0 ? (
          <Card className="p-12 text-center">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground text-lg font-medium">No deliveries found</p>
            <p className="text-sm text-muted-foreground mt-1">New delivery assignments will appear here</p>
          </Card>
        ) : (
          filteredDeliveries.map((delivery) => (
            <Card key={delivery._id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-foreground">{delivery.itemTitle}</h3>
                    <Badge className={`${statusColors[delivery.status]} capitalize mt-2`}>{delivery.status}</Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">₦{delivery.paymentAmount.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground mt-1">Delivery Fee</p>
                  </div>
                </div>

                <div className="space-y-3 border-t border-border pt-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Pickup: {delivery.pickupLocation}</p>
                      <p className="text-sm font-medium text-foreground mt-1">Delivery: {delivery.deliveryLocation}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm text-foreground">{delivery.customerPhone}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{new Date(delivery.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                {delivery.status === "pending" && (
                  <div className="flex gap-2 mt-4">
                    <Button className="flex-1 bg-green-600 hover:bg-green-700">Accept</Button>
                    <Button variant="outline" className="flex-1 bg-transparent">
                      Decline
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
