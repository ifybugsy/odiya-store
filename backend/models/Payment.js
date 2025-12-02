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
    required: false, // Made optional since vendor boosts don't have itemId
  },
  amount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ["upload_fee", "purchase", "boost_seller", "boost_vendor"],
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
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
    required: false,
  },
})

export default mongoose.model("Payment", paymentSchema)
