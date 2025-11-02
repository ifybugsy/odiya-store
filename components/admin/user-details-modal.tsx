"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Mail, Calendar, ShoppingBag, Store } from "lucide-react"

interface UserDetailsModalProps {
  user: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuspend: (userId: string) => void
  onUnsuspend: (userId: string) => void
}

export default function UserDetailsModal({ user, open, onOpenChange, onSuspend, onUnsuspend }: UserDetailsModalProps) {
  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* User Header */}
          <div className="text-center border-b border-border pb-4">
            <h3 className="text-lg font-bold text-foreground">
              {user.firstName} {user.lastName}
            </h3>
            <div className="flex justify-center gap-2 mt-2">
              {user.isSeller && <Badge>Seller</Badge>}
              {user.isSuspended ? (
                <Badge variant="destructive">Suspended</Badge>
              ) : (
                <Badge variant="outline">Active</Badge>
              )}
            </div>
          </div>

          {/* Details Grid */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium text-foreground">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Joined</p>
                <p className="text-sm font-medium text-foreground">{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {user.isSeller && (
              <div className="flex items-center gap-3">
                <Store className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Items Listed</p>
                  <p className="text-sm font-medium text-foreground">{user.itemsCount || 0}</p>
                </div>
              </div>
            )}

            {!user.isSeller && (
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Purchases</p>
                  <p className="text-sm font-medium text-foreground">{user.purchasesCount || 0}</p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t border-border">
            {user.isSuspended ? (
              <Button
                onClick={() => {
                  onUnsuspend(user._id)
                  onOpenChange(false)
                }}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Unsuspend User
              </Button>
            ) : (
              <Button
                onClick={() => {
                  onSuspend(user._id)
                  onOpenChange(false)
                }}
                variant="destructive"
                className="flex-1"
              >
                Suspend User
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
