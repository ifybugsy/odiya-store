import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.js"
import itemRoutes from "./routes/items.js"
import adminRoutes from "./routes/admin.js"
import adminVendorRoutes from "./routes/admin-vendors.js"
import userRoutes from "./routes/users.js"
import paymentRoutes from "./routes/payments.js"
import messageRoutes from "./routes/messages.js"
import uploadRoutes from "./routes/upload.js"
import riderRoutes from "./routes/riders.js"
import vendorRoutes from "./routes/vendors.js"
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

app.use(express.json({ limit: "500mb" }))
app.use(express.urlencoded({ limit: "500mb", extended: true }))

app.set("request timeout", 600000)

app.use("/uploads", express.static("uploads"))

let isConnected = false
let connectionAttempts = 0
const MAX_RETRY_ATTEMPTS = 5
const INITIAL_RETRY_DELAY = 2000

// Configure mongoose settings for better connection stability
mongoose.set("strictQuery", false)
mongoose.set("bufferTimeoutMS", 30000) // Increase buffer timeout to 30 seconds

const connectWithRetry = async (retryCount = 0) => {
  try {
    const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/odiya-store"

    console.log(`[MongoDB] Connection attempt ${retryCount + 1}/${MAX_RETRY_ATTEMPTS}...`)

    // Enhanced connection options for stability
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000, // Timeout after 10 seconds instead of 30
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
      maxPoolSize: 10, // Maximum connection pool size
      minPoolSize: 2, // Minimum connection pool size
      retryWrites: true,
      retryReads: true,
    })

    isConnected = true
    connectionAttempts = retryCount + 1
    console.log(`✓ [MongoDB] Successfully connected to database (attempt ${connectionAttempts})`)
    console.log(`✓ [MongoDB] Connection state: ${mongoose.connection.readyState}`)
  } catch (err) {
    isConnected = false
    console.error(`✗ [MongoDB] Connection attempt ${retryCount + 1} failed:`, err.message)

    if (retryCount < MAX_RETRY_ATTEMPTS - 1) {
      const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount) // Exponential backoff
      console.log(`[MongoDB] Retrying in ${delay / 1000} seconds...`)
      await new Promise((resolve) => setTimeout(resolve, delay))
      return connectWithRetry(retryCount + 1)
    } else {
      console.error(`✗ [MongoDB] Failed to connect after ${MAX_RETRY_ATTEMPTS} attempts`)
      console.error("✗ [MongoDB] Please check:")
      console.error("  1. MongoDB URI is correct in .env file")
      console.error("  2. MongoDB cluster is running and accessible")
      console.error("  3. IP address is whitelisted in MongoDB Atlas")
      console.error("  4. Network/firewall allows connections to MongoDB")
      console.error("\n  Current MONGODB_URI:", process.env.MONGODB_URI ? "Set (hidden for security)" : "NOT SET")
    }
  }
}

// Handle connection events
mongoose.connection.on("connected", () => {
  isConnected = true
  console.log("✓ [MongoDB] Connected event fired")
})

mongoose.connection.on("error", (err) => {
  isConnected = false
  console.error("✗ [MongoDB] Connection error:", err.message)
})

mongoose.connection.on("disconnected", () => {
  isConnected = false
  console.warn("⚠ [MongoDB] Disconnected from database")

  // Attempt to reconnect after disconnection
  console.log("[MongoDB] Attempting to reconnect...")
  setTimeout(() => connectWithRetry(0), 5000)
})

mongoose.connection.on("reconnected", () => {
  isConnected = true
  console.log("✓ [MongoDB] Reconnected to database")
})

// Graceful shutdown
process.on("SIGINT", async () => {
  try {
    await mongoose.connection.close()
    console.log("✓ [MongoDB] Connection closed through app termination")
    process.exit(0)
  } catch (err) {
    console.error("✗ [MongoDB] Error during connection closure:", err.message)
    process.exit(1)
  }
})

// Start initial connection
connectWithRetry()

app.use((req, res, next) => {
  // Skip health check endpoint from database check
  if (req.path === "/api/health" || req.path === "/api") {
    return next()
  }

  // Check if database is connected
  if (!isConnected || mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      error: "Database temporarily unavailable",
      message: "The server is experiencing database connectivity issues. Please try again in a moment.",
      status: 503,
      dbState: mongoose.connection.readyState,
      dbStateMessage: getConnectionStateMessage(mongoose.connection.readyState),
    })
  }

  next()
})

function getConnectionStateMessage(state) {
  const states = {
    0: "Disconnected",
    1: "Connected",
    2: "Connecting",
    3: "Disconnecting",
  }
  return states[state] || "Unknown"
}

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/items", itemRoutes)
app.use("/api/vendors", vendorRoutes)
app.use("/api/rider", riderRoutes)
app.use("/api/admin", authenticateToken, adminRoutes)
app.use("/api/admin/vendors", authenticateToken, adminVendorRoutes)
app.use("/api/users", authenticateToken, userRoutes)
app.use("/api/payments", paymentRoutes)
app.use("/api/messages", messageRoutes)
app.use("/api/upload", uploadRoutes)

app.get("/api", (req, res) => {
  const dbState = mongoose.connection.readyState
  const dbConnected = isConnected && dbState === 1

  res.status(200).json({
    status: "OK",
    message: "Odiya Store API is running",
    version: "1.0.0",
    database: {
      connected: dbConnected,
      state: dbState,
      stateMessage: getConnectionStateMessage(dbState),
    },
    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
      items: "/api/items",
      vendors: "/api/vendors",
      payments: "/api/payments",
      admin: "/api/admin",
    },
    timestamp: new Date().toISOString(),
  })
})

app.get("/api/health", (req, res) => {
  const dbState = mongoose.connection.readyState
  const dbConnected = isConnected && dbState === 1

  res.status(dbConnected ? 200 : 503).json({
    status: dbConnected ? "OK" : "DEGRADED",
    message: "Odiya Store API is running",
    database: {
      connected: dbConnected,
      state: dbState,
      stateMessage: getConnectionStateMessage(dbState),
      connectionAttempts: connectionAttempts,
    },
    timestamp: new Date().toISOString(),
  })
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
  console.log(`Request timeout: 10 minutes (for large file uploads)`)
})

export default app
