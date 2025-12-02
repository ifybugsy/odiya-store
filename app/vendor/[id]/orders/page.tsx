"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useVendorAuth } from "@/lib/vendor-auth-context"
import { ArrowLeft, Package, Clock, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

interface Order {
  _id: string
  orderNumber: string
  items: any[]
  totalAmount: number
  status: string
  customerName: string
  customerEmail: string
  createdAt: string
}

export default function VendorOrdersPage() {
  const params = useParams()
  const router = useRouter()
  const vendorId = params.id as string
  const { vendor, vendorToken } = useVendorAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    if (!vendor || !vendorToken) {
      router.push("/vendor/login")
      return
    }

    loadOrders()
  }, [vendor, vendorToken, vendorId])

  const loadOrders = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/vendors/${vendorId}/orders`, {
        headers: { Authorization: `Bearer ${vendorToken}` },
      })

      if (res.ok) {
        const data = await res.json()
        setOrders(data.orders || [])
      }
    } catch (error) {
      console.error("Failed to load orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-600" />
      case "processing":
        return <Package className="w-5 h-5 text-blue-600" />
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "cancelled":
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return <Package className="w-5 h-5 text-muted-foreground" />
    }
  }

  const filteredOrders = statusFilter === "all" ? orders : orders.filter((order) => order.status === statusFilter)

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background py-8">
        <div className="max-w-7xl mx-auto px-4">
          <Link href="/vendor/dashboard">
            <Button variant="outline" size="sm" className="mb-6 bg-transparent">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>

          <h1 className="text-3xl font-bold mb-8 text-foreground">Orders Management</h1>

          {/* Status Filter */}
          <div className="mb-6 flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant={statusFilter === "all" ? "default" : "outline"}
              onClick={() => setStatusFilter("all")}
            >
              All Orders ({orders.length})
            </Button>
            <Button
              size="sm"
              variant={statusFilter === "pending" ? "default" : "outline"}
              onClick={() => setStatusFilter("pending")}
            >
              Pending ({orders.filter((o) => o.status === "pending").length})
            </Button>
            <Button
              size="sm"
              variant={statusFilter === "processing" ? "default" : "outline"}
              onClick={() => setStatusFilter("processing")}
            >
              Processing ({orders.filter((o) => o.status === "processing").length})
            </Button>
            <Button
              size="sm"
              variant={statusFilter === "completed" ? "default" : "outline"}
              onClick={() => setStatusFilter("completed")}
            >
              Completed ({orders.filter((o) => o.status === "completed").length})
            </Button>
          </div>

          {/* Orders List */}
          {filteredOrders.length > 0 ? (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <Card key={order._id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(order.status)}
                        <h3 className="font-bold text-lg text-foreground">Order #{order.orderNumber}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()} at{" "}
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">₦{order.totalAmount.toLocaleString()}</p>
                      <p
                        className={`text-sm font-semibold capitalize ${
                          order.status === "completed"
                            ? "text-green-600"
                            : order.status === "pending"
                              ? "text-yellow-600"
                              : "text-blue-600"
                        }`}
                      >
                        {order.status}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4">
                    <p className="text-sm font-medium text-foreground mb-1">Customer:</p>
                    <p className="text-sm text-muted-foreground">
                      {order.customerName} - {order.customerEmail}
                    </p>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button size="sm" variant="outline" className="bg-transparent">
                      View Details
                    </Button>
                    <Button size="sm" variant="outline" className="bg-transparent">
                      Update Status
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No orders found</p>
            </Card>
          )}
        </div>
      </main>
    </>
  )
}
