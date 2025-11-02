import { type NextRequest, NextResponse } from "next/server"
import { connect } from "@/lib/mongodb"
import User from "@/models/User.ts"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    await connect()

    const { email, password, firstName, lastName, phone } = await request.json()

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
    })

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
    console.error("[v0] Register error:", error)
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
