"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import { LogOut, Plus } from "lucide-react"
import { validateImageUrl, handleImageError } from "@/lib/image-utils"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export default function DashboardPage() {
  const { user, token, logout } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !token) {
      router.push("/login")
      return
    }

    const loadData = async () => {
      try {
        const [profileRes, itemsRes] = await Promise.all([
          fetch(`${API_URL}/users/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/users/my-items`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])

        if (profileRes.ok) {
          setProfile(await profileRes.json())
        }
        if (itemsRes.ok) {
          setItems(await itemsRes.json())
        }
      } catch (error) {
        console.error("[v0] Failed to load data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user, token, router])

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background flex flex-col">
        <div className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <div className="flex gap-3">
                {!user?.isSeller && (
                  <Link href="/become-seller">
                    <Button className="bg-primary hover:bg-primary/90">Become a Seller</Button>
                  </Link>
                )}
                <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2 bg-transparent">
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </div>
            </div>

            {/* Profile Card */}
            <Card className="p-6 mb-8">
              <h2 className="text-xl font-bold mb-4">Profile Information</h2>
              {profile && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-semibold">
                      {profile.firstName} {profile.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-semibold">{profile.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-semibold">{profile.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">City</p>
                    <p className="font-semibold">{profile.city || "Not set"}</p>
                  </div>
                </div>
              )}
              <Link href="/profile/edit">
                <Button variant="outline" className="mt-4 bg-transparent">
                  Edit Profile
                </Button>
              </Link>
            </Card>

            {/* Seller Stats */}
            {user?.isSeller && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card className="p-6 text-center">
                  <p className="text-muted-foreground text-sm">Total Items</p>
                  <p className="text-3xl font-bold text-primary">{items.length}</p>
                </Card>
                <Card className="p-6 text-center">
                  <p className="text-muted-foreground text-sm">Active Items</p>
                  <p className="text-3xl font-bold text-primary">{items.filter((i: any) => !i.isSold).length}</p>
                </Card>
                <Card className="p-6 text-center">
                  <p className="text-muted-foreground text-sm">Sold Items</p>
                  <p className="text-3xl font-bold text-primary">{items.filter((i: any) => i.isSold).length}</p>
                </Card>
              </div>
            )}

            {/* Items Section */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">My Items</h2>
                {user?.isSeller && (
                  <Link href="/upload-item">
                    <Button className="bg-primary hover:bg-primary/90 flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Upload Item
                    </Button>
                  </Link>
                )}
              </div>

              {items.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground mb-4">No items yet</p>
                  {user?.isSeller && (
                    <Link href="/upload-item">
                      <Button className="bg-primary hover:bg-primary/90">Upload Your First Item</Button>
                    </Link>
                  )}
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((item: any) => (
                    <Card key={item._id} className="overflow-hidden">
                      <div className="h-40 bg-muted relative">
                        {item.images?.[0] && (
                          <img
                            src={validateImageUrl(item.images[0]) || "/placeholder.svg"}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            onError={handleImageError}
                          />
                        )}
                        <div
                          className={`absolute top-2 right-2 px-2 py-1 rounded text-xs text-white ${
                            item.isSold ? "bg-red-500" : item.status === "pending" ? "bg-yellow-500" : "bg-green-500"
                          }`}
                        >
                          {item.isSold ? "Sold" : item.status === "pending" ? "Pending" : "Active"}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold line-clamp-2">{item.title}</h3>
                        <p className="text-primary font-bold text-lg my-2">₦{item.price.toLocaleString()}</p>
                        <div className="flex gap-2">
                          {!item.isSold && (
                            <>
                              <Link href={`/edit-item/${item._id}`} className="flex-1">
                                <Button variant="outline" size="sm" className="w-full bg-transparent">
                                  Edit
                                </Button>
                              </Link>
                              <Link href={`/dashboard/mark-sold/${item._id}`} className="flex-1">
                                <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                                  Mark Sold
                                </Button>
                              </Link>
                            </>
                          )}
                          <Link href={`/dashboard/delete-item/${item._id}`} className="flex-1">
                            <Button variant="destructive" size="sm" className="w-full">
                              Delete
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <Footer />
      </main>
    </>
  )
}
