import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { buildPrompt } from '@/lib/aiPrompt';
import { zAISuggestion } from '@/lib/aiSchema';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json() as { prompt: string };
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
    }

    // Try Responses API first (preferred)
    try {
      const completion = await openai.responses.create({
        model: 'gpt-5',
        input: buildPrompt(prompt),
      });

      const text = completion.output_text ?? '';
      
      if (text) {
        let parsed: unknown;
        try {
          parsed = JSON.parse(text);
        } catch {
          // Some models may wrap JSON in fences; try to extract
          const match = text.match(/{[\s\S]*}/);
          if (!match) throw new Error('No JSON found in response');
          parsed = JSON.parse(match[0]);
        }

        const result = zAISuggestion.parse(parsed);

        // Enforce caps just in case
        result.sections = result.sections.slice(0, 2).map((s: any) => ({
          ...s,
          fields: s.fields.slice(0, 3),
        }));

        return NextResponse.json({ suggestion: result });
      }
    } catch (responsesError) {
      console.log('Responses API failed, trying Chat Completions:', responsesError);
    }

    // Fallback to Chat Completions
    const chat = await openai.chat.completions.create({
      model: 'gpt-5',
      messages: [
        { role: 'system', content: 'You return ONLY strict JSON. Never include markdown fences.' },
        { role: 'user', content: buildPrompt(prompt) },
      ],
      temperature: 0.2,
    });

    const text = chat.choices[0]?.message?.content ?? '';
    if (!text) return NextResponse.json({ error: 'No content' }, { status: 502 });

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      const match = text.match(/{[\s\S]*}/);
      if (!match) return NextResponse.json({ error: 'Invalid JSON from model' }, { status: 502 });
      parsed = JSON.parse(match[0]);
    }

    const result = zAISuggestion.parse(parsed);
    result.sections = result.sections.slice(0, 2).map((s: any) => ({ ...s, fields: s.fields.slice(0, 3) }));
    return NextResponse.json({ suggestion: result });
  } catch (err: unknown) {
    console.error('AI generation error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'AI error' }, { status: 500 });
  }
}