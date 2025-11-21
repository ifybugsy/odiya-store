import express from "express"
import Item from "../models/Item.js"
import User from "../models/User.js"
import { isAdmin } from "../middleware/auth.js"
import Payment from "../models/Payment.js"

const router = express.Router()

router.use(isAdmin)

// Get all items
router.get("/items", async (req, res) => {
  try {
    const items = await Item.find({}).populate("sellerId", "firstName lastName email phone").sort({ createdAt: -1 })

    res.json(items)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get pending items for approval
router.get("/pending-items", async (req, res) => {
  try {
    const items = await Item.find({ status: "pending" })
      .populate("sellerId", "firstName lastName email phone")
      .sort({ createdAt: -1 })

    res.json(items)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Approve item
router.put("/items/:id/approve", async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { isApproved: true, status: "approved", approvedBy: req.user.id },
      { new: true },
    )

    if (!item) {
      return res.status(404).json({ error: "Item not found" })
    }

    res.json({
      message: "Item approved successfully",
      item,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Reject item
router.put("/items/:id/reject", async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, { status: "rejected" }, { new: true })

    if (!item) {
      return res.status(404).json({ error: "Item not found" })
    }

    res.json({
      message: "Item rejected",
      item,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Delete item
router.delete("/items/:id", async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id)

    if (!item) {
      return res.status(404).json({ error: "Item not found" })
    }

    res.json({ message: "Item deleted successfully" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get all users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({}, "-password").sort({ createdAt: -1 })
    res.json(users)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Suspend user
router.put("/users/:id/suspend", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isSuspended: true }, { new: true }).select("-password")

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    res.json({
      message: "User suspended successfully",
      user,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Unsuspend user
router.put("/users/:id/unsuspend", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isSuspended: false }, { new: true }).select("-password")

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    res.json({
      message: "User unsuspended successfully",
      user,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get dashboard stats
router.get("/stats", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments()
    const totalSellers = await User.countDocuments({ isSeller: true })
    const totalItems = await Item.countDocuments({ isApproved: true })
    const pendingItems = await Item.countDocuments({ status: "pending" })

    const completedPayments = await Payment.find({ status: "completed" })

    const totalRevenue = completedPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0)
    const averagePayment = completedPayments.length > 0 ? totalRevenue / completedPayments.length : 0
    const totalPaymentsCompleted = completedPayments.length

    res.json({
      totalUsers,
      totalSellers,
      totalItems,
      pendingItems,
      totalRevenue,
      totalPaymentsCompleted,
      averagePayment,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
