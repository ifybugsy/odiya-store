import mongoose, { Schema, type Document } from "mongoose"

export interface IRider extends Document {
  userId: mongoose.Types.ObjectId
  licenseNumber: string
  licenseExpiry: Date
  vehicleType: "bike" | "car" | "van"
  vehicleNumber: string
  insurancePolicyNumber: string
  insuranceExpiry: Date
  bankAccountNumber: string
  bankAccountName: string
  bankName: string
  status: "pending" | "active" | "inactive" | "suspended"
  verificationStatus: "pending" | "verified" | "rejected"
  documents: Array<{
    type: string
    url: string
    uploadedAt: Date
  }>
  totalDeliveries: number
  completedDeliveries: number
  rating: number
  reviews: number
  currentLocation?: {
    latitude: number
    longitude: number
    lastUpdated: Date
  }
  isAvailable: boolean
  createdAt: Date
  updatedAt: Date
}

const RiderSchema = new Schema<IRider>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    licenseNumber: {
      type: String,
      required: true,
    },
    licenseExpiry: Date,
    vehicleType: {
      type: String,
      enum: ["bike", "car", "van"],
      required: true,
    },
    vehicleNumber: String,
    insurancePolicyNumber: String,
    insuranceExpiry: Date,
    bankAccountNumber: String,
    bankAccountName: String,
    bankName: String,
    status: {
      type: String,
      enum: ["pending", "active", "inactive", "suspended"],
      default: "pending",
    },
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    documents: [
      {
        type: String,
        url: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    totalDeliveries: {
      type: Number,
      default: 0,
    },
    completedDeliveries: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviews: {
      type: Number,
      default: 0,
    },
    currentLocation: {
      latitude: Number,
      longitude: Number,
      lastUpdated: Date,
    },
    isAvailable: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

RiderSchema.index({ userId: 1 })
RiderSchema.index({ verificationStatus: 1, status: 1 })
RiderSchema.index({ isAvailable: 1 })

export default mongoose.models.Rider || mongoose.model<IRider>("Rider", RiderSchema)
