import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-server"
import OpenAI from "openai"

export async function POST(request: NextRequest) {
  try {
    const user = getCurrentUser(request)
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { prompt } = body

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 })
    }

    const openai = new OpenAI({
      apiKey: apiKey,
    })

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Generate form structure. Rules: 2 sections max, 3 fields max per section, only "text" or "number" types. Return JSON: {"sections":[{"title":"Title","description":"Desc","fields":[{"label":"Label","type":"text","required":true,"placeholder":"placeholder"}]}]}`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 500,
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      return NextResponse.json({ error: "No response from OpenAI" }, { status: 500 })
    }

    try {
      const parsedContent = JSON.parse(content)
      return NextResponse.json(parsedContent)
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError)
      return NextResponse.json({ error: "Invalid response format from AI" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error generating form with AI:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
