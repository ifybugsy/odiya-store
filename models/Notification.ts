import mongoose, { Schema, type Document } from "mongoose"

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId
  type: "order" | "delivery" | "payment" | "system" | "recommendation"
  title: string
  message: string
  orderId?: mongoose.Types.ObjectId
  deliveryId?: mongoose.Types.ObjectId
  read: boolean
  actionUrl?: string
  createdAt: Date
  readAt?: Date
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["order", "delivery", "payment", "system", "recommendation"],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
    },
    deliveryId: {
      type: Schema.Types.ObjectId,
      ref: "Delivery",
    },
    read: {
      type: Boolean,
      default: false,
    },
    actionUrl: String,
    readAt: Date,
  },
  { timestamps: true },
)

NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 })
NotificationSchema.index({ userId: 1, createdAt: -1 })

export default mongoose.models.Notification || mongoose.model<INotification>("Notification", NotificationSchema)
