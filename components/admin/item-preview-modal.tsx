"use client"

import { useState } from "react"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  CheckCircle,
  XCircle,
  Trash2,
  MapPin,
  Calendar,
  Eye,
  User,
  Mail,
  Phone,
  Package,
  DollarSign,
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

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
    _id: string
    firstName: string
    lastName: string
    email: string
    phone?: string
  }
  createdAt: string
  updatedAt: string
  isApproved: boolean
}

interface ItemPreviewModalProps {
  item: Item | null
  open: boolean
  onClose: () => void
  onApprove: () => void
  onReject: () => void
  onDelete: () => void
}

export default function ItemPreviewModal({
  item,
  open,
  onClose,
  onApprove,
  onReject,
  onDelete,
}: ItemPreviewModalProps) {
  const [selectedImage, setSelectedImage] = useState(0)

  if (!item) return null

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      approved: { variant: "default", label: "Approved" },
      pending: { variant: "secondary", label: "Pending Review" },
      rejected: { variant: "destructive", label: "Rejected" },
      sold: { variant: "outline", label: "Sold" },
    }
    const config = variants[status] || variants.pending
    return (
      <Badge variant={config.variant} className="text-sm px-3 py-1">
        {config.label}
      </Badge>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0">
        <ScrollArea className="max-h-[90vh]">
          <div className="p-6">
            <DialogHeader className="mb-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <DialogTitle className="text-2xl font-bold mb-2">{item.title}</DialogTitle>
                  <DialogDescription className="text-base">
                    Detailed preview and verification • Item ID: {item._id.slice(-8)}
                  </DialogDescription>
                </div>
                {getStatusBadge(item.status)}
              </div>
            </DialogHeader>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Left Column - Images */}
              <div className="space-y-4">
                <Card className="overflow-hidden border-border/40">
                  <div className="relative aspect-square bg-muted">
                    {item.images && item.images.length > 0 ? (
                      <Image
                        src={item.images[selectedImage] || item.images[0]}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <Package className="w-20 h-20" />
                      </div>
                    )}
                  </div>
                </Card>

                {/* Image Thumbnails */}
                {item.images && item.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {item.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImage === idx ? "border-primary" : "border-border/40 hover:border-border"
                        }`}
                      >
                        <Image
                          src={img || "/placeholder.svg"}
                          alt={`${item.title} ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* Pricing Card */}
                <Card className="p-4 bg-primary/5 border-primary/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <DollarSign className="w-5 h-5" />
                      <span className="font-medium">Price</span>
                    </div>
                    <p className="text-3xl font-bold text-primary">₦{item.price.toLocaleString()}</p>
                  </div>
                </Card>
              </div>

              {/* Right Column - Details */}
              <div className="space-y-6">
                {/* Item Information */}
                <Card className="p-5 space-y-4 border-border/40">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Package className="w-5 h-5 text-primary" />
                    Item Information
                  </h3>
                  <Separator />

                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Description</label>
                      <p className="text-sm text-foreground mt-1 leading-relaxed">
                        {item.description || "No description provided"}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Category</label>
                        <p className="text-sm font-semibold text-foreground mt-1">{item.category}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Condition</label>
                        <p className="text-sm font-semibold text-foreground mt-1">{item.condition}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">{item.location || "Location not specified"}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Eye className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">{item.views || 0} views</span>
                    </div>
                  </div>
                </Card>

                {/* Seller Information */}
                <Card className="p-5 space-y-4 border-border/40">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Seller Information
                  </h3>
                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">
                          {item.sellerId?.firstName} {item.sellerId?.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">Seller ID: {item.sellerId?._id.slice(-8)}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground">{item.sellerId?.email}</span>
                      </div>
                      {item.sellerId?.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span className="text-foreground">{item.sellerId.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>

                {/* Timestamps */}
                <Card className="p-4 bg-muted/30 border-border/40">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Posted</span>
                    </div>
                    <span className="font-medium text-foreground">
                      {new Date(item.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </Card>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Action Buttons */}
            <DialogFooter className="flex-row gap-2 sm:justify-between">
              <Button variant="outline" onClick={onClose}>
                Close Preview
              </Button>

              <div className="flex gap-2">
                {item.status === "pending" && (
                  <>
                    <Button onClick={onReject} variant="outline" className="gap-2 bg-transparent">
                      <XCircle className="w-4 h-4" />
                      Reject
                    </Button>
                    <Button onClick={onApprove} className="gap-2 bg-green-600 hover:bg-green-700">
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </Button>
                  </>
                )}
                <Button onClick={onDelete} variant="destructive" className="gap-2">
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </div>
            </DialogFooter>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
