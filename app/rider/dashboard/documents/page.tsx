"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { useRiderAuth } from "@/lib/rider-auth-context"
import { Upload, CheckCircle, Clock, AlertTriangle, FileText } from "lucide-react"

interface Document {
  _id: string
  type: "license" | "insurance" | "vehicle_registration"
  status: "pending" | "verified" | "rejected"
  uploadedAt: string
  rejectionReason?: string
}

export default function DocumentsPage() {
  const router = useRouter()
  const { rider, token } = useRiderAuth()
  const [documents, setDocuments] = useState<Document[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const requiredDocuments = [
    { type: "license", label: "Driver's License" },
    { type: "insurance", label: "Insurance Certificate" },
    { type: "vehicle_registration", label: "Vehicle Registration" },
  ]

  const handleFileUpload = async (type: string, file: File) => {
    if (!file) return

    setError(null)
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", type)

      const response = await fetch("/api/rider/documents", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to upload document")
      }

      const newDoc = await response.json()
      setDocuments([...documents, newDoc])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  const getDocumentStatus = (type: string) => {
    return documents.find((d) => d.type === type)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-600" />
      case "rejected":
        return <AlertTriangle className="w-5 h-5 text-red-600" />
      default:
        return <FileText className="w-5 h-5 text-gray-400" />
    }
  }

  const allVerified = requiredDocuments.every((doc) => {
    const uploaded = getDocumentStatus(doc.type)
    return uploaded && uploaded.status === "verified"
  })

  if (!rider) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Documents & Verification</h1>
        <p className="text-muted-foreground mt-1">Upload required documents to complete verification</p>
      </div>

      {error && (
        <Alert className="border-destructive bg-destructive/10">
          <AlertDescription className="text-destructive">{error}</AlertDescription>
        </Alert>
      )}

      {allVerified && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="w-4 h-4 text-green-600 mr-2 inline" />
          <AlertDescription className="text-green-800">
            All documents verified! You can now accept deliveries.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4">
        {requiredDocuments.map((doc) => {
          const uploaded = getDocumentStatus(doc.type)
          return (
            <Card key={doc.type} className={uploaded ? "border-l-4 border-l-green-600" : ""}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {getStatusIcon(uploaded?.status || "pending")}
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{doc.label}</h3>
                      {uploaded ? (
                        <div className="mt-2 space-y-1">
                          <Badge
                            className={`${
                              uploaded.status === "verified"
                                ? "bg-green-100 text-green-800"
                                : uploaded.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {uploaded.status.charAt(0).toUpperCase() + uploaded.status.slice(1)}
                          </Badge>
                          {uploaded.rejectionReason && (
                            <p className="text-sm text-red-600 mt-2">Reason: {uploaded.rejectionReason}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            Uploaded: {new Date(uploaded.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground mt-2">Not uploaded yet</p>
                      )}
                    </div>
                  </div>

                  <label className="cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => e.target.files && handleFileUpload(doc.type, e.target.files[0])}
                      disabled={uploading || uploaded?.status === "verified"}
                    />
                    <Button
                      asChild
                      variant={uploaded?.status === "verified" ? "outline" : "default"}
                      disabled={uploading || uploaded?.status === "verified"}
                      className="cursor-pointer"
                    >
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        {uploaded?.status === "verified" ? "Verified" : "Upload"}
                      </span>
                    </Button>
                  </label>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
