"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X } from "lucide-react"

interface ReviewsFilterBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  ratingFilter: string
  onRatingChange: (rating: string) => void
  statusFilter: string
  onStatusChange: (status: string) => void
  onReset: () => void
}

export default function ReviewsFilterBar({
  searchQuery,
  onSearchChange,
  ratingFilter,
  onRatingChange,
  statusFilter,
  onStatusChange,
  onReset,
}: ReviewsFilterBarProps) {
  const hasActiveFilters = searchQuery || ratingFilter !== "all" || statusFilter !== "all"

  return (
    <div className="bg-background border border-border rounded-lg p-4 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by item or reviewer..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">Rating</label>
          <Select value={ratingFilter} onValueChange={onRatingChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ratings</SelectItem>
              <SelectItem value="5">5 Stars</SelectItem>
              <SelectItem value="4">4 Stars</SelectItem>
              <SelectItem value="3">3 Stars</SelectItem>
              <SelectItem value="2">2 Stars</SelectItem>
              <SelectItem value="1">1 Star</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground block mb-2">Status</label>
          <Select value={statusFilter} onStatusChange={onStatusChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="flagged">Flagged</SelectItem>
              <SelectItem value="removed">Removed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {hasActiveFilters && (
          <div className="flex items-end">
            <Button
              onClick={onReset}
              variant="outline"
              className="w-full flex items-center justify-center gap-2 bg-transparent"
            >
              <X className="w-4 h-4" />
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
