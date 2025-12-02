import express from "express"
import Subscription from "../models/Subscription.js"
import Vendor from "../models/Vendor.js"
import { authenticateToken } from "../middleware/auth.js"

const router = express.Router()

// Get vendor subscription
router.get("/vendor/current", authenticateToken, async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user.id })
    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found" })
    }

    const subscription = await Subscription.findOne({ vendorId: vendor._id })
    if (!subscription) {
      return res.status(404).json({ error: "No subscription found" })
    }

    res.json(subscription)
  } catch (error) {
    console.error("[v0] Failed to get subscription:", error)
    res.status(500).json({ error: error.message })
  }
})

// Create new subscription (called after vendor payment is verified)
router.post("/vendor/create", authenticateToken, async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user.id })
    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found" })
    }

    // Check if already has active subscription
    const existingSubscription = await Subscription.findOne({
      vendorId: vendor._id,
      status: "active",
    })

    if (existingSubscription) {
      // Extend subscription
      const newExpiryDate = new Date(existingSubscription.expiryDate.getTime() + 30 * 24 * 60 * 60 * 1000)
      existingSubscription.expiryDate = newExpiryDate
      existingSubscription.renewalDate = newExpiryDate
      existingSubscription.lastPaymentDate = new Date()
      existingSubscription.reminderSent = {
        sevenDays: false,
        threeDays: false,
        oneDay: false,
        expired: false,
      }
      await existingSubscription.save()
      return res.json({ message: "Subscription extended", subscription: existingSubscription })
    }

    // Create new subscription (30 days from now)
    const expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    const subscription = new Subscription({
      vendorId: vendor._id,
      userId: req.user.id,
      expiryDate,
      renewalDate: expiryDate,
      status: "active",
    })

    await subscription.save()
    res.status(201).json({ message: "Subscription created", subscription })
  } catch (error) {
    console.error("[v0] Failed to create subscription:", error)
    res.status(500).json({ error: error.message })
  }
})

// Get subscription status and reminders
router.get("/vendor/status", authenticateToken, async (req, res) => {
  try {
    console.log("[v0] Subscription status request from user:", req.user?.id)

    const vendor = await Vendor.findOne({ userId: req.user.id })
    if (!vendor) {
      console.warn("[v0] Vendor not found for user:", req.user.id)
      return res.status(404).json({ error: "Vendor not found", hasSubscription: false })
    }

    const subscription = await Subscription.findOne({ vendorId: vendor._id })
    if (!subscription) {
      console.log("[v0] No subscription found for vendor:", vendor._id)
      return res.status(404).json({ error: "No subscription found", hasSubscription: false })
    }

    const now = new Date()
    const daysUntilExpiry = Math.ceil((subscription.expiryDate - now) / (1000 * 60 * 60 * 24))
    const isExpiring = daysUntilExpiry <= 7
    const isExpired = subscription.expiryDate < now

    // Update status if expired
    if (isExpired && subscription.status === "active") {
      subscription.status = "expired"
      await subscription.save()

      // Remove promotion from vendor if expired
      if (vendor.isPromoted) {
        vendor.isPromoted = false
        vendor.promotedAt = null
        vendor.promotedUntil = null
        await vendor.save()
      }
    }

    res.json({
      subscription,
      daysUntilExpiry,
      isExpiring,
      isExpired,
      status: subscription.status,
      willPromotionBeRemoved: isExpired && vendor.isPromoted,
    })
  } catch (error) {
    console.error("[v0] Failed to get subscription status:", error)
    res.status(500).json({ error: error.message })
  }
})

router.post("/vendor/renew", authenticateToken, async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user.id })
    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found" })
    }

    const subscription = await Subscription.findOne({ vendorId: vendor._id })
    if (!subscription) {
      return res.status(404).json({ error: "No subscription found" })
    }

    // Calculate new expiry date (30 days from now)
    const newExpiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    // Update subscription for monthly renewal
    subscription.expiryDate = newExpiryDate
    subscription.renewalDate = newExpiryDate
    subscription.lastPaymentDate = new Date()
    subscription.status = "active"
    subscription.reminderSent = {
      sevenDays: false,
      threeDays: false,
      oneDay: false,
      expired: false,
    }

    await subscription.save()

    res.json({
      message: "Subscription renewed successfully",
      subscription,
      nextRenewalDate: newExpiryDate,
    })
  } catch (error) {
    console.error("[v0] Failed to renew subscription:", error)
    res.status(500).json({ error: error.message })
  }
})

router.get("/vendor/reminders", authenticateToken, async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user.id })
    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found" })
    }

    const subscription = await Subscription.findOne({ vendorId: vendor._id })
    if (!subscription) {
      return res.status(404).json({ error: "No subscription found", reminder: null })
    }

    const now = new Date()
    const daysUntilExpiry = Math.ceil((subscription.expiryDate - now) / (1000 * 60 * 60 * 24))

    let reminder = null

    if (daysUntilExpiry <= 0) {
      reminder = { type: "expired", message: "Your subscription has expired. Renew now to maintain access." }
    } else if (daysUntilExpiry <= 1 && !subscription.reminderSent.oneDay) {
      reminder = { type: "oneDay", message: "Your subscription expires in 1 day. Renew before expiry." }
      subscription.reminderSent.oneDay = true
      await subscription.save()
    } else if (daysUntilExpiry <= 3 && !subscription.reminderSent.threeDays) {
      reminder = { type: "threeDays", message: "Your subscription expires in 3 days. Consider renewing soon." }
      subscription.reminderSent.threeDays = true
      await subscription.save()
    } else if (daysUntilExpiry <= 7 && !subscription.reminderSent.sevenDays) {
      reminder = { type: "sevenDays", message: "Your subscription expires in 7 days." }
      subscription.reminderSent.sevenDays = true
      await subscription.save()
    }

    res.json({
      reminder,
      daysUntilExpiry,
      subscriptionStatus: subscription.status,
    })
  } catch (error) {
    console.error("[v0] Failed to get reminders:", error)
    res.status(500).json({ error: error.message })
  }
})

export default router
