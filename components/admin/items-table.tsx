"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { CheckCircle, XCircle, Trash2, Eye } from "lucide-react"

interface Item {
  _id: string
  title: string
  price: number
  category: string
  status: "approved" | "pending" | "rejected"
  images: string[]
  sellerId: {
    firstName: string
    lastName: string
    email: string
  }
  createdAt: string
}

interface ItemsTableProps {
  items: Item[]
  onApprove: (itemId: string) => void
  onReject: (itemId: string) => void
  onDelete: (itemId: string) => void
  isLoading?: boolean
}

export default function ItemsTable({ items, onApprove, onReject, onDelete, isLoading = false }: ItemsTableProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  const handleSelectAll = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(items.map((item) => item._id))
    }
  }

  const handleSelectItem = (itemId: string) => {
    setSelectedItems((prev) => (prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]))
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      approved: { bg: "bg-green-100", text: "text-green-800", label: "Approved" },
      pending: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Pending" },
      rejected: { bg: "bg-red-100", text: "text-red-800", label: "Rejected" },
    }
    const badge = badges[status] || badges.pending
    return <span className={`text-xs px-2 py-1 rounded font-medium ${badge.bg} ${badge.text}`}>{badge.label}</span>
  }

  if (items.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground text-lg">No items found</p>
        <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters</p>
      </Card>
    )
  }

  return (
    <div>
      {selectedItems.length > 0 && (
        <Card className="p-4 mb-4 bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-900">{selectedItems.length} item(s) selected</p>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left py-3 px-4 w-12">
                  <Checkbox
                    checked={selectedItems.length === items.length && items.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </th>
                <th className="text-left py-3 px-4 font-semibold">Item</th>
                <th className="text-left py-3 px-4 font-semibold">Price</th>
                <th className="text-left py-3 px-4 font-semibold">Seller</th>
                <th className="text-left py-3 px-4 font-semibold">Category</th>
                <th className="text-left py-3 px-4 font-semibold">Status</th>
                <th className="text-left py-3 px-4 font-semibold">Posted</th>
                <th className="text-left py-3 px-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item._id}
                  className={`border-b border-border hover:bg-muted/50 transition-colors ${
                    selectedItems.includes(item._id) ? "bg-blue-50" : ""
                  }`}
                >
                  <td className="py-3 px-4">
                    <Checkbox
                      checked={selectedItems.includes(item._id)}
                      onCheckedChange={() => handleSelectItem(item._id)}
                    />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {item.images?.[0] && (
                        <div className="relative w-10 h-10 rounded bg-muted flex-shrink-0">
                          <Image
                            src={item.images[0] || "/placeholder.svg"}
                            alt={item.title}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-foreground line-clamp-1">{item.title}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-primary">₦{item.price.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <div className="text-sm">
                      <p className="font-medium">
                        {item.sellerId?.firstName} {item.sellerId?.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">{item.sellerId?.email}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{item.category}</td>
                  <td className="py-3 px-4">{getStatusBadge(item.status)}</td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="text-xs w-8 h-8 p-0">
                        <Eye className="w-4 h-4" />
                      </Button>
                      {item.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => onApprove(item._id)}
                            disabled={isLoading}
                            className="text-xs bg-green-600 hover:bg-green-700 w-8 h-8 p-0"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => onReject(item._id)}
                            disabled={isLoading}
                            variant="outline"
                            className="text-xs w-8 h-8 p-0"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        onClick={() => onDelete(item._id)}
                        disabled={isLoading}
                        variant="destructive"
                        className="text-xs w-8 h-8 p-0"
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
    </div>
  )
}
