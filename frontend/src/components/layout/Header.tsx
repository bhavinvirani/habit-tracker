import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Sparkles,
  Flame,
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Trophy,
  Target,
  Menu,
  X,
  Keyboard,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { analyticsApi } from '../../services/habits';
import clsx from 'clsx';

interface HeaderProps {
  onMobileMenuToggle: () => void;
  isMobileMenuOpen: boolean;
  onShowShortcuts?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  onMobileMenuToggle,
  isMobileMenuOpen,
  onShowShortcuts,
}) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Fetch stats for streak display
  const { data: stats } = useQuery({
    queryKey: ['overview'],
    queryFn: analyticsApi.getOverview,
    staleTime: 5 * 60 * 1000,
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      const { api } = await import('../../services/api');
      await api.post('/auth/logout');
    } catch {
      // Continue logout even if API call fails
    }
    logout();
    navigate('/login');
  };

  // Calculate level from total completions
  const level = Math.floor((stats?.totalCompletions || 0) / 50) + 1;

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-dark-950/80 backdrop-blur-xl border-b border-white/[0.06] z-50">
      <div className="h-full px-4 lg:px-6 flex items-center justify-between gap-4">
        {/* Left: Logo & Mobile Menu */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu Toggle */}
          <button
            onClick={onMobileMenuToggle}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
            className="lg:hidden p-1.5 rounded-lg text-dark-500 hover:text-dark-200 hover:bg-white/[0.06] transition-colors"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center group-hover:bg-primary-500 transition-colors">
              <Sparkles size={16} className="text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-semibold text-dark-100 leading-tight tracking-tight">Habit Tracker</h1>
              <p className="text-[10px] text-dark-600 leading-tight">Build better habits</p>
            </div>
          </Link>
        </div>

        {/* Right: Stats, Notifications, Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Streak Badge */}
          {stats && stats.currentBestStreak > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-accent-orange/10 border border-accent-orange/[0.15]">
              <Flame size={14} className="text-accent-orange" />
              <span className="text-xs font-semibold text-accent-orange">
                {stats.currentBestStreak}
              </span>
            </div>
          )}

          {/* Today's Progress Mini */}
          {stats && (
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
              <Target size={14} className="text-primary-400" />
              <span className="text-xs text-dark-400">
                <span className="font-semibold text-dark-200">{stats.completedToday}</span>
                <span className="text-dark-600">/{stats.totalToday}</span>
              </span>
            </div>
          )}

          {/* Keyboard Shortcuts Button */}
          <button
            onClick={onShowShortcuts}
            className="hidden sm:flex items-center gap-1.5 p-1.5 rounded-lg text-dark-600 hover:text-dark-300 hover:bg-white/[0.06] transition-colors"
            title="Keyboard Shortcuts (?)"
          >
            <Keyboard size={18} />
            <kbd className="hidden lg:inline-flex px-1.5 py-0.5 text-[10px] font-mono bg-white/[0.04] border border-white/[0.08] rounded text-dark-600">
              ?
            </kbd>
          </button>

          {/* Notifications */}
          <button
            aria-label="Notifications"
            className="relative p-1.5 rounded-lg text-dark-600 hover:text-dark-300 hover:bg-white/[0.06] transition-colors"
          >
            <Bell size={18} />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-accent-red rounded-full" />
          </button>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              aria-label="Profile menu"
              aria-expanded={isProfileOpen}
              aria-haspopup="true"
              className={clsx(
                'flex items-center gap-2 p-1 pr-2.5 rounded-lg transition-all duration-150',
                isProfileOpen ? 'bg-white/[0.08]' : 'hover:bg-white/[0.04]'
              )}
            >
              {/* Avatar */}
              <div className="relative">
                <div className="w-7 h-7 rounded-lg bg-primary-600 flex items-center justify-center">
                  <span className="text-xs font-semibold text-white">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                {/* Level badge */}
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-accent-yellow flex items-center justify-center">
                  <span className="text-[7px] font-bold text-dark-950">{level}</span>
                </div>
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-medium text-dark-200 leading-tight">
                  {user?.name || 'User'}
                </p>
                <p className="text-[10px] text-dark-600 leading-tight">Level {level}</p>
              </div>
              <ChevronDown
                size={14}
                className={clsx(
                  'hidden sm:block text-dark-600 transition-transform duration-150',
                  isProfileOpen && 'rotate-180'
                )}
              />
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full mt-2 w-56 bg-dark-900 border border-white/[0.08] rounded-xl shadow-elevated overflow-hidden animate-scale-in"
              >
                {/* User Info */}
                <div className="px-4 py-3 border-b border-white/[0.06]">
                  <p className="text-sm font-medium text-dark-100">{user?.name}</p>
                  <p className="text-xs text-dark-500 truncate">{user?.email}</p>
                </div>

                {/* Quick Stats */}
                <div className="p-2.5 border-b border-white/[0.06] grid grid-cols-2 gap-1.5">
                  <div className="text-center p-2 rounded-lg bg-white/[0.03]">
                    <div className="flex items-center justify-center gap-1 text-accent-orange">
                      <Flame size={13} />
                      <span className="font-semibold text-xs">{stats?.currentBestStreak || 0}</span>
                    </div>
                    <p className="text-[10px] text-dark-600">Streak</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-white/[0.03]">
                    <div className="flex items-center justify-center gap-1 text-accent-yellow">
                      <Trophy size={13} />
                      <span className="font-semibold text-xs">{stats?.longestEverStreak || 0}</span>
                    </div>
                    <p className="text-[10px] text-dark-600">Best</p>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="p-1.5">
                  <Link
                    role="menuitem"
                    to="/profile"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-dark-400 hover:bg-white/[0.06] hover:text-dark-200 transition-colors text-sm"
                  >
                    <User size={16} />
                    <span>Profile</span>
                  </Link>
                  <Link
                    role="menuitem"
                    to="/profile?tab=settings"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-dark-400 hover:bg-white/[0.06] hover:text-dark-200 transition-colors text-sm"
                  >
                    <Settings size={16} />
                    <span>Settings</span>
                  </Link>
                  <div className="my-1 border-t border-white/[0.06]" />
                  <button
                    role="menuitem"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-accent-red/80 hover:bg-accent-red/10 hover:text-accent-red transition-colors text-sm"
                  >
                    <LogOut size={16} />
                    <span>Log out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
