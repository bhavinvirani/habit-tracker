import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Activity,
  Database,
  Server,
  Cpu,
  HardDrive,
  RefreshCw,
  Clock,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle2,
  Users,
  Loader2,
  ChevronDown,
  ChevronRight,
  Shield,
  Zap,
} from 'lucide-react';
import { adminApi } from '../../services/admin';
import { AdminSession } from '../../types';
import { StatCard, Card, Badge, Button, CircularProgress, ConfirmDialog } from '../ui';
import toast from 'react-hot-toast';

// ─── Helpers ────────────────────────────────────────────────────

function latencyBadge(ms: number): 'success' | 'warning' | 'danger' {
  if (ms < 50) return 'success';
  if (ms < 200) return 'warning';
  return 'danger';
}

function statusIcon(status: string) {
  if (status === 'connected') return <CheckCircle2 size={14} className="text-green-400" />;
  if (status === 'not configured') return <WifiOff size={14} className="text-dark-500" />;
  return <AlertTriangle size={14} className="text-red-400" />;
}

// ─── Component ──────────────────────────────────────────────────

const SystemHealthTab: React.FC = () => {
  const queryClient = useQueryClient();
  const [errorsExpanded, setErrorsExpanded] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<AdminSession | null>(null);
  const [revokeAllTarget, setRevokeAllTarget] = useState<{ userId: string; name: string } | null>(
    null
  );

  const {
    data: stats,
    isLoading,
    isError,
    error: _queryError,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ['admin-system-stats'],
    queryFn: adminApi.getSystemStats,
    refetchInterval: 30000,
    retry: 1,
  });

  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['admin-sessions'],
    queryFn: adminApi.getActiveSessions,
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-system-stats'] });
    queryClient.invalidateQueries({ queryKey: ['admin-sessions'] });
  };

  const handleRevokeSession = async () => {
    if (!revokeTarget) return;
    try {
      await adminApi.revokeSession(revokeTarget.id);
      toast.success('Session revoked');
      queryClient.invalidateQueries({ queryKey: ['admin-sessions'] });
    } catch {
      toast.error('Failed to revoke session');
    }
    setRevokeTarget(null);
  };

  const handleRevokeAllSessions = async () => {
    if (!revokeAllTarget) return;
    try {
      const count = await adminApi.revokeAllUserSessions(revokeAllTarget.userId);
      toast.success(`Revoked ${count} sessions for ${revokeAllTarget.name}`);
      queryClient.invalidateQueries({ queryKey: ['admin-sessions'] });
    } catch {
      toast.error('Failed to revoke sessions');
    }
    setRevokeAllTarget(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-dark-400" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="card p-6 text-center">
        <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
        <p className="text-red-400 font-medium mb-1">Failed to load system stats</p>
        <p className="text-sm text-dark-400 mb-4">
          {(_queryError as { response?: { data?: { error?: { message: string } } } })?.response
            ?.data?.error?.message || 'Network error or server unreachable'}
        </p>
        <Button variant="secondary" size="sm" icon={RefreshCw} onClick={handleRefresh}>
          Retry
        </Button>
      </div>
    );
  }

  if (!stats) return null;

  const heapUsagePercent =
    stats.system.memory.heapTotal > 0
      ? Math.round((stats.system.memory.heapUsed / stats.system.memory.heapTotal) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Refresh bar */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-dark-500">
          Last updated: {dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString() : '—'}
        </p>
        <Button variant="secondary" size="sm" icon={RefreshCw} onClick={handleRefresh}>
          Refresh
        </Button>
      </div>

      {/* App Info Bar */}
      <Card padding="lg">
        <div className="flex flex-wrap gap-6 text-sm">
          <InfoPill label="Version" value={stats.application.version} />
          <InfoPill label="Environment" value={stats.application.environment} />
          <InfoPill label="Node" value={stats.application.nodeVersion} />
          <InfoPill label="Uptime" value={stats.application.uptime.formatted} />
          <InfoPill
            label="Started"
            value={new Date(stats.application.startedAt).toLocaleString()}
          />
        </div>
      </Card>

      {/* Dependency Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(stats.dependencies).map(([name, dep]) => (
          <Card key={name} padding="lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {name === 'database' ? (
                  <Database size={16} className="text-blue-400" />
                ) : (
                  <Server size={16} className="text-purple-400" />
                )}
                <span className="text-sm font-medium text-white capitalize">{name}</span>
              </div>
              <div className="flex items-center gap-2">
                {statusIcon(dep.status)}
                <Badge variant={latencyBadge(dep.latencyMs)} size="sm">
                  {dep.latencyMs}ms
                </Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Memory & CPU */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card padding="lg" header={<SectionHeader icon={HardDrive} title="Memory" />}>
          <div className="flex items-center gap-6">
            <CircularProgress
              percent={heapUsagePercent}
              size={100}
              strokeWidth={8}
              gradientId="heap-usage"
            >
              <span className="text-lg font-bold text-white">{heapUsagePercent}%</span>
            </CircularProgress>
            <div className="space-y-2 flex-1">
              <MemoryRow label="Heap Used" value={stats.system.memory.heapUsed} />
              <MemoryRow label="Heap Total" value={stats.system.memory.heapTotal} />
              <MemoryRow label="RSS" value={stats.system.memory.rss} />
              <MemoryRow label="External" value={stats.system.memory.external} />
            </div>
          </div>
        </Card>

        <Card padding="lg" header={<SectionHeader icon={Cpu} title="CPU & Load" />}>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-4">
              <MiniStat label="Load 1m" value={stats.system.loadAverage['1m']} />
              <MiniStat label="Load 5m" value={stats.system.loadAverage['5m']} />
              <MiniStat label="Load 15m" value={stats.system.loadAverage['15m']} />
            </div>
            <div className="text-xs text-dark-500 pt-1">
              Platform: {stats.system.platform} / {stats.system.arch} &middot; PID:{' '}
              {stats.system.pid}
            </div>
          </div>
        </Card>
      </div>

      {/* Cache Performance */}
      <Card padding="lg" header={<SectionHeader icon={Zap} title="Cache Performance" />}>
        <div className="flex items-center gap-6">
          <CircularProgress
            percent={stats.cache.hitRate}
            size={80}
            strokeWidth={7}
            gradientId="cache-hit"
          >
            <span className="text-sm font-bold text-white">{stats.cache.hitRate}%</span>
          </CircularProgress>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
            <MiniStat label="Hits" value={stats.cache.hits} />
            <MiniStat label="Misses" value={stats.cache.misses} />
            <MiniStat label="Sets" value={stats.cache.sets} />
            <MiniStat label="Invalidations" value={stats.cache.invalidations} />
          </div>
        </div>
        <p className="text-xs text-dark-500 mt-2">Backend: {stats.cache.backend}</p>
      </Card>

      {/* Request Metrics */}
      <Card padding="lg" header={<SectionHeader icon={Activity} title="Request Metrics" />}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          <MiniStat label="Total Requests" value={stats.requests.totalRequests} />
          <MiniStat label="Active" value={stats.requests.activeRequests} />
          <MiniStat label="Avg Response" value={`${stats.requests.averageResponseTime}ms`} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.requests.byMethod && Object.keys(stats.requests.byMethod).length > 0 && (
            <div>
              <p className="text-xs text-dark-400 mb-2 uppercase tracking-wider">By Method</p>
              <div className="space-y-1">
                {Object.entries(stats.requests.byMethod).map(([method, count]) => (
                  <div key={method} className="flex justify-between text-sm">
                    <span className="text-dark-300 font-mono">{method}</span>
                    <span className="text-white">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {stats.requests.byStatusGroup && Object.keys(stats.requests.byStatusGroup).length > 0 && (
            <div>
              <p className="text-xs text-dark-400 mb-2 uppercase tracking-wider">By Status</p>
              <div className="space-y-1">
                {Object.entries(stats.requests.byStatusGroup).map(([group, count]) => (
                  <div key={group} className="flex justify-between text-sm">
                    <span className="text-dark-300">{group}</span>
                    <span className="text-white">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Error Summary */}
      <Card padding="lg" header={<SectionHeader icon={AlertTriangle} title="Errors" />}>
        <div className="flex items-center gap-4 mb-3">
          <MiniStat label="Total Errors" value={stats.errors.totalErrors} />
        </div>
        {stats.errors.byCode && Object.keys(stats.errors.byCode).length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-dark-400 mb-2 uppercase tracking-wider">By Code</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.errors.byCode).map(([code, entry]) => (
                <Badge key={code} variant="danger" size="sm">
                  {code}: {entry.count}
                </Badge>
              ))}
            </div>
          </div>
        )}
        {stats.errors.recent && stats.errors.recent.length > 0 && (
          <div>
            <button
              onClick={() => setErrorsExpanded(!errorsExpanded)}
              className="flex items-center gap-1 text-xs text-dark-400 hover:text-white transition-colors"
            >
              {errorsExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              Recent Errors ({stats.errors.recent.length})
            </button>
            {errorsExpanded && (
              <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
                {stats.errors.recent.map((err, i) => (
                  <div
                    key={i}
                    className="text-xs font-mono p-2 rounded bg-dark-800/50 text-dark-300"
                  >
                    <span className="text-red-400">[{err.code}]</span> {err.message}
                    {err.url && <span className="text-dark-500 ml-2">{err.url}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Cron Jobs */}
      {stats.cronJobs && Object.keys(stats.cronJobs).length > 0 && (
        <Card padding="lg" header={<SectionHeader icon={Clock} title="Cron Jobs" />}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-dark-400 uppercase tracking-wider border-b border-dark-700">
                  <th className="text-left py-2 pr-4">Name</th>
                  <th className="text-left py-2 pr-4">Schedule</th>
                  <th className="text-left py-2 pr-4">Last Run</th>
                  <th className="text-center py-2 pr-4">Status</th>
                  <th className="text-right py-2 pr-4">Runs</th>
                  <th className="text-right py-2">Fails</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(stats.cronJobs).map(([name, job]) => (
                  <tr key={name} className="border-b border-dark-700/50 last:border-b-0">
                    <td className="py-2 pr-4 text-white font-medium">{name}</td>
                    <td className="py-2 pr-4 text-dark-300 font-mono text-xs">{job.schedule}</td>
                    <td className="py-2 pr-4 text-dark-400 text-xs">
                      {job.lastRun ? new Date(job.lastRun).toLocaleString() : '—'}
                    </td>
                    <td className="py-2 pr-4 text-center">
                      <Badge
                        variant={
                          job.lastStatus === 'success' || !job.lastStatus ? 'success' : 'danger'
                        }
                        size="sm"
                      >
                        {job.lastStatus || 'idle'}
                      </Badge>
                    </td>
                    <td className="py-2 pr-4 text-right text-dark-300">{job.runCount}</td>
                    <td className="py-2 text-right text-dark-300">{job.failCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Rate Limiting */}
      {stats.rateLimiting && (
        <Card padding="lg" header={<SectionHeader icon={Shield} title="Rate Limiting" />}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MiniStat label="Total Throttled" value={stats.rateLimiting.totalThrottled} />
            {Object.entries(stats.rateLimiting.byLimiter || {}).map(([name, count]) => (
              <MiniStat key={name} label={name} value={count} />
            ))}
          </div>
        </Card>
      )}

      {/* Active Users */}
      {stats.activeUsers && typeof stats.activeUsers === 'object' && 'dau' in stats.activeUsers && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Users} value={stats.activeUsers.dau} label="DAU" color="green" />
          <StatCard icon={Users} value={stats.activeUsers.wau} label="WAU" color="blue" />
          <StatCard icon={Users} value={stats.activeUsers.mau} label="MAU" color="orange" />
          <StatCard
            icon={Users}
            value={stats.activeUsers.totalRegistered}
            label="Total Registered"
            color="purple"
          />
        </div>
      )}

      {/* Session Management */}
      <Card padding="lg" header={<SectionHeader icon={Wifi} title="Active Sessions" />}>
        {sessionsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-dark-400" />
          </div>
        ) : !sessions || sessions.length === 0 ? (
          <p className="text-sm text-dark-400 text-center py-4">No active sessions.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-dark-400 uppercase tracking-wider border-b border-dark-700">
                  <th className="text-left py-2 pr-4">User</th>
                  <th className="text-left py-2 pr-4">Email</th>
                  <th className="text-left py-2 pr-4">Created</th>
                  <th className="text-left py-2 pr-4">Expires</th>
                  <th className="text-center py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr key={session.id} className="border-b border-dark-700/50 last:border-b-0">
                    <td className="py-2 pr-4 text-white">{session.user.name}</td>
                    <td className="py-2 pr-4 text-dark-300">{session.user.email}</td>
                    <td className="py-2 pr-4 text-dark-400 text-xs">
                      {new Date(session.createdAt).toLocaleString()}
                    </td>
                    <td className="py-2 pr-4 text-dark-400 text-xs">
                      {new Date(session.expiresAt).toLocaleString()}
                    </td>
                    <td className="py-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="danger" size="sm" onClick={() => setRevokeTarget(session)}>
                          Revoke
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            setRevokeAllTarget({
                              userId: session.user.id,
                              name: session.user.name,
                            })
                          }
                          title="Revoke all sessions for this user"
                        >
                          All
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <ConfirmDialog
        isOpen={!!revokeTarget}
        onClose={() => setRevokeTarget(null)}
        onConfirm={handleRevokeSession}
        title="Revoke Session"
        message={`Revoke session for ${revokeTarget?.user.name} (${revokeTarget?.user.email})? They will need to log in again.`}
        confirmText="Revoke"
        danger
      />

      <ConfirmDialog
        isOpen={!!revokeAllTarget}
        onClose={() => setRevokeAllTarget(null)}
        onConfirm={handleRevokeAllSessions}
        title="Revoke All Sessions"
        message={`Revoke ALL sessions for ${revokeAllTarget?.name}? They will be logged out of all devices.`}
        confirmText="Revoke All"
        danger
      />
    </div>
  );
};

// ─── Sub-components ─────────────────────────────────────────────

const InfoPill: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <span className="text-dark-500 text-xs">{label}</span>
    <p className="text-white font-medium">{value}</p>
  </div>
);

const MemoryRow: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div className="flex justify-between text-sm">
    <span className="text-dark-400">{label}</span>
    <span className="text-white font-mono">{value} MB</span>
  </div>
);

const MiniStat: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="p-3 rounded-lg bg-dark-800/50">
    <p className="text-xs text-dark-400 mb-1">{label}</p>
    <p className="text-lg font-semibold text-white">{value}</p>
  </div>
);

const SectionHeader: React.FC<{ icon: React.ElementType; title: string }> = ({
  icon: Icon,
  title,
}) => (
  <div className="flex items-center gap-2">
    <Icon size={16} className="text-primary-400" />
    <h3 className="text-sm font-medium text-white">{title}</h3>
  </div>
);

export default SystemHealthTab;
