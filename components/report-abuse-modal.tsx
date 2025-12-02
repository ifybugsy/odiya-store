"use client"

import { useState, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, CheckCircle, Loader2, AlertTriangle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
const REPORT_TIMEOUT = 10000

export function ReportAbuseModal({
  itemId,
  isOpen,
  onClose,
}: { itemId: string; isOpen: boolean; onClose: () => void }) {
  const { token, user } = useAuth()
  const [reason, setReason] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [validationError, setValidationError] = useState("")

  const validateReport = useCallback(() => {
    setValidationError("")

    if (!user) {
      setValidationError("You must be logged in to report abuse")
      return false
    }

    if (!token) {
      setValidationError("Authentication token is missing. Please log in again.")
      return false
    }

    if (!reason || reason.trim() === "") {
      setValidationError("Please select a reason for your report")
      return false
    }

    if (description.length > 500) {
      setValidationError("Description cannot exceed 500 characters")
      return false
    }

    if (!itemId || itemId.trim() === "") {
      setValidationError("Invalid item. Please try again.")
      console.error("[v0] Invalid itemId for report:", itemId)
      return false
    }

    return true
  }, [reason, description, itemId, token, user])

  const handleSubmit = async () => {
    if (!validateReport()) {
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      console.log("[v0] Starting report submission:", { itemId, reason, descriptionLength: description.length })

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), REPORT_TIMEOUT)

      const reportPayload = {
        itemId,
        reason,
        description: description.trim(),
      }

      console.log("[v0] Report payload:", reportPayload)

      const res = await fetch(`${API_URL}/reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(reportPayload),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      console.log("[v0] Report response status:", res.status)

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        const errorMessage = errorData?.error || errorData?.message || `Server error (${res.status})`
        console.error("[v0] Report submission failed:", {
          status: res.status,
          error: errorMessage,
          fullResponse: errorData,
        })
        setError(errorMessage)
        setIsSubmitting(false)
        return
      }

      const data = await res.json()
      console.log("[v0] Report submitted successfully:", {
        reportId: data._id || data.id,
        status: data.status,
        message: data.message,
      })

      setSubmitted(true)
      setReason("")
      setDescription("")
      setValidationError("")

      setTimeout(() => {
        onClose()
        setSubmitted(false)
      }, 2500)
    } catch (error: any) {
      console.error("[v0] Failed to submit report:", {
        errorName: error?.name,
        errorMessage: error?.message,
        errorCode: error?.code,
      })

      if (error?.name === "AbortError") {
        setError("Request timed out. Please check your connection and try again.")
        console.error("[v0] Report submission timeout after 10 seconds")
      } else if (error instanceof TypeError) {
        setError("Network error. Please check your internet connection and try again.")
      } else {
        setError(error?.message || "An unexpected error occurred while submitting your report")
      }

      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setReason("")
      setDescription("")
      setError("")
      setValidationError("")
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            Report Abuse
          </DialogTitle>
          <DialogDescription>Help us maintain a safe marketplace by reporting inappropriate content</DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="text-center py-8">
            <div className="flex justify-center mb-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="text-green-600 text-lg font-semibold mb-2">Report Submitted Successfully</div>
            <p className="text-sm text-muted-foreground mb-2">Thank you for helping us maintain a safe community.</p>
            <p className="text-xs text-muted-foreground">
              Our moderation team will review your report and take appropriate action within 24-48 hours.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {(error || validationError) && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex gap-2 items-start">
                  <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600">{error || validationError}</p>
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-2 block">Reason for Report *</label>
              <Select
                value={reason}
                onValueChange={(value) => {
                  setReason(value)
                  setValidationError("")
                }}
              >
                <SelectTrigger disabled={isSubmitting}>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Inappropriate Content">Inappropriate Content</SelectItem>
                  <SelectItem value="Fraud">Fraud or Scam</SelectItem>
                  <SelectItem value="Offensive">Offensive or Harassing</SelectItem>
                  <SelectItem value="Spam">Spam</SelectItem>
                  <SelectItem value="Wrong Category">Wrong Category</SelectItem>
                  <SelectItem value="Counterfeit">Counterfeit Product</SelectItem>
                  <SelectItem value="Damaged">Damaged or Defective Item</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">Choose the category that best describes the issue</p>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Additional Details{" "}
                <span className="text-muted-foreground font-normal">(Optional - max 500 characters)</span>
              </label>
              <Textarea
                placeholder="Provide detailed information about your report to help us investigate..."
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value)
                  setValidationError("")
                }}
                className="resize-none"
                rows={4}
                disabled={isSubmitting}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground mt-1">{description.length}/500 characters</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-900">
                Your report is anonymous and will be reviewed by our moderation team. False reports may result in
                account restrictions.
              </p>
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!reason || isSubmitting}
                className="bg-red-600 hover:bg-red-700 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Report"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
