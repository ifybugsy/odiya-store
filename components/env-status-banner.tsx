"use client"

import { useEffect, useState } from "react"
import { X, AlertTriangle } from "lucide-react"
import { validateEnvironment, testApiConnection, getConfigurationHelp } from "@/lib/env-config"
import { Button } from "@/components/ui/button"

export function EnvStatusBanner() {
  const [config, setConfig] = useState<ReturnType<typeof validateEnvironment> | null>(null)
  const [testResult, setTestResult] = useState<Awaited<ReturnType<typeof testApiConnection>> | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [testing, setTesting] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    const envConfig = validateEnvironment()
    setConfig(envConfig)

    // Auto-test API connection if configured
    if (envConfig.isConfigured) {
      handleTestConnection()
    }
  }, [])

  const handleTestConnection = async () => {
    setTesting(true)
    const result = await testApiConnection()
    setTestResult(result)
    setTesting(false)
  }

  // Don't show banner if dismissed or no config yet
  if (dismissed || !config) return null

  // Don't show banner if everything is working
  if (config.isConfigured && testResult?.success) return null

  // Show error banner if there are configuration issues
  if (!config.isConfigured) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm mb-1">API Configuration Error</h3>
              <div className="text-sm space-y-1">
                {config.errors.map((error, index) => (
                  <p key={index}>• {error}</p>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" onClick={() => setShowDetails(!showDetails)}>
                  {showDetails ? "Hide" : "Show"} Fix Instructions
                </Button>
                <Button size="sm" variant="secondary" onClick={handleTestConnection} disabled={testing}>
                  {testing ? "Testing..." : "Test Connection"}
                </Button>
              </div>

              {showDetails && (
                <pre className="mt-3 p-3 bg-red-700 rounded text-xs overflow-auto max-h-64">
                  {getConfigurationHelp()}
                </pre>
              )}
            </div>
            <button onClick={() => setDismissed(true)} className="flex-shrink-0 hover:bg-red-700 rounded p-1">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Show warning banner if connection test failed
  if (testResult && !testResult.success) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-amber-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm mb-1">API Connection Failed</h3>
              <p className="text-sm">{testResult.message}</p>
              <div className="mt-2 text-xs opacity-90">API URL: {config.apiUrl}</div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" onClick={handleTestConnection} disabled={testing}>
                  {testing ? "Retrying..." : "Retry Connection"}
                </Button>
                <Button size="sm" variant="secondary" onClick={() => setShowDetails(!showDetails)}>
                  {showDetails ? "Hide" : "Show"} Details
                </Button>
              </div>

              {showDetails && (
                <pre className="mt-3 p-3 bg-amber-700 rounded text-xs overflow-auto max-h-64">
                  {JSON.stringify(testResult.details, null, 2)}
                </pre>
              )}
            </div>
            <button onClick={() => setDismissed(true)} className="flex-shrink-0 hover:bg-amber-700 rounded p-1">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
