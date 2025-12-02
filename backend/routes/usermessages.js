import express from "express"
import { authenticateToken } from "../middleware/auth.js"

const UserMessage = (await import("../models/UserMessage.js")).default
const User = (await import("../models/User.js")).default

const router = express.Router()

router.get("/conversations", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id

    // Find all messages where user is sender or receiver
    const messages = await UserMessage.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    })
      .populate("senderId", "firstName lastName email profileImage")
      .populate("receiverId", "firstName lastName email profileImage")
      .sort({ createdAt: -1 })

    // Group by conversation ID and get latest message for each
    const conversationsMap = new Map()
    messages.forEach((msg) => {
      if (!conversationsMap.has(msg.conversationId)) {
        conversationsMap.set(msg.conversationId, msg)
      }
    })

    const conversations = Array.from(conversationsMap.values())

    res.json({ conversations })
  } catch (error) {
    console.error("[User Messages] Get conversations error:", error)
    res.status(500).json({ error: error.message })
  }
})

router.get("/conversation/:conversationId", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id
    const { conversationId } = req.params

    const messages = await UserMessage.find({
      conversationId,
      $or: [{ senderId: userId }, { receiverId: userId }],
    })
      .populate("senderId", "firstName lastName email profileImage")
      .populate("receiverId", "firstName lastName email profileImage")
      .sort({ createdAt: 1 })

    // Mark messages as read where user is receiver
    await UserMessage.updateMany(
      {
        conversationId,
        receiverId: userId,
        isRead: false,
      },
      { isRead: true },
    )

    res.json({ messages })
  } catch (error) {
    console.error("[User Messages] Get conversation error:", error)
    res.status(500).json({ error: error.message })
  }
})

router.post("/send", authenticateToken, async (req, res) => {
  try {
    const senderId = req.user.id
    const { receiverId, subject, message } = req.body

    if (!receiverId || !message) {
      return res.status(400).json({ error: "Receiver and message are required" })
    }

    // Check if receiver exists
    const receiver = await User.findById(receiverId)
    if (!receiver) {
      return res.status(404).json({ error: "Receiver not found" })
    }

    // Generate conversation ID (sorted IDs to ensure consistency)
    const conversationId = [senderId, receiverId].sort().join("-")

    const newMessage = new UserMessage({
      conversationId,
      senderId,
      receiverId,
      subject: subject || "New Message",
      message,
    })

    await newMessage.save()

    const populatedMessage = await UserMessage.findById(newMessage._id)
      .populate("senderId", "firstName lastName email profileImage")
      .populate("receiverId", "firstName lastName email profileImage")

    res.status(201).json({
      message: "Message sent successfully",
      data: populatedMessage,
    })
  } catch (error) {
    console.error("[User Messages] Send message error:", error)
    res.status(500).json({ error: error.message })
  }
})

router.post("/reply", authenticateToken, async (req, res) => {
  try {
    const senderId = req.user.id
    const { receiverId, conversationId, message, parentMessageId } = req.body

    if (!receiverId || !conversationId || !message) {
      return res.status(400).json({ error: "Receiver, conversation ID, and message are required" })
    }

    const newMessage = new UserMessage({
      conversationId,
      senderId,
      receiverId,
      subject: "Re: Message",
      message,
      parentMessageId: parentMessageId || null,
    })

    await newMessage.save()

    const populatedMessage = await UserMessage.findById(newMessage._id)
      .populate("senderId", "firstName lastName email profileImage")
      .populate("receiverId", "firstName lastName email profileImage")

    res.status(201).json({
      message: "Reply sent successfully",
      data: populatedMessage,
    })
  } catch (error) {
    console.error("[User Messages] Reply error:", error)
    res.status(500).json({ error: error.message })
  }
})

router.get("/unread-count", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id

    const unreadCount = await UserMessage.countDocuments({
      receiverId: userId,
      isRead: false,
    })

    res.json({ unreadCount })
  } catch (error) {
    console.error("[User Messages] Unread count error:", error)
    res.status(500).json({ error: error.message })
  }
})

router.put("/conversation/:conversationId/read", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id
    const { conversationId } = req.params

    await UserMessage.updateMany(
      {
        conversationId,
        receiverId: userId,
        isRead: false,
      },
      { isRead: true },
    )

    res.json({ message: "Conversation marked as read" })
  } catch (error) {
    console.error("[User Messages] Mark as read error:", error)
    res.status(500).json({ error: error.message })
  }
})

export default router
