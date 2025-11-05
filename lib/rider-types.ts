// Rider-specific TypeScript types and interfaces

export interface RiderUser {
  id: string
  email: string
  phone: string
  fullName: string
  vehicleType: "motorcycle" | "car" | "bicycle" | "truck"
  licensePlate?: string
  status: "pending" | "active" | "suspended" | "inactive"
  verificationStatus: "pending" | "verified" | "rejected"
  averageRating: number
  totalDeliveries: number
  bankAccountVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface RiderDocument {
  id: string
  riderId: string
  documentType: "license" | "insurance" | "vehicle_registration" | "id_proof"
  documentUrl: string
  expiryDate?: string
  verificationStatus: "pending" | "verified" | "rejected"
  rejectionReason?: string
  uploadedAt: string
  verifiedAt?: string
}

export interface RiderDelivery {
  id: string
  riderId: string
  orderId: string
  pickupLocation: string
  deliveryLocation: string
  status: "pending" | "accepted" | "picked_up" | "in_transit" | "delivered" | "failed"
  assignedAt?: string
  pickedUpAt?: string
  deliveredAt?: string
  deliveryFee: number
  distanceKm?: number
  estimatedTimeMinutes?: number
  actualTimeMinutes?: number
  paymentStatus: "pending" | "completed" | "failed"
  rating?: number
  feedback?: string
  createdAt: string
  updatedAt: string
}

export interface RiderRating {
  id: string
  riderId: string
  deliveryId: string
  customerId: string
  rating: number
  feedback?: string
  createdAt: string
}

export interface RiderEarnings {
  id: string
  riderId: string
  deliveryId: string
  grossAmount: number
  commissionPercentage: number
  commissionAmount: number
  netAmount: number
  paymentDate?: string
  paymentMethod: "bank_transfer" | "wallet"
  paymentStatus: "pending" | "completed" | "failed"
  createdAt: string
}

export interface RiderRegistrationData {
  email: string
  password: string
  fullName: string
  phone: string
  vehicleType: "motorcycle" | "car" | "bicycle" | "truck"
  licensePlate?: string
}
