"use client"

import { useEffect, useState } from "react"
import { testApiConnection, getApiUrl } from "@/lib/api-utils"
import { CheckCircle, XCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ApiConnectionStatus() {
  const [status, setStatus] = useState<{
    connected: boolean
    message: string
    details?: any
  } | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const checkConnection = async () => {
    setIsChecking(true)
    const result = await testApiConnection()
    setStatus(result)
    setIsChecking(false)
  }

  useEffect(() => {
    checkConnection()
  }, [])

  if (!status && !isChecking) return null

  if (status?.connected) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-sm font-medium text-green-800">Backend Connected</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-red-800">API Connection Failed</p>
          <p className="text-xs text-red-700 mt-1">{status?.message || "Checking connection..."}</p>

          {status?.details && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs text-red-600 underline mt-2 hover:text-red-800"
            >
              {showDetails ? "Hide Details" : "Show Details"}
            </button>
          )}

          {showDetails && status?.details && (
            <div className="mt-2 p-2 bg-red-100 rounded text-xs font-mono text-red-900 overflow-auto">
              <pre>{JSON.stringify(status.details, null, 2)}</pre>
            </div>
          )}

          <div className="mt-3 space-y-2">
            <p className="text-xs text-red-700 font-medium">API URL: {getApiUrl()}</p>
            <p className="text-xs text-red-600">
              <strong>Solutions:</strong>
            </p>
            <ul className="text-xs text-red-600 list-disc ml-4 space-y-1">
              <li>Ensure backend server is running</li>
              <li>
                Verify <code className="bg-red-100 px-1 rounded">NEXT_PUBLIC_API_URL</code> environment variable is set
                correctly
              </li>
              <li>Check that the backend is deployed and accessible</li>
              <li>Verify CORS settings on backend allow your domain</li>
            </ul>
          </div>

          <Button
            onClick={checkConnection}
            disabled={isChecking}
            size="sm"
            variant="outline"
            className="mt-3 bg-transparent"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isChecking ? "animate-spin" : ""}`} />
            {isChecking ? "Checking..." : "Retry Connection"}
          </Button>
        </div>
      </div>
    </div>
  )
}
