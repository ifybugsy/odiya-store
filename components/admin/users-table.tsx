"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Ban, CheckCircle, Mail, Eye } from "lucide-react"

interface User {
  _id: string
  firstName: string
  lastName: string
  email: string
  isSeller: boolean
  isSuspended: boolean
  createdAt: string
  itemsCount?: number
  purchasesCount?: number
}

interface UsersTableProps {
  users: User[]
  onSuspend: (userId: string) => void
  onUnsuspend: (userId: string) => void
  isLoading?: boolean
}

export default function UsersTable({ users, onSuspend, onUnsuspend, isLoading = false }: UsersTableProps) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(users.map((user) => user._id))
    }
  }

  const handleSelectUser = (userId: string) => {
    setSelectedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  if (users.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground text-lg">No users found</p>
        <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters</p>
      </Card>
    )
  }

  return (
    <div>
      {selectedUsers.length > 0 && (
        <Card className="p-4 mb-4 bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-900">{selectedUsers.length} user(s) selected</p>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left py-3 px-4 w-12">
                  <Checkbox
                    checked={selectedUsers.length === users.length && users.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </th>
                <th className="text-left py-3 px-4 font-semibold">Name</th>
                <th className="text-left py-3 px-4 font-semibold">Email</th>
                <th className="text-left py-3 px-4 font-semibold">Type</th>
                <th className="text-left py-3 px-4 font-semibold">Status</th>
                <th className="text-left py-3 px-4 font-semibold">Activity</th>
                <th className="text-left py-3 px-4 font-semibold">Joined</th>
                <th className="text-left py-3 px-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user._id}
                  className={`border-b border-border hover:bg-muted/50 transition-colors ${
                    selectedUsers.includes(user._id) ? "bg-blue-50" : ""
                  }`}
                >
                  <td className="py-3 px-4">
                    <Checkbox
                      checked={selectedUsers.includes(user._id)}
                      onCheckedChange={() => handleSelectUser(user._id)}
                    />
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-foreground">
                      {user.firstName} {user.lastName}
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground text-xs">{user.email}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={user.isSeller ? "default" : "secondary"}>
                      {user.isSeller ? "Seller" : "Buyer"}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    {user.isSuspended ? (
                      <Badge variant="destructive" className="gap-1">
                        <Ban className="w-3 h-3" />
                        Suspended
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1 border-green-200 text-green-800">
                        <CheckCircle className="w-3 h-3" />
                        Active
                      </Badge>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-xs">
                      {user.isSeller ? (
                        <p>{user.itemsCount || 0} items listed</p>
                      ) : (
                        <p>{user.purchasesCount || 0} purchases</p>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="text-xs w-8 h-8 p-0">
                        <Eye className="w-4 h-4" />
                      </Button>
                      {user.isSuspended ? (
                        <Button
                          size="sm"
                          onClick={() => onUnsuspend(user._id)}
                          disabled={isLoading}
                          className="text-xs bg-green-600 hover:bg-green-700 px-3"
                        >
                          Unsuspend
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => onSuspend(user._id)}
                          disabled={isLoading}
                          variant="destructive"
                          className="text-xs flex items-center gap-1"
                        >
                          <Ban className="w-3 h-3" />
                          Suspend
                        </Button>
                      )}
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
