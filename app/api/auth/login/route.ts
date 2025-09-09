import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production-12345'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (email === "admin@example.com" && password === "password123") {
      const user = {
        id: "admin-1",
        email: "admin@example.com",
        name: "Admin User"
      }

      const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' })
      
      const response = NextResponse.json({ success: true, user })
      
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
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
