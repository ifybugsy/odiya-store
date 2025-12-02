import express from "express"
import User from "../models/User.js"
import { authenticateToken, isAdmin } from "../middleware/auth.js"

const router = express.Router()

// Get all sellers
router.get("/", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, status = "all" } = req.query
    const skip = (page - 1) * limit

    const query = { isSeller: true }
    if (status === "active") {
      query.isSuspended = false
    } else if (status === "suspended") {
      query.isSuspended = true
    }

    const sellers = await User.find(query)
      .select(
        "firstName lastName email businessName phone status totalItemsListed itemsSold rating ratingCount isSuspended createdAt",
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number.parseInt(limit))

    const total = await User.countDocuments(query)

    res.json({
      sellers,
      pagination: { page: Number.parseInt(page), limit: Number.parseInt(limit), total },
    })
  } catch (error) {
    console.error("[v0] Failed to get sellers:", error)
    res.status(500).json({ error: error.message })
  }
})

// Bulk actions on sellers
router.post("/bulk-action", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { sellerIds, action } = req.body

    if (!sellerIds || sellerIds.length === 0) {
      return res.status(400).json({ error: "No sellers selected" })
    }

    let updateData = {}

    if (action === "suspend") {
      updateData = { isSuspended: true }
    } else if (action === "unsuspend") {
      updateData = { isSuspended: false }
    } else {
      return res.status(400).json({ error: "Invalid action" })
    }

    const result = await User.updateMany({ _id: { $in: sellerIds } }, updateData)

    console.log(`[v0] Bulk action ${action} performed on ${result.modifiedCount} sellers`)

    res.json({
      message: `Bulk action ${action} completed`,
      modifiedCount: result.modifiedCount,
    })
  } catch (error) {
    console.error("[v0] Failed to perform bulk action:", error)
    res.status(500).json({ error: error.message })
  }
})

export default router
