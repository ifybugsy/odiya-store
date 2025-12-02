import express from "express"
import Vendor from "../models/Vendor.js"
import User from "../models/User.js"
import VendorMessage from "../models/VendorMessage.js"
import VendorFollower from "../models/VendorFollower.js"
import { authenticateToken } from "../middleware/auth.js"
import Item from "../models/Item.js"
import jwt from "jsonwebtoken"
import Order from "../models/Order.js"

const router = express.Router()

// Vendor Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Find user by email
    const user = await User.findOne({ email: normalizedEmail })
    if (!user) {
      console.log("[Vendor Login] User not found:", normalizedEmail)
      return res.status(401).json({ error: "Invalid email or password" })
    }

    // Check if user has vendor profile
    const vendor = await Vendor.findOne({ userId: user._id })
    if (!vendor) {
      console.log("[Vendor Login] No vendor profile found for user:", user._id)
      return res.status(401).json({ error: "No vendor profile found for this account" })
    }

    // Verify password
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      console.log("[Vendor Login] Password mismatch for vendor:", vendor._id)
      return res.status(401).json({ error: "Invalid email or password" })
    }

    // Check vendor status
    if (vendor.status === "suspended") {
      console.log("[Vendor Login] Suspended vendor attempted login:", vendor._id)
      return res.status(403).json({ error: "Your vendor account has been suspended. Contact support." })
    }

    if (vendor.status === "rejected") {
      console.log("[Vendor Login] Rejected vendor attempted login:", vendor._id)
      return res.status(403).json({ error: "Your vendor application was rejected. Contact support." })
    }

    const token = jwt.sign(
      { id: vendor._id, email: user.email, vendorId: vendor._id },
      process.env.JWT_SECRET || "your_jwt_secret_key",
      { expiresIn: "7d" },
    )

    console.log("[Vendor Login] Successful login for vendor:", vendor.storeName, "Status:", vendor.status)

    res.json({
      message: "Vendor login successful",
      token,
      vendor: {
        id: vendor._id,
        userId: user._id,
        firstName: user.firstName || vendor.storeName,
        storeName: vendor.storeName,
        status: vendor.status,
        email: user.email,
        phoneNumber: user.phone || vendor.phoneNumber,
        isApproved: vendor.status === "approved",
        followers_count: vendor.followers_count,
        totalSales: vendor.totalSales,
        totalRevenue: vendor.totalRevenue,
        createdAt: vendor.createdAt,
      },
    })
  } catch (error) {
    console.error("[Vendor Login] Error:", error.message)
    res.status(500).json({ error: error.message })
  }
})

router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 12, sort = "createdAt", search = "" } = req.query
    const skip = (page - 1) * limit

    const filter = { status: "approved", isApproved: true }

    if (search.trim()) {
      filter.$or = [
        { storeName: { $regex: search, $options: "i" } },
        { storeDescription: { $regex: search, $options: "i" } },
      ]
    }

    const vendors = await Vendor.aggregate([
      { $match: filter },
      {
        $addFields: {
          // Calculate promotion score
          isCurrentlyPromoted: {
            $cond: {
              if: {
                $and: [{ $eq: ["$isPromoted", true] }, { $gte: ["$promotedUntil", new Date()] }],
              },
              then: 1,
              else: 0,
            },
          },
        },
      },
      // Sort by promotion status first, then by followers and ratings
      { $sort: { isCurrentlyPromoted: -1, followers_count: -1, ratings: -1, createdAt: -1 } },
      { $skip: skip },
      { $limit: Number.parseInt(limit) },
      // Lookup user information
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      {
        $unwind: {
          path: "$userInfo",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          userId: 1,
          storeName: 1,
          storeDescription: 1,
          storeImage: 1,
          storeBanner: 1,
          storeLogo: 1,
          status: 1,
          isVerified: 1,
          isPromoted: 1,
          promotedAt: 1,
          promotedUntil: 1,
          ratings: 1,
          followers_count: 1,
          totalSales: 1,
          totalRevenue: 1,
          createdAt: 1,
          "userInfo.firstName": 1,
          "userInfo.lastName": 1,
          "userInfo.email": 1,
          "userInfo.phone": 1,
          "userInfo.profileImage": 1,
        },
      },
    ])

    const total = await Vendor.countDocuments(filter)

    console.log(`[v0] Fetched ${vendors.length} vendors with promoted priority`)

    res.json({
      vendors,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("[v0] Get vendors error:", error)
    res.status(500).json({ error: error.message })
  }
})

