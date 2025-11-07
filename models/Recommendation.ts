import mongoose, { Schema, type Document } from "mongoose"

export interface IRecommendation extends Document {
  userId: mongoose.Types.ObjectId
  itemId: mongoose.Types.ObjectId
  score: number
  reason: "category_match" | "rating" | "price_range" | "trending" | "similar_to_wishlist"
  viewed: boolean
  createdAt: Date
}

const RecommendationSchema = new Schema<IRecommendation>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    itemId: {
      type: Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    reason: {
      type: String,
      enum: ["category_match", "rating", "price_range", "trending", "similar_to_wishlist"],
      default: "category_match",
    },
    viewed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

RecommendationSchema.index({ userId: 1, score: -1 })
RecommendationSchema.index({ userId: 1, createdAt: -1 })
RecommendationSchema.index({ itemId: 1 })

export default mongoose.models.Recommendation || mongoose.model<IRecommendation>("Recommendation", RecommendationSchema)
