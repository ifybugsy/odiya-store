"use client"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { CheckCircle, XCircle, Trash2, Eye, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Item {
  _id: string
  title: string
  description: string
  price: number
  category: string
  status: "approved" | "pending" | "rejected" | "sold"
  images: string[]
  condition: string
  location: string
  views: number
  sellerId: {
    firstName: string
    lastName: string
    email: string
  }
  createdAt: string
}

interface ItemsTableEnhancedProps {
  items: Item[]
  selectedItems: string[]
  onSelectItems: (ids: string[]) => void
  onApprove: (itemId: string) => void
  onReject: (itemId: string) => void
  onDelete: (itemId: string) => void
  onPreview: (item: Item) => void
  isLoading?: boolean
}

export default function ItemsTableEnhanced({
  items,
  selectedItems,
  onSelectItems,
  onApprove,
  onReject,
  onDelete,
  onPreview,
  isLoading = false,
}: ItemsTableEnhancedProps) {
  const handleSelectAll = () => {
    if (selectedItems.length === items.length) {
      onSelectItems([])
    } else {
      onSelectItems(items.map((item) => item._id))
    }
  }

  const handleSelectItem = (itemId: string) => {
    if (selectedItems.includes(itemId)) {
      onSelectItems(selectedItems.filter((id) => id !== itemId))
    } else {
      onSelectItems([...selectedItems, itemId])
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      approved: { variant: "default", label: "Approved" },
      pending: { variant: "secondary", label: "Pending" },
      rejected: { variant: "destructive", label: "Rejected" },
      sold: { variant: "outline", label: "Sold" },
    }
    const config = variants[status] || variants.pending
    return (
      <Badge variant={config.variant} className="text-xs">
        {config.label}
      </Badge>
    )
  }

  const getConditionBadge = (condition: string) => {
    return <span className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground font-medium">{condition}</span>
  }

  if (items.length === 0) {
    return (
      <Card className="p-12 text-center border-dashed">
        <p className="text-muted-foreground text-lg mb-2">No items found</p>
        <p className="text-sm text-muted-foreground">Try adjusting your filters or search query</p>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden border-border/40">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 border-b border-border">
            <tr>
              <th className="text-left py-4 px-4 w-12">
                <Checkbox
                  checked={selectedItems.length === items.length && items.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </th>
              <th className="text-left py-4 px-4 font-semibold text-foreground">Item Details</th>
              <th className="text-left py-4 px-4 font-semibold text-foreground">Price</th>
              <th className="text-left py-4 px-4 font-semibold text-foreground">Seller</th>
              <th className="text-left py-4 px-4 font-semibold text-foreground">Category</th>
              <th className="text-left py-4 px-4 font-semibold text-foreground">Status</th>
              <th className="text-left py-4 px-4 font-semibold text-foreground">Views</th>
              <th className="text-left py-4 px-4 font-semibold text-foreground">Posted</th>
              <th className="text-right py-4 px-4 font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {items.map((item) => (
              <tr
                key={item._id}
                className={`hover:bg-muted/50 transition-colors ${
                  selectedItems.includes(item._id) ? "bg-primary/5" : ""
                }`}
              >
                <td className="py-4 px-4">
                  <Checkbox
                    checked={selectedItems.includes(item._id)}
                    onCheckedChange={() => handleSelectItem(item._id)}
                  />
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-16 h-16 rounded-lg bg-muted flex-shrink-0 overflow-hidden border border-border/40">
                      {item.images?.[0] ? (
                        <Image
                          src={item.images[0] || "/placeholder.svg"}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground line-clamp-1 mb-1">{item.title}</p>
                      <div className="flex items-center gap-2">
                        {getConditionBadge(item.condition)}
                        {item.location && (
                          <span className="text-xs text-muted-foreground truncate">{item.location}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <p className="font-bold text-lg text-primary">₦{item.price.toLocaleString()}</p>
                </td>
                <td className="py-4 px-4">
                  <div className="text-sm">
                    <p className="font-medium text-foreground">
                      {item.sellerId?.firstName} {item.sellerId?.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate max-w-[180px]">{item.sellerId?.email}</p>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className="text-sm text-muted-foreground">{item.category}</span>
                </td>
                <td className="py-4 px-4">{getStatusBadge(item.status)}</td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.views || 0}</span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className="text-xs text-muted-foreground">
                    {new Date(item.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex gap-1 justify-end">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onPreview(item)}
                      className="w-9 h-9 p-0 hover:bg-primary/10"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    {item.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => onApprove(item._id)}
                          disabled={isLoading}
                          className="w-9 h-9 p-0 bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => onReject(item._id)}
                          disabled={isLoading}
                          variant="outline"
                          className="w-9 h-9 p-0"
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      onClick={() => onDelete(item._id)}
                      disabled={isLoading}
                      variant="ghost"
                      className="w-9 h-9 p-0 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
