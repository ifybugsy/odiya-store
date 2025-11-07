"use client"

// Custom hooks for rider-specific functionality

import { useRiderAuth } from "./rider-auth-context"
import { useState, useCallback, useEffect } from "react"
import type { RiderDelivery, RiderEarnings, RiderRating } from "./rider-types"

export function useDeliveries() {
  const { token } = useRiderAuth()
  const [deliveries, setDeliveries] = useState<RiderDelivery[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDeliveries = useCallback(async () => {
    if (!token) return

    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/rider/deliveries", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) throw new Error("Failed to fetch deliveries")
      const data = await response.json()
      setDeliveries(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchDeliveries()
  }, [fetchDeliveries])

  const updateDeliveryStatus = useCallback(
    async (deliveryId: string, status: RiderDelivery["status"]) => {
      if (!token) return
      try {
        const response = await fetch(`/api/rider/deliveries/${deliveryId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        })
        if (!response.ok) throw new Error("Failed to update delivery status")
        const updated = await response.json()
        setDeliveries((prev) => prev.map((d) => (d.id === deliveryId ? updated : d)))
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
      }
    },
    [token],
  )

  return { deliveries, isLoading, error, fetchDeliveries, updateDeliveryStatus }
}

export function useRiderEarnings() {
  const { token } = useRiderAuth()
  const [earnings, setEarnings] = useState<RiderEarnings[]>([])
  const [totalEarnings, setTotalEarnings] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchEarnings = useCallback(async () => {
    if (!token) return

    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/rider/earnings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) throw new Error("Failed to fetch earnings")
      const data = await response.json()
      setEarnings(data.earnings)
      setTotalEarnings(data.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchEarnings()
  }, [fetchEarnings])

  return { earnings, totalEarnings, isLoading, error, refetch: fetchEarnings }
}

export function useRiderRatings() {
  const { token, rider } = useRiderAuth()
  const [ratings, setRatings] = useState<RiderRating[]>([])
  const [averageRating, setAverageRating] = useState(5)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRatings = useCallback(async () => {
    if (!token || !rider) return

    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/rider/${rider.id}/ratings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) throw new Error("Failed to fetch ratings")
      const data = await response.json()
      setRatings(data.ratings)
      setAverageRating(data.averageRating)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setIsLoading(false)
    }
  }, [token, rider])

  useEffect(() => {
    fetchRatings()
  }, [fetchRatings])

  return { ratings, averageRating, isLoading, error }
}
