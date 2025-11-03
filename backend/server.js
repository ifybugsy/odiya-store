import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import bcrypt from "bcryptjs"
import User from "./models/User.js" // <-- Make sure this path is correct
import authRoutes from "./routes/auth.js"
import itemRoutes from "./routes/items.js"
import adminRoutes from "./routes/admin.js"
import userRoutes from "./routes/users.js"
import paymentRoutes from "./routes/payments.js"
import messageRoutes from "./routes/messages.js"
import { authenticateToken } from "./middleware/auth.js"

dotenv.config()

const app = express()

// Define allowed origins for CORS
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://odiya-store.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean) // Remove undefined values

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, curl requests)
      if (!origin) return callback(null, true)

      if (allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        console.warn(`CORS blocked request from origin: ${origin}`)
        callback(new Error("Not allowed by CORS"))
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400, // 24 hours
  }),
)
app.use(express.json())
app.use(express.urlencoded({ limit: "50mb", extended: true }))

// Database Connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/odiya-store")
  .then(async () => {
    console.log("MongoDB connected")

    // ✅ Auto-create admin user if not exists
    try {
      const adminExists = await User.findOne({ email: "admin@odiya.com" })
      if (!adminExists) {
        const hashedPassword = await bcrypt.hash("admin123", 10)
        await User.create({
          name: "Admin",
          email: "admin@odiya.com",
          password: hashedPassword,
          isAdmin: true,
        })
        console.log("✅ Default admin user created: admin@odiya.com / admin123")
      } else {
        console.log("✅ Admin already exists")
      }
    } catch (err) {
      console.error("Error creating admin:", err)
    }
  })
  .catch((err) => console.log("MongoDB connection error:", err))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/items", itemRoutes)
app.use("/api/admin", authenticateToken, adminRoutes)
app.use("/api/users", authenticateToken, userRoutes)
app.use("/api/payments", paymentRoutes)
app.use("/api/messages", authenticateToken, messageRoutes)

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Odiya Store API is running" })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
    status: err.status || 500,
  })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Odiya Store API running on port ${PORT}`)
  console.log(`Allowed CORS origins: ${allowedOrigins.join(", ")}`)
})

export default app
