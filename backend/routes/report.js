import express from "express"
import Report from "../models/Report.js"
import Item from "../models/Item.js"
import { authenticateToken } from "../middleware/auth.js"

const router = express.Router()

router.post("/", authenticateToken, async (req, res) => {
  try {
    const { itemId, reason, description } = req.body

    // Validate required fields
    if (!itemId || !itemId.trim()) {
      console.log("[v0] Report submission failed: Missing itemId")
      return res.status(400).json({ error: "Item ID is required" })
    }

    if (!reason || !reason.trim()) {
      console.log("[v0] Report submission failed: Missing reason")
      return res.status(400).json({ error: "Reason for report is required" })
    }

    // Validate description length if provided
    if (description && description.length > 500) {
      console.log("[v0] Report submission failed: Description exceeds 500 characters")
      return res.status(400).json({ error: "Description cannot exceed 500 characters" })
    }

    // Validate item exists
    const item = await Item.findById(itemId)
    if (!item) {
      console.log(`[v0] Report submission failed: Item not found (${itemId})`)
      return res.status(404).json({ error: "Item not found" })
    }

    // Check if user has already reported this item
    const existingReport = await Report.findOne({
      itemId,
      reportedBy: req.user.id,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Last 24 hours
    })

    if (existingReport) {
      console.log(`[v0] Duplicate report attempt by user ${req.user.id} for item ${itemId}`)
      return res.status(409).json({
        error: "You have already reported this item recently. Please wait before submitting another report.",
      })
    }

    // Create new report
    const report = new Report({
      itemId,
      reportedBy: req.user.id,
      reason,
      description: description ? description.trim() : "",
      status: "pending",
    })

    // Add seller information
    if (item.sellerId) {
      report.sellerId = item.sellerId
    }

    await report.save()

    console.log(`[v0] Report created successfully: ${report._id}`, {
      itemId,
      reportedBy: req.user.id,
      reason,
      sellerId: item.sellerId,
    })

    res.status(201).json({
      message: "Report submitted successfully. Our team will review it shortly.",
      id: report._id,
      status: report.status,
    })
  } catch (error) {
    console.error("[v0] Report creation error:", error.message)
    res.status(500).json({
      error: "Failed to submit report. Please try again later.",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
})

router.get("/", authenticateToken, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      console.log(`[v0] Unauthorized report access attempt by user ${req.user.id}`)
      return res.status(403).json({ error: "Unauthorized" })
    }

    const { page = 1, limit = 20, status = "all" } = req.query
    const skip = (page - 1) * limit

    const query = {}
    if (status !== "all") {
      query.status = status
    }

    const reports = await Report.find(query)
      .populate("itemId", "title price images category")
      .populate("reportedBy", "firstName lastName email")
      .populate("sellerId", "firstName lastName email businessName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number.parseInt(limit))

    const total = await Report.countDocuments(query)
    const totalPages = Math.ceil(total / limit)

    console.log(`[v0] Reports retrieved: ${reports.length} reports`)

    res.json({
      reports,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total,
        totalPages,
      },
    })
  } catch (error) {
    console.error("[v0] Get reports error:", error.message)
    res.status(500).json({
      error: "Failed to retrieve reports",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
})

router.put("/:id/status", authenticateToken, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      console.log(`[v0] Unauthorized report status update attempt by user ${req.user.id}`)
      return res.status(403).json({ error: "Unauthorized" })
    }

    const { status, notes } = req.body

    if (!status) {
      return res.status(400).json({ error: "Status is required" })
    }

    const validStatuses = ["pending", "investigating", "resolved", "dismissed"]
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` })
    }

    const report = await Report.findByIdAndUpdate(
      req.params.id,
      {
        status,
        ...(notes && { notes }),
        resolvedAt: status === "resolved" ? new Date() : undefined,
        resolvedBy: status === "resolved" ? req.user.id : undefined,
      },
      { new: true },
    )

    if (!report) {
      return res.status(404).json({ error: "Report not found" })
    }

    console.log(`[v0] Report ${report._id} status updated to: ${status}`)

    res.json({
      message: "Report status updated successfully",
      report,
    })
  } catch (error) {
    console.error("[v0] Update report status error:", error.message)
    res.status(500).json({
      error: "Failed to update report status",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
})

router.get("/stats", authenticateToken, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: "Unauthorized" })
    }

    const stats = {
      total: await Report.countDocuments({}),
      pending: await Report.countDocuments({ status: "pending" }),
      investigating: await Report.countDocuments({ status: "investigating" }),
      resolved: await Report.countDocuments({ status: "resolved" }),
      dismissed: await Report.countDocuments({ status: "dismissed" }),
    }

    console.log("[v0] Report statistics retrieved:", stats)
    res.json(stats)
  } catch (error) {
    console.error("[v0] Get report stats error:", error.message)
    res.status(500).json({ error: "Failed to retrieve statistics" })
  }
})

export default router
