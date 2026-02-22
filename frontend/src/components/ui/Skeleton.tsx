import React from 'react';
import clsx from 'clsx';

interface SkeletonProps {
  className?: string;
  /** Render as a circle */
  circle?: boolean;
  /** Width (CSS value) */
  width?: string | number;
  /** Height (CSS value) */
  height?: string | number;
}

const Skeleton: React.FC<SkeletonProps> = ({ className, circle, width, height }) => (
  <div
    className={clsx('animate-pulse bg-white/[0.06] rounded', circle && 'rounded-full', className)}
    style={{ width, height }}
  />
);

/** Skeleton shaped like a stat card */
export const StatCardSkeleton: React.FC = () => (
  <div className="bg-dark-900 border border-white/[0.06] rounded-xl p-4">
    <div className="flex items-center gap-3">
      <Skeleton circle className="w-9 h-9" />
      <div className="flex-1 flex flex-col gap-2">
        <Skeleton className="h-5 w-14 rounded-md" />
        <Skeleton className="h-3 w-20 rounded-md" />
      </div>
    </div>
  </div>
);

/** Skeleton for a single habit row */
export const HabitRowSkeleton: React.FC = () => (
  <div className="flex items-center gap-4 p-4 rounded-xl bg-dark-900 border border-white/[0.06]">
    <Skeleton circle className="w-10 h-10" />
    <div className="flex-1 flex flex-col gap-2">
      <Skeleton className="h-4 w-36 rounded-md" />
      <Skeleton className="h-3 w-20 rounded-md" />
    </div>
    <div className="hidden sm:flex items-center gap-4">
      <Skeleton className="h-7 w-10 rounded-md" />
      <Skeleton className="h-7 w-10 rounded-md" />
      <Skeleton className="h-7 w-10 rounded-md" />
    </div>
  </div>
);

/** Skeleton for a chart area */
export const ChartSkeleton: React.FC<{ height?: string }> = ({ height = 'h-40' }) => (
  <div className="bg-dark-900 border border-white/[0.06] rounded-xl p-5">
    <div className="flex items-center justify-between mb-4">
      <Skeleton className="h-4 w-32 rounded-md" />
      <Skeleton className="h-4 w-16 rounded-md" />
    </div>
    <div className={clsx(height, 'flex items-end gap-2 px-4')}>
      {Array.from({ length: 7 }).map((_, i) => (
        <Skeleton key={i} className="flex-1 rounded-t-md" height={`${30 + Math.random() * 60}%`} />
      ))}
    </div>
  </div>
);

/** Skeleton for a book card */
export const BookCardSkeleton: React.FC = () => (
  <div className="bg-dark-900 border border-white/[0.06] rounded-xl p-4 flex flex-col gap-3">
    <div className="flex gap-3">
      <Skeleton className="w-14 h-20 rounded-lg" />
      <div className="flex-1 flex flex-col gap-2">
        <Skeleton className="h-4 w-3/4 rounded-md" />
        <Skeleton className="h-3 w-1/2 rounded-md" />
        <Skeleton className="h-1.5 w-full rounded-full mt-2" />
      </div>
    </div>
  </div>
);

/** Skeleton for a challenge card */
export const ChallengeCardSkeleton: React.FC = () => (
  <div className="bg-dark-900 border border-white/[0.06] rounded-xl p-4 flex flex-col gap-3">
    <div className="flex items-center justify-between">
      <Skeleton className="h-4 w-36 rounded-md" />
      <Skeleton className="h-5 w-14 rounded-full" />
    </div>
    <Skeleton className="h-3 w-full rounded-md" />
    <div className="flex items-center gap-4 mt-1">
      <Skeleton circle className="w-14 h-14" />
      <div className="flex-1 flex flex-col gap-2">
        <Skeleton className="h-3 w-20 rounded-md" />
        <Skeleton className="h-3 w-28 rounded-md" />
      </div>
    </div>
  </div>
);

