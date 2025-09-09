import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    //  fix: Get admin user directly
    const adminUser = await prisma.user.findUnique({
      where: { email: "admin@example.com" }
    })

    if (!adminUser) {
      return NextResponse.json({ error: "Admin user not found" }, { status: 404 })
    }

    const forms = await prisma.form.findMany({
      where: {
        userId: adminUser.id
      },
      include: {
        sections: {
          include: {
            fields: {
              select: {
                id: true,
                label: true,
                type: true
              }
            }
          },
          orderBy: {
            order: 'asc'
          }
        },
        submissions: {
          select: {
            id: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(forms)
  } catch (error) {
    console.error("Error fetching forms:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // replace with real auth if real project  
    //  fix: Get or create admin user directly
    let adminUser = await prisma.user.findUnique({
      where: { email: "admin@example.com" }
    })

    if (!adminUser) {
      adminUser = await prisma.user.create({
        data: {
          email: "admin@example.com",
          name: "Admin User"
        }
      })
    }

    const body = await request.json()
    const { title, description, sections } = body

    if (!title || !sections || sections.length === 0) {
      return NextResponse.json({ error: "Title and at least one section required" }, { status: 400 })
    }

    const form = await prisma.form.create({
      data: {
        title,
        description: description || null,
        userId: adminUser.id,
        sections: {
          create: sections.map((section: { title: string; description: string; fields: Array<{ label: string; type: string; required: boolean; placeholder: string }> }, sectionIndex: number) => ({
            title: section.title,
            description: section.description || null,
            order: sectionIndex,
            fields: {
              create: section.fields.map((field: { label: string; type: string; required: boolean; placeholder: string }, fieldIndex: number) => ({
                label: field.label,
                type: field.type,
                required: field.required || false,
                placeholder: field.placeholder || null,
                order: fieldIndex
              }))
            }
          }))
        }
      },
      include: {
        sections: {
          include: {
            fields: true
          },
          orderBy: {
            order: 'asc'
          }
        }
      }
    })

    return NextResponse.json(form)
  } catch (error: any) {
    if (error.code === 'P2003') {
      return NextResponse.json({ error: "Database constraint error. Please try again." }, { status: 400 })
    }
    
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
