import mongoose from "mongoose"

const userMessageSchema = new mongoose.Schema({
  conversationId: {
    type: String,
    required: true,
    index: true,
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  parentMessageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserMessage",
    default: null,
  },
  attachments: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

userMessageSchema.index({ senderId: 1, receiverId: 1, conversationId: 1 })
userMessageSchema.index({ conversationId: 1, createdAt: -1 })
userMessageSchema.index({ createdAt: -1 })
userMessageSchema.index({ isRead: 1, receiverId: 1 })

export default mongoose.model("UserMessage", userMessageSchema)