// Get vendor by ID
router.get("/:id", async (req, res) => {
  try {
    console.log("[v0] Fetching vendor profile:", req.params.id)

    const vendor = await Vendor.findById(req.params.id).populate(
      "userId",
      "firstName lastName email phone profileImage businessName",
    )

    if (!vendor) {
      console.log("[v0] Vendor not found:", req.params.id)
      return res.status(404).json({ error: "Vendor not found" })
    }

    // Get vendor's items count
    const itemsCount = await Item.countDocuments({
      sellerId: vendor.userId._id,
      isApproved: true,
    })

    const vendorData = {
      ...vendor.toObject(),
      itemsCount,
      storeBanner: vendor.storeBanner || null,
      storeLogo: vendor.storeLogo || null,
      isVerified: vendor.isVerified || false,
      isPromoted: vendor.isPromoted || false,
    }

    console.log("[v0] Vendor profile fetched successfully with all fields")
    res.json(vendorData)
  } catch (error) {
    console.error("[v0] Get vendor error:", error.message)
    res.status(500).json({ error: error.message })
  }
})

// Register as vendor
router.post("/register", authenticateToken, async (req, res) => {
  try {
    const { storeName, storeDescription, socialLinks, idCard } = req.body
    const userId = req.user.id

    // Check if already a vendor
    const existingVendor = await Vendor.findOne({ userId })
    if (existingVendor) {
      return res.status(400).json({ error: "User is already a vendor" })
    }

    const vendor = new Vendor({
      userId,
      storeName,
      storeDescription,
      socialLinks: socialLinks || {},
      idCard,
      status: "pending",
    })

    await vendor.save()

    // Update user to mark as having vendor profile
    await User.findByIdAndUpdate(userId, { isVendor: true })

    console.log("[v0] Vendor registration successful with ID card")

    res.status(201).json({
      message: "Vendor registration submitted for approval",
      vendor,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get current user's vendor profile
router.get("/my-store/profile", authenticateToken, async (req, res) => {
  try {
    console.log("[v0] [Vendor Profile] Fetching profile for user ID:", req.user.id)
    console.log("[v0] [Vendor Profile] Request headers:", { vendorId: req.user.vendorId })

    const vendor = await Vendor.findOne({ userId: req.user.id }).populate(
      "userId",
      "firstName lastName email phone profileImage",
    )

    if (!vendor) {
      console.log("[v0] [Vendor Profile] No vendor profile found for user:", req.user.id)
      return res.status(404).json({
        error: "Vendor profile not found",
        message: "No vendor profile exists for this account. Please register as a vendor first.",
      })
    }

    console.log("[v0] [Vendor Profile] Successfully fetched profile for:", vendor.storeName, "Status:", vendor.status)

    res.json({
      ...vendor.toObject(),
      isApproved: vendor.status === "approved",
      isPending: vendor.status === "pending",
      isSuspended: vendor.status === "suspended",
      isRejected: vendor.status === "rejected",
    })
  } catch (error) {
    console.error("[v0] [Vendor Profile] Error fetching profile:", error.message)
    res.status(500).json({
      error: error.message,
      message: "An error occurred while fetching your vendor profile. Please try again.",
    })
  }
})

// Update vendor profile
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id)

    if (!vendor) return res.status(404).json({ error: "Vendor not found" })

    // Authorization check
    if (vendor.userId.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ error: "Unauthorized" })
    }

    const {
      storeName,
      storeDescription,
      storeImage,
      storeBanner,
      storeLogo,
      storeTheme,
      socialLinks,
      store_policies,
      return_policy,
      shipping_policy,
      phoneNumber,
      location,
      email,
      catalogImages,
    } = req.body

    Object.assign(vendor, {
      storeName,
      storeDescription,
      storeImage: storeImage || vendor.storeImage,
      storeBanner: storeBanner || vendor.storeBanner,
      storeLogo: storeLogo || vendor.storeLogo,
      storeTheme: storeTheme || vendor.storeTheme,
      socialLinks: socialLinks || vendor.socialLinks,
      store_policies,
      return_policy,
      shipping_policy,
      phoneNumber: phoneNumber || vendor.phoneNumber,
      location: location || vendor.location,
      email: email || vendor.email,
      catalogImages: catalogImages || vendor.catalogImages,
      updatedAt: new Date(),
    })

    await vendor.save()

    console.log("[v0] Vendor profile updated with contact info and carousel images")

    res.json({ message: "Vendor profile updated", vendor })
  } catch (error) {
    console.error("[v0] Update vendor error:", error.message)
    res.status(500).json({ error: error.message })
  }
})

