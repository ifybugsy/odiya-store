import mongoose from "mongoose"

const vendorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  storeName: {
    type: String,
    required: true,
  },
  storeDescription: String,
  storeImage: String,
  storeTheme: {
    primaryColor: {
      type: String,
      default: "#FF6B35",
    },
    secondaryColor: {
      type: String,
      default: "#004E89",
    },
  },
  storeBanner: String,
  storeLogo: String,
  idCard: String,
  catalogImages: {
    type: [String],
    default: [],
    validate: {
      validator: (v) => v.length <= 3,
      message: "Maximum 3 catalog images allowed",
    },
  },
  socialLinks: {
    website: String,
    instagram: String,
    facebook: String,
    twitter: String,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "suspended", "rejected"],
    default: "pending",
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verifiedAt: Date,
  isPromoted: {
    type: Boolean,
    default: false,
  },
  promotedAt: Date,
  promotedUntil: Date,
  isApproved: {
    type: Boolean,
    default: false,
  },
  approvedBy: mongoose.Schema.Types.ObjectId,
  approvedAt: Date,
  ratings: {
    type: Number,
    default: 0,
  },
  ratingCount: {
    type: Number,
    default: 0,
  },
  reviewCount: {
    type: Number,
    default: 0,
  },
  totalSales: {
    type: Number,
    default: 0,
  },
  totalRevenue: {
    type: Number,
    default: 0,
  },
  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  followers_count: {
    type: Number,
    default: 0,
  },
  banner_image: String,
  store_policies: String,
  return_policy: String,
  shipping_policy: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  phoneNumber: String,
  location: String,
  email: String,

  // Subscription status tracking for feature unlocking and automatic monthly renewal management
  subscriptionStatus: {
    type: String,
    enum: ["inactive", "active", "expired", "pending"],
    default: "inactive",
  },
  lastSubscriptionDate: {
    type: Date,
    default: null,
  },
  subscriptionExpiryDate: {
    type: Date,
    default: null,
  },
})

vendorSchema.index({ userId: 1 })
vendorSchema.index({ status: 1 })
vendorSchema.index({ createdAt: -1 })

export default mongoose.model("Vendor", vendorSchema)
