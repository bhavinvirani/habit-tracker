import React from 'react';
import { Target, Plus, Sparkles, ArrowRight, Zap, BookOpen, Coffee } from 'lucide-react';
import { SUGGESTED_HABITS } from '../constants/habits';

interface EmptyStateProps {
  type: 'habits' | 'books' | 'challenges' | 'analytics' | 'dashboard';
  onAction?: () => void;
  actionLabel?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ type, onAction, actionLabel }) => {
  if (type === 'habits') {
    return (
      <div className="text-center py-12">
        <div className="mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary-500/[0.12] flex items-center justify-center mx-auto mb-4">
            <Sparkles size={32} className="text-primary-400" />
          </div>
          <h2 className="text-xl font-semibold text-dark-100 mb-2">Start Your Journey</h2>
          <p className="text-sm text-dark-500 max-w-md mx-auto">
            Build better habits, one day at a time. Create your first habit to get started!
          </p>
        </div>

        <div className="mb-8">
          <h3 className="text-xs font-medium text-dark-600 uppercase tracking-wider mb-4">
            Popular habits to try
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 max-w-2xl mx-auto">
            {SUGGESTED_HABITS.map((habit) => {
              const Icon = habit.icon;
              return (
                <button
                  key={habit.name}
                  onClick={onAction}
                  className="group p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.05] transition-all text-left"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${habit.color}14` }}
                    >
                      <Icon size={18} style={{ color: habit.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-dark-200 truncate">{habit.name}</p>
                      <p className="text-[11px] text-dark-600">{habit.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-dark-600">{habit.category}</span>
                    <ArrowRight
                      size={12}
                      className="text-dark-700 group-hover:text-primary-400 transition-colors"
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <button onClick={onAction} className="btn btn-primary">
          <Plus size={16} />
          {actionLabel || 'Create Your First Habit'}
        </button>

        <div className="mt-10 p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] max-w-lg mx-auto">
          <h4 className="text-sm font-medium text-dark-200 mb-3 flex items-center gap-2">
            <Zap size={14} className="text-accent-yellow" />
            Pro Tips for Success
          </h4>
          <ul className="text-xs text-dark-500 flex flex-col gap-2 text-left">
            <li className="flex items-start gap-2">
              <span className="text-primary-500 mt-0.5">-</span>
              Start with just 2-3 habits to avoid overwhelm
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-500 mt-0.5">-</span>
              Stack new habits with existing routines
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-500 mt-0.5">-</span>
              Focus on consistency, not perfection
            </li>
          </ul>
        </div>
      </div>
    );
  }

  if (type === 'books') {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-2xl bg-accent-purple/[0.12] flex items-center justify-center mx-auto mb-4">
          <BookOpen size={32} className="text-accent-purple" />
        </div>
        <h2 className="text-xl font-semibold text-dark-100 mb-2">Track Your Reading</h2>
        <p className="text-sm text-dark-500 max-w-md mx-auto mb-6">
          Add books to your reading list and track your progress page by page.
        </p>
        <button onClick={onAction} className="btn btn-primary">
          <Plus size={16} />
          {actionLabel || 'Add Your First Book'}
        </button>
      </div>
    );
  }

  if (type === 'challenges') {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-2xl bg-accent-yellow/[0.12] flex items-center justify-center mx-auto mb-4">
          <Target size={32} className="text-accent-yellow" />
        </div>
        <h2 className="text-xl font-semibold text-dark-100 mb-2">Challenge Yourself</h2>
        <p className="text-sm text-dark-500 max-w-md mx-auto mb-6">
          Create challenges to push your limits and build lasting habits.
        </p>
        <button onClick={onAction} className="btn btn-primary">
          <Plus size={16} />
          {actionLabel || 'Create a Challenge'}
        </button>
      </div>
    );
  }

  if (type === 'analytics') {
    return (
      <div className="text-center py-12">
        <div className="w-14 h-14 rounded-xl bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
          <Target size={24} className="text-dark-600" />
        </div>
        <h2 className="text-lg font-semibold text-dark-200 mb-2">No Data Yet</h2>
        <p className="text-sm text-dark-500 max-w-md mx-auto">
          Start tracking your habits to see detailed analytics and insights.
        </p>
      </div>
    );
  }

  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 rounded-2xl bg-primary-500/[0.12] flex items-center justify-center mx-auto mb-4">
        <Coffee size={32} className="text-primary-400" />
      </div>
      <h2 className="text-xl font-semibold text-dark-100 mb-2">Welcome to Habit Tracker!</h2>
      <p className="text-sm text-dark-500 max-w-md mx-auto mb-6">
        Your journey to better habits starts here. Create your first habit to begin.
      </p>
      <button onClick={onAction} className="btn btn-primary">
        <Plus size={16} />
        {actionLabel || 'Get Started'}
      </button>
    </div>
  );
};

export default EmptyState;
