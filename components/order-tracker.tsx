"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Truck, Package, CheckCircle2 } from "lucide-react"

interface OrderTracker {
  orderId: string
  status: string
  deliveryLocation?: {
    latitude: number
    longitude: number
  }
  estimatedDeliveryTime?: string
}

interface OrderTrackerProps {
  orderId: string
  token: string
}

export function OrderTracker({ orderId, token }: OrderTrackerProps) {
  const [tracker, setTracker] = useState<OrderTracker | null>(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    connectToWebSocket()
  }, [])

  const connectToWebSocket = () => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
    const wsUrl = `${protocol}//${window.location.host}/api/ws?token=${token}`

    try {
      const ws = new WebSocket(wsUrl)

      ws.onopen = () => {
        console.log("[v0] WebSocket connected")
        setConnected(true)
        // Subscribe to order updates
        ws.send(JSON.stringify({ type: "subscribe", orderId }))
      }

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data)
        if (message.type === "order_status" || message.type === "delivery_update") {
          setTracker(
            (prev) =>
              ({
                ...prev,
                ...message.data,
              }) as any,
          )
        }
      }

      ws.onclose = () => {
        setConnected(false)
        // Reconnect after 5 seconds
        setTimeout(connectToWebSocket, 5000)
      }
    } catch (error) {
      console.error("[v0] WebSocket error:", error)
    }
  }

  if (!tracker) {
    return null
  }

  const getStepStatus = (step: string) => {
    const steps = ["pending", "confirmed", "processing", "ready_for_delivery", "in_transit", "delivered"]
    const currentIndex = steps.indexOf(tracker.status)
    const stepIndex = steps.indexOf(step)
    return currentIndex >= stepIndex ? "completed" : "pending"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="w-5 h-5" />
          Order Tracking
        </CardTitle>
        <CardDescription>
          Real-time tracking {connected && <span className="text-green-600 ml-2">● Live</span>}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Timeline */}
        <div className="space-y-4">
          {["confirmed", "processing", "ready_for_delivery", "in_transit", "delivered"].map((step, index) => (
            <div key={step} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    getStepStatus(step) === "completed" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {getStepStatus(step) === "completed" ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <Package className="w-6 h-6" />
                  )}
                </div>
                {index < 4 && (
                  <div className={`w-1 h-8 ${getStepStatus(step) === "completed" ? "bg-green-100" : "bg-gray-100"}`} />
                )}
              </div>
              <div className="pt-2">
                <div className="font-semibold capitalize">{step.replace(/_/g, " ")}</div>
                <div className="text-sm text-gray-600">
                  {getStepStatus(step) === "completed" && tracker.status === step && "In progress"}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Location */}
        {tracker.deliveryLocation && (
          <div className="bg-blue-50 p-4 rounded-lg flex gap-3">
            <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-semibold">Current Location</div>
              <div className="text-xs text-gray-600 mt-1">
                {tracker.deliveryLocation.latitude.toFixed(4)}, {tracker.deliveryLocation.longitude.toFixed(4)}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
