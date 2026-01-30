import { z } from 'zod';

// ============ USE TEMPLATE ============

export const useTemplateSchema = z.object({
  name: z.string().min(1).max(100).trim().optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format')
    .optional(),
  icon: z.string().max(10).optional(),
  category: z.string().max(50).trim().optional(),
});

export type UseTemplateInput = z.infer<typeof useTemplateSchema>;

// ============ QUERY PARAMS ============

export const getTemplatesQuerySchema = z.object({
  category: z.string().optional(),
});

export type GetTemplatesQuery = z.infer<typeof getTemplatesQuerySchema>;
