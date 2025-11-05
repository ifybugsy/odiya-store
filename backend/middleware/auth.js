import jwt from "jsonwebtoken"

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    console.warn("[v0] No token provided in Authorization header")
    console.warn("[v0] Auth header:", authHeader ? `"${authHeader.substring(0, 20)}..."` : "none")
    return res.status(401).json({ error: "Access token required" })
  }

  jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret_key", (err, user) => {
    if (err) {
      console.error("[v0] Token verification failed:", err.name, err.message)
      const errorMsg =
        err.name === "TokenExpiredError"
          ? "Your session has expired. Please log in again."
          : "Invalid or malformed token. Please log in again."
      return res.status(403).json({ error: errorMsg })
    }
    req.user = user
    next()
  })
}

export const isAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: "Admin access required" })
  }
  next()
}

export const isSeller = (req, res, next) => {
  if (!req.user || !req.user.isSeller) {
    return res.status(403).json({ error: "Seller access required" })
  }
  next()
}
