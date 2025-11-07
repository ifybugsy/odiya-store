import mongoose from "mongoose"

const userInteractionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    interactionType: {
      type: String,
      enum: ["view", "click", "purchase", "wishlist", "compare", "review"],
      required: true,
    },
    category: String,
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    price: Number,
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
)

// Index for efficient queries
userInteractionSchema.index({ userId: 1, timestamp: -1 })
userInteractionSchema.index({ productId: 1 })
userInteractionSchema.index({ interactionType: 1 })

export default mongoose.model("UserInteraction", userInteractionSchema)
