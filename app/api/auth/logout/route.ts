import { NextResponse } from "next/server"

export async function POST() {
  const response = NextResponse.json({ success: true })
  
  // Clear the auth cookie
  response.cookies.set('auth-token', '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
    sameSite: 'lax'
  })

  return response
}
