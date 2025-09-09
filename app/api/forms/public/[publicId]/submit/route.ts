import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  try {
    const { publicId } = await params
    const body = await request.json()
    const { formData } = body

    // First, get the form to validate it exists
    const form = await prisma.form.findUnique({
      where: {
        publicId: publicId
      },
      include: {
        sections: {
          include: {
            fields: true
          }
        }
      }
    })

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 })
    }

    // Create the form submission
    const submission = await prisma.formSubmission.create({
      data: {
        formId: form.id,
        responses: {
          create: Object.entries(formData).map(([fieldId, value]) => ({
            fieldId: fieldId,
            value: String(value)
          }))
        }
      }
    })

    return NextResponse.json({ success: true, submissionId: submission.id })
  } catch (error) {
    console.error("Error submitting form:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
