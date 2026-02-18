import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, Loader2, Calendar, Globe, Target, BookOpen, Trophy, Award, Flame } from 'lucide-react';
import { adminApi } from '../../services/admin';
import { Badge, Card } from '../ui';

interface UserDetailPanelProps {
  userId: string | null;
  onClose: () => void;
}

const UserDetailPanel: React.FC<UserDetailPanelProps> = ({ userId, onClose }) => {
  const { data: user, isLoading } = useQuery({
    queryKey: ['admin-user-detail', userId],
    queryFn: () => adminApi.getUserDetail(userId!),
    enabled: !!userId,
  });

  if (!userId) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-dark-900 border-l border-dark-700 z-50 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-dark-900/95 backdrop-blur border-b border-dark-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">User Detail</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-dark-700 text-dark-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-dark-400" />
          </div>
        ) : !user ? (
          <div className="p-6 text-center text-dark-400">User not found.</div>
        ) : (
          <div className="p-6 space-y-6">
            {/* User Info */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-bold text-primary-400">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-white">{user.name}</h3>
                  {user.isAdmin && (
                    <Badge variant="success" size="sm">
                      Admin
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-dark-400">{user.email}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-dark-500">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Globe size={12} />
                    {user.timezone}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-5 gap-3">
              <CountBox icon={Target} label="Habits" count={user._count.habits} />
              <CountBox icon={Flame} label="Logs" count={user._count.habitLogs} />
              <CountBox icon={Award} label="Milestones" count={user._count.milestones} />
              <CountBox icon={BookOpen} label="Books" count={user._count.books} />
              <CountBox icon={Trophy} label="Challenges" count={user._count.challenges} />
            </div>

            {/* Habits */}
            <Card
              padding="lg"
              header={
                <h4 className="text-sm font-medium text-white">Habits ({user.habits.length})</h4>
              }
            >
              {user.habits.length === 0 ? (
                <p className="text-sm text-dark-400 text-center py-4">No habits.</p>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {user.habits.map((habit) => (
                    <div
                      key={habit.id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-dark-700/30 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: habit.color }}
                        />
                        <span className="text-sm text-white truncate">{habit.name}</span>
                        {habit.isArchived && (
                          <Badge variant="default" size="sm">
                            Archived
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-dark-400 flex-shrink-0">
                        <span title="Current streak">{habit.currentStreak}d</span>
                        <span title="Longest streak" className="text-dark-500">
                          best: {habit.longestStreak}d
                        </span>
                        <span title="Total completions">{habit.totalCompletions} done</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Books */}
            <Card
              padding="lg"
              header={
                <h4 className="text-sm font-medium text-white">Books ({user.books.length})</h4>
              }
            >
              {user.books.length === 0 ? (
                <p className="text-sm text-dark-400 text-center py-4">No books.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {user.books.map((book) => (
                    <div
                      key={book.id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-dark-700/30 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-sm text-white truncate">{book.title}</p>
                        {book.author && <p className="text-xs text-dark-500">{book.author}</p>}
                      </div>
                      <Badge
                        variant={
                          book.status === 'FINISHED'
                            ? 'success'
                            : book.status === 'READING'
                              ? 'warning'
                              : book.status === 'ABANDONED'
                                ? 'danger'
                                : 'default'
                        }
                        size="sm"
                      >
                        {book.status.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Challenges */}
            <Card
              padding="lg"
              header={
                <h4 className="text-sm font-medium text-white">
                  Challenges ({user.challenges.length})
                </h4>
              }
            >
              {user.challenges.length === 0 ? (
                <p className="text-sm text-dark-400 text-center py-4">No challenges.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {user.challenges.map((challenge) => (
                    <div
                      key={challenge.id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-dark-700/30 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-sm text-white truncate">{challenge.name}</p>
                        <p className="text-xs text-dark-500">
                          {challenge.duration} days &middot;{' '}
                          {challenge.completionRate != null
                            ? `${Math.round(challenge.completionRate)}% complete`
                            : 'In progress'}
                        </p>
                      </div>
                      <Badge
                        variant={
                          challenge.status === 'COMPLETED'
                            ? 'success'
                            : challenge.status === 'ACTIVE'
                              ? 'warning'
                              : challenge.status === 'FAILED'
                                ? 'danger'
                                : 'default'
                        }
                        size="sm"
                      >
                        {challenge.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </>
  );
};

// ─── Sub-components ─────────────────────────────────────────────

const CountBox: React.FC<{
  icon: React.ElementType;
  label: string;
  count: number;
}> = ({ icon: Icon, label, count }) => (
  <div className="text-center p-3 rounded-lg bg-dark-800/50">
    <Icon size={14} className="text-dark-400 mx-auto mb-1" />
    <p className="text-lg font-semibold text-white">{count}</p>
    <p className="text-xs text-dark-500">{label}</p>
  </div>
);

export default UserDetailPanel;
