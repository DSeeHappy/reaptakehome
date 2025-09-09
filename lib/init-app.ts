import { ensureAdminUser } from './init-db'

let isInitialized = false

export async function initializeApp() {
  if (isInitialized) return
  
  try {
    await ensureAdminUser()
    isInitialized = true
    console.log("🚀 App initialized successfully")
  } catch (error) {
    console.error("❌ Failed to initialize app:", error)
  }
}
