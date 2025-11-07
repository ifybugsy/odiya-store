"use client"

import { useRiderAuth } from "@/lib/rider-auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Clock, XCircle } from "lucide-react"

export function VerificationStatusCard() {
  const { rider } = useRiderAuth()

  if (!rider) return null

  const statusConfig = {
    pending: {
      icon: Clock,
      title: "Verification Pending",
      description: "Your documents are being reviewed. This usually takes 24-48 hours.",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    verified: {
      icon: CheckCircle,
      title: "Verified",
      description: "Your account is verified and ready to accept deliveries.",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    rejected: {
      icon: XCircle,
      title: "Verification Rejected",
      description: "Your documents were rejected. Please resubmit with correct information.",
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  }

  const config = statusConfig[rider.verificationStatus]
  const Icon = config.icon

  return (
    <Alert className={`${config.bgColor} border-none`}>
      <Icon className={`h-4 w-4 ${config.color}`} />
      <AlertDescription>
        <p className="font-semibold text-foreground">{config.title}</p>
        <p className="text-sm text-muted-foreground mt-1">{config.description}</p>
      </AlertDescription>
    </Alert>
  )
}
