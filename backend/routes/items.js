import express from "express"
import Item from "../models/Item.js"
import { authenticateToken, isSeller } from "../middleware/auth.js"
import mongoose from "mongoose"

const router = express.Router()

// Get all approved items with pagination and infinite scroll
router.get("/", async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = 20
    const category = req.query.category
    const search = req.query.search
    const condition = req.query.condition

    const filter = { isApproved: true, isSold: false }

    if (category) {
      filter.category = category
    }

    if (condition) {
      filter.condition = condition
    }

    if (search) {
      filter.$or = [{ title: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }]
    }

    const items = await Item.find(filter)
      .populate("sellerId", "firstName lastName phone profileImage rating ratingCount")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)

    const total = await Item.countDocuments(filter)

    console.log(`[Backend] Fetched ${items.length} items, first item ID:`, items[0]?._id)

    res.json({
      items,
      total,
      page,
      pages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("[Backend] Error fetching items:", error.message)
    res.status(500).json({ error: error.message })
  }
})

// Get categories
router.get("/categories", (req, res) => {
  const categories = [
    "Cars",
    "Phones",
    "Electronics",
    "Furniture",
    "Clothing",
    "Books",
    "Sports",
    "Real Estate",
    "Jobs",
    "Services",
  ]
  res.json({ categories })
})

// Get single item
router.get("/:id", async (req, res) => {
  try {
    const itemId = req.params.id
    console.log("[Backend] Fetching item with ID:", itemId)
    console.log("[Backend] ID type:", typeof itemId)
    console.log("[Backend] ID length:", itemId.length)
    
    const isValidObjectId = /^[a-f\d]{24}$/i.test(itemId)
    if (!isValidObjectId) {
      console.log("[Backend] Invalid ObjectId format:", itemId)
      return res.status(404).json({ error: "Invalid item ID format" })
    }

    const item = await Item.findByIdAndUpdate(
      itemId,
      { $inc: { views: 1 } },
      { new: true }
    ).populate("sellerId", "firstName lastName phone email profileImage rating ratingCount businessName")

    if (!item) {
      console.log("[Backend] Item not found with ID:", itemId)
      return res.status(404).json({ error: "Item not found" })
    }

    if (item.price !== undefined && item.price !== null) {
      item.price = Number(item.price)
      if (isNaN(item.price)) {
        console.warn("[Backend] Invalid price for item:", item._id)
        item.price = 0
      }
    } else {
      item.price = 0
    }

    console.log("[Backend] Item found successfully:", item._id)
    res.json(item)
  } catch (error) {
    console.error("[Backend] Error fetching item:", error.message)
    console.error("[Backend] Error stack:", error.stack)
    if (error.name === "CastError") {
      return res.status(404).json({ error: "Invalid item ID format" })
    }
    res.status(500).json({ error: error.message })
  }
})

// Create item (seller only)
router.post("/", authenticateToken, isSeller, async (req, res) => {
  try {
    const { title, description, category, price, images, location, condition } = req.body

    if (!title || !category || !price) {
      return res.status(400).json({ error: "Title, category, and price are required" })
    }

    const item = new Item({
      title,
      description,
      category,
      price,
      images: images || [], // Allow empty array
      sellerId: req.user.id,
      location,
      condition,
    })

    await item.save()

    res.status(201).json({
      message: "Item created successfully",
      item,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.put("/:id/images", authenticateToken, async (req, res) => {
  try {
    const { images } = req.body

    if (!images || !Array.isArray(images)) {
      return res.status(400).json({ error: "Images array is required" })
    }

    const item = await Item.findById(req.params.id)

    if (!item) {
      return res.status(404).json({ error: "Item not found" })
    }

    // Only the seller who created the item can update images
    if (item.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" })
    }

    // Add new images to existing ones
    item.images = [...item.images, ...images]
    item.updatedAt = Date.now()
    await item.save()

    res.json({
      message: "Images added successfully",
      item,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Update item
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)

    if (!item) {
      return res.status(404).json({ error: "Item not found" })
    }

    if (item.sellerId.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ error: "Unauthorized" })
    }

    const { title, description, price, condition, location } = req.body

    if (title) item.title = title
    if (description) item.description = description
    if (price) item.price = price
    if (condition) item.condition = condition
    if (location) item.location = location

    await item.save()

    res.json({
      message: "Item updated successfully",
      item,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Delete item
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)

    if (!item) {
      return res.status(404).json({ error: "Item not found" })
    }

    if (item.sellerId.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ error: "Unauthorized" })
    }

    await Item.deleteOne({ _id: req.params.id })

    res.json({ message: "Item deleted successfully" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Mark as sold
router.put("/:id/sold", authenticateToken, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)

    if (!item) {
      return res.status(404).json({ error: "Item not found" })
    }

    if (item.sellerId.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ error: "Unauthorized" })
    }

    item.isSold = true
    item.status = "sold"
    await item.save()

    res.json({
      message: "Item marked as sold",
      item,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get seller items
router.get("/seller/:sellerId", async (req, res) => {
  try {
    const items = await Item.find({ sellerId: req.params.sellerId }).sort({ createdAt: -1 })

    res.json(items)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
