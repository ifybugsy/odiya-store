import mongoose, { Schema, type Document } from "mongoose"

export interface IDelivery extends Document {
  orderId: mongoose.Types.ObjectId
  riderId: mongoose.Types.ObjectId
  pickupLocation: {
    latitude: number
    longitude: number
    address: string
  }
  deliveryLocation: {
    latitude: number
    longitude: number
    address: string
  }
  status: "assigned" | "picked_up" | "in_transit" | "delivered" | "failed"
  currentLocation?: {
    latitude: number
    longitude: number
    timestamp: Date
  }
  estimatedDeliveryTime?: Date
  actualDeliveryTime?: Date
  rating?: number
  feedback?: string
  createdAt: Date
  updatedAt: Date
}

const DeliverySchema = new Schema<IDelivery>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    riderId: {
      type: Schema.Types.ObjectId,
      ref: "Rider",
      required: true,
    },
    pickupLocation: {
      latitude: Number,
      longitude: Number,
      address: String,
    },
    deliveryLocation: {
      latitude: Number,
      longitude: Number,
      address: String,
    },
    status: {
      type: String,
      enum: ["assigned", "picked_up", "in_transit", "delivered", "failed"],
      default: "assigned",
    },
    currentLocation: {
      latitude: Number,
      longitude: Number,
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
    estimatedDeliveryTime: Date,
    actualDeliveryTime: Date,
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    feedback: String,
  },
  { timestamps: true },
)

DeliverySchema.index({ riderId: 1, status: 1 })
DeliverySchema.index({ orderId: 1 })
DeliverySchema.index({ status: 1 })

export default mongoose.models.Delivery || mongoose.model<IDelivery>("Delivery", DeliverySchema)
