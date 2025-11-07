import mongoose from "mongoose"

const recommendationCacheSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
      unique: true,
    },
    recommendations: [
      {
        productId: mongoose.Schema.Types.ObjectId,
        score: Number,
        reason: String,
      },
    ],
    cachedAt: {
      type: Date,
      default: Date.now,
      expires: 3600, // Auto-delete after 1 hour
    },
  },
  { timestamps: true },
)

export default mongoose.model("RecommendationCache", recommendationCacheSchema)
