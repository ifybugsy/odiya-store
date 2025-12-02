import mongoose from "mongoose"

const adminRoleSchema = new mongoose.Schema({
  roleName: {
    type: String,
    enum: ["super_admin", "admin", "vendor_manager", "seller_manager", "support_admin"],
    required: true,
  },
  description: String,
  permissions: {
    // User Management
    manageUsers: { type: Boolean, default: false },
    viewUsers: { type: Boolean, default: false },
    suspendUsers: { type: Boolean, default: false },
    deleteUsers: { type: Boolean, default: false },

    // Vendor Management
    manageVendors: { type: Boolean, default: false },
    approveVendors: { type: Boolean, default: false },
    rejectVendors: { type: Boolean, default: false },
    suspendVendors: { type: Boolean, default: false },
    promoteVendors: { type: Boolean, default: false },

    // Item Management
    manageItems: { type: Boolean, default: false },
    approveItems: { type: Boolean, default: false },
    rejectItems: { type: Boolean, default: false },
    bulkApproveItems: { type: Boolean, default: false },
    deleteItems: { type: Boolean, default: false },

    // Seller Management
    manageSellers: { type: Boolean, default: false },
    approveSellers: { type: Boolean, default: false },
    rejectSellers: { type: Boolean, default: false },
    suspendSellers: { type: Boolean, default: false },

    // Admin Management
    createAdmin: { type: Boolean, default: false },
    manageAdmins: { type: Boolean, default: false },
    viewAdminLogs: { type: Boolean, default: false },

    // Subscription Management
    manageSubscriptions: { type: Boolean, default: false },
    viewSubscriptionAnalytics: { type: Boolean, default: false },
    sendSubscriptionReminders: { type: Boolean, default: false },

    // System Management
    viewAnalytics: { type: Boolean, default: false },
    viewReports: { type: Boolean, default: false },
    manageSettings: { type: Boolean, default: false },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.model("AdminRole", adminRoleSchema)
