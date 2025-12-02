import express from "express"
import Subscription from "../models/Subscription.js"
import Vendor from "../models/Vendor.js"
import { authenticateToken, isAdmin } from "../middleware/auth.js"

const router = express.Router()

// Get all subscriptions with filters
router.get("/", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, status = "all", filterType = "all" } = req.query
    const skip = (page - 1) * limit

    const query = {}
    if (status !== "all") {
      query.status = status
    }

    let subscriptions = await Subscription.find(query)
      .populate("vendorId", "storeName status isPromoted promotedUntil")
      .populate("userId", "firstName lastName email")
      .sort({ expiryDate: 1 })
      .skip(skip)
      .limit(Number.parseInt(limit))

    // Apply additional filters
    if (filterType === "expiring") {
      const now = new Date()
      subscriptions = subscriptions.filter((sub) => {
        const daysUntilExpiry = Math.ceil((sub.expiryDate - now) / (1000 * 60 * 60 * 24))
        return daysUntilExpiry <= 7 && daysUntilExpiry > 0
      })
    } else if (filterType === "expired") {
      subscriptions = subscriptions.filter((sub) => sub.status === "expired")
    } else if (filterType === "promoted") {
      subscriptions = subscriptions.filter((sub) => sub.vendorId?.isPromoted)
    }

    const total = await Subscription.countDocuments(query)

    // Add computed fields
    const enrichedSubscriptions = subscriptions.map((sub) => {
      const now = new Date()
      const daysUntilExpiry = Math.ceil((sub.expiryDate - now) / (1000 * 60 * 60 * 24))
      const isExpiring = daysUntilExpiry <= 7
      const isExpired = sub.expiryDate < now

      return {
        ...sub.toObject(),
        daysUntilExpiry,
        isExpiring,
        isExpired,
      }
    })

    res.json({
      subscriptions: enrichedSubscriptions,
      pagination: { page: Number.parseInt(page), limit: Number.parseInt(limit), total },
    })
  } catch (error) {
    console.error("[v0] Failed to get subscriptions:", error)
    res.status(500).json({ error: error.message })
  }
})

// Get subscription statistics
router.get("/stats/overview", authenticateToken, isAdmin, async (req, res) => {
  try {
    const subscriptions = await Subscription.find()
    const now = new Date()

    const active = subscriptions.filter((s) => s.status === "active").length
    const expired = subscriptions.filter((s) => s.status === "expired").length
    const expiring = subscriptions.filter((s) => {
      const daysLeft = Math.ceil((s.expiryDate - now) / (1000 * 60 * 60 * 24))
      return daysLeft <= 7 && daysLeft > 0 && s.status === "active"
    }).length

    const totalRevenue = subscriptions.reduce((sum, s) => {
      if (s.status === "active" || s.status === "expired") {
        return sum + s.amount
      }
      return sum
    }, 0)

    res.json({
      active,
      expired,
      expiring,
      total: subscriptions.length,
      totalRevenue,
    })
  } catch (error) {
    console.error("[v0] Failed to get subscription stats:", error)
    res.status(500).json({ error: error.message })
  }
})

// Send renewal reminder to vendor
router.post("/:subscriptionId/send-reminder", authenticateToken, isAdmin, async (req, res) => {
  try {
    const subscription = await Subscription.findByIdAndUpdate(
      req.params.subscriptionId,
      {
        $set: {
          "reminderSent.sevenDays": true,
        },
        updatedAt: new Date(),
      },
      { new: true },
    ).populate("userId", "firstName lastName email")

    if (!subscription) {
      return res.status(404).json({ error: "Subscription not found" })
    }

    // TODO: Send email reminder to vendor
    console.log(`[v0] Reminder sent to ${subscription.userId.email}`)

    res.json({
      message: "Reminder sent successfully",
      subscription,
    })
  } catch (error) {
    console.error("[v0] Failed to send reminder:", error)
    res.status(500).json({ error: error.message })
  }
})

// Handle subscription expiry and remove promotion
router.post("/:subscriptionId/expire", authenticateToken, isAdmin, async (req, res) => {
  try {
    const subscription = await Subscription.findByIdAndUpdate(
      req.params.subscriptionId,
      {
        status: "expired",
        updatedAt: new Date(),
      },
      { new: true },
    )

    if (!subscription) {
      return res.status(404).json({ error: "Subscription not found" })
    }

    // Remove promotion if vendor is promoted
    const vendor = await Vendor.findByIdAndUpdate(
      subscription.vendorId,
      {
        isPromoted: false,
        promotedAt: null,
        promotedUntil: null,
      },
      { new: true },
    )

    console.log(`[v0] Subscription expired and promotion removed for vendor: ${vendor.storeName}`)

    res.json({
      message: "Subscription expired and promotion removed",
      subscription,
      vendor,
    })
  } catch (error) {
    console.error("[v0] Failed to expire subscription:", error)
    res.status(500).json({ error: error.message })
  }
})

export default router
