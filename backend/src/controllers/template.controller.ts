import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendCreated } from '../utils/response';
import * as templateService from '../services/template.service';
import { GetTemplatesQuery, UseTemplateInput } from '../validators/template.validator';

/**
 * Get all habit templates
 * GET /api/templates
 */
export const getTemplates = asyncHandler(async (req: AuthRequest, res: Response) => {
  const query = req.query as unknown as GetTemplatesQuery;

  const templates = await templateService.getTemplates(query.category);

  // Group templates by category for easier frontend consumption
  const grouped = templates.reduce(
    (acc, template) => {
      const category = template.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(template);
      return acc;
    },
    {} as Record<string, typeof templates>
  );

  sendSuccess(
    res,
    {
      templates,
      byCategory: grouped,
    },
    'Templates retrieved successfully'
  );
});

/**
 * Get a single template by ID
 * GET /api/templates/:id
 */
export const getTemplateById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const templateId = req.params.id as string;
  const template = await templateService.getTemplateById(templateId);

  sendSuccess(res, { template }, 'Template retrieved successfully');
});

/**
 * Create a habit from a template
 * POST /api/templates/:id/use
 */
export const useTemplate = asyncHandler(async (req: AuthRequest, res: Response) => {
  const templateId = req.params.id as string;
  const overrides = req.body as UseTemplateInput;

  const habit = await templateService.useTemplate(req.userId!, templateId, overrides);

  sendCreated(res, { habit }, 'Habit created from template! 🎯');
});