// Follow vendor
router.post("/:id/follow", authenticateToken, async (req, res) => {
  try {
    const vendorId = req.params.id
    const userId = req.user.id

    const vendor = await Vendor.findById(vendorId)
    if (!vendor) return res.status(404).json({ error: "Vendor not found" })

    // Check if already following
    const existingFollow = await VendorFollower.findOne({ vendorId, userId })
    if (existingFollow) {
      return res.status(400).json({ error: "Already following this vendor" })
    }

    const follow = new VendorFollower({ vendorId, userId })
    await follow.save()

    // Update vendor followers count
    vendor.followers_count = (vendor.followers_count || 0) + 1
    await vendor.save()

    res.status(201).json({ message: "Now following vendor" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Unfollow vendor
router.delete("/:id/follow", authenticateToken, async (req, res) => {
  try {
    const vendorId = req.params.id
    const userId = req.user.id

    await VendorFollower.deleteOne({ vendorId, userId })

    const vendor = await Vendor.findById(vendorId)
    if (vendor) {
      vendor.followers_count = Math.max(0, (vendor.followers_count || 1) - 1)
      await vendor.save()
    }

    res.json({ message: "Unfollowed vendor" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Send message to vendor
router.post("/:id/messages", authenticateToken, async (req, res) => {
  try {
    const { message, subject } = req.body
    const vendorId = req.params.id

    const vendor = await Vendor.findById(vendorId)
    if (!vendor) return res.status(404).json({ error: "Vendor not found" })

    const conversationId = `${req.user.id}-${vendorId}`

    const vendorMessage = new VendorMessage({
      vendorId,
      buyerId: req.user.id,
      message,
      subject,
      sender: "buyer",
      conversationId,
    })

    await vendorMessage.save()
    res.status(201).json({ message: "Message sent to vendor", vendorMessage })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post("/:id/messages/reply", authenticateToken, async (req, res) => {
  try {
    const { messageId, buyerId, message, subject } = req.body
    const vendorId = req.params.id

    const vendor = await Vendor.findById(vendorId)
    if (!vendor) return res.status(404).json({ error: "Vendor not found" })

    // Authorization check
    if (vendor.userId.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ error: "Unauthorized" })
    }

    // Generate conversationId
    const conversationId = `${buyerId}-${vendorId}`

    const vendorMessage = new VendorMessage({
      vendorId,
      buyerId,
      message,
      subject,
      sender: "vendor",
      conversationId,
      parentMessageId: messageId,
    })

    await vendorMessage.save()

    // Mark original message as read
    if (messageId) {
      await VendorMessage.findByIdAndUpdate(messageId, { isRead: true })
    }

    console.log("[Vendor Reply] Vendor replied to message:", messageId)
    res.status(201).json({ message: "Reply sent successfully", vendorMessage })
  } catch (error) {
    console.error("[Vendor Reply] Error:", error.message)
    res.status(500).json({ error: error.message })
  }
})

// Get messages for vendor
router.get("/:id/messages", authenticateToken, async (req, res) => {
  try {
    const vendorId = req.params.id
    console.log("[Vendor Messages] Fetching messages for vendor:", vendorId)

    const vendor = await Vendor.findById(vendorId)

    if (!vendor) {
      console.log("[Vendor Messages] Vendor not found:", vendorId)
      return res.status(404).json({ error: "Vendor not found" })
    }

    // Authorization check
    if (vendor.userId.toString() !== req.user.id && !req.user.isAdmin) {
      console.log("[Vendor Messages] Unauthorized access attempt by user:", req.user.id)
      return res.status(403).json({ error: "Unauthorized" })
    }

    const messages = await VendorMessage.find({ vendorId })
      .populate("buyerId", "firstName lastName email profileImage")
      .sort({ createdAt: -1 })

    console.log("[Vendor Messages] Found", messages.length, "messages for vendor:", vendorId)

    res.json({ messages })
  } catch (error) {
    console.error("[Vendor Messages] Error fetching messages:", error.message)
    res.status(500).json({ error: error.message })
  }
})

// Get vendor stats
router.get("/:id/stats", authenticateToken, async (req, res) => {
  try {
    const vendorId = req.params.id
    console.log("[Vendor Stats] Fetching stats for vendor:", vendorId)

    const vendor = await Vendor.findById(vendorId)
    if (!vendor) {
      console.log("[Vendor Stats] Vendor not found:", vendorId)
      return res.status(404).json({ error: "Vendor not found" })
    }

    // Authorization check
    if (vendor.userId.toString() !== req.user.id && !req.user.isAdmin) {
      console.log("[Vendor Stats] Unauthorized access attempt by user:", req.user.id)
      return res.status(403).json({ error: "Unauthorized" })
    }

    // Get items count
    const itemsCount = await Item.countDocuments({
      sellerId: vendor.userId,
      isApproved: true,
    })

    // Get total sales and revenue from orders
    const orders = await Order.find({
      "items.sellerId": vendor.userId,
      status: { $in: ["completed", "delivered"] },
    })

    let totalSales = 0
    let totalRevenue = 0

    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (item.sellerId.toString() === vendor.userId.toString()) {
          totalSales += item.quantity
          totalRevenue += item.price * item.quantity
        }
      })
    })

    const stats = {
      totalSales,
      totalRevenue,
      followers: vendor.followers_count || 0,
      items: itemsCount,
      rating: vendor.ratings || 0,
    }

    console.log("[Vendor Stats] Successfully fetched stats:", stats)

    res.json(stats)
  } catch (error) {
    console.error("[Vendor Stats] Error fetching stats:", error.message)
    res.status(500).json({ error: error.message })
  }
})

// Get vendor orders
router.get("/:id/orders", authenticateToken, async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id)
    if (!vendor) return res.status(404).json({ error: "Vendor not found" })

    // Authorization check
    if (vendor.userId.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ error: "Unauthorized" })
    }

    const Order = (await import("../models/Order.js")).default

    // Find orders containing vendor's items
    const orders = await Order.find({
      "items.sellerId": vendor.userId,
    })
      .populate("buyerId", "firstName lastName email")
      .sort({ createdAt: -1 })

    // Filter and format orders for this vendor
    const vendorOrders = orders.map((order) => ({
      _id: order._id,
      orderNumber: order.orderNumber || order._id,
      items: order.items.filter((item) => item.sellerId.toString() === vendor.userId.toString()),
      totalAmount: order.items
        .filter((item) => item.sellerId.toString() === vendor.userId.toString())
        .reduce((sum, item) => sum + item.price * item.quantity, 0),
      status: order.status,
      customerName: `${order.buyerId.firstName} ${order.buyerId.lastName}`,
      customerEmail: order.buyerId.email,
      createdAt: order.createdAt,
    }))

    console.log(`[v0] Fetched ${vendorOrders.length} orders for vendor ${vendor.storeName}`)
    res.json({ orders: vendorOrders })
  } catch (error) {
    console.error("[v0] Get vendor orders error:", error.message)
    res.status(500).json({ error: error.message })
  }
})

// Get vendor items
router.get("/:id/items", authenticateToken, async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id)
    if (!vendor) return res.status(404).json({ error: "Vendor not found" })

    // Authorization check
    if (vendor.userId.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ error: "Unauthorized" })
    }

    const items = await Item.find({ sellerId: vendor.userId }).sort({ createdAt: -1 })

    console.log(`[v0] Fetched ${items.length} items for vendor ${vendor.storeName}`)
    res.json({ items })
  } catch (error) {
    console.error("[v0] Get vendor items error:", error.message)
    res.status(500).json({ error: error.message })
  }
})