/** Full-page skeleton for Dashboard */
export const DashboardSkeleton: React.FC = () => (
  <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading dashboard">
    <div className="flex items-center justify-between">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-36 rounded-md" />
        <Skeleton className="h-4 w-48 rounded-md" />
      </div>
      <Skeleton className="h-9 w-24 rounded-lg" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-dark-900 border border-white/[0.06] rounded-xl flex flex-col items-center justify-center py-8">
        <Skeleton circle className="w-36 h-36" />
        <Skeleton className="h-4 w-28 rounded-md mt-4" />
        <Skeleton className="h-3 w-20 rounded-md mt-2" />
      </div>
      <div className="bg-dark-900 border border-white/[0.06] rounded-xl p-5 flex flex-col gap-4">
        <Skeleton className="h-3 w-20 rounded-md" />
        <div className="grid grid-cols-3 gap-3">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      </div>
    </div>
    <div className="bg-dark-900 border border-white/[0.06] rounded-xl p-5">
      <Skeleton className="h-4 w-28 rounded-md mb-4" />
      <div className="flex gap-1.5">
        {Array.from({ length: 14 }).map((_, i) => (
          <div key={i} className="flex-1 flex flex-col gap-1">
            <Skeleton className="h-3 w-full rounded-md" />
            <Skeleton className="aspect-square w-full rounded-md" />
          </div>
        ))}
      </div>
    </div>
    <div className="bg-dark-900 border border-white/[0.06] rounded-xl p-5 flex flex-col gap-3">
      <Skeleton className="h-4 w-24 rounded-md" />
      <HabitRowSkeleton />
      <HabitRowSkeleton />
      <HabitRowSkeleton />
    </div>
  </div>
);

/** Full-page skeleton for Habits */
export const HabitsSkeleton: React.FC = () => (
  <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading habits">
    <div className="flex items-center justify-between">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-32 rounded-md" />
        <Skeleton className="h-4 w-24 rounded-md" />
      </div>
      <Skeleton className="h-9 w-24 rounded-lg" />
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
    </div>
    <div className="bg-dark-900 border border-white/[0.06] rounded-xl p-4">
      <div className="flex flex-wrap items-center gap-3">
        <Skeleton className="h-9 flex-1 min-w-[180px] rounded-lg" />
        <Skeleton className="h-9 w-32 rounded-lg" />
        <Skeleton className="h-9 w-32 rounded-lg" />
        <Skeleton className="h-9 w-16 rounded-lg" />
      </div>
    </div>
    <div className="flex flex-col gap-2.5">
      <HabitRowSkeleton />
      <HabitRowSkeleton />
      <HabitRowSkeleton />
      <HabitRowSkeleton />
      <HabitRowSkeleton />
    </div>
  </div>
);

/** Full-page skeleton for Analytics */
export const AnalyticsSkeleton: React.FC = () => (
  <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading analytics">
    <div className="flex flex-col gap-2">
      <Skeleton className="h-7 w-28 rounded-md" />
      <Skeleton className="h-4 w-44 rounded-md" />
    </div>
    <div className="grid lg:grid-cols-5 gap-6">
      <div className="lg:col-span-3 bg-dark-900 border border-white/[0.06] rounded-xl p-5">
        <div className="flex items-center gap-6">
          <Skeleton circle className="w-28 h-28 shrink-0" />
          <div className="flex-1 flex flex-col gap-3">
            <Skeleton className="h-5 w-36 rounded-md" />
            <Skeleton className="h-1.5 w-full rounded-full" />
            <Skeleton className="h-1.5 w-full rounded-full" />
            <Skeleton className="h-1.5 w-full rounded-full" />
          </div>
        </div>
      </div>
      <div className="lg:col-span-2">
        <Skeleton className="h-full min-h-[100px] w-full rounded-xl" />
      </div>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
    </div>
    <ChartSkeleton />
    <div className="grid lg:grid-cols-2 gap-6">
      <ChartSkeleton />
      <ChartSkeleton />
    </div>
  </div>
);

/** Full-page skeleton for Books */
export const BooksSkeleton: React.FC = () => (
  <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading books">
    <div className="flex items-center justify-between">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-32 rounded-md" />
        <Skeleton className="h-4 w-36 rounded-md" />
      </div>
      <Skeleton className="h-9 w-24 rounded-lg" />
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <BookCardSkeleton />
      <BookCardSkeleton />
      <BookCardSkeleton />
      <BookCardSkeleton />
      <BookCardSkeleton />
      <BookCardSkeleton />
    </div>
  </div>
);

/** Full-page skeleton for Challenges */
export const ChallengesSkeleton: React.FC = () => (
  <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading challenges">
    <div className="flex items-center justify-between">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-32 rounded-md" />
        <Skeleton className="h-4 w-40 rounded-md" />
      </div>
      <Skeleton className="h-9 w-28 rounded-lg" />
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <ChallengeCardSkeleton />
      <ChallengeCardSkeleton />
      <ChallengeCardSkeleton />
      <ChallengeCardSkeleton />
    </div>
  </div>
);

export default Skeleton;
