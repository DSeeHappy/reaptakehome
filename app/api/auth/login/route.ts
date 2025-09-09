import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { prisma } from "@/lib/prisma"

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production-12345'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (email === "admin@example.com" && password === "password123") {
      // Find or create admin user
      let user = await prisma.user.findUnique({
        where: { email: "admin@example.com" }
      })

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: "admin@example.com",
            name: "Admin User"
          }
        })
        console.log("Created admin user with ID:", user.id)
      } else {
        console.log("Found existing admin user with ID:", user.id)
      }

      const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' })
      
      const response = NextResponse.json({ success: true, user: { id: user.id, email: user.email, name: user.name } })
      
      // Set HttpOnly cookie
      response.cookies.set('auth-token', token, {
        httpOnly: true,
        path: '/',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        sameSite: 'lax'
      })

      return response
    }

    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
