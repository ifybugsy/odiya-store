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
      "Electronics",
      "Phones",
      "Laptops",
      "Computers",
      "Cars",
      "Car Parts",
      "Motorcycles",
      "Furniture",
      "Clothing",
      "Hair Accessories",
      "Fashion Accessories",
      "Books",
      "Sports",
      "Sports Equipment",
      "Real Estate",
      "Services",
      "Food & Beverages",
      "Home & Garden",
      "Toys & Games",
      "Beauty & Personal Care",
      "Health & Wellness",
      "Pet Supplies",
      "Jewelry",
      "Collectibles",
      "Other",
    ],
  },
  price: {
    type: Number,
    required: true,
  },
  images: [String],
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  location: String,
  condition: {
    type: String,
    enum: ["New", "Like New", "Good", "Fair"],
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
