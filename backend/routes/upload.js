import express from "express"
import multer from "multer"
import path from "path"
import fs from "fs"
import { authenticateToken } from "../middleware/auth.js"

const router = express.Router()

// Configure multer for image uploads
const uploadDir = "uploads/"
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error("Invalid file type. Only images are allowed."))
    }
  },
})

const uploadErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error("[v0] Multer error:", err)
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ error: "File is too large. Maximum size is 5MB." })
    }
    return res.status(400).json({ error: err.message })
  }
  if (err) {
    console.error("[v0] File upload error:", err)
    return res.status(400).json({ error: err.message || "File upload failed" })
  }
  next()
}

// Upload endpoint for profile pictures and item images
router.post(
  "/",
  authenticateToken,
  (req, res, next) => {
    const uploadSingle = upload.single("file")
    uploadSingle(req, res, (err) => {
      if (err) {
        return uploadErrorHandler(err, req, res, next)
      }
      next()
    })
  },
  (req, res) => {
    try {
      if (!req.file) {
        console.error("[v0] No file uploaded")
        return res.status(400).json({ error: "No file uploaded" })
      }

      const baseUrl = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 5000}`
      const filePath = `${baseUrl}/uploads/${req.file.filename}`

      console.log("[v0] File uploaded successfully:", {
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size,
        url: filePath,
      })

      res.status(201).json({
        message: "File uploaded successfully",
        url: filePath,
        filename: req.file.filename,
      })
    } catch (error) {
      console.error("[v0] Upload response error:", error)
      res.status(500).json({ error: error.message || "Failed to process upload response" })
    }
  },
)

export default router
