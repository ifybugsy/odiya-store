"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useVendorAuth } from "@/lib/vendor-auth-context"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export default function VendorSettingsPage() {
  const params = useParams()
  const router = useRouter()
  const vendorId = params.id as string
  const { vendor, vendorToken } = useVendorAuth()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [formData, setFormData] = useState({
    storeName: "",
    storeDescription: "",
    storeImage: "",
    storeBanner: "",
    storeLogo: "",
    phoneNumber: "",
    location: "",
    email: "",
    catalogImages: ["", "", ""],
    storeTheme: {
      primaryColor: "#FF6B35",
      secondaryColor: "#004E89",
    },
    socialLinks: {
      website: "",
      instagram: "",
      facebook: "",
      twitter: "",
    },
    store_policies: "",
    return_policy: "",
    shipping_policy: "",
  })

  useEffect(() => {
    if (!vendor || !vendorToken) {
      router.push("/vendor/login")
      return
    }

    if (vendor.id !== vendorId && vendor._id !== vendorId) {
      setError("Unauthorized: You can only edit your own store settings")
      return
    }

    loadVendorData()
  }, [vendor, vendorToken, vendorId])

  const loadVendorData = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/vendors/${vendorId}`, {
        headers: { Authorization: `Bearer ${vendorToken}` },
      })

      if (res.ok) {
        const data = await res.json()
        setFormData({
          storeName: data.storeName || "",
          storeDescription: data.storeDescription || "",
          storeImage: data.storeImage || "",
          storeBanner: data.storeBanner || "",
          storeLogo: data.storeLogo || "",
          phoneNumber: data.phoneNumber || "",
          location: data.location || "",
          email: data.email || "",
          catalogImages: data.catalogImages || ["", "", ""],
          storeTheme: data.storeTheme || { primaryColor: "#FF6B35", secondaryColor: "#004E89" },
          socialLinks: data.socialLinks || { website: "", instagram: "", facebook: "", twitter: "" },
          store_policies: data.store_policies || "",
          return_policy: data.return_policy || "",
          shipping_policy: data.shipping_policy || "",
        })
      }
    } catch (err) {
      console.error("Failed to load vendor data:", err)
      setError("Failed to load store settings")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    if (name.startsWith("theme.")) {
      const themeKey = name.split(".")[1]
      setFormData({
        ...formData,
        storeTheme: { ...formData.storeTheme, [themeKey]: value },
      })
    } else if (name.startsWith("social.")) {
      const socialKey = name.split(".")[1]
      setFormData({
        ...formData,
        socialLinks: { ...formData.socialLinks, [socialKey]: value },
      })
    } else if (name.startsWith("catalogImage")) {
      const index = Number.parseInt(name.replace("catalogImage", ""))
      const newImages = [...formData.catalogImages]
      newImages[index] = value
      setFormData({ ...formData, catalogImages: newImages })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setSaving(true)

    try {
      const res = await fetch(`${API_URL}/vendors/${vendorId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${vendorToken}`,
        },
        body: JSON.stringify({
          ...formData,
          phoneNumber: formData.phoneNumber,
          location: formData.location,
          email: formData.email,
          catalogImages: formData.catalogImages,
        }),
      })

      if (res.ok) {
        setSuccess("Store settings saved successfully!")
        setTimeout(() => router.push(`/vendor/dashboard`), 1500)
      } else {
        const data = await res.json()
        setError(data.error || "Failed to save settings")
      }
    } catch (err) {
      console.error("Failed to save:", err)
      setError("Failed to save store settings")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/vendor/dashboard">
            <Button variant="outline" size="sm" className="mb-6 bg-transparent">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>

          <h1 className="text-3xl font-bold mb-8 text-foreground">Store Settings</h1>

          {error && (
            <div className="mb-4 p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6">
            {/* Store Branding */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4 text-foreground">Store Branding</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">Store Name*</label>
                  <Input
                    name="storeName"
                    value={formData.storeName}
                    onChange={handleChange}
                    placeholder="Your Store Name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">Store Description</label>
                  <textarea
                    name="storeDescription"
                    value={formData.storeDescription}
                    onChange={handleChange}
                    placeholder="Tell customers about your store..."
                    className="w-full border border-border rounded-md p-3 min-h-[100px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">Store Image URL</label>
                  <div className="space-y-3">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          const reader = new FileReader()
                          reader.onloadend = () => {
                            setFormData({ ...formData, storeImage: reader.result as string })
                          }
                          reader.readAsDataURL(file)
                        }
                      }}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground">Or enter image URL</p>
                    <Input
                      name="storeImage"
                      value={formData.storeImage}
                      onChange={handleChange}
                      placeholder="https://example.com/store-image.jpg"
                    />
                    {formData.storeImage && (
                      <img
                        src={formData.storeImage || "/placeholder.svg"}
                        alt="Store preview"
                        className="mt-2 w-32 h-32 object-cover rounded-lg border"
                      />
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">Store Banner URL</label>
                  <div className="space-y-3">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          const reader = new FileReader()
                          reader.onloadend = () => {
                            setFormData({ ...formData, storeBanner: reader.result as string })
                          }
                          reader.readAsDataURL(file)
                        }
                      }}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground">Or enter image URL (Recommended: 1200x400px)</p>
                    <Input
                      name="storeBanner"
                      value={formData.storeBanner}
                      onChange={handleChange}
                      placeholder="https://example.com/banner.jpg"
                    />
                    {formData.storeBanner && (
                      <img
                        src={formData.storeBanner || "/placeholder.svg"}
                        alt="Banner preview"
                        className="mt-2 w-full h-32 object-cover rounded-lg border"
                      />
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">Store Logo</label>
                  <div className="space-y-3">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          const reader = new FileReader()
                          reader.onloadend = () => {
                            setFormData({ ...formData, storeLogo: reader.result as string })
                          }
                          reader.readAsDataURL(file)
                        }
                      }}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground">Or enter image URL (Recommended: 100x100px)</p>
                    <Input
                      name="storeLogo"
                      value={formData.storeLogo}
                      onChange={handleChange}
                      placeholder="https://example.com/logo.png"
                    />
                    {formData.storeLogo && (
                      <img
                        src={formData.storeLogo || "/placeholder.svg"}
                        alt="Logo preview"
                        className="mt-2 w-24 h-24 object-cover rounded-lg border"
                      />
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Contact Information */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4 text-foreground">Contact Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">Phone Number*</label>
                  <Input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="+234 (123) 456-7890"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">Location/Address*</label>
                  <Input
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="City, State or Full Address"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">Email Address*</label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="contact@yourstore.com"
                    required
                  />
                </div>
              </div>
            </Card>

            {/* Store Image Carousel */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4 text-foreground">Store Image Carousel (Up to 3 Images)</h2>
              <div className="space-y-6">
                {[0, 1, 2].map((index) => (
                  <div key={index} className="space-y-3 pb-6 border-b border-border last:border-b-0">
                    <label className="block text-sm font-medium mb-2 text-foreground">Image {index + 1}</label>
                    <div className="space-y-3">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            const reader = new FileReader()
                            reader.onloadend = () => {
                              const newImages = [...formData.catalogImages]
                              newImages[index] = reader.result as string
                              setFormData({ ...formData, catalogImages: newImages })
                            }
                            reader.readAsDataURL(file)
                          }
                        }}
                        className="cursor-pointer"
                      />
                      <Input
                        name={`catalogImage${index}`}
                        value={formData.catalogImages[index]}
                        onChange={(e) => {
                          const newImages = [...formData.catalogImages]
                          newImages[index] = e.target.value
                          setFormData({ ...formData, catalogImages: newImages })
                        }}
                        placeholder="Or enter image URL"
                      />
                      {formData.catalogImages[index] && (
                        <div className="relative w-full h-40 rounded-lg overflow-hidden border border-border">
                          <img
                            src={formData.catalogImages[index] || "/placeholder.svg"}
                            alt={`Carousel ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newImages = [...formData.catalogImages]
                              newImages[index] = ""
                              setFormData({ ...formData, catalogImages: newImages })
                            }}
                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg text-xs font-semibold"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Store Theme */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4 text-foreground">Store Theme Colors</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">Primary Color</label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      name="theme.primaryColor"
                      value={formData.storeTheme.primaryColor}
                      onChange={handleChange}
                      className="w-20 h-10"
                    />
                    <Input
                      name="theme.primaryColor"
                      value={formData.storeTheme.primaryColor}
                      onChange={handleChange}
                      placeholder="#FF6B35"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">Secondary Color</label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      name="theme.secondaryColor"
                      value={formData.storeTheme.secondaryColor}
                      onChange={handleChange}
                      className="w-20 h-10"
                    />
                    <Input
                      name="theme.secondaryColor"
                      value={formData.storeTheme.secondaryColor}
                      onChange={handleChange}
                      placeholder="#004E89"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Social Links */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4 text-foreground">Social Links</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">Website</label>
                  <Input
                    name="social.website"
                    value={formData.socialLinks.website}
                    onChange={handleChange}
                    placeholder="https://yourwebsite.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">Instagram</label>
                  <Input
                    name="social.instagram"
                    value={formData.socialLinks.instagram}
                    onChange={handleChange}
                    placeholder="@yourusername"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">Facebook</label>
                  <Input
                    name="social.facebook"
                    value={formData.socialLinks.facebook}
                    onChange={handleChange}
                    placeholder="https://facebook.com/yourpage"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">Twitter</label>
                  <Input
                    name="social.twitter"
                    value={formData.socialLinks.twitter}
                    onChange={handleChange}
                    placeholder="@yourusername"
                  />
                </div>
              </div>
            </Card>

            {/* Store Policies */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4 text-foreground">Store Policies</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">Store Policies</label>
                  <textarea
                    name="store_policies"
                    value={formData.store_policies}
                    onChange={handleChange}
                    placeholder="Your general store policies..."
                    className="w-full border border-border rounded-md p-3 min-h-[100px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">Return Policy</label>
                  <textarea
                    name="return_policy"
                    value={formData.return_policy}
                    onChange={handleChange}
                    placeholder="Your return and refund policy..."
                    className="w-full border border-border rounded-md p-3 min-h-[100px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">Shipping Policy</label>
                  <textarea
                    name="shipping_policy"
                    value={formData.shipping_policy}
                    onChange={handleChange}
                    placeholder="Your shipping and delivery policy..."
                    className="w-full border border-border rounded-md p-3 min-h-[100px]"
                  />
                </div>
              </div>
            </Card>

            {/* Save Button */}
            <div className="flex gap-4">
              <Button type="submit" disabled={saving} className="flex-1 bg-primary hover:bg-primary/90 h-12">
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save Settings"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/vendor/dashboard")}
                className="bg-transparent"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </main>
    </>
  )
}
