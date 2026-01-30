import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validate';
import { useTemplateSchema, getTemplatesQuerySchema } from '../validators/template.validator';
import { getTemplates, getTemplateById, useTemplate } from '../controllers/template.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all templates
router.get('/', validateQuery(getTemplatesQuerySchema), getTemplates);

// Get single template
router.get('/:id', getTemplateById);

// Create habit from template
router.post('/:id/use', validateBody(useTemplateSchema), useTemplate);

export default router;
