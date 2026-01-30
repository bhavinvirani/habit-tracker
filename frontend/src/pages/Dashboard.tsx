import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Flame, TrendingUp, Calendar, Loader2, Plus, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { trackingApi, analyticsApi } from '../services/habits';
import { format } from 'date-fns';
import clsx from 'clsx';

const Dashboard: React.FC = () => {
  const queryClient = useQueryClient();

  // Fetch today's habits
  const { data: todayData, isLoading: loadingToday } = useQuery({
    queryKey: ['today'],
    queryFn: trackingApi.getToday,
  });

  // Fetch overview stats
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['overview'],
    queryFn: analyticsApi.getOverview,
  });

  // Check-in mutation for habits with target values (increments value)
  const checkInMutation = useMutation({
    mutationFn: ({
      habitId,
      value,
      completed,
    }: {
      habitId: string;
      value?: number;
      completed?: boolean;
    }) => trackingApi.checkIn(habitId, { value, completed }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['today'] });
      queryClient.invalidateQueries({ queryKey: ['overview'] });
      if (variables.completed) {
        toast.success('Habit completed! 🎉');
      } else {
        toast.success('Progress updated! 💪');
      }
    },
    onError: () => {
      toast.error('Failed to check in');
    },
  });

  // Undo mutation
  const undoMutation = useMutation({
    mutationFn: (habitId: string) => trackingApi.undo(habitId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['today'] });
      queryClient.invalidateQueries({ queryKey: ['overview'] });
      toast.success('Check-in undone');
    },
    onError: () => {
      toast.error('Failed to undo check-in');
    },
  });

  // Handle habit click - increment for numeric habits, toggle for boolean
  const handleHabitClick = (habit: {
    id: string;
    isCompleted: boolean;
    targetValue: number | null;
    logValue: number | null;
    habitType: string;
  }) => {
    const hasGoal = habit.targetValue && habit.targetValue > 0;
    const currentValue = habit.logValue || 0;
    const targetValue = habit.targetValue || 1;
    const isFullyComplete = habit.isCompleted || (hasGoal && currentValue >= targetValue);

    if (isFullyComplete) {
      // Undo the check-in
      undoMutation.mutate(habit.id);
    } else if (hasGoal && habit.habitType !== 'BOOLEAN') {
      // Increment value by 1
      const newValue = currentValue + 1;
      const willComplete = newValue >= targetValue;
      checkInMutation.mutate({
        habitId: habit.id,
        value: newValue,
        completed: willComplete,
      });
    } else {
      // Boolean habit - just mark complete
      checkInMutation.mutate({
        habitId: habit.id,
        completed: true,
      });
    }
  };

  const isLoading = loadingToday || loadingStats;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  const habits = todayData?.habits || [];
  const completedCount = todayData?.summary?.completed || 0;
  const totalCount = todayData?.summary?.total || 0;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-dark-400 mt-1">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>
        <Link to="/habits" className="btn btn-primary">
          <Plus size={18} />
          New Habit
        </Link>
      </div>

      {/* Today's Progress Ring + Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Progress Ring */}
        <div className="lg:col-span-2 card flex flex-col items-center justify-center py-8">
          <div className="relative w-40 h-40">
            {/* Background circle */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                className="text-dark-700"
              />
              {/* Progress circle */}
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="url(#progressGradient)"
                strokeWidth="12"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 70}
                strokeDashoffset={2 * Math.PI * 70 * (1 - percentage / 100)}
                className="transition-all duration-700 ease-out"
              />
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#22c55e" />
                </linearGradient>
              </defs>
            </svg>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-white">{percentage}%</span>
              <span className="text-sm text-dark-400">complete</span>
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className="text-lg font-semibold text-white">Today's Progress</p>
            <p className="text-dark-400">
              {completedCount} of {totalCount} habits done
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <span className="stat-label">Current Streak</span>
              <Flame className="w-5 h-5 text-accent-orange" />
            </div>
            <p className="stat-value text-accent-orange">{stats?.currentBestStreak || 0}</p>
            <p className="text-sm text-dark-500">days in a row</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <span className="stat-label">Longest Streak</span>
              <TrendingUp className="w-5 h-5 text-accent-green" />
            </div>
            <p className="stat-value text-accent-green">{stats?.longestEverStreak || 0}</p>
            <p className="text-sm text-dark-500">personal best</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <span className="stat-label">Avg Completion</span>
              <Calendar className="w-5 h-5 text-accent-purple" />
            </div>
            <p className="stat-value text-accent-purple">{stats?.monthlyCompletionRate || 0}%</p>
            <p className="text-sm text-dark-500">last 30 days</p>
          </div>
        </div>
      </div>

      {/* Today's Habits */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Today's Habits</h2>
          {totalCount > 0 && (
            <div className="flex items-center gap-2">
              <div className="h-2 w-32 bg-dark-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-500 to-primary-400 transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-dark-400">{percentage}%</span>
            </div>
          )}
        </div>

        {habits.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-dark-800 mb-4">
              <Sparkles className="w-8 h-8 text-dark-500" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No habits yet</h3>
            <p className="text-dark-400 mb-4">Create your first habit to start tracking</p>
            <Link to="/habits" className="btn btn-primary">
              <Plus size={18} />
              Create Habit
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {habits.map((habit) => {
              const hasGoal = habit.targetValue && habit.targetValue > 0;
              const currentValue = habit.logValue || 0;
              const targetValue = habit.targetValue || 1;
              const goalProgress = hasGoal ? Math.min((currentValue / targetValue) * 100, 100) : 0;
              const isFullyComplete = habit.isCompleted || (hasGoal && currentValue >= targetValue);

              return (
                <div
                  key={habit.id}
                  className={clsx(
                    'relative flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer group',
                    isFullyComplete
                      ? 'bg-gradient-to-r from-accent-green/10 to-dark-800/50 border-accent-green/30'
                      : 'bg-dark-800 border-dark-600 hover:border-dark-500'
                  )}
                  onClick={() => handleHabitClick(habit)}
                >
                  {/* Completed indicator */}
                  {isFullyComplete && (
                    <div className="absolute -top-2 -right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent-green text-dark-900 text-xs font-bold shadow-lg">
                      <CheckCircle2 size={12} />
                      Done
                    </div>
                  )}

                  <button
                    className={clsx(
                      'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all',
                      isFullyComplete
                        ? 'text-white ring-2 ring-accent-green/50 ring-offset-2 ring-offset-dark-800'
                        : 'text-dark-500 hover:text-dark-300 group-hover:scale-110'
                    )}
                    style={{
                      backgroundColor: isFullyComplete ? habit.color : 'transparent',
                      borderWidth: isFullyComplete ? 0 : 2,
                      borderColor: habit.color,
                    }}
                  >
                    {isFullyComplete && <CheckCircle2 size={18} />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3
                        className={clsx(
                          'font-medium transition-colors',
                          isFullyComplete ? 'text-accent-green' : 'text-white'
                        )}
                      >
                        {habit.icon && <span className="mr-1">{habit.icon}</span>}
                        {habit.name}
                      </h3>
                      {isFullyComplete && (
                        <span className="text-xs text-dark-500">(click to undo)</span>
                      )}
                    </div>

                    {/* Goal progress */}
                    {hasGoal && (
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex-1 h-2 bg-dark-700 rounded-full overflow-hidden max-w-[120px]">
                          <div
                            className={clsx(
                              'h-full rounded-full transition-all duration-300',
                              isFullyComplete ? 'bg-accent-green' : 'bg-primary-500'
                            )}
                            style={{ width: `${goalProgress}%` }}
                          />
                        </div>
                        <span
                          className={clsx(
                            'text-xs font-medium',
                            isFullyComplete ? 'text-accent-green' : 'text-dark-400'
                          )}
                        >
                          {currentValue}/{targetValue} {habit.unit || ''}
                        </span>
                        {!isFullyComplete && (
                          <span className="text-xs text-dark-500">
                            ({targetValue - currentValue} left)
                          </span>
                        )}
                      </div>
                    )}

                    {!hasGoal && habit.description && (
                      <p className="text-sm text-dark-500 truncate">{habit.description}</p>
                    )}
                  </div>

                  {habit.currentStreak > 0 && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-orange/10">
                      <Flame size={14} className="text-accent-orange" />
                      <span className="text-sm font-medium text-accent-orange">
                        {habit.currentStreak}
                      </span>
                    </div>
                  )}

                  <div
                    className={clsx(
                      'w-1.5 h-10 rounded-full transition-all',
                      isFullyComplete && 'opacity-50'
                    )}
                    style={{ backgroundColor: habit.color }}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
