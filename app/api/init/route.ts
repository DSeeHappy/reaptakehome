import { NextResponse } from "next/server"
import { ensureAdminUser } from "@/lib/init-db"

export async function GET() {
  try {
    const adminUser = await ensureAdminUser()
    return NextResponse.json({ 
      success: true, 
      message: "App initialized successfully",
      adminUser: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name
      }
    })
  } catch (error) {
    console.error("Initialization error:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to initialize app" 
    }, { status: 500 })
  }
}
