import express from "express"
import jwt from "jsonwebtoken"
import User from "../models/User.js"

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

export default router
