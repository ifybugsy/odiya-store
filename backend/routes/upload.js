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

// Upload endpoint for profile pictures and item images
router.post("/", authenticateToken, upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" })
    }

    // Return relative path that can be served by the backend
    const filePath = `${process.env.API_BASE_URL || "http://localhost:5000"}/uploads/${req.file.filename}`

    res.status(201).json({
      message: "File uploaded successfully",
      url: filePath,
      filename: req.file.filename,
    })
  } catch (error) {
    console.error("[v0] Upload error:", error)
    res.status(500).json({ error: error.message || "Failed to upload file" })
  }
})

export default router
