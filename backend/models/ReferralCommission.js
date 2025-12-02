import mongoose from "mongoose"

const referralCommissionSchema = new mongoose.Schema({
  referralId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Referral",
    required: true,
    index: true,
  },
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
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payment",
    required: true,
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
  },
  boostType: {
    type: String,
    enum: ["item", "vendor"],
    required: true,
  },
  boostAmount: {
    type: Number,
    required: true,
  },
  commissionAmount: {
    type: Number,
    required: true,
  },
  commissionRate: {
    type: Number,
    default: 0.1,
  },
  status: {
    type: String,
    enum: ["pending", "paid", "cancelled"],
    default: "pending",
  },
  paidAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

referralCommissionSchema.index({ referrerId: 1, createdAt: -1 })
referralCommissionSchema.index({ referredUserId: 1 })
referralCommissionSchema.index({ paymentId: 1 })
referralCommissionSchema.index({ status: 1, referrerId: 1 })

export default mongoose.model("ReferralCommission", referralCommissionSchema)
