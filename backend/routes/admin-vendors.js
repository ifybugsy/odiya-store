import express from "express"
import Vendor from "../models/Vendor.js"
import User from "../models/User.js"
import VendorActivity from "../models/VendorActivity.js"
import { authenticateToken, isAdmin } from "../middleware/auth.js"

const router = express.Router()

const logVendorActivity = async (vendorId, activityType, description, metadata = {}, severity = "low") => {
  try {
    await VendorActivity.create({
      vendorId,
      activityType,
      description,
      metadata,
      severity,
    })
  } catch (error) {
    console.error("[v0] Failed to log vendor activity:", error)
  }
}

// Get all vendors (admin only) with search and pagination
router.get("/", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, status = "all", sort = "createdAt", search = "" } = req.query
    const skip = (page - 1) * limit

    const query = {}
    if (status !== "all") {
      query.status = status
    }

    if (search.trim()) {
      query.$or = [
        { storeName: { $regex: search, $options: "i" } },
        { "userId.email": { $regex: search, $options: "i" } },
      ]
    }

    const vendors = await Vendor.find(query)
      .populate("userId", "firstName lastName email phone businessName city rating ratingCount itemsSold")
      .populate("approvedBy", "firstName lastName")
      .sort({ [sort]: -1 })
      .skip(skip)
      .limit(Number.parseInt(limit))

    const total = await Vendor.countDocuments(query)
    const totalPages = Math.ceil(total / limit)

    res.json({
      vendors,
      pagination: { page: Number.parseInt(page), limit: Number.parseInt(limit), total, totalPages },
    })
  } catch (error) {
    console.error("[v0] Get vendors error:", error)
    res.status(500).json({ error: error.message })
  }
})

// Get vendor by ID (admin only)
router.get("/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id)
      .populate("userId", "firstName lastName email phone businessName city rating itemsSold")
      .populate("approvedBy", "firstName lastName")

    if (!vendor) return res.status(404).json({ error: "Vendor not found" })

    res.json(vendor)
  } catch (error) {
    console.error("[v0] Get vendor error:", error)
    res.status(500).json({ error: error.message })
  }
})

router.get("/:id/activities", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, activityType, severity } = req.query
    const skip = (page - 1) * limit

    const query = { vendorId: req.params.id }
    if (activityType) query.activityType = activityType
    if (severity) query.severity = severity

    const activities = await VendorActivity.find(query).sort({ timestamp: -1 }).skip(skip).limit(Number.parseInt(limit))

    const total = await VendorActivity.countDocuments(query)

    res.json({
      activities,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("[v0] Get vendor activities error:", error)
    res.status(500).json({ error: error.message })
  }
})

router.get("/activities/all", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50, activityType, severity, vendorId } = req.query
    const skip = (page - 1) * limit

    const query = {}
    if (activityType) query.activityType = activityType
    if (severity) query.severity = severity
    if (vendorId) query.vendorId = vendorId

    const activities = await VendorActivity.find(query)
      .populate("vendorId", "storeName status")
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(Number.parseInt(limit))

    const total = await VendorActivity.countDocuments(query)

    res.json({
      activities,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("[v0] Get all activities error:", error)
    res.status(500).json({ error: error.message })
  }
})

// Approve vendor
router.put("/:id/approve", authenticateToken, isAdmin, async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      {
        status: "approved",
        isApproved: true,
        approvedBy: req.user.id,
        approvedAt: new Date(),
      },
      { new: true },
    ).populate("userId", "firstName lastName email")

    if (!vendor) return res.status(404).json({ error: "Vendor not found" })

    await User.findByIdAndUpdate(vendor.userId, {
      isVendor: true,
      isSeller: true, // Automatically grant seller permissions
    })

    await logVendorActivity(
      vendor._id,
      "status_changed",
      `Vendor approved by admin ${req.user.firstName} ${req.user.lastName}. Seller role automatically granted.`,
      { previousStatus: "pending", newStatus: "approved", approvedBy: req.user.id, sellerRoleGranted: true },
      "medium",
    )

    console.log(`[v0] Vendor approved and seller role granted: ${vendor.storeName}`)
    res.json({ message: "Vendor approved successfully. Seller permissions granted.", vendor })
  } catch (error) {
    console.error("[v0] Approve vendor error:", error)
    res.status(500).json({ error: error.message })
  }
})

// Reject vendor
router.put("/:id/reject", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { reason } = req.body
    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      {
        status: "rejected",
        isApproved: false,
      },
      { new: true },
    ).populate("userId", "firstName lastName email")

    if (!vendor) return res.status(404).json({ error: "Vendor not found" })

    await logVendorActivity(
      vendor._id,
      "status_changed",
      `Vendor rejected by admin ${req.user.firstName} ${req.user.lastName}`,
      { previousStatus: vendor.status, newStatus: "rejected", reason, rejectedBy: req.user.id },
      "high",
    )

    console.log(`[v0] Vendor rejected: ${vendor.storeName}`)
    res.json({ message: "Vendor rejected successfully", vendor, reason })
  } catch (error) {
    console.error("[v0] Reject vendor error:", error)
    res.status(500).json({ error: error.message })
  }
})

