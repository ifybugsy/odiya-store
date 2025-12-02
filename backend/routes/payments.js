import express from "express"

const Payment = (await import("../models/Payment.js")).default
const Item = (await import("../models/Item.js")).default
const Vendor = (await import("../models/Vendor.js")).default

const router = express.Router()

// Create payment record
router.post("/create", async (req, res) => {
  try {
    const { userId, itemId, amount, type, paymentMethod } = req.body

    const payment = new Payment({
      userId,
      itemId,
      amount,
      type,
      paymentMethod,
      status: "pending",
    })

    await payment.save()

    // In production, integrate with Paystack or your payment provider
    res.status(201).json({
      message: "Payment record created",
      payment,
      // Return bank account details for manual transfer
      bankDetails: {
        accountNumber: "1028301845",
        purpose: "Bugsy Mart Upload Fee",
      },
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Verify payment
router.post("/verify/:paymentId", async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(req.params.paymentId, { status: "completed" }, { new: true })

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" })
    }

    res.json({
      message: "Payment verified",
      payment,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post("/boost/seller", async (req, res) => {
  try {
    const { userId, itemId } = req.body

    if (!userId || !itemId) {
      return res.status(400).json({ error: "User ID and Item ID are required" })
    }

    const payment = new Payment({
      userId,
      itemId,
      amount: 150,
      type: "boost_seller",
      paymentMethod: "bank_transfer",
      status: "pending",
      description: "Item Boost Fee - ₦150",
    })

    await payment.save()

    res.status(201).json({
      message: "Seller boost payment record created",
      payment,
      bankDetails: {
        accountNumber: "1028301845",
        accountName: "IFYBUGSY DIGITAL TECHNOLOGIES",
        bankName: "UBA",
        purpose: "Bugsy Mart Boost Fee - Item",
      },
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post("/boost/vendor", async (req, res) => {
  try {
    const { userId, vendorId } = req.body

    if (!userId || !vendorId) {
      return res.status(400).json({ error: "User ID and Vendor ID are required" })
    }

    const payment = new Payment({
      userId,
      vendorId,
      amount: 2000,
      type: "boost_vendor",
      paymentMethod: "bank_transfer",
      status: "pending",
      description: "Vendor Boost Fee - ₦2,000",
    })

    await payment.save()

    res.status(201).json({
      message: "Vendor boost payment record created",
      payment,
      bankDetails: {
        accountNumber: "1028301845",
        accountName: "IFYBUGSY DIGITAL TECHNOLOGIES",
        bankName: "UBA",
        purpose: "Bugsymart Vendor Boost Fee",
      },
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post("/boost/seller/verify/:paymentId", async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(req.params.paymentId, { status: "completed" }, { new: true })

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" })
    }

    // Promote the item for 30 days
    const item = await Item.findByIdAndUpdate(
      payment.itemId,
      {
        isPromoted: true,
        promotedAt: new Date(),
        promotedUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      { new: true },
    )

    try {
      const User = (await import("../models/User.js")).default
      const Referral = (await import("../models/Referral.js")).default
      const ReferralCommission = (await import("../models/ReferralCommission.js")).default

      const user = await User.findById(payment.userId)
      if (user?.referredBy) {
        const referral = await Referral.findOne({
          referrerId: user.referredBy,
          referredUserId: user._id,
        })

        if (referral) {
          const commissionAmount = payment.amount * (referral.commissionRate || 0.1)
          const commission = new ReferralCommission({
            referralId: referral._id,
            referrerId: user.referredBy,
            referredUserId: user._id,
            paymentId: payment._id,
            itemId: payment.itemId,
            boostType: "item",
            boostAmount: payment.amount,
            commissionAmount,
            commissionRate: referral.commissionRate || 0.1,
          })
          await commission.save()

          await Referral.findByIdAndUpdate(referral._id, {
            $inc: { totalEarnings: commissionAmount },
          })

          await User.findByIdAndUpdate(user.referredBy, {
            $inc: { totalReferralEarnings: commissionAmount },
          })
        }
      }
    } catch (commissionError) {
      console.error("[v0] Failed to record commission:", commissionError)
    }

    res.json({
      message: "Payment verified and item promoted for 30 days",
      payment,
      item,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post("/boost/vendor/verify/:paymentId", async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(req.params.paymentId, { status: "completed" }, { new: true })

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" })
    }

    // Promote the vendor for 30 days
    const vendor = await Vendor.findByIdAndUpdate(
      payment.vendorId,
      {
        isPromoted: true,
        promotedAt: new Date(),
        promotedUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      { new: true },
    )

    try {
      const User = (await import("../models/User.js")).default
      const Referral = (await import("../models/Referral.js")).default
      const ReferralCommission = (await import("../models/ReferralCommission.js")).default

      const user = await User.findById(payment.userId)
      if (user?.referredBy) {
        const referral = await Referral.findOne({
          referrerId: user.referredBy,
          referredUserId: user._id,
        })

        if (referral) {
          const commissionAmount = payment.amount * (referral.commissionRate || 0.1)
          const commission = new ReferralCommission({
            referralId: referral._id,
            referrerId: user.referredBy,
            referredUserId: user._id,
            paymentId: payment._id,
            vendorId: payment.vendorId,
            boostType: "vendor",
            boostAmount: payment.amount,
            commissionAmount,
            commissionRate: referral.commissionRate || 0.1,
          })
          await commission.save()

          await Referral.findByIdAndUpdate(referral._id, {
            $inc: { totalEarnings: commissionAmount },
          })

          await User.findByIdAndUpdate(user.referredBy, {
            $inc: { totalReferralEarnings: commissionAmount },
          })
        }
      }
    } catch (commissionError) {
      console.error("[v0] Failed to record commission:", commissionError)
    }

    res.json({
      message: "Payment verified and vendor promoted for 30 days",
      payment,
      vendor,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
