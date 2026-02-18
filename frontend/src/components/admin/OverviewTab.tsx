import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Users,
  Target,
  Activity,
  TrendingUp,
  Loader2,
  Download,
  BarChart3,
  PieChart as PieChartIcon,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { adminApi } from '../../services/admin';
import { AdminUser } from '../../types';
import { StatCard, Card, Button } from '../ui';
import AuditLogPanel from './AuditLogPanel';
import toast from 'react-hot-toast';

const CHART_COLORS = [
  '#2aa3ff',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#f97316',
];

const OverviewTab: React.FC = () => {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: adminApi.getStats,
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users', { limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }],
    queryFn: () => adminApi.getUsers({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }),
  });

  const { data: trends, isLoading: trendsLoading } = useQuery({
    queryKey: ['admin-trends'],
    queryFn: () => adminApi.getTrends(30),
  });

  const { data: content, isLoading: contentLoading } = useQuery({
    queryKey: ['admin-content-breakdown'],
    queryFn: adminApi.getContentBreakdown,
  });

  const handleExport = async (type: 'users' | 'habits' | 'logs') => {
    try {
      await adminApi.exportData(type);
      toast.success(`${type} exported successfully`);
    } catch {
      toast.error(`Failed to export ${type}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      {statsLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-xl bg-dark-800/50 border border-dark-700 animate-pulse"
            />
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Users} value={stats.totalUsers} label="Total Users" color="green" />
          <StatCard icon={Target} value={stats.totalHabits} label="Total Habits" color="blue" />
          <StatCard
            icon={Activity}
            value={stats.activeUsersLast7Days}
            label="Active (7d)"
            color="orange"
          />
          <StatCard
            icon={TrendingUp}
            value={stats.avgCompletionRate}
            suffix="%"
            label="Avg Completion"
            color="purple"
          />
        </div>
      ) : null}

      {/* Trend Charts */}
      {trendsLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-64 rounded-xl bg-dark-800/50 border border-dark-700 animate-pulse"
            />
          ))}
        </div>
      ) : trends && trends.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <TrendChart title="New Users (30d)" data={trends} dataKey="newUsers" color="#10b981" />
          <TrendChart
            title="Active Users (30d)"
            data={trends}
            dataKey="activeUsers"
            color="#2aa3ff"
          />
          <TrendChart
            title="Completion Rate (30d)"
            data={trends}
            dataKey="completionRate"
            color="#8b5cf6"
            suffix="%"
          />
        </div>
      ) : null}

      {/* Content Breakdown + Engagement */}
      {contentLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="h-72 rounded-xl bg-dark-800/50 border border-dark-700 animate-pulse"
            />
          ))}
        </div>
      ) : content ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Habits by Frequency Pie */}
            <Card
              padding="lg"
              header={
                <div className="flex items-center gap-2">
                  <PieChartIcon size={16} className="text-primary-400" />
                  <h3 className="text-sm font-medium text-white">Habits by Frequency</h3>
                </div>
              }
            >
              {content.habits.byFrequency.length > 0 ? (
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={content.habits.byFrequency}
                        dataKey="count"
                        nameKey="frequency"
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                        label={({ frequency, count }) => `${frequency}: ${count}`}
                        labelLine={false}
                      >
                        {content.habits.byFrequency.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1a1a2e',
                          border: '1px solid #334155',
                          borderRadius: '8px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-sm text-dark-400 text-center py-8">No data</p>
              )}
            </Card>

            {/* Habits by Category Bar */}
            <Card
              padding="lg"
              header={
                <div className="flex items-center gap-2">
                  <BarChart3 size={16} className="text-primary-400" />
                  <h3 className="text-sm font-medium text-white">Habits by Category</h3>
                </div>
              }
            >
              {content.habits.byCategory.length > 0 ? (
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={content.habits.byCategory.slice(0, 8)}
                      layout="vertical"
                      margin={{ left: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <YAxis
                        dataKey="category"
                        type="category"
                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                        width={55}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1a1a2e',
                          border: '1px solid #334155',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar dataKey="count" fill="#2aa3ff" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-sm text-dark-400 text-center py-8">No data</p>
              )}
            </Card>
          </div>

          {/* Engagement Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={Target}
              value={content.engagement.avgHabitsPerUser}
              label="Avg Habits/User"
              color="blue"
            />
            <StatCard
              icon={TrendingUp}
              value={content.engagement.avgCompletionRate}
              suffix="%"
              label="Avg Completion"
              color="green"
            />
            <StatCard
              icon={Activity}
              value={content.engagement.avgStreakLength}
              label="Avg Streak"
              color="orange"
            />
            <StatCard
              icon={Users}
              value={content.engagement.usersWithActiveHabits}
              label="Active Habit Users"
              color="purple"
            />
          </div>
        </>
      ) : null}

      {/* Export Buttons */}
      <Card padding="lg" header={<h3 className="text-sm font-medium text-white">Data Export</h3>}>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            size="sm"
            icon={Download}
            onClick={() => handleExport('users')}
          >
            Export Users
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={Download}
            onClick={() => handleExport('habits')}
          >
            Export Habits
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={Download}
            onClick={() => handleExport('logs')}
          >
            Export Logs
          </Button>
        </div>
      </Card>

      {/* Recent Activity + New Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          padding="lg"
          header={<h3 className="text-sm font-medium text-white">Recent Activity</h3>}
        >
          <AuditLogPanel limit={5} showLoadMore={false} />
        </Card>

        <Card padding="lg" header={<h3 className="text-sm font-medium text-white">New Users</h3>}>
          {usersLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-dark-400" />
            </div>
          ) : usersData?.users.length === 0 ? (
            <p className="text-sm text-dark-400 text-center py-6">No users yet.</p>
          ) : (
            <div className="space-y-3">
              {usersData?.users.map((user: AdminUser) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-dark-700/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium text-primary-400">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{user.name}</p>
                      <p className="text-xs text-dark-400 truncate">{user.email}</p>
                    </div>
                  </div>
                  <span className="text-xs text-dark-500 whitespace-nowrap">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

// ─── Trend Chart Sub-component ──────────────────────────────────

interface TrendChartProps {
  title: string;
  data: Array<{ date: string; newUsers: number; activeUsers: number; completionRate: number }>;
  dataKey: string;
  color: string;
  suffix?: string;
}

const TrendChart: React.FC<TrendChartProps> = ({ title, data, dataKey, color, suffix }) => (
  <Card padding="lg" header={<h3 className="text-sm font-medium text-white">{title}</h3>}>
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
          <defs>
            <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="date"
            tick={{ fill: '#94a3b8', fontSize: 10 }}
            tickFormatter={(val) => {
              const d = new Date(val);
              return `${d.getMonth() + 1}/${d.getDate()}`;
            }}
            interval="preserveStartEnd"
          />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1a2e',
              border: '1px solid #334155',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            formatter={(value: number) => [`${value}${suffix || ''}`, dataKey]}
            labelFormatter={(label) => new Date(label as string).toLocaleDateString()}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            fill={`url(#gradient-${dataKey})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </Card>
);

export default OverviewTab;
