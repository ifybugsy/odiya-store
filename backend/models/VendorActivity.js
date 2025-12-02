import mongoose from "mongoose"

const vendorActivitySchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
    required: true,
    index: true,
  },
  activityType: {
    type: String,
    enum: [
      "product_added",
      "product_updated",
      "product_deleted",
      "order_received",
      "order_fulfilled",
      "order_cancelled",
      "payout_requested",
      "profile_updated",
      "status_changed",
      "login",
      "suspicious_activity",
    ],
    required: true,
    index: true,
  },
  description: {
    type: String,
    required: true,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  ipAddress: String,
  userAgent: String,
  severity: {
    type: String,
    enum: ["low", "medium", "high", "critical"],
    default: "low",
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
})

vendorActivitySchema.index({ vendorId: 1, timestamp: -1 })
vendorActivitySchema.index({ activityType: 1, timestamp: -1 })
vendorActivitySchema.index({ severity: 1, timestamp: -1 })

export default mongoose.model("VendorActivity", vendorActivitySchema)
