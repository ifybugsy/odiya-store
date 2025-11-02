import express from "express"
import Payment from "../models/Payment.js"

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
        accountNumber: "2252184000",
        purpose: "Odiya Store Upload Fee",
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

export default router
