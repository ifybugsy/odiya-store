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
import uploadRoutes from "./routes/upload.js"
import riderRoutes from "./routes/riders.js"
import { authenticateToken } from "./middleware/auth.js"

dotenv.config()

const app = express()

const isDevelopment = process.env.NODE_ENV === "development" || process.env.DEVELOPMENT_MODE === "true"

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://odiya-store.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean)

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true)

      if (isDevelopment) {
        console.warn("[DEV-MODE] CORS bypass enabled - all origins allowed (TESTING ONLY)")
        return callback(null, true)
      }

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
    maxAge: 86400,
  }),
)
app.use(express.json())
app.use(express.urlencoded({ limit: "50mb", extended: true }))

app.use("/uploads", express.static("uploads"))

mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/odiya-store")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/items", itemRoutes)
app.use("/api/rider", riderRoutes)
app.use("/api/admin", authenticateToken, adminRoutes)
app.use("/api/users", authenticateToken, userRoutes)
app.use("/api/payments", paymentRoutes)
app.use("/api/messages", messageRoutes)
app.use("/api/upload", uploadRoutes)

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Odiya Store API is running" })
})

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
