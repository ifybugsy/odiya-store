import mongoose from "mongoose"

const vendorFollowerSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

vendorFollowerSchema.index({ vendorId: 1, userId: 1 }, { unique: true })

export default mongoose.model("VendorFollower", vendorFollowerSchema)




 