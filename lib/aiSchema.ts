import { z } from 'zod';

export const zField = z.object({
  label: z.string().min(1).max(80),
  type: z.enum(['text', 'number']),
  required: z.boolean().optional(),
  placeholder: z.string().max(120).optional().nullable(),
});

export const zSection = z.object({
  title: z.string().min(1).max(80),
  description: z.string().max(280).optional().nullable(),
  fields: z.array(zField).min(1).max(3),
});

export const zAISuggestion = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(280).optional().nullable(),
  sections: z.array(zSection).min(1).max(2),
});

export type ZAISuggestion = z.infer<typeof zAISuggestion>;
