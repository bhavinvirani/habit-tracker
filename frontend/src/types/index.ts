export type Frequency = 'DAILY' | 'WEEKLY';
export type HabitType = 'BOOLEAN' | 'NUMERIC' | 'DURATION';

export interface Habit {
  id: string;
  userId: string;
  name: string;
  description?: string;
  frequency: Frequency;
  color: string;
  icon?: string;
  category?: string;
  goal: number;
  isActive: boolean;
  isArchived: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  // Extended fields
  habitType?: HabitType;
  targetValue?: number;
  unit?: string;
  daysOfWeek?: number[];
  timesPerWeek?: number;
}

export interface HabitWithStats extends Habit {
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
  totalCompletions: number;
  lastCompletedAt?: string;
}

export interface HabitLog {
  id: string;
  habitId: string;
  userId: string;
  date: string;
  completed: boolean;
  value: number;
  notes?: string;
  createdAt: string;
}

export interface TodayHabit extends Habit {
  completed: boolean;
  log: HabitLog | null;
  currentStreak: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
}

// Feature Flags
export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string | null;
  category: string;
  enabled: boolean;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

// Admin types
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
  _count: {
    habits: number;
    habitLogs: number;
  };
}

export interface ApplicationStats {
  totalUsers: number;
  totalHabits: number;
  totalHabitLogs: number;
  adminCount: number;
  activeUsersLast7Days: number;
  activeUsersLast30Days: number;
  newRegistrationsLast7Days: number;
  avgCompletionRate: number;
}

export type AuditAction = 'CREATED' | 'UPDATED' | 'DELETED' | 'TOGGLED';

