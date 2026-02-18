import { Prisma } from '@prisma/client';
import prisma from '../config/database';
import { NotFoundError, BadRequestError } from '../utils/AppError';

class AdminService {
  async getAllUsers({
    page = 1,
    limit = 20,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  }: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<{ users: unknown[]; total: number }> {
    const where: Prisma.UserWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy: Prisma.UserOrderByWithRelationInput =
      sortBy === 'habitCount'
        ? { habits: { _count: sortOrder as Prisma.SortOrder } }
        : { [sortBy]: sortOrder as Prisma.SortOrder };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          isAdmin: true,
          createdAt: true,
          _count: {
            select: { habits: true, habitLogs: true },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total };
  }

  async updateUserRole(
    userId: string,
    isAdmin: boolean,
    requestingAdminId: string
  ): Promise<unknown> {
    if (userId === requestingAdminId && !isAdmin) {
      throw new BadRequestError('You cannot remove your own admin privileges');
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError('User', userId);

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isAdmin },
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
        createdAt: true,
      },
    });

    return updated;
  }

  async getApplicationStats(): Promise<Record<string, unknown>> {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalHabits,
      totalHabitLogs,
      adminCount,
      activeUsersLast7Days,
      activeUsersLast30Days,
      newRegistrationsLast7Days,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.habit.count(),
      prisma.habitLog.count(),
      prisma.user.count({ where: { isAdmin: true } }),
      prisma.habitLog
        .findMany({
          where: { createdAt: { gte: sevenDaysAgo } },
          select: { userId: true },
          distinct: ['userId'],
        })
        .then((r) => r.length),
      prisma.habitLog
        .findMany({
          where: { createdAt: { gte: thirtyDaysAgo } },
          select: { userId: true },
          distinct: ['userId'],
        })
        .then((r) => r.length),
      prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    ]);

    // Calculate average completion rate
    let avgCompletionRate = 0;
    if (totalHabits > 0) {
      const completedLogs = await prisma.habitLog.count({
        where: { completed: true },
      });
      avgCompletionRate =
        totalHabitLogs > 0 ? Math.round((completedLogs / totalHabitLogs) * 100) : 0;
    }

    return {
      totalUsers,
      totalHabits,
      totalHabitLogs,
      adminCount,
      activeUsersLast7Days,
      activeUsersLast30Days,
      newRegistrationsLast7Days,
      avgCompletionRate,
    };
  }

  // ─── Trends ──────────────────────────────────────────────────────

  async getTrends(days: number = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    since.setHours(0, 0, 0, 0);

    const [newUsersRaw, activeUsersRaw, completionRaw] = await Promise.all([
      prisma.$queryRaw<{ date: Date; count: bigint }[]>`
        SELECT date_trunc('day', "createdAt") as date, COUNT(*)::bigint as count
        FROM "users"
        WHERE "createdAt" >= ${since}
        GROUP BY date_trunc('day', "createdAt")
        ORDER BY date
      `,
      prisma.$queryRaw<{ date: Date; count: bigint }[]>`
        SELECT date_trunc('day', "date") as date, COUNT(DISTINCT "userId")::bigint as count
        FROM "habit_logs"
        WHERE "date" >= ${since}
        GROUP BY date_trunc('day', "date")
        ORDER BY date
      `,
      prisma.$queryRaw<{ date: Date; total: bigint; completed: bigint }[]>`
        SELECT
          date_trunc('day', "date") as date,
          COUNT(*)::bigint as total,
          SUM(CASE WHEN "completed" = true THEN 1 ELSE 0 END)::bigint as completed
        FROM "habit_logs"
        WHERE "date" >= ${since}
        GROUP BY date_trunc('day', "date")
        ORDER BY date
      `,
    ]);

    // Build a map of all dates in range
    const dateMap = new Map<
      string,
      { newUsers: number; activeUsers: number; completionRate: number }
    >();
    for (let d = new Date(since); d <= new Date(); d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().split('T')[0];
      dateMap.set(key, { newUsers: 0, activeUsers: 0, completionRate: 0 });
    }

    for (const row of newUsersRaw) {
      const key = new Date(row.date).toISOString().split('T')[0];
      const entry = dateMap.get(key);
      if (entry) entry.newUsers = Number(row.count);
    }

    for (const row of activeUsersRaw) {
      const key = new Date(row.date).toISOString().split('T')[0];
      const entry = dateMap.get(key);
      if (entry) entry.activeUsers = Number(row.count);
    }

    for (const row of completionRaw) {
      const key = new Date(row.date).toISOString().split('T')[0];
      const entry = dateMap.get(key);
      const total = Number(row.total);
      const completed = Number(row.completed);
      if (entry) entry.completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    }

    return Array.from(dateMap.entries()).map(([date, values]) => ({
      date,
      ...values,
    }));
  }

  // ─── Content Breakdown ───────────────────────────────────────────

  async getContentBreakdown() {
    const [
      habitsByFrequency,
      habitsByType,
      habitCategories,
      booksByStatus,
      challengesByStatus,
      totalUsers,
      usersWithActiveHabits,
      avgHabitsPerUserRaw,
      avgStreakRaw,
    ] = await Promise.all([
      prisma.habit.groupBy({ by: ['frequency'], _count: true }),
      prisma.habit.groupBy({ by: ['habitType'], _count: true }),
      prisma.habit.groupBy({
        by: ['category'],
        _count: true,
        where: { category: { not: null } },
        orderBy: { _count: { category: 'desc' } },
      }),
      prisma.book.groupBy({ by: ['status'], _count: true }),
      prisma.challenge.groupBy({ by: ['status'], _count: true }),
      prisma.user.count(),
      prisma.user.count({
        where: { habits: { some: { isArchived: false, isActive: true } } },
      }),
      prisma.habit.aggregate({ _avg: { totalCompletions: true }, _count: true }),
      prisma.habit.aggregate({
        _avg: { currentStreak: true },
        where: { isArchived: false },
      }),
    ]);

    // Calculate avg completion rate
    const totalLogs = await prisma.habitLog.count();
    const completedLogs = await prisma.habitLog.count({ where: { completed: true } });
    const avgCompletionRate = totalLogs > 0 ? Math.round((completedLogs / totalLogs) * 100) : 0;

    const totalHabits = avgHabitsPerUserRaw._count;
    const avgHabitsPerUser = totalUsers > 0 ? Math.round((totalHabits / totalUsers) * 10) / 10 : 0;

    return {
      habits: {
        byFrequency: habitsByFrequency.map((h) => ({
          frequency: h.frequency,
          count: h._count,
        })),
        byType: habitsByType.map((h) => ({
          type: h.habitType,
          count: h._count,
        })),
        byCategory: habitCategories.map((h) => ({
          category: h.category || 'Uncategorized',
          count: h._count,
        })),
      },
      books: {
        byStatus: booksByStatus.map((b) => ({
          status: b.status,
          count: b._count,
        })),
      },
      challenges: {
        byStatus: challengesByStatus.map((c) => ({
          status: c.status,
          count: c._count,
        })),
      },
      engagement: {
        avgHabitsPerUser,
        avgCompletionRate,
        avgStreakLength: Math.round((avgStreakRaw._avg.currentStreak || 0) * 10) / 10,
        usersWithActiveHabits,
        totalUsers,
      },
    };
  }

  // ─── User Detail ─────────────────────────────────────────────────

  async getUserDetail(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
        timezone: true,
        createdAt: true,
        _count: {
          select: {
            habits: true,
            habitLogs: true,
            milestones: true,
            books: true,
            challenges: true,
          },
        },
      },
    });

    if (!user) throw new NotFoundError('User', userId);

    const [habits, books, challenges] = await Promise.all([
      prisma.habit.findMany({
        where: { userId },
        select: {
          id: true,
          name: true,
          color: true,
          frequency: true,
          habitType: true,
          isActive: true,
          isArchived: true,
          currentStreak: true,
          longestStreak: true,
          totalCompletions: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.book.findMany({
        where: { userId },
        select: {
          id: true,
          title: true,
          author: true,
          status: true,
          rating: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      prisma.challenge.findMany({
        where: { userId },
        select: {
          id: true,
          name: true,
          status: true,
          duration: true,
          completionRate: true,
          startDate: true,
          endDate: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
    ]);

    return {
      ...user,
      habits,
      books,
      challenges,
    };
  }

  // ─── Data Export ─────────────────────────────────────────────────

  async exportData(type: 'users' | 'habits' | 'logs') {
    switch (type) {
      case 'users': {
        const users = await prisma.user.findMany({
          select: {
            id: true,
            name: true,
            email: true,
            isAdmin: true,
            timezone: true,
            createdAt: true,
            _count: { select: { habits: true, habitLogs: true } },
          },
          orderBy: { createdAt: 'desc' },
        });
        return {
          headers: ['ID', 'Name', 'Email', 'Admin', 'Timezone', 'Created', 'Habits', 'Logs'],
          rows: users.map((u) => [
            u.id,
            u.name,
            u.email,
            u.isAdmin ? 'Yes' : 'No',
            u.timezone,
            u.createdAt.toISOString(),
            u._count.habits,
            u._count.habitLogs,
          ]),
        };
      }
      case 'habits': {
        const habits = await prisma.habit.findMany({
          select: {
            id: true,
            name: true,
            frequency: true,
            habitType: true,
            category: true,
            isActive: true,
            isArchived: true,
            currentStreak: true,
            longestStreak: true,
            totalCompletions: true,
            createdAt: true,
            user: { select: { name: true, email: true } },
          },
          orderBy: { createdAt: 'desc' },
        });
        return {
          headers: [
            'ID',
            'Name',
            'User',
            'Email',
            'Frequency',
            'Type',
            'Category',
            'Active',
            'Archived',
            'Current Streak',
            'Longest Streak',
            'Total Completions',
            'Created',
          ],
          rows: habits.map((h) => [
            h.id,
            h.name,
            h.user.name,
            h.user.email,
            h.frequency,
            h.habitType,
            h.category || '',
            h.isActive ? 'Yes' : 'No',
            h.isArchived ? 'Yes' : 'No',
            h.currentStreak,
            h.longestStreak,
            h.totalCompletions,
            h.createdAt.toISOString(),
          ]),
        };
      }
      case 'logs': {
        const logs = await prisma.habitLog.findMany({
          select: {
            id: true,
            date: true,
            completed: true,
            value: true,
            notes: true,
            createdAt: true,
            habit: { select: { name: true } },
            user: { select: { name: true, email: true } },
          },
          orderBy: { date: 'desc' },
          take: 10000,
        });
        return {
          headers: [
            'ID',
            'Date',
            'Habit',
            'User',
            'Email',
            'Completed',
            'Value',
            'Notes',
            'Created',
          ],
          rows: logs.map((l) => [
            l.id,
            l.date.toISOString().split('T')[0],
            l.habit.name,
            l.user.name,
            l.user.email,
            l.completed ? 'Yes' : 'No',
            l.value ?? '',
            l.notes || '',
            l.createdAt.toISOString(),
          ]),
        };
      }
    }
  }

  // ─── Session Management ──────────────────────────────────────────

  async getActiveSessions() {
    const sessions = await prisma.refreshToken.findMany({
      where: { expiresAt: { gt: new Date() } },
      select: {
        id: true,
        createdAt: true,
        expiresAt: true,
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return sessions;
  }

  async revokeSession(tokenId: string) {
    const token = await prisma.refreshToken.findUnique({ where: { id: tokenId } });
    if (!token) throw new NotFoundError('Session', tokenId);

    await prisma.refreshToken.delete({ where: { id: tokenId } });
  }

  async revokeAllUserSessions(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError('User', userId);

    const result = await prisma.refreshToken.deleteMany({ where: { userId } });
    return result.count;
  }
}

export const adminService = new AdminService();
