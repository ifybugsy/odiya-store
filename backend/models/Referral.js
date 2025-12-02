import mongoose from "mongoose"

const referralSchema = new mongoose.Schema({
  referrerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  referredUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  referralCode: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  status: {
    type: String,
    enum: ["pending", "active", "inactive"],
    default: "active",
  },
  totalEarnings: {
    type: Number,
    default: 0,
  },
  commissionRate: {
    type: Number,
    default: 0.1, // 10%
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

referralSchema.index({ referrerId: 1, createdAt: -1 })
referralSchema.index({ referredUserId: 1 })
referralSchema.index({ referralCode: 1 })

export default mongoose.model("Referral", referralSchema)
