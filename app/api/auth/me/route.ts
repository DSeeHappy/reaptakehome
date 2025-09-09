import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-server"

export async function GET(request: NextRequest) {
  try {
    const user = getCurrentUser(request)
    
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
