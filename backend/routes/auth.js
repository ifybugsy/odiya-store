import express from "express"
import jwt from "jsonwebtoken"
import User from "../models/User.js"
import Vendor from "../models/Vendor.js"
import { authenticateToken } from "../middleware/auth.js"

const router = express.Router()

// Register
router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body

    if (!firstName || !lastName || !email || !phone || !password) {
      return res.status(400).json({ error: "All fields are required" })
    }

    const normalizedEmail = email.toLowerCase().trim()

    const existingUser = await User.findOne({ email: normalizedEmail })
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" })
    }

    const user = new User({
      firstName,
      lastName,
      email: normalizedEmail,
      phone,
      password,
      // Password will be automatically hashed by the pre-save middleware
    })

    await user.save()

    const token = jwt.sign(
      { id: user._id, email: user.email, isSeller: user.isSeller, isAdmin: user.isAdmin },
      process.env.JWT_SECRET || "your_jwt_secret_key",
      { expiresIn: "7d" },
    )

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isSeller: user.isSeller,
        isAdmin: user.isAdmin,
      },
    })
  } catch (error) {
    console.error("[v0] Register error:", error.message)
    res.status(500).json({ error: error.message })
  }
})

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" })
    }

    const normalizedEmail = email.toLowerCase().trim()
    const isDevelopmentMode = process.env.DEVELOPMENT_MODE === "true"

    console.log(`[v0] Login attempt for: ${normalizedEmail} | DevMode: ${isDevelopmentMode}`)

    let user = await User.findOne({ email: normalizedEmail })

    if (isDevelopmentMode && !user && normalizedEmail === "admin@test.com") {
      console.log("[v0] [DEV-MODE] Creating temporary admin user for testing")
      user = new User({
        firstName: "Admin",
        lastName: "Test",
        email: normalizedEmail,
        phone: "0000000000",
        password: "test123",
        isAdmin: true,
        isSeller: false,
      })
      await user.save()
    }

    if (!user) {
      console.warn(`[v0] Login failed: User not found - ${normalizedEmail}`)
      return res.status(401).json({
        error: "Invalid email or password",
        debug:
          process.env.NODE_ENV === "development"
            ? `User account not found. In dev mode, try admin@test.com / test123`
            : undefined,
      })
    }

    if (user.isSuspended) {
      console.warn(`[v0] Login blocked: Account suspended - ${normalizedEmail}`)
      return res.status(403).json({ error: "Your account has been suspended. Contact support." })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      console.warn(`[v0] Login failed: Invalid password for - ${normalizedEmail}`)
      return res.status(401).json({
        error: "Invalid email or password",
        debug: process.env.NODE_ENV === "development" ? "Password verification failed" : undefined,
      })
    }

    console.log(`[v0] Login successful: ${normalizedEmail} | isAdmin: ${user.isAdmin} | isSeller: ${user.isSeller}`)
    console.log(`[v0] JWT will contain: isSeller=${user.isSeller}`)

    const token = jwt.sign(
      { id: user._id, email: user.email, isSeller: user.isSeller, isAdmin: user.isAdmin },
      process.env.JWT_SECRET || "your_jwt_secret_key",
      { expiresIn: "7d" },
    )

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isSeller: user.isSeller,
        isAdmin: user.isAdmin,
      },
    })
  } catch (error) {
    console.error("[v0] Login exception:", error.message, error.stack)
    res.status(500).json({
      error: "Server error during login",
      debug: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
})

// Vendor Register
router.post("/vendor/register", async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, idCard, businessName, businessDescription } = req.body

    if (!firstName || !lastName || !email || !phone || !password) {
      return res.status(400).json({ error: "All fields are required" })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Check if email already exists in User table
    const existingUser = await User.findOne({ email: normalizedEmail })
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" })
    }

    // Create user account for vendor
    const user = new User({
      firstName,
      lastName,
      email: normalizedEmail,
      phone,
      password,
      isSeller: false,
      isAdmin: false,
    })

    await user.save()

    const vendor = new Vendor({
      userId: user._id,
      storeName: businessName || `${firstName} ${lastName}'s Store`,
      storeDescription: businessDescription,
      idCard,
      status: "pending",
    })

    await vendor.save()

    const token = jwt.sign(
      { id: vendor._id, email: user.email, vendorId: vendor._id },
      process.env.JWT_SECRET || "your_jwt_secret_key",
      { expiresIn: "7d" },
    )

    console.log(`[v0] Vendor registered with ID card: ${normalizedEmail}`)

    res.status(201).json({
      message: "Vendor account created. ID card submitted for verification.",
      token,
      vendor: {
        id: vendor._id,
        storeName: vendor.storeName,
        email: user.email,
        status: vendor.status,
        idCard: !!vendor.idCard,
      },
    })
  } catch (error) {
    console.error("[v0] Vendor register error:", error.message)
    res.status(500).json({ error: error.message })
  }
})

