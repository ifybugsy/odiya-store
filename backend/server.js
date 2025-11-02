import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.js"
import itemRoutes from "./routes/items.js"
import adminRoutes from "./routes/admin.js"
import userRoutes from "./routes/users.js"
import paymentRoutes from "./routes/payments.js"
import messageRoutes from "./routes/messages.js"
import { authenticateToken } from "./middleware/auth.js"

dotenv.config()

const app = express()

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
)
app.use(express.json())
app.use(express.urlencoded({ limit: "50mb", extended: true }))

// Database Connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/odiya-store")
  .then(() => console.log("MongoDB connected"))
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
})

export default app
