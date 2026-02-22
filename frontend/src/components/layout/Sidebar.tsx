import React from 'react';
import { NavLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  LayoutDashboard,
  CheckSquare,
  BarChart3,
  User,
  Calendar,
  BookOpen,
  Trophy,
  Flame,
  Target,
  TrendingUp,
  HelpCircle,
  X,
  MessageCircle,
  Shield,
} from 'lucide-react';
import { analyticsApi, trackingApi } from '../../services/habits';
import { useAuthStore } from '../../store/authStore';
import clsx from 'clsx';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuthStore();

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['overview'],
    queryFn: analyticsApi.getOverview,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch today's habits
  const { data: todayData } = useQuery({
    queryKey: ['today'],
    queryFn: trackingApi.getToday,
    staleTime: 60 * 1000,
  });

  const navItems = [
    {
      to: '/',
      icon: LayoutDashboard,
      label: 'Dashboard',
      badge: null,
    },
    {
      to: '/habits',
      icon: CheckSquare,
      label: 'Habits',
      badge: stats?.activeHabits ? String(stats.activeHabits) : null,
    },
    {
      to: '/calendar',
      icon: Calendar,
      label: 'Calendar',
      badge: null,
    },
    {
      to: '/analytics',
      icon: BarChart3,
      label: 'Analytics',
      badge: null,
    },
    {
      to: '/books',
      icon: BookOpen,
      label: 'Books',
      badge: null,
    },
    {
      to: '/challenges',
      icon: Trophy,
      label: 'Challenges',
      badge: null,
    },
    {
      to: '/profile',
      icon: User,
      label: 'Profile',
      badge: null,
    },
    ...(user?.isAdmin
      ? [
          {
            to: '/admin',
            icon: Shield,
            label: 'Admin',
            badge: null,
          },
        ]
      : []),
  ];

  const todayProgress = todayData?.summary
    ? Math.round((todayData.summary.completed / Math.max(todayData.summary.total, 1)) * 100)
    : 0;

  const sidebarContent = (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
        <span className="text-sm font-semibold text-dark-100">Menu</span>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-dark-500 hover:text-dark-200 hover:bg-white/[0.06] transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Today's Progress Card */}
      <div className="p-4">
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-dark-500 uppercase tracking-wider">Today</span>
            <span className="text-xs font-semibold text-primary-400">{todayProgress}%</span>
          </div>
          <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-primary-500 rounded-full transition-all duration-500"
              style={{ width: `${todayProgress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-dark-500">
              {todayData?.summary?.completed || 0} of {todayData?.summary?.total || 0} habits
            </span>
            {todayData?.summary?.remaining ? (
              <span className="text-accent-orange">{todayData.summary.remaining} left</span>
            ) : todayData?.summary?.total ? (
              <span className="text-accent-green">All done!</span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 overflow-y-auto">
        <ul className="flex flex-col gap-0.5">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/'}
                onClick={onClose}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 text-[13px] relative group',
                    isActive
                      ? 'bg-white/[0.08] text-dark-100 font-medium'
                      : 'text-dark-500 hover:bg-white/[0.04] hover:text-dark-300'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-primary-500 rounded-r-full" />
                    )}
                    <item.icon
                      size={18}
                      strokeWidth={isActive ? 2 : 1.5}
                      className="transition-colors shrink-0"
                    />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-[10px] font-medium rounded-md bg-white/[0.06] text-dark-400">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Stats Footer */}
      <div className="p-4 border-t border-white/[0.06]">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-1.5 mb-3">
          <div className="text-center p-2 rounded-lg bg-white/[0.03]">
            <div className="flex items-center justify-center gap-1 text-accent-orange mb-0.5">
              <Flame size={13} />
              <span className="font-semibold text-xs">{stats?.currentBestStreak || 0}</span>
            </div>
            <p className="text-[10px] text-dark-600">Streak</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-white/[0.03]">
            <div className="flex items-center justify-center gap-1 text-accent-green mb-0.5">
              <Target size={13} />
              <span className="font-semibold text-xs">{stats?.monthlyCompletionRate || 0}%</span>
            </div>
            <p className="text-[10px] text-dark-600">Month</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-white/[0.03]">
            <div className="flex items-center justify-center gap-1 text-primary-400 mb-0.5">
              <TrendingUp size={13} />
              <span className="font-semibold text-xs">{stats?.totalCompletions || 0}</span>
            </div>
            <p className="text-[10px] text-dark-600">Total</p>
          </div>
        </div>

        {/* Help & Integration Links */}
        <div className="flex flex-col gap-0.5">
          <NavLink
            to="/docs/integration"
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-[13px]',
                isActive
                  ? 'bg-white/[0.08] text-primary-400'
                  : 'text-dark-600 hover:bg-white/[0.04] hover:text-dark-400'
              )
            }
          >
            <MessageCircle size={16} />
            <span>OpenClaw Integration</span>
          </NavLink>
          <NavLink
            to="/help"
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-[13px]',
                isActive
                  ? 'bg-white/[0.08] text-primary-400'
                  : 'text-dark-600 hover:bg-white/[0.04] hover:text-dark-400'
              )
            }
          >
            <HelpCircle size={16} />
            <span>Help & Support</span>
          </NavLink>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={clsx(
          'lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-dark-950 border-r border-white/[0.06] z-50 flex flex-col transition-transform duration-300',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-16 bottom-0 w-64 bg-dark-950/80 backdrop-blur-xl border-r border-white/[0.06] flex-col">
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;
