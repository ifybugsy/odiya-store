import express from "express"
import AdminRole from "../models/AdminRole.js"
import User from "../models/User.js"
import { authenticateToken, isAdmin } from "../middleware/auth.js"
import { isSuperAdmin } from "../middleware/adminPermissions.js"

const router = express.Router()

// Initialize default roles (run once)
router.post("/init", async (req, res) => {
  try {
    const existingRoles = await AdminRole.find()
    if (existingRoles.length > 0) {
      return res.json({ message: "Roles already initialized" })
    }

    const defaultRoles = [
      {
        roleName: "super_admin",
        description: "Super Administrator - Full system access",
        permissions: {
          manageUsers: true,
          viewUsers: true,
          suspendUsers: true,
          deleteUsers: true,
          manageVendors: true,
          approveVendors: true,
          rejectVendors: true,
          suspendVendors: true,
          promoteVendors: true,
          manageItems: true,
          approveItems: true,
          rejectItems: true,
          bulkApproveItems: true,
          deleteItems: true,
          manageSellers: true,
          approveSellers: true,
          rejectSellers: true,
          suspendSellers: true,
          createAdmin: true,
          manageAdmins: true,
          viewAdminLogs: true,
          manageSubscriptions: true,
          viewSubscriptionAnalytics: true,
          sendSubscriptionReminders: true,
          viewAnalytics: true,
          viewReports: true,
          manageSettings: true,
        },
      },
      {
        roleName: "admin",
        description: "General Administrator",
        permissions: {
          manageUsers: true,
          viewUsers: true,
          suspendUsers: true,
          manageVendors: true,
          approveVendors: true,
          rejectVendors: true,
          suspendVendors: true,
          manageItems: true,
          approveItems: true,
          rejectItems: true,
          bulkApproveItems: true,
          deleteItems: true,
          manageSellers: true,
          approveSellers: true,
          rejectSellers: true,
          viewAnalytics: true,
          viewReports: true,
        },
      },
      {
        roleName: "vendor_manager",
        description: "Vendor Manager - Manages vendors and their subscriptions",
        permissions: {
          viewUsers: true,
          manageVendors: true,
          approveVendors: true,
          rejectVendors: true,
          suspendVendors: true,
          promoteVendors: true,
          manageSubscriptions: true,
          viewSubscriptionAnalytics: true,
          sendSubscriptionReminders: true,
          viewAnalytics: true,
        },
      },
      {
        roleName: "seller_manager",
        description: "Seller Manager - Manages items and sellers",
        permissions: {
          viewUsers: true,
          manageItems: true,
          approveItems: true,
          rejectItems: true,
          bulkApproveItems: true,
          deleteItems: true,
          manageSellers: true,
          approveSellers: true,
          rejectSellers: true,
          suspendSellers: true,
          viewAnalytics: true,
        },
      },
      {
        roleName: "support_admin",
        description: "Support Admin - Limited access for support staff",
        permissions: {
          viewUsers: true,
          viewAnalytics: true,
          viewReports: true,
        },
      },
    ]

    await AdminRole.insertMany(defaultRoles)
    res.json({ message: "Default roles initialized", roles: defaultRoles })
  } catch (error) {
    console.error("[v0] Failed to initialize roles:", error)
    res.status(500).json({ error: error.message })
  }
})

// Get all roles
router.get("/", authenticateToken, isAdmin, async (req, res) => {
  try {
    const roles = await AdminRole.find()
    res.json(roles)
  } catch (error) {
    console.error("[v0] Failed to get roles:", error)
    res.status(500).json({ error: error.message })
  }
})

// Get role by ID
router.get("/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    const role = await AdminRole.findById(req.params.id)
    if (!role) return res.status(404).json({ error: "Role not found" })
    res.json(role)
  } catch (error) {
    console.error("[v0] Failed to get role:", error)
    res.status(500).json({ error: error.message })
  }
})

// Create new admin with role
router.post("/create-admin", authenticateToken, isSuperAdmin, async (req, res) => {
  try {
    const { email, firstName, lastName, adminRole } = req.body

    if (!email || !firstName || !lastName || !adminRole) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    // Check if user exists
    let user = await User.findOne({ email: email.toLowerCase() })

    if (!user) {
      // Create new user (will need to set password later)
      user = new User({
        email: email.toLowerCase(),
        firstName,
        lastName,
        phone: "",
        password: "temp", // Should be updated by user
      })
    }

    // Set admin role
    user.isAdmin = true
    user.adminRole = adminRole
    user.adminSince = new Date()

    // Get role permissions
    const roleData = await AdminRole.findOne({ roleName: adminRole })
    if (roleData) {
      user.adminPermissions = roleData._id
    }

    await user.save()

    console.log(`[v0] Admin created: ${email} with role ${adminRole}`)
    res.json({
      message: "Admin created successfully",
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        adminRole: user.adminRole,
        adminSince: user.adminSince,
      },
    })
  } catch (error) {
    console.error("[v0] Failed to create admin:", error)
    res.status(500).json({ error: error.message })
  }
})

export default router
