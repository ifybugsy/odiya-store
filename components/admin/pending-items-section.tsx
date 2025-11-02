"use client"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle, XCircle, Trash2 } from "lucide-react"

interface PendingItem {
  _id: string
  title: string
  description: string
  price: number
  category: string
  images: string[]
  sellerId: {
    firstName: string
    lastName: string
  }
}

interface PendingItemsSectionProps {
  items: PendingItem[]
  onApprove: (itemId: string) => void
  onReject: (itemId: string) => void
  onDelete: (itemId: string) => void
  isLoading?: boolean
}

export default function PendingItemsSection({
  items,
  onApprove,
  onReject,
  onDelete,
  isLoading = false,
}: PendingItemsSectionProps) {
  if (items.length === 0) {
    return (
      <Card className="p-12 text-center">
        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3 opacity-50" />
        <p className="text-muted-foreground text-lg font-medium">No pending items</p>
        <p className="text-sm text-muted-foreground mt-1">All items have been reviewed</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <Card key={item._id} className="p-6 hover:shadow-md transition-shadow">
          <div className="flex gap-6 mb-4">
            {item.images?.[0] && (
              <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                <Image src={item.images[0] || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-bold text-lg text-foreground">{item.title}</h3>
              <p className="text-muted-foreground text-sm mb-3">{item.description?.substring(0, 100)}...</p>
              <div className="flex gap-4 text-sm flex-wrap">
                <span className="font-semibold text-primary">₦{item.price.toLocaleString()}</span>
                <span className="text-muted-foreground">{item.category}</span>
                <span className="text-muted-foreground">
                  Seller: {item.sellerId?.firstName} {item.sellerId?.lastName}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() => onApprove(item._id)}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Approve
            </Button>
            <Button
              onClick={() => onReject(item._id)}
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              Reject
            </Button>
            <Button
              onClick={() => onDelete(item._id)}
              disabled={isLoading}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )
}