// Delete vendor item
router.delete("/:id/items/:itemId", authenticateToken, async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id)
    if (!vendor) return res.status(404).json({ error: "Vendor not found" })

    // Authorization check
    if (vendor.userId.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ error: "Unauthorized" })
    }

    const item = await Item.findOneAndDelete({
      _id: req.params.itemId,
      sellerId: vendor.userId,
    })

    if (!item) {
      return res.status(404).json({ error: "Item not found or unauthorized" })
    }

    console.log(`[v0] Deleted item ${item.title} for vendor ${vendor.storeName}`)
    res.json({ message: "Item deleted successfully" })
  } catch (error) {
    console.error("[v0] Delete vendor item error:", error.message)
    res.status(500).json({ error: error.message })
  }
})

// Update vendor catalog images (up to 3 images)
router.put("/:id/catalog", authenticateToken, async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id)

    if (!vendor) return res.status(404).json({ error: "Vendor not found" })

    if (vendor.userId.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ error: "Unauthorized" })
    }

    const { catalogImages } = req.body

    if (!Array.isArray(catalogImages)) {
      return res.status(400).json({ error: "catalogImages must be an array" })
    }

    if (catalogImages.length > 3) {
      return res.status(400).json({ error: "Maximum 3 catalog images allowed" })
    }

    vendor.catalogImages = catalogImages
    vendor.updatedAt = new Date()

    await vendor.save()

    console.log("[v0] Vendor catalog updated with", catalogImages.length, "images")

    res.json({ message: "Catalog images updated successfully", vendor })
  } catch (error) {
    console.error("[v0] Update catalog error:", error.message)
    res.status(500).json({ error: error.message })
  }
})

