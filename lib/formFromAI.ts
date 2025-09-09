import { prisma } from '@/lib/prisma';
import type { AISuggestionPayload } from '@/types/ai';

export async function persistAISuggestion(userId: string, ai: AISuggestionPayload) {
  return prisma.form.create({
    data: {
      title: ai.title,
      description: ai.description ?? null,
      userId,
      sections: {
        create: ai.sections.map((s, si) => ({
          title: s.title,
          description: s.description ?? null,
          order: si,
          fields: {
            create: s.fields.map((f, fi) => ({
              label: f.label,
              type: f.type,                // 'text' | 'number'
              required: !!f.required,
              placeholder: f.placeholder ?? null,
              order: fi,
            })),
          },
        })),
      },
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
    },
  });
}
