import mongoose, { Schema, type Document } from "mongoose"

export interface IWishlist extends Document {
  userId: mongoose.Types.ObjectId
  itemId: mongoose.Types.ObjectId
  addedAt: Date
}

const WishlistSchema = new Schema<IWishlist>(
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
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
)

// Index for faster queries
WishlistSchema.index({ userId: 1, itemId: 1 }, { unique: true })
WishlistSchema.index({ userId: 1, addedAt: -1 })

export default mongoose.models.Wishlist || mongoose.model<IWishlist>("Wishlist", WishlistSchema)
