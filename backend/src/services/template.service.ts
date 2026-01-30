import prisma from '../config/database';
import { NotFoundError } from '../utils/AppError';
import { HabitTemplate, Habit } from '@prisma/client';
import { UseTemplateInput } from '../validators/template.validator';
import * as habitService from './habit.service';
import logger from '../utils/logger';

// ============ SERVICE FUNCTIONS ============

/**
 * Get all templates with optional category filter
 */
export async function getTemplates(category?: string): Promise<HabitTemplate[]> {
  const where = category ? { category } : {};

  return prisma.habitTemplate.findMany({
    where,
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  });
}

/**
 * Get a single template by ID
 */
export async function getTemplateById(templateId: string): Promise<HabitTemplate> {
  const template = await prisma.habitTemplate.findUnique({
    where: { id: templateId },
  });

  if (!template) {
    throw new NotFoundError('Template', templateId);
  }

  return template;
}

/**
 * Create a habit from a template
 */
export async function useTemplate(
  userId: string,
  templateId: string,
  overrides: UseTemplateInput = {}
): Promise<Habit> {
  const template = await getTemplateById(templateId);

  const habit = await habitService.createHabit(
    userId,
    {
      name: overrides.name || template.name,
      description: template.description,
      category: overrides.category || template.category,
      frequency: template.frequency,
      habitType: template.habitType,
      targetValue: template.targetValue,
      unit: template.unit,
      color: overrides.color || template.color,
      icon: overrides.icon || template.icon,
    },
    templateId
  );

  logger.info('Habit created from template', {
    habitId: habit.id,
    templateId,
    userId,
  });

  return habit;
}

/**
 * Seed default templates (run during database setup)
 */
export async function seedTemplates(): Promise<void> {
  const templates = getDefaultTemplates();

  for (const template of templates) {
    await prisma.habitTemplate.upsert({
      where: { id: template.id },
      update: template,
      create: template,
    });
  }

  logger.info('Templates seeded', { count: templates.length });
}

// ============ DEFAULT TEMPLATES ============

