import mongoose from "mongoose"

const vendorMessageSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
    required: true,
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  conversationId: {
    type: String,
    required: true,
    index: true,
  },
  subject: String,
  message: {
    type: String,
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  sender: {
    type: String,
    enum: ["vendor", "buyer"],
    required: true,
  },
  attachments: [String],
  parentMessageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "VendorMessage",
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

vendorMessageSchema.index({ vendorId: 1, buyerId: 1, conversationId: 1 })
vendorMessageSchema.index({ conversationId: 1, createdAt: -1 })
vendorMessageSchema.index({ createdAt: -1 })
vendorMessageSchema.index({ isRead: 1, vendorId: 1 })

export default mongoose.model("VendorMessage", vendorMessageSchema)
