import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';
import {
  Settings,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  Loader2,
  Search,
  ChevronDown,
  ChevronRight,
  FileText,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { featuresApi } from '../services/features';
import { reportsApi } from '../services/reports';
import { useAuthStore } from '../store/authStore';
import { useFeatureFlags } from '../contexts/FeatureFlagContext';
import { FeatureFlag } from '../types';
import { PageHeader } from '../components/ui';
import { DashboardSkeleton } from '../components/ui/Skeleton';

const Admin: React.FC = () => {
  const { user } = useAuthStore();
  const { isEnabled, refetch: refetchFeatureFlags } = useFeatureFlags();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  // Fetch all feature flags (admin endpoint)
  const {
    data: flags,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['admin-features'],
    queryFn: featuresApi.getAllFlags,
    enabled: !!user?.isAdmin,
  });

  // Toggle flag mutation with optimistic UI
  const toggleMutation = useMutation({
    mutationFn: ({ key, enabled }: { key: string; enabled: boolean }) =>
      featuresApi.updateFlag(key, { enabled }),
    onMutate: async ({ key, enabled }) => {
      await queryClient.cancelQueries({ queryKey: ['admin-features'] });
      const previous = queryClient.getQueryData<FeatureFlag[]>(['admin-features']);
      if (previous) {
        queryClient.setQueryData<FeatureFlag[]>(
          ['admin-features'],
          previous.map((flag) => (flag.key === key ? { ...flag, enabled } : flag))
        );
      }
      return { previous };
    },
    onSuccess: (_data, { key, enabled }) => {
      toast.success(`Flag "${key}" ${enabled ? 'enabled' : 'disabled'}`);
      refetchFeatureFlags();
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['admin-features'], context.previous);
      }
      toast.error('Failed to update feature flag');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-features'] });
    },
  });

  // Generate reports mutation
  const generateReportsMutation = useMutation({
    mutationFn: reportsApi.generateReports,
    onSuccess: (data) => {
      toast.success(
        `Reports generated: ${data.usersProcessed} users processed, ${data.usersSkipped} skipped`
      );
    },
    onError: () => {
      toast.error('Failed to generate reports');
    },
  });

  // Group flags by category
  const groupedFlags = useMemo(() => {
    if (!flags) return {};

    const filtered = flags.filter(
      (flag) =>
        flag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        flag.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (flag.description && flag.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return filtered.reduce<Record<string, FeatureFlag[]>>((acc, flag) => {
      const category = flag.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(flag);
      return acc;
    }, {});
  }, [flags, searchQuery]);

  const categoryNames = Object.keys(groupedFlags).sort();

  const toggleCategory = (category: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  // Redirect non-admins (after all hooks)
  if (!user?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title="Admin Dashboard"
        subtitle="Manage feature flags and generate reports"
        icon={Settings}
      />

      {/* AI Report Generation - only visible when ai_insights flag is enabled */}
      {isEnabled('ai_insights') && (
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">AI Weekly Reports</h2>
                <p className="text-sm text-dark-400">
                  Generate AI-powered weekly insight reports for all users
                </p>
              </div>
            </div>
            <button
              onClick={() => generateReportsMutation.mutate()}
              disabled={generateReportsMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {generateReportsMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  Generate Reports
                </>
              )}
            </button>
          </div>

          {/* Report generation results */}
          {generateReportsMutation.isSuccess && generateReportsMutation.data && (
            <div className="mt-4 p-4 rounded-lg bg-dark-800 border border-dark-700">
              <h3 className="text-sm font-medium text-white mb-2">Generation Results</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-dark-400">Users Processed</p>
                  <p className="text-lg font-semibold text-accent-green">
                    {generateReportsMutation.data.usersProcessed}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-dark-400">Users Skipped</p>
                  <p className="text-lg font-semibold text-dark-300">
                    {generateReportsMutation.data.usersSkipped}
                  </p>
                </div>
              </div>
              {generateReportsMutation.data.errors.length > 0 && (
                <div className="mt-3 pt-3 border-t border-dark-700">
                  <p className="text-xs text-red-400 font-medium mb-1">Errors:</p>
                  <ul className="space-y-1">
                    {generateReportsMutation.data.errors.map((error, i) => (
                      <li key={i} className="text-xs text-red-300">
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Feature Flags Manager */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Feature Flags</h2>
          <span className="text-sm text-dark-400">{flags?.length || 0} flags total</span>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
          <input
            type="text"
            placeholder="Search flags by name, key, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-dark-800 border border-dark-700 text-white placeholder-dark-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
          />
        </div>

        {isError && (
          <div className="card p-6 text-center">
            <p className="text-red-400">Failed to load feature flags. Please try again.</p>
          </div>
        )}

        {/* Grouped flags */}
        {categoryNames.length === 0 && !isError && (
          <div className="card p-6 text-center">
            <p className="text-dark-400">
              {searchQuery ? 'No flags match your search.' : 'No feature flags found.'}
            </p>
          </div>
        )}

        {categoryNames.map((category) => {
          const categoryFlags = groupedFlags[category];
          const isCollapsed = collapsedCategories.has(category);
          const enabledCount = categoryFlags.filter((f) => f.enabled).length;

          return (
            <div key={category} className="card p-0 overflow-hidden">
              {/* Category header */}
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between p-4 hover:bg-dark-700/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isCollapsed ? (
                    <ChevronRight className="w-4 h-4 text-dark-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-dark-400" />
                  )}
                  <h3 className="text-base font-semibold text-white capitalize">{category}</h3>
                  <span className="text-xs text-dark-400">
                    {enabledCount}/{categoryFlags.length} enabled
                  </span>
                </div>
              </button>

              {/* Flag list */}
              {!isCollapsed && (
                <div className="border-t border-dark-700">
                  {categoryFlags.map((flag, idx) => (
                    <div
                      key={flag.key}
                      className={`flex items-center justify-between p-4 ${
                        idx < categoryFlags.length - 1 ? 'border-b border-dark-700/50' : ''
                      } hover:bg-dark-700/20 transition-colors`}
                    >
                      <div className="flex-1 min-w-0 mr-4">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-medium text-white">{flag.name}</h4>
                          <code className="text-xs px-1.5 py-0.5 rounded bg-dark-700 text-dark-300">
                            {flag.key}
                          </code>
                        </div>
                        {flag.description && (
                          <p className="text-xs text-dark-400 mt-1 truncate">{flag.description}</p>
                        )}
                        <p className="text-xs text-dark-500 mt-1">
                          Updated {new Date(flag.updatedAt).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Toggle switch */}
                      <button
                        onClick={() =>
                          toggleMutation.mutate({ key: flag.key, enabled: !flag.enabled })
                        }
                        disabled={toggleMutation.isPending}
                        className="flex-shrink-0 transition-colors disabled:opacity-50"
                        aria-label={`Toggle ${flag.name}`}
                      >
                        {flag.enabled ? (
                          <ToggleRight className="w-10 h-10 text-accent-green" />
                        ) : (
                          <ToggleLeft className="w-10 h-10 text-dark-500 hover:text-dark-400" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Admin;
