import express from "express"
import Item from "../models/Item.js"
import User from "../models/User.js"
import Vendor from "../models/Vendor.js" // Import Vendor model
import { isAdmin } from "../middleware/auth.js"
import Payment from "../models/Payment.js"
import Referral from "../models/Referral.js"
import ReferralCommission from "../models/ReferralCommission.js"

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

// Get all messages for admin
router.get("/messages", async (req, res) => {
  try {
    const VendorMessage = (await import("../models/VendorMessage.js")).default

    const messages = await VendorMessage.find({})
      .populate("buyerId", "firstName lastName email")
      .populate("vendorId", "storeName")
      .sort({ createdAt: -1 })

    res.json({ messages, totalMessages: messages.length })
  } catch (error) {
    console.error("[Admin Messages] Error:", error.message)
    res.status(500).json({ error: error.message })
  }
})

// Get all ratings for admin
router.get("/ratings", async (req, res) => {
  try {
    const vendors = await Vendor.find({}).select("storeName averageRating totalReviews").sort({ averageRating: -1 })

    const users = await User.find({ isSeller: true })
      .select("firstName lastName email rating ratingCount")
      .sort({ rating: -1 })

    res.json({
      vendors,
      users,
      totalVendorRatings: vendors.reduce((sum, v) => sum + (v.totalReviews || 0), 0),
      totalUserRatings: users.reduce((sum, u) => sum + (u.ratingCount || 0), 0),
    })
  } catch (error) {
    console.error("[Admin Ratings] Error:", error.message)
    res.status(500).json({ error: error.message })
  }
})

router.get("/users", async (req, res) => {
  try {
    // Fetch all users and populate vendor information
    const allUsers = await User.find({}, "-password").sort({ createdAt: -1 })

    // Get all vendor user IDs to filter them out
    const vendors = await Vendor.find({}, "userId")
    const vendorUserIds = vendors.map((v) => v.userId.toString())

    // Filter out vendors from the users list
    const users = allUsers.filter((user) => !vendorUserIds.includes(user._id.toString()))

    console.log(`[v0] Fetched ${users.length} users (excluding ${vendorUserIds.length} vendors)`)
    res.json(users)
  } catch (error) {
    console.error("[v0] Get users error:", error)
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

router.get("/activity", async (req, res) => {
  try {
    const VendorMessage = (await import("../models/VendorMessage.js")).default

    // Get recent messages
    const recentMessages = await VendorMessage.find({})
      .populate("buyerId", "firstName lastName")
      .populate("vendorId", "storeName")
      .sort({ createdAt: -1 })
      .limit(50)

    const messageActivities = recentMessages.map((msg) => ({
      _id: msg._id,
      userId: msg.buyerId?._id,
      userName: `${msg.buyerId?.firstName || "Unknown"} ${msg.buyerId?.lastName || ""}`,
      type: "message",
      title: `Message to ${msg.vendorId?.storeName || "vendor"}`,
      description: msg.subject || "New message",
      timestamp: msg.createdAt,
      metadata: { vendorId: msg.vendorId?._id },
    }))

    // Combine with other activities (you can add more activity types here)
    const allActivities = [...messageActivities]

    res.json(allActivities)
  } catch (error) {
    console.error("[Admin Activity] Error:", error.message)
    res.status(500).json({ error: error.message })
  }
})

router.get("/activity/stats", async (req, res) => {
  try {
    const VendorMessage = (await import("../models/VendorMessage.js")).default

    const totalMessages = await VendorMessage.countDocuments()
    const totalUsers = await User.countDocuments()
    const totalPurchases = 0 // Add purchase tracking if you have it

    res.json({
      totalActivities: totalMessages + totalPurchases,
      purchasesCount: totalPurchases,
      activeUsers: totalUsers,
      messagesCount: totalMessages,
    })
  } catch (error) {
    console.error("[Admin Activity Stats] Error:", error.message)
    res.status(500).json({ error: error.message })
  }
})

// Boost request endpoints for admin approval
router.get("/boost-requests", async (req, res) => {
  try {
    const boostRequests = await Payment.find({
      type: { $in: ["boost_seller", "boost_vendor"] },
    })
      .populate("userId", "firstName lastName email")
      .populate("itemId", "title")
      .populate("vendorId", "storeName")
      .sort({ createdAt: -1 })

    res.json({ boostRequests })
  } catch (error) {
    console.error("[Admin Boost Requests] Error:", error.message)
    res.status(500).json({ error: error.message })
  }
})

router.post("/approve-boost/:paymentId", async (req, res) => {
  try {
    const { type } = req.body
    const payment = await Payment.findByIdAndUpdate(req.params.paymentId, { status: "completed" }, { new: true })

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" })
    }

    if (type === "item" && payment.itemId) {
      await Item.findByIdAndUpdate(payment.itemId, {
        isPromoted: true,
        promotedAt: new Date(),
        promotedUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      })
    } else if (type === "vendor" && payment.vendorId) {
      await Vendor.findByIdAndUpdate(payment.vendorId, {
        isPromoted: true,
        promotedAt: new Date(),
        promotedUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      })
    }

    res.json({
      message: "Boost approved and item/vendor promoted for 30 days",
      payment,
    })
  } catch (error) {
    console.error("[Admin Approve Boost] Error:", error.message)
    res.status(500).json({ error: error.message })
  }
})

router.post("/reject-boost/:paymentId", async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(req.params.paymentId, { status: "rejected" }, { new: true })

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" })
    }

    res.json({
      message: "Boost request rejected",
      payment,
    })
  } catch (error) {
    console.error("[Admin Reject Boost] Error:", error.message)
    res.status(500).json({ error: error.message })
  }
})

router.get("/referrals", async (req, res) => {
  try {
    const referrals = await Referral.find({})
      .populate("referrerId", "firstName lastName email")
      .populate("referredUserId", "firstName lastName email")
      .sort({ createdAt: -1 })

    const commissions = await ReferralCommission.find({})
      .populate("referrerId", "firstName lastName email")
      .populate("referredUserId", "firstName lastName")
      .populate("paymentId")
      .sort({ createdAt: -1 })

    const totalCommissions = commissions.reduce((sum, c) => sum + c.commissionAmount, 0)
    const pendingCommissions = commissions
      .filter((c) => c.status === "pending")
      .reduce((sum, c) => sum + c.commissionAmount, 0)
    const paidCommissions = commissions
      .filter((c) => c.status === "paid")
      .reduce((sum, c) => sum + c.commissionAmount, 0)

    res.json({
      referrals,
      commissions,
      stats: {
        totalReferrals: referrals.length,
        activeReferrals: referrals.filter((r) => r.status === "active").length,
        totalCommissions,
        pendingCommissions,
        paidCommissions,
      },
    })
  } catch (error) {
    console.error("[Admin Referrals] Error:", error)
    res.status(500).json({ error: error.message })
  }
})

router.put("/referrals/commission/:id/pay", async (req, res) => {
  try {
    const commission = await ReferralCommission.findByIdAndUpdate(
      req.params.id,
      {
        status: "paid",
        paidAt: new Date(),
      },
      { new: true },
    )

    if (!commission) {
      return res.status(404).json({ error: "Commission not found" })
    }

    res.json({ message: "Commission marked as paid", commission })
  } catch (error) {
    console.error("[Admin Referrals] Pay commission error:", error)
    res.status(500).json({ error: error.message })
  }
})

export default router
