export interface Habit {
  id: string;
  userId: string;
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'custom';
  color: string;
  icon?: string;
  category?: string;
  goal?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HabitLog {
  id: string;
  habitId: string;
  userId: string;
  date: string;
  completed: boolean;
  notes?: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface DashboardStats {
  totalHabits: number;
  completedToday: number;
  currentStreak: number;
  successRate: number;
}
