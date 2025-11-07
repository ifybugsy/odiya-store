import mongoose, { Schema, type Document } from "mongoose"

export interface IRealTimeEvent extends Document {
  eventType: "order_status" | "delivery_update" | "location_update" | "notification" | "rating"
  entityId: mongoose.Types.ObjectId
  entityType: "Order" | "Delivery" | "User"
  userId?: mongoose.Types.ObjectId
  data: Record<string, any>
  processed: boolean
  createdAt: Date
}

const RealTimeEventSchema = new Schema<IRealTimeEvent>(
  {
    eventType: {
      type: String,
      enum: ["order_status", "delivery_update", "location_update", "notification", "rating"],
      required: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    entityType: {
      type: String,
      enum: ["Order", "Delivery", "User"],
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    data: {
      type: Schema.Types.Mixed,
      default: {},
    },
    processed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

// TTL index to auto-delete old events after 30 days
RealTimeEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 })
RealTimeEventSchema.index({ processed: 1, eventType: 1 })

export default mongoose.models.RealTimeEvent || mongoose.model<IRealTimeEvent>("RealTimeEvent", RealTimeEventSchema)
