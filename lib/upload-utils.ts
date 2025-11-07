export const compressImage = async (file: File, quality = 90): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      const img = new Image()

      img.onload = () => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")

        if (!ctx) {
          reject(new Error("Failed to get canvas context"))
          return
        }

        // Calculate dimensions (max 1920x1440)
        let width = img.width
        let height = img.height

        if (width > 1920 || height > 1440) {
          const scale = Math.min(1920 / width, 1440 / height)
          width *= scale
          height *= scale
        }

        canvas.width = width
        canvas.height = height
        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error("Failed to compress image"))
            }
          },
          "image/jpeg",
          quality / 100,
        )
      }

      img.onerror = () => {
        reject(new Error("Failed to load image"))
      }

      img.src = event.target?.result as string
    }

    reader.onerror = () => {
      reject(new Error("Failed to read file"))
    }

    reader.readAsDataURL(file)
  })
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
}

export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  const maxSize = 100 * 1024 * 1024 // 100MB
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File is too large. Maximum size is 100MB. Your file is ${formatFileSize(file.size)}.`,
    }
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.",
    }
  }

  return { valid: true }
}
