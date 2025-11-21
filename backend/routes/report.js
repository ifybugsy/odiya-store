import express from "express"
import Report from "../models/Report.js"
import { authenticateToken } from "../middleware/auth.js"

const router = express.Router()

// Create abuse report
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { itemId, reason, description } = req.body

    if (!itemId || !reason) {
      return res.status(400).json({ error: "Item ID and reason are required" })
    }

    const report = new Report({
      itemId,
      reportedBy: req.user.id,
      reason,
      description,
    })

    // Get seller ID from item
    const Item = require("../models/Item.js").default
    const item = await Item.findById(itemId)
    if (item) {
      report.sellerId = item.sellerId
    }

    await report.save()

    res.status(201).json({
      message: "Report submitted successfully",
      report,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get all reports (admin only)
router.get("/", authenticateToken, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: "Unauthorized" })
    }

    const reports = await Report.find()
      .populate("itemId", "title price images")
      .populate("reportedBy", "firstName lastName email")
      .populate("sellerId", "firstName lastName email")
      .sort({ createdAt: -1 })

    res.json(reports)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Update report status (admin only)
router.put("/:id/status", authenticateToken, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: "Unauthorized" })
    }

    const { status } = req.body
    const report = await Report.findByIdAndUpdate(req.params.id, { status }, { new: true })

    res.json({ message: "Report status updated", report })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