function getDefaultTemplates() {
  return [
    // Health
    {
      id: 'tpl-exercise',
      name: 'Exercise',
      description: 'Daily physical exercise to stay fit',
      category: 'Health',
      icon: '🏃',
      color: '#10B981',
      habitType: 'BOOLEAN' as const,
      frequency: 'DAILY' as const,
      isSystem: true,
    },
    {
      id: 'tpl-water',
      name: 'Drink Water',
      description: 'Stay hydrated throughout the day',
      category: 'Health',
      icon: '💧',
      color: '#3B82F6',
      habitType: 'NUMERIC' as const,
      targetValue: 8,
      unit: 'glasses',
      frequency: 'DAILY' as const,
      isSystem: true,
    },
    {
      id: 'tpl-sleep',
      name: 'Sleep 8 Hours',
      description: 'Get enough quality sleep',
      category: 'Health',
      icon: '😴',
      color: '#6366F1',
      habitType: 'DURATION' as const,
      targetValue: 480,
      unit: 'minutes',
      frequency: 'DAILY' as const,
      isSystem: true,
    },
    {
      id: 'tpl-vitamins',
      name: 'Take Vitamins',
      description: 'Daily vitamins and supplements',
      category: 'Health',
      icon: '💊',
      color: '#F59E0B',
      habitType: 'BOOLEAN' as const,
      frequency: 'DAILY' as const,
      isSystem: true,
    },

    // Fitness
    {
      id: 'tpl-gym',
      name: 'Go to Gym',
      description: 'Workout at the gym',
      category: 'Fitness',
      icon: '🏋️',
      color: '#EF4444',
      habitType: 'BOOLEAN' as const,
      frequency: 'WEEKLY' as const,
      isSystem: true,
    },
    {
      id: 'tpl-steps',
      name: 'Walk 10,000 Steps',
      description: 'Hit your daily step goal',
      category: 'Fitness',
      icon: '👟',
      color: '#14B8A6',
      habitType: 'NUMERIC' as const,
      targetValue: 10000,
      unit: 'steps',
      frequency: 'DAILY' as const,
      isSystem: true,
    },
    {
      id: 'tpl-stretching',
      name: 'Stretching',
      description: 'Daily stretching routine',
      category: 'Fitness',
      icon: '🧘',
      color: '#EC4899',
      habitType: 'DURATION' as const,
      targetValue: 15,
      unit: 'minutes',
      frequency: 'DAILY' as const,
      isSystem: true,
    },

    // Productivity
    {
      id: 'tpl-focus',
      name: 'Deep Work Session',
      description: 'Focused work without distractions',
      category: 'Productivity',
      icon: '🎯',
      color: '#8B5CF6',
      habitType: 'DURATION' as const,
      targetValue: 120,
      unit: 'minutes',
      frequency: 'DAILY' as const,
      isSystem: true,
    },
    {
      id: 'tpl-planning',
      name: 'Plan Tomorrow',
      description: 'Plan tasks for the next day',
      category: 'Productivity',
      icon: '📋',
      color: '#0EA5E9',
      habitType: 'BOOLEAN' as const,
      frequency: 'DAILY' as const,
      isSystem: true,
    },
    {
      id: 'tpl-inbox-zero',
      name: 'Inbox Zero',
      description: 'Clear your email inbox',
      category: 'Productivity',
      icon: '📧',
      color: '#6B7280',
      habitType: 'BOOLEAN' as const,
      frequency: 'DAILY' as const,
      isSystem: true,
    },

    // Learning
    {
      id: 'tpl-reading',
      name: 'Read',
      description: 'Daily reading habit',
      category: 'Learning',
      icon: '📚',
      color: '#A855F7',
      habitType: 'DURATION' as const,
      targetValue: 30,
      unit: 'minutes',
      frequency: 'DAILY' as const,
      isSystem: true,
    },
    {
      id: 'tpl-learn-language',
      name: 'Learn Language',
      description: 'Practice a new language',
      category: 'Learning',
      icon: '🗣️',
      color: '#22C55E',
      habitType: 'DURATION' as const,
      targetValue: 15,
      unit: 'minutes',
      frequency: 'DAILY' as const,
      isSystem: true,
    },
    {
      id: 'tpl-coding',
      name: 'Code Practice',
      description: 'Practice coding skills',
      category: 'Learning',
      icon: '💻',
      color: '#1E40AF',
      habitType: 'DURATION' as const,
      targetValue: 60,
      unit: 'minutes',
      frequency: 'DAILY' as const,
      isSystem: true,
    },

    // Mindfulness
    {
      id: 'tpl-meditation',
      name: 'Meditate',
      description: 'Daily meditation practice',
      category: 'Mindfulness',
      icon: '🧘‍♂️',
      color: '#7C3AED',
      habitType: 'DURATION' as const,
      targetValue: 10,
      unit: 'minutes',
      frequency: 'DAILY' as const,
      isSystem: true,
    },
    {
      id: 'tpl-journal',
      name: 'Journal',
      description: 'Write in your journal',
      category: 'Mindfulness',
      icon: '✍️',
      color: '#DB2777',
      habitType: 'BOOLEAN' as const,
      frequency: 'DAILY' as const,
      isSystem: true,
    },
    {
      id: 'tpl-gratitude',
      name: 'Gratitude',
      description: 'Write 3 things you are grateful for',
      category: 'Mindfulness',
      icon: '🙏',
      color: '#F97316',
      habitType: 'BOOLEAN' as const,
      frequency: 'DAILY' as const,
      isSystem: true,
    },

    // Finance
    {
      id: 'tpl-no-spend',
      name: 'No Spend Day',
      description: 'Avoid unnecessary spending',
      category: 'Finance',
      icon: '💰',
      color: '#16A34A',
      habitType: 'BOOLEAN' as const,
      frequency: 'DAILY' as const,
      isSystem: true,
    },
    {
      id: 'tpl-budget',
      name: 'Track Expenses',
      description: 'Log daily expenses',
      category: 'Finance',
      icon: '📊',
      color: '#0D9488',
      habitType: 'BOOLEAN' as const,
      frequency: 'DAILY' as const,
      isSystem: true,
    },

    // Social
    {
      id: 'tpl-call-family',
      name: 'Call Family',
      description: 'Stay connected with family',
      category: 'Social',
      icon: '📞',
      color: '#E11D48',
      habitType: 'BOOLEAN' as const,
      frequency: 'WEEKLY' as const,
      isSystem: true,
    },
    {
      id: 'tpl-no-social',
      name: 'No Social Media',
      description: 'Stay off social media',
      category: 'Social',
      icon: '📵',
      color: '#64748B',
      habitType: 'BOOLEAN' as const,
      frequency: 'DAILY' as const,
      isSystem: true,
    },
  ];
}
