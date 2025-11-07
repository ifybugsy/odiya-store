"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { FileText, CheckCircle, XCircle, AlertCircle } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

interface Document {
  _id: string
  riderId: string
  riderName: string
  type: "license" | "insurance" | "vehicle_registration"
  status: "pending" | "verified" | "rejected"
  uploadedAt: string
  rejectionReason?: string
}

export default function AdminRiderDocumentsPage() {
  const { user, token, isLoading } = useAuth()
  const router = useRouter()
  const [documents, setDocuments] = useState<Document[]>([])
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("pending")
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    if (isLoading) return

    if (!user?.isAdmin) {
      setAuthError("Unauthorized access")
      setTimeout(() => router.push("/admin-login"), 1000)
      return
    }

    loadDocuments()
  }, [user, token, isLoading, router])

  const loadDocuments = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/admin/riders/documents`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setDocuments(data)
        setFilteredDocuments(data.filter((d: Document) => d.status === "pending"))
      }
    } catch (error) {
      console.error("Failed to load documents:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let filtered = documents
    if (statusFilter !== "all") {
      filtered = filtered.filter((doc) => doc.status === statusFilter)
    }
    setFilteredDocuments(filtered)
  }, [statusFilter, documents])

  const handleApproveDocument = async (docId: string) => {
    setProcessingId(docId)
    try {
      const response = await fetch(`${API_URL}/admin/riders/documents/${docId}/approve`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        loadDocuments()
        setSelectedDoc(null)
      }
    } catch (error) {
      console.error("Failed to approve document:", error)
    } finally {
      setProcessingId(null)
    }
  }

  const handleRejectDocument = async (docId: string) => {
    if (!rejectionReason.trim()) {
      alert("Please provide a reason for rejection")
      return
    }

    setProcessingId(docId)
    try {
      const response = await fetch(`${API_URL}/admin/riders/documents/${docId}/reject`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: rejectionReason }),
      })

      if (response.ok) {
        loadDocuments()
        setSelectedDoc(null)
        setRejectionReason("")
      }
    } catch (error) {
      console.error("Failed to reject document:", error)
    } finally {
      setProcessingId(null)
    }
  }

  const getDocumentIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-600" />
      case "pending":
        return <AlertCircle className="w-4 h-4 text-yellow-600" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (authError) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card className="p-8 max-w-md text-center">
          <p className="text-red-600 font-semibold">{authError}</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Rider Document Verification</h1>
        <p className="text-muted-foreground mt-1">Review and verify rider documents</p>
      </div>

      {/* Filter */}
      <div className="flex gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Documents</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground text-sm">Pending Review</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">
              {documents.filter((d) => d.status === "pending").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground text-sm">Approved</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {documents.filter((d) => d.status === "verified").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground text-sm">Rejected</p>
            <p className="text-3xl font-bold text-red-600 mt-2">
              {documents.filter((d) => d.status === "rejected").length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Documents Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-muted-foreground text-lg font-medium">No documents found</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((doc) => (
            <Card
              key={doc._id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedDoc(doc)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getDocumentIcon(doc.status)}
                    <div>
                      <p className="font-semibold text-foreground capitalize">{doc.type.replace(/_/g, " ")}</p>
                      <p className="text-sm text-muted-foreground">{doc.riderName}</p>
                    </div>
                  </div>
                  <Badge
                    className={`${
                      doc.status === "verified"
                        ? "bg-green-100 text-green-800"
                        : doc.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="capitalize">{selectedDoc.type.replace(/_/g, " ")}</span>
                {getDocumentIcon(selectedDoc.status)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Rider</p>
                <p className="font-semibold text-foreground">{selectedDoc.riderName}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge
                  className={`mt-1 ${
                    selectedDoc.status === "verified"
                      ? "bg-green-100 text-green-800"
                      : selectedDoc.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                  }`}
                >
                  {selectedDoc.status.charAt(0).toUpperCase() + selectedDoc.status.slice(1)}
                </Badge>
              </div>

              {selectedDoc.status === "pending" && (
                <div>
                  <label className="text-sm font-medium text-foreground">Rejection Reason (if rejecting)</label>
                  <Textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Why is this document being rejected?"
                    className="mt-2 min-h-24"
                  />
                </div>
              )}

              {selectedDoc.rejectionReason && selectedDoc.status === "rejected" && (
                <div className="bg-red-50 p-3 rounded border border-red-200">
                  <p className="text-sm font-semibold text-red-800">Rejection Reason:</p>
                  <p className="text-sm text-red-700 mt-1">{selectedDoc.rejectionReason}</p>
                </div>
              )}

              <div className="flex gap-2">
                {selectedDoc.status === "pending" && (
                  <>
                    <Button
                      onClick={() => handleApproveDocument(selectedDoc._id)}
                      disabled={processingId === selectedDoc._id}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {processingId === selectedDoc._id ? "Processing..." : "Approve"}
                    </Button>
                    <Button
                      onClick={() => handleRejectDocument(selectedDoc._id)}
                      disabled={processingId === selectedDoc._id || !rejectionReason.trim()}
                      variant="destructive"
                      className="flex-1"
                    >
                      {processingId === selectedDoc._id ? "Processing..." : "Reject"}
                    </Button>
                  </>
                )}
                <Button onClick={() => setSelectedDoc(null)} variant="outline" className="flex-1">
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
