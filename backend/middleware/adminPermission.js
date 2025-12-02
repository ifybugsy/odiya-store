// Check specific admin permissions based on role
export const checkPermission = (permission) => {
  return async (req, res, next) => {
    try {
      if (!req.user?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" })
      }

      // Super admin has all permissions
      if (req.user?.adminRole === "super_admin") {
        return next()
      }

      const AdminRole = (await import("../models/AdminRole.js")).default
      const roleData = await AdminRole.findOne({ roleName: req.user.adminRole })

      if (!roleData) {
        return res.status(403).json({ error: "Role not found" })
      }

      // Check if role has specific permission
      if (!roleData.permissions[permission]) {
        return res.status(403).json({
          error: `Permission denied: ${permission} not allowed for ${req.user.adminRole}`,
        })
      }

      next()
    } catch (error) {
      console.error("[v0] Permission check error:", error)
      res.status(500).json({ error: "Permission check failed" })
    }
  }
}

export const isSuperAdmin = (req, res, next) => {
  if (req.user?.adminRole !== "super_admin") {
    return res.status(403).json({ error: "Super admin access required" })
  }
  next()
}
