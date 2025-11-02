import { type NextRequest, NextResponse } from "next/server"
import { connect } from "@/lib/mongodb"
import User from "@/models/User.ts"
import jwt from "jsonwebtoken"

export async function POST(request: NextRequest) {
  try {
    await connect()

    const { email, password } = await request.json()

    const user = await User.findOne({ email })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 })
    }

    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 })
    }

    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET || "", { expiresIn: "7d" })

    return NextResponse.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    })
  } catch (error) {
    console.error("[v0] Login error:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
