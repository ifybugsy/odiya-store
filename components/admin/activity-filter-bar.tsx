"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X } from "lucide-react"

interface ActivityFilterBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  typeFilter: string
  onTypeChange: (type: string) => void
  dateRangeFilter: string
  onDateRangeChange: (range: string) => void
  onReset: () => void
}

export default function ActivityFilterBar({
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeChange,
  dateRangeFilter,
  onDateRangeChange,
  onReset,
}: ActivityFilterBarProps) {
  const hasActiveFilters = searchQuery || typeFilter !== "all" || dateRangeFilter !== "all"

  return (
    <div className="bg-background border border-border rounded-lg p-4 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by user or action..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">Activity Type</label>
          <Select value={typeFilter} onValueChange={onTypeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Activities</SelectItem>
              <SelectItem value="purchase">Purchases</SelectItem>
              <SelectItem value="login">Logins</SelectItem>
              <SelectItem value="view">Item Views</SelectItem>
              <SelectItem value="review">Reviews Posted</SelectItem>
              <SelectItem value="message">Messages Sent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground block mb-2">Date Range</label>
          <Select value={dateRangeFilter} onValueChange={onDateRangeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">Last 3 Months</SelectItem>
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