// Vendor Login
router.post("/vendor/login", async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" })
    }

    const normalizedEmail = email.toLowerCase().trim()

    console.log(`[v0] Vendor login attempt: ${normalizedEmail}`)

    // Find user by email
    const user = await User.findOne({ email: normalizedEmail })
    if (!user) {
      console.warn(`[v0] Vendor login failed: User not found - ${normalizedEmail}`)
      return res.status(401).json({ error: "Invalid email or password" })
    }

    // Check if user has vendor profile
    const vendor = await Vendor.findOne({ userId: user._id })
    if (!vendor) {
      console.warn(`[v0] Vendor login failed: No vendor profile - ${normalizedEmail}`)
      return res.status(401).json({ error: "No vendor profile found for this account" })
    }

    // Verify password
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      console.warn(`[v0] Vendor login failed: Invalid password - ${normalizedEmail}`)
      return res.status(401).json({ error: "Invalid email or password" })
    }

    // Check vendor status
    if (vendor.status === "suspended") {
      console.warn(`[v0] Vendor login blocked: Account suspended - ${normalizedEmail}`)
      return res.status(403).json({ error: "Your vendor account has been suspended. Contact support." })
    }

    if (vendor.status === "rejected") {
      console.warn(`[v0] Vendor login blocked: Application rejected - ${normalizedEmail}`)
      return res.status(403).json({ error: "Your vendor application was rejected. Contact support." })
    }

    console.log(`[v0] Vendor login successful: ${normalizedEmail} | Status: ${vendor.status}`)

    const token = jwt.sign(
      { id: user._id, email: user.email, vendorId: vendor._id },
      process.env.JWT_SECRET || "your_jwt_secret_key",
      { expiresIn: "7d" },
    )

    res.json({
      message: "Vendor login successful",
      token,
      vendor: {
        id: vendor._id,
        userId: user._id,
        storeName: vendor.storeName,
        email: user.email,
        phone: user.phone,
        status: vendor.status,
        isApproved: vendor.status === "approved",
        followers_count: vendor.followers_count || 0,
      },
    })
  } catch (error) {
    console.error("[v0] Vendor login error:", error.message)
    res.status(500).json({ error: error.message })
  }
})

// Token Refresh
router.post("/refresh-token", authenticateToken, async (req, res) => {
  try {
    // Fetch fresh user data from database
    const user = await User.findById(req.user.id).select("-password")

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    // Check if this is a vendor
    const vendor = await Vendor.findOne({ userId: user._id })

    // Generate new JWT with current user data
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        isSeller: user.isSeller,
        isAdmin: user.isAdmin,
        vendorId: vendor?._id || null,
      },
      process.env.JWT_SECRET || "your_jwt_secret_key",
      { expiresIn: "7d" },
    )

    console.log(`[v0] Token refreshed for: ${user.email}`)

    res.json({
      message: "Token refreshed successfully",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isSeller: user.isSeller,
        isAdmin: user.isAdmin,
        isVendor: !!vendor,
      },
      vendor: vendor
        ? {
            id: vendor._id,
            storeName: vendor.storeName,
            status: vendor.status,
          }
        : null,
    })
  } catch (error) {
    console.error("[v0] Token refresh error:", error.message)
    res.status(500).json({ error: error.message })
  }
})

export default router
