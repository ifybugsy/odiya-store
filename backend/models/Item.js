import mongoose from "mongoose"

const itemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  category: {
    type: String,
    required: true,
    enum: [
      "Cars",
      "Phones",
      "Electronics",
      "Furniture",
      "Clothing",
      "Books",
      "Sports",
      "Real Estate",
      "Jobs",
      "Services",
    ],
  },
  price: {
    type: Number,
    required: true,
  },
  images: [String], // Array of image URLs
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  location: String,
  condition: {
    type: String,
    enum: ["New", "Like New", "Good", "Fair", "Foreign Used"],
    default: "Good",
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "sold"],
    default: "pending",
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  approvedBy: mongoose.Schema.Types.ObjectId,
  views: {
    type: Number,
    default: 0,
  },
  isSold: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.model("Item", itemSchema)
