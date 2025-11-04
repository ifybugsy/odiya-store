"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Navbar from "@/components/navbar"
import DashboardHeader from "@/components/admin/dashboard-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertTriangle, Save } from "lucide-react"

export default function AdminSettingsPage() {
  const { user, isAdmin } = useAuth()
  const router = useRouter()
  const [authError, setAuthError] = useState("")
  const [settings, setSettings] = useState({
    platformName: "Odiya Store",
    maxItemsPerSeller: 100,
    maintenanceMode: false,
    emailNotifications: true,
  })
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState("")

  useEffect(() => {
    if (!user) {
      setAuthError("Please log in to access admin settings")
      setTimeout(() => router.push("/admin-login"), 2000)
      return
    }

    if (!isAdmin && !user.isAdmin) {
      setAuthError("Admin access required")
      setTimeout(() => router.push("/"), 2000)
      return
    }
  }, [user, isAdmin, router])

  const handleSaveSettings = async () => {
    setSaving(true)
    setSaveMessage("")

    try {
      // Simulate settings save (would call API in production)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setSaveMessage("✓ Settings saved successfully!")
      setTimeout(() => setSaveMessage(""), 2000)
    } catch (error) {
      setSaveMessage("Failed to save settings. Please try again.")
      console.error("Settings save error:", error)
    } finally {
      setSaving(false)
    }
  }

  if (authError) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <Card className="p-8 text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-lg text-red-600">{authError}</p>
            </Card>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <DashboardHeader user={user} title="Settings" description="Configure platform settings and preferences" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {/* Platform Settings */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Platform Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Platform Name</label>
                  <Input
                    value={settings.platformName}
                    onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Max Items Per Seller</label>
                  <Input
                    type="number"
                    value={settings.maxItemsPerSeller}
                    onChange={(e) => setSettings({ ...settings, maxItemsPerSeller: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>
            </Card>

            {/* Feature Toggles */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Feature Controls</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Maintenance Mode</p>
                    <p className="text-sm text-muted-foreground">Prevent new uploads and transactions</p>
                  </div>
                  <button
                    onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                    className={`w-12 h-7 rounded-full transition ${
                      settings.maintenanceMode ? "bg-red-500" : "bg-gray-300"
                    } relative`}
                  >
                    <div
                      className={`w-6 h-6 bg-white rounded-full transition absolute top-0.5 ${
                        settings.maintenanceMode ? "right-0.5" : "left-0.5"
                      }`}
                    ></div>
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Send transactional emails to users</p>
                  </div>
                  <button
                    onClick={() => setSettings({ ...settings, emailNotifications: !settings.emailNotifications })}
                    className={`w-12 h-7 rounded-full transition ${
                      settings.emailNotifications ? "bg-green-500" : "bg-gray-300"
                    } relative`}
                  >
                    <div
                      className={`w-6 h-6 bg-white rounded-full transition absolute top-0.5 ${
                        settings.emailNotifications ? "right-0.5" : "left-0.5"
                      }`}
                    ></div>
                  </button>
                </div>
              </div>
            </Card>

            {/* API Settings */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">System Information</h2>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Platform Status</p>
                  <p className="font-semibold text-green-600">Operational</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Admin Panel Version</p>
                  <p className="font-semibold">v2.0.0</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Last Updated</p>
                  <p className="font-semibold">{new Date().toLocaleString()}</p>
                </div>
              </div>
            </Card>

            {/* Save Section */}
            <div className="flex items-center justify-between">
              <div>
                {saveMessage && (
                  <div
                    className={`text-sm p-3 rounded ${saveMessage.includes("✓") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
                  >
                    {saveMessage}
                  </div>
                )}
              </div>
              <Button onClick={handleSaveSettings} className="bg-primary hover:bg-primary/90" disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
