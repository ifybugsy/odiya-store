import express from "express"
import { authenticateToken } from "../middleware/auth.js"
import crypto from "crypto"

const Referral = (await import("../models/Referral.js")).default
const ReferralCommission = (await import("../models/ReferralCommission.js")).default
const User = (await import("../models/User.js")).default
const Payment = (await import("../models/Payment.js")).default

const router = express.Router()

router.post("/generate-code", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id

    // Check if user already has a referral code
    const user = await User.findById(userId)
    if (user.referralCode) {
      return res.json({
        referralCode: user.referralCode,
        referralLink: `${process.env.FRONTEND_URL || "http://localhost:3000"}/register?ref=${user.referralCode}`,
      })
    }

    // Generate unique referral code
    let referralCode
    let isUnique = false
    while (!isUnique) {
      referralCode = crypto.randomBytes(4).toString("hex").toUpperCase()
      const existing = await User.findOne({ referralCode })
      if (!existing) isUnique = true
    }

    // Update user with referral code
    user.referralCode = referralCode
    await user.save()

    res.json({
      referralCode,
      referralLink: `${process.env.FRONTEND_URL || "http://localhost:3000"}/register?ref=${referralCode}`,
    })
  } catch (error) {
    console.error("[Referrals] Generate code error:", error)
    res.status(500).json({ error: error.message })
  }
})

router.get("/my-stats", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id

    const user = await User.findById(userId)
    if (!user.referralCode) {
      return res.json({
        referralCode: null,
        totalReferrals: 0,
        totalEarnings: 0,
        pendingEarnings: 0,
        paidEarnings: 0,
        referrals: [],
        commissions: [],
      })
    }

    // Get all referrals made by this user
    const referrals = await Referral.find({ referrerId: userId })
      .populate("referredUserId", "firstName lastName email createdAt")
      .sort({ createdAt: -1 })

    // Get all commissions earned
    const commissions = await ReferralCommission.find({ referrerId: userId })
      .populate("referredUserId", "firstName lastName")
      .populate("paymentId")
      .sort({ createdAt: -1 })

    const totalEarnings = commissions.reduce((sum, c) => sum + c.commissionAmount, 0)
    const pendingEarnings = commissions
      .filter((c) => c.status === "pending")
      .reduce((sum, c) => sum + c.commissionAmount, 0)
    const paidEarnings = commissions.filter((c) => c.status === "paid").reduce((sum, c) => sum + c.commissionAmount, 0)

    res.json({
      referralCode: user.referralCode,
      referralLink: `${process.env.FRONTEND_URL || "http://localhost:3000"}/register?ref=${user.referralCode}`,
      totalReferrals: referrals.length,
      totalEarnings,
      pendingEarnings,
      paidEarnings,
      referrals,
      commissions,
    })
  } catch (error) {
    console.error("[Referrals] Get stats error:", error)
    res.status(500).json({ error: error.message })
  }
})

router.post("/apply-code", async (req, res) => {
  try {
    const { referralCode, newUserId } = req.body

    if (!referralCode || !newUserId) {
      return res.status(400).json({ error: "Referral code and user ID required" })
    }

    // Find referrer by code
    const referrer = await User.findOne({ referralCode })
    if (!referrer) {
      return res.status(404).json({ error: "Invalid referral code" })
    }

    // Prevent self-referral
    if (referrer._id.toString() === newUserId) {
      return res.status(400).json({ error: "Cannot use your own referral code" })
    }

    // Update new user with referrer
    await User.findByIdAndUpdate(newUserId, { referredBy: referrer._id })

    // Create referral record
    const referral = new Referral({
      referrerId: referrer._id,
      referredUserId: newUserId,
      referralCode,
    })
    await referral.save()

    // Update referrer's count
    await User.findByIdAndUpdate(referrer._id, { $inc: { totalReferrals: 1 } })

    res.json({ message: "Referral code applied successfully", referral })
  } catch (error) {
    console.error("[Referrals] Apply code error:", error)
    res.status(500).json({ error: error.message })
  }
})

router.post("/record-commission", authenticateToken, async (req, res) => {
  try {
    const { paymentId, boostType } = req.body

    const payment = await Payment.findById(paymentId)
    if (!payment) {
      return res.status(404).json({ error: "Payment not found" })
    }

    // Check if user was referred
    const user = await User.findById(payment.userId)
    if (!user.referredBy) {
      return res.json({ message: "User was not referred, no commission to record" })
    }

    // Check if commission already recorded
    const existing = await ReferralCommission.findOne({ paymentId })
    if (existing) {
      return res.json({ message: "Commission already recorded" })
    }

    // Find referral record
    const referral = await Referral.findOne({
      referrerId: user.referredBy,
      referredUserId: user._id,
    })

    if (!referral) {
      return res.status(404).json({ error: "Referral record not found" })
    }

    // Calculate commission (10% of boost amount)
    const commissionRate = referral.commissionRate || 0.1
    const commissionAmount = payment.amount * commissionRate

    // Create commission record
    const commission = new ReferralCommission({
      referralId: referral._id,
      referrerId: user.referredBy,
      referredUserId: user._id,
      paymentId,
      itemId: payment.itemId || null,
      vendorId: payment.vendorId || null,
      boostType,
      boostAmount: payment.amount,
      commissionAmount,
      commissionRate,
    })
    await commission.save()

    // Update referral total earnings
    await Referral.findByIdAndUpdate(referral._id, {
      $inc: { totalEarnings: commissionAmount },
    })

    // Update referrer's total earnings
    await User.findByIdAndUpdate(user.referredBy, {
      $inc: { totalReferralEarnings: commissionAmount },
    })

    res.json({
      message: "Commission recorded successfully",
      commission,
    })
  } catch (error) {
    console.error("[Referrals] Record commission error:", error)
    res.status(500).json({ error: error.message })
  }
})

export default router
