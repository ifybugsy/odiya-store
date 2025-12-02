import mongoose from "mongoose"

const subscriptionSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
    required: true,
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  planName: {
    type: String,
    default: "Monthly Vendor Plan",
  },
  amount: {
    type: Number,
    default: 2000, // ₦2000
  },
  currency: {
    type: String,
    default: "NGN",
  },
  status: {
    type: String,
    enum: ["active", "expired", "suspended", "cancelled"],
    default: "active",
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  renewalDate: {
    type: Date,
    required: true,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  lastPaymentDate: {
    type: Date,
    default: Date.now,
  },
  lastPaymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payment",
  },
  reminderSent: {
    sevenDays: {
      type: Boolean,
      default: false,
    },
    threeDays: {
      type: Boolean,
      default: false,
    },
    oneDay: {
      type: Boolean,
      default: false,
    },
    expired: {
      type: Boolean,
      default: false,
    },
  },
  promotionRemovalWarningsSent: {
    type: Number,
    default: 0,
  },
  autoRenew: {
    type: Boolean,
    default: false,
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

// Index for finding subscriptions by status and expiry date
subscriptionSchema.index({ status: 1, expiryDate: 1 })
subscriptionSchema.index({ vendorId: 1 })
subscriptionSchema.index({ userId: 1 })

export default mongoose.model("Subscription", subscriptionSchema)
