"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Trash2, X } from "lucide-react"

interface BulkActionsBarProps {
  selectedCount: number
  onApprove: () => void
  onReject: () => void
  onDelete: () => void
  onClear: () => void
}

export default function BulkActionsBar({ selectedCount, onApprove, onReject, onDelete, onClear }: BulkActionsBarProps) {
  return (
    <Card className="p-4 bg-primary/5 border-primary/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
              {selectedCount}
            </div>
            <span className="font-semibold text-foreground">
              {selectedCount} item{selectedCount !== 1 ? "s" : ""} selected
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={onApprove} size="sm" className="gap-2 bg-green-600 hover:bg-green-700">
            <CheckCircle className="w-4 h-4" />
            Approve All
          </Button>
          <Button onClick={onReject} size="sm" variant="outline" className="gap-2 bg-transparent">
            <XCircle className="w-4 h-4" />
            Reject All
          </Button>
          <Button onClick={onDelete} size="sm" variant="destructive" className="gap-2">
            <Trash2 className="w-4 h-4" />
            Delete All
          </Button>
          <Button onClick={onClear} size="sm" variant="ghost" className="gap-2">
            <X className="w-4 h-4" />
            Clear
          </Button>
        </div>
      </div>
    </Card>
  )
}
