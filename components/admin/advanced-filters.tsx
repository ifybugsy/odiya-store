"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Filter, X } from "lucide-react"

interface FilterOption {
  id: string
  label: string
  selected: boolean
}

interface AdvancedFiltersProps {
  onFilterChange: (filters: Record<string, any>) => void
}

export function AdvancedFilters({ onFilterChange }: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState({
    status: [] as string[],
    dateRange: "30d",
    minAmount: 0,
    maxAmount: 100000,
    userRole: "all",
  })

  const statusOptions: FilterOption[] = [
    { id: "pending", label: "Pending", selected: filters.status.includes("pending") },
    { id: "confirmed", label: "Confirmed", selected: filters.status.includes("confirmed") },
    { id: "delivered", label: "Delivered", selected: filters.status.includes("delivered") },
    { id: "cancelled", label: "Cancelled", selected: filters.status.includes("cancelled") },
  ]

  const handleStatusToggle = (statusId: string) => {
    setFilters((prev) => ({
      ...prev,
      status: prev.status.includes(statusId) ? prev.status.filter((s) => s !== statusId) : [...prev.status, statusId],
    }))
  }

  const handleApplyFilters = () => {
    onFilterChange(filters)
    setIsOpen(false)
  }

  const handleClearFilters = () => {
    setFilters({
      status: [],
      dateRange: "30d",
      minAmount: 0,
      maxAmount: 100000,
      userRole: "all",
    })
    onFilterChange({})
  }

  return (
    <div className="space-y-2">
      <Button variant="outline" className="gap-2 bg-transparent" onClick={() => setIsOpen(!isOpen)}>
        <Filter className="w-4 h-4" />
        Advanced Filters
      </Button>

      {isOpen && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Filter Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Status Filter */}
            <div>
              <label className="text-sm font-semibold block mb-2">Order Status</label>
              <div className="flex gap-2 flex-wrap">
                {statusOptions.map((option) => (
                  <Badge
                    key={option.id}
                    variant={option.selected ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleStatusToggle(option.id)}
                  >
                    {option.label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="text-sm font-semibold block mb-2">Date Range</label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters((prev) => ({ ...prev, dateRange: e.target.value }))}
                className="w-full p-2 border rounded-md text-sm"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>

            {/* Amount Range */}
            <div>
              <label className="text-sm font-semibold block mb-2">Amount Range</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minAmount}
                  onChange={(e) => setFilters((prev) => ({ ...prev, minAmount: Number.parseInt(e.target.value) }))}
                  className="flex-1 p-2 border rounded-md text-sm"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxAmount}
                  onChange={(e) => setFilters((prev) => ({ ...prev, maxAmount: Number.parseInt(e.target.value) }))}
                  className="flex-1 p-2 border rounded-md text-sm"
                />
              </div>
            </div>

            {/* User Role */}
            <div>
              <label className="text-sm font-semibold block mb-2">User Role</label>
              <select
                value={filters.userRole}
                onChange={(e) => setFilters((prev) => ({ ...prev, userRole: e.target.value }))}
                className="w-full p-2 border rounded-md text-sm"
              >
                <option value="all">All Users</option>
                <option value="buyer">Buyers</option>
                <option value="seller">Sellers</option>
                <option value="rider">Riders</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-4">
              <Button className="flex-1" onClick={handleApplyFilters}>
                Apply Filters
              </Button>
              <Button variant="outline" className="flex-1 bg-transparent" onClick={handleClearFilters}>
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