router.post("/:id/rate", authenticateToken, async (req, res) => {
  try {
    const { rating } = req.body
    const vendorId = req.params.id

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" })
    }

    const vendor = await Vendor.findById(vendorId)
    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found" })
    }

    // Prevent vendors from rating themselves
    if (vendor.userId.toString() === req.user.id) {
      return res.status(400).json({ error: "You cannot rate your own store" })
    }

    // Calculate new average rating
    const currentRating = vendor.averageRating || 0
    const currentRatingCount = vendor.totalReviews || 0

    const newRatingCount = currentRatingCount + 1
    const newAverageRating = (currentRating * currentRatingCount + rating) / newRatingCount

    vendor.averageRating = newAverageRating
    vendor.totalReviews = newRatingCount
    await vendor.save()

    console.log(
      `[Vendor Rating] User ${req.user.id} rated vendor ${vendorId}: ${rating} stars (new avg: ${newAverageRating.toFixed(2)})`,
    )

    res.json({
      message: "Rating submitted successfully",
      averageRating: newAverageRating,
      totalReviews: newRatingCount,
    })
  } catch (error) {
    console.error("[Vendor Rating] Error:", error.message)
    res.status(500).json({ error: error.message })
  }
})

const getVendorReview = async () => {
  return (await import("../models/VendorReview.js")).default
}

// Check follow status endpoint
router.get("/:id/follow/status", authenticateToken, async (req, res) => {
  try {
    const vendorId = req.params.id
    const userId = req.user.id

    const existingFollow = await VendorFollower.findOne({ vendorId, userId })

    res.json({ isFollowing: !!existingFollow })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Review endpoints for vendors
router.post("/:id/reviews", authenticateToken, async (req, res) => {
  try {
    const vendorId = req.params.id
    const { rating, comment } = req.body
    const VendorReview = await getVendorReview()

    if (!rating || !comment) {
      return res.status(400).json({ error: "Rating and comment are required" })
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" })
    }

    const vendor = await Vendor.findById(vendorId)
    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found" })
    }

    // Check if user already reviewed
    const existingReview = await VendorReview.findOne({
      vendorId,
      $or: [{ userId: req.user.id }, { buyerId: req.user.id }],
    })

    if (existingReview) {
      return res.status(400).json({ error: "You have already reviewed this vendor" })
    }

    // Get user name
    let userName = "Anonymous"
    try {
      const User = (await import("../models/User.js")).default
      const user = await User.findById(req.user.id)
      if (user) {
        userName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email
      }
    } catch (e) {
      console.log("[v0] Could not fetch user name:", e.message)
    }

    // Create review
    const review = new VendorReview({
      vendorId,
      userId: req.user.id,
      userName,
      rating,
      comment,
    })
    await review.save()

    // Update vendor ratings
    const reviews = await VendorReview.find({ vendorId })
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0)
    const avgRating = totalRating / reviews.length

    vendor.ratings = avgRating
    vendor.ratingCount = reviews.length
    vendor.reviewCount = reviews.length
    await vendor.save()

    res.status(201).json({ message: "Review added successfully", review })
  } catch (error) {
    console.error("[v0] Error adding review:", error)
    res.status(500).json({ error: error.message })
  }
})

// Get vendor reviews
router.get("/:id/reviews", async (req, res) => {
  try {
    const vendorId = req.params.id
    const VendorReview = await getVendorReview()

    const reviews = await VendorReview.find({ vendorId }).sort({ createdAt: -1 }).limit(50)

    res.json(reviews)
  } catch (error) {
    console.error("[v0] Error fetching reviews:", error)
    res.status(500).json({ error: error.message })
  }
})

export default router
