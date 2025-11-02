import express from "express"
import User from "../models/User.js"
import Item from "../models/Item.js"

const router = express.Router()

// Get user profile
router.get("/profile", async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password")

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    res.json(user)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Update profile
router.put("/profile", async (req, res) => {
  try {
    const { firstName, lastName, phone, address, city, state, profileImage } = req.body

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { firstName, lastName, phone, address, city, state, profileImage },
      { new: true },
    ).select("-password")

    res.json({
      message: "Profile updated successfully",
      user,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Become a seller
router.put("/become-seller", async (req, res) => {
  try {
    const { businessName, businessDescription, bankAccountNumber, bankAccountName, bankName } = req.body

    if (!businessName || !bankAccountNumber || !bankAccountName || !bankName) {
      return res.status(400).json({ error: "All seller details are required" })
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        isSeller: true,
        businessName,
        businessDescription,
        bankAccountNumber,
        bankAccountName,
        bankName,
      },
      { new: true },
    ).select("-password")

    res.json({
      message: "You are now a seller",
      user,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get user items
router.get("/my-items", async (req, res) => {
  try {
    const items = await Item.find({ sellerId: req.user.id }).sort({ createdAt: -1 })

    res.json(items)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
