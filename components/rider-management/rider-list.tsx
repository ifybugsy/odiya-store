"use client"

import { useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Phone, MapPin, Bike, MoreVertical, Pencil, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EditRiderDialog } from "./edit-rider-dialog"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function RiderList() {
  const { data: riders, error, mutate } = useSWR("/api/riders", fetcher)
  const [editingRider, setEditingRider] = useState<any>(null)

  const handleStatusToggle = async (riderId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "active" ? "inactive" : "active"
      const response = await fetch(`/api/riders/${riderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        mutate()
      }
    } catch (error) {
      console.error("[v0] Error updating rider status:", error)
    }
  }

  const handleDelete = async (riderId: string) => {
    if (!confirm("Are you sure you want to delete this rider?")) return

    try {
      const response = await fetch(`/api/riders/${riderId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        mutate()
      }
    } catch (error) {
      console.error("[v0] Error deleting rider:", error)
    }
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Failed to load riders</p>
        </CardContent>
      </Card>
    )
  }

  if (!riders) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Loading riders...</p>
        </CardContent>
      </Card>
    )
  }

  if (riders.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Bike className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">No riders yet</h3>
          <p className="text-muted-foreground mt-2">Get started by adding your first delivery rider</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {riders.map((rider: any) => (
          <Card key={rider.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Bike className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{rider.name}</h3>
                    <Badge variant={rider.status === "active" ? "default" : "secondary"} className="mt-1">
                      {rider.status}
                    </Badge>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditingRider(rider)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusToggle(rider.id, rider.status)}>
                      Toggle Status
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleDelete(rider.id)} className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{rider.phone}</span>
              </div>
              {rider.vehicleNumber && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Bike className="h-4 w-4" />
                  <span>{rider.vehicleNumber}</span>
                </div>
              )}
              {rider.area && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{rider.area}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {editingRider && (
        <EditRiderDialog
          rider={editingRider}
          open={!!editingRider}
          onClose={() => setEditingRider(null)}
          onSuccess={() => {
            mutate()
            setEditingRider(null)
          }}
        />
      )}
    </>
  )
}
