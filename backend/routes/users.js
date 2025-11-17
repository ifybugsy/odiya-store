import express from "express"
import User from "../models/User.js"
import Item from "../models/Item.js"
import { authenticateToken } from "../middleware/auth.js"

const router = express.Router()

router.use(authenticateToken)

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
    const { businessName, businessDescription } = req.body

    if (!businessName) {
      return res.status(400).json({ error: "Business name is required" })
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        isSeller: true,
        businessName,
        businessDescription,
      },
      { new: true },
    ).select("-password")

    console.log(`[v0] User upgraded to seller: ${user.email} | isSeller: ${user.isSeller}`)

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

router.post("/:userId/rate", async (req, res) => {
  try {
    const { rating } = req.body
    const targetUserId = req.params.userId

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" })
    }

    // Prevent users from rating themselves
    if (targetUserId === req.user.id) {
      return res.status(400).json({ error: "You cannot rate yourself" })
    }

    const targetUser = await User.findById(targetUserId)

    if (!targetUser) {
      return res.status(404).json({ error: "User not found" })
    }

    // Update rating (simple average calculation)
    const currentRating = targetUser.rating || 0
    const currentRatingCount = targetUser.ratingCount || 0
    
    const newRatingCount = currentRatingCount + 1
    const newAverageRating = ((currentRating * currentRatingCount) + rating) / newRatingCount

    targetUser.rating = newAverageRating
    targetUser.ratingCount = newRatingCount
    await targetUser.save()

    console.log(`[v0] User ${req.user.id} rated user ${targetUserId}: ${rating} stars (new avg: ${newAverageRating.toFixed(2)})`)

    res.json({
      message: "Rating submitted successfully",
      averageRating: newAverageRating,
      totalRatings: newRatingCount,
    })
  } catch (error) {
    console.error("[v0] Rating submission error:", error.message)
    res.status(500).json({ error: error.message })
  }
})

router.put("/promote-admin", async (req, res) => {
  try {
    const { targetEmail, setupToken } = req.body

    if (!targetEmail) {
      return res.status(400).json({ error: "Target email is required" })
    }

    const isValidSetupToken = setupToken === process.env.ADMIN_SETUP_TOKEN
    const isExistingAdmin = req.user?.isAdmin === true

    if (!isValidSetupToken && !isExistingAdmin) {
      return res.status(403).json({ error: "Insufficient permissions to promote users" })
    }

    const normalizedEmail = targetEmail.toLowerCase().trim()
    const user = await User.findOne({ email: normalizedEmail })

    if (!user) {
      return res.status(404).json({ error: `User with email ${normalizedEmail} not found` })
    }

    if (user.isAdmin) {
      return res.status(400).json({ error: "User is already an admin" })
    }

    user.isAdmin = true
    await user.save()

    console.log(`[v0] User promoted to admin: ${normalizedEmail} by ${req.user?.email || "setup-token"}`)

    res.json({
      message: `${normalizedEmail} has been promoted to admin`,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isAdmin: user.isAdmin,
      },
    })
  } catch (error) {
    console.error("[v0] Admin promotion error:", error.message)
    res.status(500).json({ error: error.message })
  }
})

router.get("/check-admin/:email", async (req, res) => {
  try {
    const normalizedEmail = req.params.email.toLowerCase().trim()
    const user = await User.findOne({ email: normalizedEmail }).select("email isAdmin isSuspended")

    if (!user) {
      return res.json({ exists: false, isAdmin: false })
    }

    res.json({
      exists: true,
      email: user.email,
      isAdmin: user.isAdmin,
      isSuspended: user.isSuspended,
    })
  } catch (error) {
    console.error("[v0] Check admin error:", error.message)
    res.status(500).json({ error: error.message })
  }
})

export default router
