import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    //  fix: Get admin user directly - hardcoded admin user obv bad practice
    const adminUser = await prisma.user.findUnique({
      where: { email: "admin@example.com" }
    })

    if (!adminUser) {
      return NextResponse.json({ error: "Admin user not found" }, { status: 404 })
    }

    const { formId } = await params

    // Verify the form belongs to the admin user
    const form = await prisma.form.findFirst({
      where: {
        id: formId,
        userId: adminUser.id
      }
    })

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 })
    }

    // Get all submissions for this form
    const submissions = await prisma.formSubmission.findMany({
      where: {
        formId: formId
      },
      include: {
        responses: {
          include: {
            field: {
              select: {
                id: true,
                label: true,
                type: true
              }
            }
          }
        }
      },
      orderBy: {
        submittedAt: 'desc'
      }
    })

    return NextResponse.json(submissions)
  } catch (error) {
    console.error("Error fetching form submissions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