export interface AuditEntry {
  id: string;
  flagKey: string;
  action: AuditAction;
  changes: Record<string, unknown>;
  performedBy: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

// Weekly Report
export interface PatternInsight {
  insight: string;
  habits: string[];
  confidence: string;
}

export interface RiskInsight {
  habit: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export interface OptimizationInsight {
  suggestion: string;
  habits: string[];
  impact: string;
}

export interface WeeklyReport {
  id: string;
  userId: string;
  patterns: PatternInsight[];
  risks: RiskInsight[];
  optimizations: OptimizationInsight[];
  narrative: string;
  periodStart: string;
  periodEnd: string;
  generatedAt: string;
}

export interface DashboardStats {
  totalHabits: number;
  activeHabits: number;
  completedToday: number;
  totalToday: number;
  todayPercentage: number;
  currentStreak: number;
  longestStreak: number;
  averageCompletion: number;
}

export interface HabitTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  frequency: Frequency;
  color: string;
  icon: string;
  defaultGoal: number;
  tips: string[];
}

export interface Milestone {
  id: string;
  habitId: string;
  streak: number;
  achievedAt: string;
  habit: {
    name: string;
    color: string;
    icon?: string;
  };
}

// Color options for habits
export const HABIT_COLORS = [
  { name: 'Blue', value: '#2aa3ff' },
  { name: 'Green', value: '#10b981' },
  { name: 'Yellow', value: '#f59e0b' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Orange', value: '#f97316' },
];

// Category options for habits
export const HABIT_CATEGORIES = [
  'Health',
  'Fitness',
  'Mindfulness',
  'Productivity',
  'Learning',
  'Social',
  'Finance',
  'Creativity',
  'Other',
];

// Analytics types
export interface WeeklyDay {
  date: string;
  completed: number;
  total: number;
  percentage: number;
  habits: Array<{ id: string; name: string; completed: boolean; value: number | null }>;
}

export interface WeeklyStats {
  days: WeeklyDay[];
  summary: {
    total: number;
    completed: number;
    rate: number;
  };
}

export interface MonthlyDay {
  date: string;
  completed: number;
  total: number;
  percentage: number;
  habits?: {
    id: string;
    name: string;
    completed: boolean;
  }[];
}

export interface MonthlyStats {
  days: MonthlyDay[];
  summary: {
    totalCompleted: number;
    totalPossible: number;
    percentage: number;
  };
}

export interface HeatmapStats {
  year: number;
  data: {
    date: string;
    count: number;
    percentage: number;
  }[];
}

export interface HabitAnalytics {
  habitId: string;
  name: string;
  stats: {
    currentStreak: number;
    longestStreak: number;
    completionRate: number;
    totalCompletions: number;
  };
}

export interface StreakInfo {
  habitId: string;
  habitName: string;
  currentStreak: number;
  longestStreak: number;
  color: string;
}

export interface StreaksData {
  streaks: StreakInfo[];
}

// Insights data with optional suggestions and highlights
export interface InsightsData {
  insights: string[];
  recommendations: string[];
  suggestions?: string[];
  bestDay?: {
    day: string;
    percentage: number;
  };
  worstDay?: {
    day: string;
    percentage: number;
  };
  topHabit?: {
    name: string;
    streak: number;
  };
  needsAttention?: {
    name: string;
    missedDays: number;
  }[];
}

// Productivity score from /analytics/productivity
export interface ProductivityScore {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  trend: 'improving' | 'stable' | 'declining';
  breakdown: { consistency: number; streaks: number; completion: number };
}

// Best performing analysis from /analytics/performance
export interface BestPerformingData {
  bestDayOfWeek: { day: string; dayNumber: number; completionRate: number };
  worstDayOfWeek: { day: string; dayNumber: number; completionRate: number };
  byDayOfWeek: Array<{
    day: string;
    dayNumber: number;
    completionRate: number;
    completions: number;
  }>;
  mostConsistentHabit: { id: string; name: string; color: string; rate: number } | null;
  leastConsistentHabit: { id: string; name: string; color: string; rate: number } | null;
}

// Habit correlation from /analytics/correlations
export interface HabitCorrelation {
  habit1: { id: string; name: string };
  habit2: { id: string; name: string };
  correlation: number;
  interpretation: string;
}

// Streak prediction from /analytics/predictions
export interface StreakPrediction {
  habitId: string;
  habitName: string;
  currentStreak: number;
  predictedDaysToMilestone: number;
  nextMilestone: number;
  riskLevel: 'low' | 'medium' | 'high';
  riskReason: string | null;
}

// ─── Admin: System Stats ─────────────────────────────────────────

export interface SystemStats {
  application: {
    name: string;
    version: string;
    environment: string;
    nodeVersion: string;
    uptime: { seconds: number; formatted: string };
    startedAt: string;
  };
  system: {
    memory: {
      rss: number;
      heapTotal: number;
      heapUsed: number;
      external: number;
      arrayBuffers: number;
    };
    cpu: { user: number; system: number };
    platform: string;
    arch: string;
    pid: number;
    loadAverage: { '1m': number; '5m': number; '15m': number };
  };
  database: Record<string, unknown>;
  cache: {
    hits: number;
    misses: number;
    sets: number;
    invalidations: number;
    hitRate: number;
    backend: string;
  };
  requests: {
    totalRequests: number;
    activeRequests: number;
    averageResponseTime: number;
    byMethod: Record<string, number>;
    byStatusGroup: Record<string, number>;
  };
  redis: Record<string, unknown>;
  deployment: {
    gitSha: string | null;
    buildTimestamp: string | null;
    dockerImage: string | null;
    packageVersion: string;
  };
  errors: {
    totalErrors: number;
    byCode: Record<string, { count: number; lastMessage: string; statusCode: number }>;
    recent: Array<{
      code: string;
      message: string;
      url: string;
      method: string;
      timestamp: string;
    }>;
  };
  cronJobs: Record<
    string,
    {
      schedule: string;
      lastRun: string | null;
      lastStatus: string | null;
      runCount: number;
      failCount: number;
    }
  >;
  rateLimiting: {
    totalThrottled: number;
    byLimiter: Record<string, number>;
  };
  activeUsers: {
    dau: number;
    wau: number;
    mau: number;
    totalRegistered: number;
  };
  dependencies: Record<string, { status: string; latencyMs: number }>;
}

// ─── Admin: Trends ───────────────────────────────────────────────

export interface TrendPoint {
  date: string;
  newUsers: number;
  activeUsers: number;
  completionRate: number;
}

// ─── Admin: Content Breakdown ────────────────────────────────────

export interface ContentBreakdown {
  habits: {
    byFrequency: Array<{ frequency: string; count: number }>;
    byType: Array<{ type: string; count: number }>;
    byCategory: Array<{ category: string; count: number }>;
  };
  books: {
    byStatus: Array<{ status: string; count: number }>;
  };
  challenges: {
    byStatus: Array<{ status: string; count: number }>;
  };
  engagement: {
    avgHabitsPerUser: number;
    avgCompletionRate: number;
    avgStreakLength: number;
    usersWithActiveHabits: number;
    totalUsers: number;
  };
}

// ─── Admin: User Detail ──────────────────────────────────────────

export interface AdminUserDetail {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  timezone: string;
  createdAt: string;
  _count: {
    habits: number;
    habitLogs: number;
    milestones: number;
    books: number;
    challenges: number;
  };
  habits: Array<{
    id: string;
    name: string;
    color: string;
    frequency: string;
    habitType: string;
    isActive: boolean;
    isArchived: boolean;
    currentStreak: number;
    longestStreak: number;
    totalCompletions: number;
    createdAt: string;
  }>;
  books: Array<{
    id: string;
    title: string;
    author: string | null;
    status: string;
    rating: number | null;
    createdAt: string;
  }>;
  challenges: Array<{
    id: string;
    name: string;
    status: string;
    duration: number;
    completionRate: number | null;
    startDate: string;
    endDate: string;
  }>;
}

// ─── Admin: Sessions ─────────────────────────────────────────────

export interface AdminSession {
  id: string;
  createdAt: string;
  expiresAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

// Axios Error type
export interface ApiError {
  response?: {
    data?: {
      error?: {
        message: string;
      };
    };
  };
}

// Recharts tooltip props
export interface ChartTooltipProps {
  active?: boolean;
  payload?: {
    value: number;
    payload: {
      total: number;
      percentage: number;
    };
  }[];
  label?: string;
}
