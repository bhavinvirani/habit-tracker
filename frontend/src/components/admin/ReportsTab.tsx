import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { Sparkles, Loader2, FileText, AlertTriangle, ToggleLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { reportsApi } from '../../services/reports';
import { useFeatureFlags } from '../../contexts/FeatureFlagContext';
import { featuresApi } from '../../services/features';

const ReportsTab: React.FC = () => {
  const { isEnabled, isLoading: flagsLoading, refetch: refetchFlags } = useFeatureFlags();
  const aiEnabled = isEnabled('ai_insights');

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

  const enableFlagMutation = useMutation({
    mutationFn: () => featuresApi.updateFlag('ai_insights', { enabled: true }),
    onSuccess: async () => {
      await refetchFlags();
      toast.success('AI Insights feature enabled');
    },
    onError: () => {
      toast.error('Failed to enable feature flag');
    },
  });

  if (flagsLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-dark-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Feature flag warning */}
      {!aiEnabled && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-yellow-300">
                AI Insights feature is currently disabled
              </p>
              <p className="text-xs text-yellow-400/70 mt-0.5">
                Enable the{' '}
                <code className="px-1 py-0.5 rounded bg-dark-800 text-yellow-300">ai_insights</code>{' '}
                feature flag to allow report generation and user access.
              </p>
            </div>
          </div>
          <button
            onClick={() => enableFlagMutation.mutate()}
            disabled={enableFlagMutation.isPending}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30 transition-colors disabled:opacity-50 text-sm font-medium flex-shrink-0"
          >
            {enableFlagMutation.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ToggleLeft className="w-3.5 h-3.5" />
            )}
            Enable
          </button>
        </div>
      )}

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
            disabled={generateReportsMutation.isPending || !aiEnabled}
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

      <div className="card p-6">
        <h3 className="text-sm font-medium text-dark-400 uppercase tracking-wider mb-3">
          About AI Reports
        </h3>
        <div className="space-y-2 text-sm text-dark-300">
          <p>
            AI-powered weekly reports analyze each user&apos;s habit data and generate personalized
            insights including pattern recognition, risk assessment, and optimization suggestions.
          </p>
          <p>
            Reports are generated for all users with at least 7 days of tracking data. Users can
            view their latest report on their dashboard.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReportsTab;