// Suspend vendor
router.put("/:id/suspend", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { reason } = req.body
    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      {
        status: "suspended",
      },
      { new: true },
    ).populate("userId", "firstName lastName email")

    if (!vendor) return res.status(404).json({ error: "Vendor not found" })

    // Suspend the user as well
    await User.findByIdAndUpdate(vendor.userId._id, { isSuspended: true })

    await logVendorActivity(
      vendor._id,
      "status_changed",
      `Vendor suspended by admin ${req.user.firstName} ${req.user.lastName}`,
      { previousStatus: vendor.status, newStatus: "suspended", reason, suspendedBy: req.user.id },
      "critical",
    )

    console.log(`[v0] Vendor suspended: ${vendor.storeName}`)
    res.json({ message: "Vendor suspended successfully", vendor, reason })
  } catch (error) {
    console.error("[v0] Suspend vendor error:", error)
    res.status(500).json({ error: error.message })
  }
})

// Unsuspend vendor
router.put("/:id/unsuspend", authenticateToken, isAdmin, async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      {
        status: "approved",
      },
      { new: true },
    ).populate("userId", "firstName lastName email")

    if (!vendor) return res.status(404).json({ error: "Vendor not found" })

    // Unsuspend the user as well
    await User.findByIdAndUpdate(vendor.userId._id, { isSuspended: false })

    await logVendorActivity(
      vendor._id,
      "status_changed",
      `Vendor unsuspended by admin ${req.user.firstName} ${req.user.lastName}`,
      { previousStatus: "suspended", newStatus: "approved", unsuspendedBy: req.user.id },
      "medium",
    )

    console.log(`[v0] Vendor unsuspended: ${vendor.storeName}`)
    res.json({ message: "Vendor unsuspended successfully", vendor })
  } catch (error) {
    console.error("[v0] Unsuspend vendor error:", error)
    res.status(500).json({ error: error.message })
  }
})

// Delete vendor
router.delete("/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndDelete(req.params.id)

    if (!vendor) return res.status(404).json({ error: "Vendor not found" })

    // Remove vendor status from user
    await User.findByIdAndUpdate(vendor.userId, { isVendor: false })

    await logVendorActivity(
      vendor._id,
      "status_changed",
      `Vendor deleted by admin ${req.user.firstName} ${req.user.lastName}`,
      { storeName: vendor.storeName, deletedBy: req.user.id },
      "critical",
    )

    console.log(`[v0] Vendor deleted: ${vendor.storeName}`)
    res.json({ message: "Vendor deleted successfully" })
  } catch (error) {
    console.error("[v0] Delete vendor error:", error)
    res.status(500).json({ error: error.message })
  }
})

// Get vendor stats
router.get("/:id/stats", authenticateToken, isAdmin, async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id)
    if (!vendor) return res.status(404).json({ error: "Vendor not found" })

    const activityStats = await VendorActivity.aggregate([
      { $match: { vendorId: vendor._id } },
      {
        $group: {
          _id: "$activityType",
          count: { $sum: 1 },
        },
      },
    ])

    const recentActivities = await VendorActivity.find({ vendorId: vendor._id }).sort({ timestamp: -1 }).limit(10)

    const stats = {
      totalSales: vendor.totalSales,
      totalRevenue: vendor.totalRevenue,
      followers: vendor.followers_count,
      ratings: vendor.ratings,
      ratingCount: vendor.ratingCount,
      activityStats,
      recentActivities,
    }

    res.json(stats)
  } catch (error) {
    console.error("[v0] Get vendor stats error:", error)
    res.status(500).json({ error: error.message })
  }
})

router.put("/:id/verify", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { isVerified } = req.body
    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      {
        isVerified,
        verifiedAt: isVerified ? new Date() : null,
      },
      { new: true },
    )

    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found" })
    }

    await logVendorActivity(
      vendor._id,
      "verification_changed",
      `Vendor ${isVerified ? "verified" : "unverified"} by admin ${req.user.firstName} ${req.user.lastName}`,
      { isVerified, changedBy: req.user.id },
      "medium",
    )

    console.log(`[v0] Vendor verification updated: ${vendor.storeName} - ${isVerified ? "Verified" : "Unverified"}`)
    res.json({ message: "Vendor verification status updated", vendor })
  } catch (error) {
    console.error("Error updating vendor verification:", error)
    res.status(500).json({ error: "Failed to update verification status" })
  }
})

router.put("/:id/promote", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { isPromoted } = req.body
    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      {
        isPromoted,
        promotedAt: isPromoted ? new Date() : null,
        promotedUntil: isPromoted ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null, // 30 days
      },
      { new: true },
    )

    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found" })
    }

    await logVendorActivity(
      vendor._id,
      "promotion_changed",
      `Vendor ${isPromoted ? "promoted" : "unpromoted"} by admin ${req.user.firstName} ${req.user.lastName}`,
      { isPromoted, promotedUntil: vendor.promotedUntil, changedBy: req.user.id },
      "medium",
    )

    console.log(`[v0] Vendor promotion updated: ${vendor.storeName} - ${isPromoted ? "Promoted" : "Unpromoted"}`)
    res.json({ message: "Vendor promotion status updated", vendor })
  } catch (error) {
    console.error("Error updating vendor promotion:", error)
    res.status(500).json({ error: "Failed to update promotion status" })
  }
})

export default router
