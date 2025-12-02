"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X } from "lucide-react"

interface UsersFilterBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  typeFilter: string
  onTypeChange: (type: string) => void
  statusFilter: string
  onStatusChange: (status: string) => void
  onReset: () => void
}

export default function UsersFilterBar({
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeChange,
  statusFilter,
  onStatusChange,
  onReset,
}: UsersFilterBarProps) {
  const hasActiveFilters = searchQuery || typeFilter !== "all" || statusFilter !== "all"

  return (
    <div className="bg-background border border-border rounded-lg p-4 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">User Type</label>
          <Select value={typeFilter} onValueChange={onTypeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="buyer">Buyers Only</SelectItem>
              <SelectItem value="seller">Sellers Only</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">Vendors are managed in the Vendor Management section</p>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground block mb-2">Account Status</label>
          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
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
