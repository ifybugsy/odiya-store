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

    const user = await User.findOne({ email: normalizedEmail })
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" })
    }

    if (user.isSuspended) {
      return res.status(403).json({ error: "Your account has been suspended" })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      console.error(`[v0] Login failed: Password mismatch for ${normalizedEmail}`)
      return res.status(401).json({ error: "Invalid email or password" })
    }

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
    console.error("[v0] Login error:", error.message)
    res.status(500).json({ error: error.message })
  }
})

export default router
