import mongoose from "mongoose"

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ["upload_fee", "purchase"],
    default: "upload_fee",
  },
  status: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending",
  },
  reference: String,
  paymentMethod: String,
  description: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.model("Payment", paymentSchema)
