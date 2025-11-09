import { del } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"

export async function DELETE(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "No URL provided" }, { status: 400 })
    }

    // Validate that the URL is a Vercel Blob URL
    if (!url.includes("blob.vercel-storage.com")) {
      return NextResponse.json({ error: "Invalid blob URL" }, { status: 400 })
    }

    console.log("[delete-image] Deleting from Vercel Blob:", url)

    // Delete from Vercel Blob
    await del(url)

    console.log("[delete-image] Successfully deleted:", url)

    return NextResponse.json({ success: true, message: "Image deleted successfully" })
  } catch (error: any) {
    console.error("[delete-image] Error:", error)
    return NextResponse.json({ error: error.message || "Delete failed" }, { status: 500 })
  }
}
