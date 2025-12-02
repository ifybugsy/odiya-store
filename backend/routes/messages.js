import express from "express"
import Message from "../models/Message.js"
import Item from "../models/Item.js"
import VendorMessage from "../models/VendorMessage.js"
import { authenticateToken } from "../middleware/auth.js"

const router = express.Router()

// Send message to seller
router.post("/", async (req, res) => {
  try {
    const { itemId, senderName, senderPhone, senderEmail, message } = req.body

    if (!itemId || !senderName || !senderPhone || !senderEmail || !message) {
      return res.status(400).json({ error: "All fields are required" })
    }

    const item = await Item.findById(itemId)
    if (!item) {
      return res.status(404).json({ error: "Item not found" })
    }

    const newMessage = new Message({
      itemId,
      senderId: req.user?.id || null,
      senderName,
      senderPhone,
      senderEmail,
      message,
    })

    await newMessage.save()

    res.status(201).json({
      message: "Message sent successfully",
      data: newMessage,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get messages for seller
router.get("/seller/:sellerId", async (req, res) => {
  try {
    const items = await Item.find({ sellerId: req.params.sellerId }).select("_id")
    const itemIds = items.map((item) => item._id)

    const messages = await Message.find({ itemId: { $in: itemIds } })
      .populate("itemId", "title")
      .sort({ createdAt: -1 })

    res.json(messages)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Respond to message
router.put("/:messageId/respond", async (req, res) => {
  try {
    const { response } = req.body

    const message = await Message.findByIdAndUpdate(
      req.params.messageId,
      { sellerResponse: response, isRead: true },
      { new: true },
    )

    if (!message) {
      return res.status(404).json({ error: "Message not found" })
    }

    res.json({
      message: "Response sent successfully",
      data: message,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post("/vendor/:vendorId", authenticateToken, async (req, res) => {
  try {
    const { message, subject, parentMessageId } = req.body
    const { vendorId } = req.params
    const buyerId = req.user.id

    // Create conversation ID based on vendor and buyer
    const conversationId = `${vendorId}_${buyerId}`

    const vendorMessage = new VendorMessage({
      vendorId,
      buyerId,
      conversationId,
      message,
      subject: subject || "Customer Inquiry",
      sender: "buyer",
      parentMessageId: parentMessageId || null,
    })

    await vendorMessage.save()

    console.log("[v0] Vendor message sent with conversation threading")

    res.status(201).json({
      message: "Message sent successfully",
      data: vendorMessage,
    })
  } catch (error) {
    console.error("[v0] Send vendor message error:", error)
    res.status(500).json({ error: error.message })
  }
})

router.get("/vendor/:vendorId", authenticateToken, async (req, res) => {
  try {
    const { vendorId } = req.params

    // Get messages grouped by conversation with latest first
    const messages = await VendorMessage.find({ vendorId })
      .populate("buyerId", "firstName lastName email profileImage")
      .sort({ conversationId: 1, createdAt: -1 })
      .lean()

    // Group by conversation for better UI organization
    const conversationMap = new Map()
    messages.forEach((msg) => {
      if (!conversationMap.has(msg.conversationId)) {
        conversationMap.set(msg.conversationId, [])
      }
      conversationMap.get(msg.conversationId).push(msg)
    })

    const conversations = Array.from(conversationMap.values())

    console.log("[v0] Fetched", messages.length, "messages in", conversations.length, "conversations")

    res.json({
      messages,
      conversations,
      total: messages.length,
    })
  } catch (error) {
    console.error("[v0] Get vendor messages error:", error)
    res.status(500).json({ error: error.message })
  }
})

export default router
