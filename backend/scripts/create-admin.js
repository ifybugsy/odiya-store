// Run this script once to create an admin user
// Usage: node backend/scripts/create-admin.js

import mongoose from "mongoose"
import bcrypt from "bcryptjs"
import dotenv from "dotenv"

dotenv.config()

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  password: String,
  isSeller: Boolean,
  isAdmin: Boolean,
  isSuspended: Boolean,
  createdAt: { type: Date, default: Date.now },
})

async function createAdmin() {
  try {
    const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/odiya-store"
    await mongoose.connect(mongoURI)

    const User = mongoose.model("User", userSchema)

    const existingAdmin = await User.findOne({ email: "admin@test.com" })
    if (existingAdmin) {
      console.log("Admin already exists!")
      await mongoose.disconnect()
      return
    }

    const hashedPassword = await bcrypt.hash("test123", 10)

    const admin = new User({
      firstName: "Admin",
      lastName: "User",
      email: "admin@test.com",
      phone: "08000000000",
      password: hashedPassword,
      isSeller: false,
      isAdmin: true,
      isSuspended: false,
    })

    await admin.save()
    console.log("Admin user created successfully!")
    console.log("Email: admin@test.com")
    console.log("Password: test123")

    await mongoose.disconnect()
  } catch (error) {
    console.error("Error creating admin:", error)
    await mongoose.disconnect()
  }
}

createAdmin()
