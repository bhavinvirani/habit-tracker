import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create test user
  const hashedPassword = await bcrypt.hash('password123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      password: hashedPassword,
      name: 'Test User',
    },
  });

  console.log('✅ Created test user:', user.email);

  // Create sample habits
  const habits = await Promise.all([
    prisma.habit.upsert({
      where: { id: '1' },
      update: {},
      create: {
        id: '1',
        userId: user.id,
        name: 'Morning Exercise',
        description: 'Do 30 minutes of exercise every morning',
        frequency: 'DAILY',
        color: '#10b981',
        icon: '🏃',
        category: 'Health',
        goal: 30,
        isActive: true,
      },
    }),
    prisma.habit.upsert({
      where: { id: '2' },
      update: {},
      create: {
        id: '2',
        userId: user.id,
        name: 'Read Books',
        description: 'Read at least 20 pages daily',
        frequency: 'DAILY',
        color: '#f59e0b',
        icon: '📚',
        category: 'Learning',
        goal: 20,
        isActive: true,
      },
    }),
    prisma.habit.upsert({
      where: { id: '3' },
      update: {},
      create: {
        id: '3',
        userId: user.id,
        name: 'Meditation',
        description: 'Practice mindfulness meditation',
        frequency: 'DAILY',
        color: '#8b5cf6',
        icon: '🧘',
        category: 'Wellness',
        goal: 10,
        isActive: true,
      },
    }),
    prisma.habit.upsert({
      where: { id: '4' },
      update: {},
      create: {
        id: '4',
        userId: user.id,
        name: 'Weekly Planning',
        description: 'Plan the upcoming week',
        frequency: 'WEEKLY',
        color: '#3b82f6',
        icon: '📅',
        category: 'Productivity',
        isActive: true,
      },
    }),
  ]);

  console.log(`✅ Created ${habits.length} habits`);

  // Create some habit logs for the past 7 days
  const today = new Date();
  const logs = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    // Log for habit 1 (every day)
    logs.push(
      prisma.habitLog.upsert({
        where: {
          habitId_date: {
            habitId: '1',
            date,
          },
        },
        update: {},
        create: {
          habitId: '1',
          userId: user.id,
          date,
          completed: true,
          notes: i === 0 ? 'Felt great today!' : undefined,
        },
      })
    );

    // Log for habit 2 (skip some days)
    if (i % 2 === 0) {
      logs.push(
        prisma.habitLog.upsert({
          where: {
            habitId_date: {
              habitId: '2',
              date,
            },
          },
          update: {},
          create: {
            habitId: '2',
            userId: user.id,
            date,
            completed: true,
          },
        })
      );
    }

    // Log for habit 3 (most days)
    if (i < 5) {
      logs.push(
        prisma.habitLog.upsert({
          where: {
            habitId_date: {
              habitId: '3',
              date,
            },
          },
          update: {},
          create: {
            habitId: '3',
            userId: user.id,
            date,
            completed: true,
          },
        })
      );
    }
  }

  await Promise.all(logs);
  console.log(`✅ Created ${logs.length} habit logs`);

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
