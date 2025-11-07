import express from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import Rider from "../models/Rider.js"

const router = express.Router()

// Register a new rider
router.post("/register", async (req, res) => {
  try {
    const { email, password, fullName, phone, vehicleType, licensePlate } = req.body

    // Validate required fields
    if (!email || !password || !fullName || !phone) {
      return res.status(400).json({ message: "Missing required fields: email, password, fullName, phone" })
    }

    // Check if rider already exists
    const existingRider = await Rider.findOne({ email: email.toLowerCase() })
    if (existingRider) {
      return res.status(400).json({ message: "Email already registered as a rider" })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create new rider
    const rider = new Rider({
      email: email.toLowerCase(),
      password: hashedPassword,
      fullName,
      phone,
      vehicleType: vehicleType || "motorcycle",
      licensePlate: licensePlate || null,
      verificationStatus: "pending",
      isActive: true,
      createdAt: new Date(),
    })

    await rider.save()

    // Generate token
    const token = jwt.sign(
      { id: rider._id, email: rider.email, role: "rider" },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" },
    )

    // Return rider data without password
    const riderData = {
      id: rider._id,
      email: rider.email,
      fullName: rider.fullName,
      phone: rider.phone,
      vehicleType: rider.vehicleType,
      verificationStatus: rider.verificationStatus,
    }

    res.status(201).json({
      message: "Rider registered successfully",
      token,
      rider: riderData,
    })
  } catch (error) {
    console.error("[v0] Rider registration error:", error)
    res.status(500).json({ message: "Registration failed", error: error.message })
  }
})

export default router
