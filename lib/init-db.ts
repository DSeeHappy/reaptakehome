import { prisma } from './prisma'

export async function ensureAdminUser() {
  try {
    // First, ensure the database is properly initialized
    await ensureDatabaseInitialized()
    
    // Check if admin user exists
    let adminUser = await prisma.user.findUnique({
      where: { email: "admin@example.com" }
    })

    if (!adminUser) {
      // Create admin user if it doesn't exist
      adminUser = await prisma.user.create({
        data: {
          email: "admin@example.com",
          name: "Admin User"
        }
      })
      console.log("✅ Created admin user with ID:", adminUser.id)
    } else {
      console.log("✅ Admin user already exists with ID:", adminUser.id)
    }

    return adminUser
  } catch (error) {
    console.error("❌ Error ensuring admin user:", error)
    // If it's a table doesn't exist error, try to initialize the database
    if (error.code === 'P2021') {
      console.log("🔄 Database tables not found, initializing...")
      await ensureDatabaseInitialized()
      // Retry once more
      return await ensureAdminUser()
    }
    throw error
  }
}

async function ensureDatabaseInitialized() {
  try {
    // Try to run a simple query to check if tables exist
    await prisma.$queryRaw`SELECT 1`
    console.log("✅ Database is properly initialized")
  } catch (error) {
    if (error.code === 'P2021') {
      console.log("🔄 Database tables missing, creating schema...")
      // The database exists but tables don't, this should have been handled by db push
      // But let's try to create a simple user table if needed
      try {
        await prisma.$executeRaw`
          CREATE TABLE IF NOT EXISTS "User" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "email" TEXT NOT NULL UNIQUE,
            "name" TEXT NOT NULL
          )
        `
        await prisma.$executeRaw`
          CREATE TABLE IF NOT EXISTS "Form" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "title" TEXT NOT NULL,
            "description" TEXT,
            "publicId" TEXT NOT NULL UNIQUE,
            "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" DATETIME NOT NULL,
            "userId" TEXT NOT NULL,
            FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
          )
        `
        await prisma.$executeRaw`
          CREATE TABLE IF NOT EXISTS "Section" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "title" TEXT NOT NULL,
            "description" TEXT,
            "order" INTEGER NOT NULL,
            "formId" TEXT NOT NULL,
            FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE CASCADE
          )
        `
        await prisma.$executeRaw`
          CREATE TABLE IF NOT EXISTS "Field" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "label" TEXT NOT NULL,
            "type" TEXT NOT NULL,
            "required" BOOLEAN NOT NULL DEFAULT false,
            "placeholder" TEXT,
            "order" INTEGER NOT NULL,
            "sectionId" TEXT NOT NULL,
            FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE CASCADE
          )
        `
        await prisma.$executeRaw`
          CREATE TABLE IF NOT EXISTS "FormSubmission" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "formId" TEXT NOT NULL,
            "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE CASCADE
          )
        `
        await prisma.$executeRaw`
          CREATE TABLE IF NOT EXISTS "FieldResponse" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "value" TEXT NOT NULL,
            "fieldId" TEXT NOT NULL,
            "submissionId" TEXT NOT NULL,
            FOREIGN KEY ("fieldId") REFERENCES "Field"("id") ON DELETE CASCADE,
            FOREIGN KEY ("submissionId") REFERENCES "FormSubmission"("id") ON DELETE CASCADE
          )
        `
        console.log("✅ Database tables created successfully")
      } catch (createError) {
        console.error("❌ Failed to create tables:", createError)
        throw createError
      }
    } else {
      throw error
    }
  }
}
