import mongoose, { Schema, type Document } from "mongoose"

export interface IOrder extends Document {
  buyerId: mongoose.Types.ObjectId
  sellerId: mongoose.Types.ObjectId
  items: Array<{
    productId: mongoose.Types.ObjectId
    quantity: number
    price: number
  }>
  totalAmount: number
  status: "pending" | "confirmed" | "processing" | "ready_for_delivery" | "in_transit" | "delivered" | "cancelled"
  shippingAddress: {
    street: string
    city: string
    state: string
    zipCode: string
    phone: string
  }
  paymentMethod: string
  paymentStatus: "pending" | "completed" | "failed"
  riderId?: mongoose.Types.ObjectId
  deliveryStartedAt?: Date
  deliveredAt?: Date
  createdAt: Date
  updatedAt: Date
}

const OrderSchema = new Schema<IOrder>(
  {
    buyerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Item",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "processing", "ready_for_delivery", "in_transit", "delivered", "cancelled"],
      default: "pending",
    },
    shippingAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      phone: String,
    },
    paymentMethod: String,
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    riderId: {
      type: Schema.Types.ObjectId,
      ref: "Rider",
    },
    deliveryStartedAt: Date,
    deliveredAt: Date,
  },
  { timestamps: true },
)

// Index for faster queries
OrderSchema.index({ buyerId: 1, createdAt: -1 })
OrderSchema.index({ sellerId: 1, createdAt: -1 })
OrderSchema.index({ riderId: 1, status: 1 })
OrderSchema.index({ status: 1 })

export default mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema)
