import cors from "cors"

const isDevelopment = process.env.NODE_ENV === "development" || process.env.DEVELOPMENT_MODE === "true"

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://odiya-store.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean)

export const corsMiddleware = cors({
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
})

export default corsMiddleware
