'use client';

import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';
import {
  Ban,
  Key,
  Shield,
  Trash2,
  TrendingUp,
  UserCog,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  useAuthMutation,
  useAuthPaginatedQuery,
  useAuthQuery,
} from '@/lib/convex/hooks';

const cn = (...classes: Array<string | undefined>) =>
  classes.filter(Boolean).join(' ');

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-3xl border border-slate-100 bg-white/90 p-6 shadow-[0_15px_50px_-25px_rgba(15,23,42,0.45)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/80',
        className
      )}
    >
      {children}
    </div>
  );
}

type CreateUserDialogProps = {
  onClose: () => void;
  onSuccess: () => void;
};

function CreateUserDialog({ onClose, onSuccess }: CreateUserDialogProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');

  const createUserMutation = useAuthMutation(api.admin.createUser);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    void toast.promise(
      createUserMutation
        .mutateAsync({ email, name, password, role })
        .then(() => {
          onSuccess();
          onClose();
        }),
      {
        loading: 'Creating user...',
        success: 'User created successfully!',
        error: (e) => e.data?.message ?? 'Failed to create user',
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserPlus className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            <h2 className="font-semibold text-slate-900 text-xl dark:text-white">
              Create New User
            </h2>
          </div>
          <button
            className="rounded-full p-2 transition hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={onClose}
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block font-medium text-slate-700 text-sm dark:text-slate-300">
              Name
            </label>
            <input
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
              type="text"
              value={name}
            />
          </div>

          <div>
            <label className="mb-2 block font-medium text-slate-700 text-sm dark:text-slate-300">
              Email
            </label>
            <input
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              required
              type="email"
              value={email}
            />
          </div>

          <div>
            <label className="mb-2 block font-medium text-slate-700 text-sm dark:text-slate-300">
              Password
            </label>
            <input
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              minLength={8}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              type="password"
              value={password}
            />
          </div>

          <div>
            <label className="mb-2 block font-medium text-slate-700 text-sm dark:text-slate-300">
              Role
            </label>
            <select
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              onChange={(e) => setRole(e.target.value as 'user' | 'admin')}
              value={role}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              className="flex-1 rounded-full bg-slate-100 px-4 py-2 font-semibold text-slate-600 text-sm transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className="flex-1 rounded-full bg-indigo-600 px-4 py-2 font-semibold text-sm text-white transition hover:bg-indigo-700"
              type="submit"
            >
              Create User
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

type SetPasswordDialogProps = {
  onClose: () => void;
  userId: string;
  userName: string;
};

function SetPasswordDialog({
  onClose,
  userId,
  userName,
}: SetPasswordDialogProps) {
  const [newPassword, setNewPassword] = useState('');

  const setPasswordMutation = useAuthMutation(api.admin.setUserPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    void toast.promise(
      setPasswordMutation.mutateAsync({ userId, newPassword }).then(() => {
        onClose();
      }),
      {
        loading: 'Setting password...',
        success: 'Password updated successfully!',
        error: (e) => e.data?.message ?? 'Failed to set password',
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Key className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            <h2 className="font-semibold text-slate-900 text-xl dark:text-white">
              Set Password for {userName}
            </h2>
          </div>
          <button
            className="rounded-full p-2 transition hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={onClose}
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block font-medium text-slate-700 text-sm dark:text-slate-300">
              New Password
            </label>
            <input
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              minLength={8}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
              type="password"
              value={newPassword}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              className="flex-1 rounded-full bg-slate-100 px-4 py-2 font-semibold text-slate-600 text-sm transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className="flex-1 rounded-full bg-indigo-600 px-4 py-2 font-semibold text-sm text-white transition hover:bg-indigo-700"
              type="submit"
            >
              Set Password
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

type BanUserDialogProps = {
  onClose: () => void;
  userId: Id<'user'>;
  userName: string;
};

function BanUserDialog({ onClose, userId, userName }: BanUserDialogProps) {
  const [banReason, setBanReason] = useState('');
  const [banExpiresIn, setBanExpiresIn] = useState('');

  const banUserMutation = useAuthMutation(api.admin.banUser);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    void toast.promise(
      banUserMutation
        .mutateAsync({
          userId,
          banReason: banReason || undefined,
          banExpiresIn: banExpiresIn ? Number(banExpiresIn) : undefined,
        })
        .then(() => {
          onClose();
        }),
      {
        loading: 'Banning user...',
        success: 'User banned successfully!',
        error: (e) => e.data?.message ?? 'Failed to ban user',
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Ban className="h-6 w-6 text-red-600 dark:text-red-400" />
            <h2 className="font-semibold text-slate-900 text-xl dark:text-white">
              Ban {userName}
            </h2>
          </div>
          <button
            className="rounded-full p-2 transition hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={onClose}
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block font-medium text-slate-700 text-sm dark:text-slate-300">
              Reason (optional)
            </label>
            <textarea
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="Reason for ban..."
              rows={3}
              value={banReason}
            />
          </div>

          <div>
            <label className="mb-2 block font-medium text-slate-700 text-sm dark:text-slate-300">
              Expires In (seconds, optional)
            </label>
            <input
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              min="0"
              onChange={(e) => setBanExpiresIn(e.target.value)}
              placeholder="e.g., 86400 for 24 hours"
              type="number"
              value={banExpiresIn}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              className="flex-1 rounded-full bg-slate-100 px-4 py-2 font-semibold text-slate-600 text-sm transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className="flex-1 rounded-full bg-red-600 px-4 py-2 font-semibold text-sm text-white transition hover:bg-red-700"
              type="submit"
            >
              Ban User
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default function UserManagementPage() {
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [passwordDialog, setPasswordDialog] = useState<{
    userId: string;
    userName: string;
  } | null>(null);
  const [banDialog, setBanDialog] = useState<{
    userId: Id<'user'>;
    userName: string;
  } | null>(null);

  // Fetch dashboard stats
  const { data: stats } = useAuthQuery(api.admin.getDashboardStats, {});

  // Fetch users with pagination
  const {
    data: users,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useAuthPaginatedQuery(
    api.admin.getAllUsers,
    {
      role: roleFilter,
      search: searchQuery || undefined,
    },
    { initialNumItems: 10 }
  );

  const updateRoleMutation = useAuthMutation(api.admin.updateUserRole);
  const unbanUserMutation = useAuthMutation(api.admin.unbanUser);
  const removeUserMutation = useAuthMutation(api.admin.removeUser);
  const revokeSessionsMutation = useAuthMutation(api.admin.revokeUserSessions);

  const handleRoleChange = (userId: Id<'user'>, newRole: 'user' | 'admin') => {
    void toast.promise(
      updateRoleMutation.mutateAsync({ userId, role: newRole }),
      {
        loading: 'Updating user role...',
        success: 'User role updated successfully!',
        error: (e) => e.data?.message ?? 'Failed to update user role',
      }
    );
  };

  const handleUnban = (userId: Id<'user'>) => {
    void toast.promise(unbanUserMutation.mutateAsync({ userId }), {
      loading: 'Unbanning user...',
      success: 'User unbanned successfully!',
      error: (e) => e.data?.message ?? 'Failed to unban user',
    });
  };

  const handleRemoveUser = (userId: Id<'user'>, userName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete ${userName}? This action cannot be undone.`
      )
    ) {
      return;
    }

    void toast.promise(removeUserMutation.mutateAsync({ userId }), {
      loading: 'Removing user...',
      success: 'User removed successfully!',
      error: (e) => e.data?.message ?? 'Failed to remove user',
    });
  };

  const handleRevokeSessions = (userId: Id<'user'>, userName: string) => {
    if (!confirm(`Revoke all sessions for ${userName}?`)) {
      return;
    }

    void toast.promise(revokeSessionsMutation.mutateAsync({ userId }), {
      loading: 'Revoking sessions...',
      success: 'All sessions revoked!',
      error: (e) => e.data?.message ?? 'Failed to revoke sessions',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#c7d2fe,transparent_55%)] opacity-60 dark:bg-[radial-gradient(circle_at_top,#312e81,transparent_55%)]" />
        <div className="relative">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              <div>
                <h1 className="font-semibold text-3xl text-slate-900 dark:text-white">
                  User Management
                </h1>
                <p className="text-lg text-slate-500 dark:text-slate-400">
                  Manage users, roles, and permissions
                </p>
              </div>
            </div>
            <button
              className="flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-3 font-semibold text-sm text-white transition hover:bg-indigo-700"
              onClick={() => setShowCreateDialog(true)}
              type="button"
            >
              <UserPlus className="h-4 w-4" />
              Create User
            </button>
          </div>
        </div>
      </Card>

      {/* Statistics */}
      <div className="grid @3xl:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 dark:bg-indigo-500/20">
              <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-slate-500 text-sm dark:text-slate-400">
                Total Users
              </p>
              <p className="font-semibold text-2xl text-slate-900 dark:text-white">
                {stats?.totalUsers ?? 0}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 dark:bg-purple-500/20">
              <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-slate-500 text-sm dark:text-slate-400">
                Total Admins
              </p>
              <p className="font-semibold text-2xl text-slate-900 dark:text-white">
                {stats?.totalAdmins ?? 0}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-500/20">
              <TrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-slate-500 text-sm dark:text-slate-400">
                Recent Users
              </p>
              <p className="font-semibold text-2xl text-slate-900 dark:text-white">
                {stats?.recentUsers.length ?? 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* User Management */}
      <Card>
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <UserCog className="h-6 w-6 text-slate-600 dark:text-slate-400" />
              <h2 className="font-semibold text-slate-900 text-xl dark:text-white">
                All Users
              </h2>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <input
              className="min-w-[200px] flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              type="text"
              value={searchQuery}
            />
            <select
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              onChange={(e) =>
                setRoleFilter(e.target.value as 'all' | 'user' | 'admin')
              }
              value={roleFilter}
            >
              <option value="all">All Roles</option>
              <option value="user">Users</option>
              <option value="admin">Admins</option>
            </select>
          </div>

          {/* User List */}
          <div className="space-y-3">
            {users && users.length > 0 ? (
              users.filter(Boolean).map((user) => {
                if (!user) return null;
                return (
                  <div
                    className="rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60"
                    key={user._id}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 to-purple-500 font-semibold text-white">
                          {user.name?.charAt(0) ?? user.email?.charAt(0) ?? 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {user.name ?? 'Unknown'}
                          </p>
                          <p className="text-slate-500 text-sm dark:text-slate-400">
                            {user.email}
                          </p>
                          {user.isBanned && (
                            <p className="mt-1 text-red-600 text-xs dark:text-red-400">
                              Banned: {user.banReason ?? 'No reason provided'}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            'rounded-full px-3 py-1 font-semibold text-xs',
                            user.role === 'admin'
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-200'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-200'
                          )}
                        >
                          {user.role === 'admin' ? 'Admin' : 'User'}
                        </span>

                        {user.isBanned && (
                          <span className="rounded-full bg-red-100 px-3 py-1 font-semibold text-red-700 text-xs dark:bg-red-500/20 dark:text-red-200">
                            Banned
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {user.role === 'admin' ? (
                        <button
                          className="rounded-full bg-slate-100 px-3 py-1.5 font-semibold text-slate-600 text-xs transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                          onClick={() => handleRoleChange(user._id, 'user')}
                          type="button"
                        >
                          Revoke Admin
                        </button>
                      ) : (
                        <button
                          className="rounded-full bg-purple-600 px-3 py-1.5 font-semibold text-white text-xs transition hover:bg-purple-700"
                          onClick={() => handleRoleChange(user._id, 'admin')}
                          type="button"
                        >
                          Make Admin
                        </button>
                      )}

                      <button
                        className="rounded-full bg-indigo-100 px-3 py-1.5 font-semibold text-indigo-700 text-xs transition hover:bg-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-200"
                        onClick={() =>
                          setPasswordDialog({
                            userId: user._id,
                            userName: user.name ?? user.email ?? 'User',
                          })
                        }
                        type="button"
                      >
                        <Key className="mr-1 inline h-3 w-3" />
                        Set Password
                      </button>

                      {user.isBanned ? (
                        <button
                          className="rounded-full bg-emerald-100 px-3 py-1.5 font-semibold text-emerald-700 text-xs transition hover:bg-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-200"
                          onClick={() => handleUnban(user._id)}
                          type="button"
                        >
                          Unban
                        </button>
                      ) : (
                        <button
                          className="rounded-full bg-red-100 px-3 py-1.5 font-semibold text-red-700 text-xs transition hover:bg-red-200 dark:bg-red-500/20 dark:text-red-200"
                          onClick={() =>
                            setBanDialog({
                              userId: user._id,
                              userName: user.name ?? user.email ?? 'User',
                            })
                          }
                          type="button"
                        >
                          <Ban className="mr-1 inline h-3 w-3" />
                          Ban
                        </button>
                      )}

                      <button
                        className="rounded-full bg-orange-100 px-3 py-1.5 font-semibold text-orange-700 text-xs transition hover:bg-orange-200 dark:bg-orange-500/20 dark:text-orange-200"
                        onClick={() =>
                          handleRevokeSessions(
                            user._id,
                            user.name ?? user.email ?? 'User'
                          )
                        }
                        type="button"
                      >
                        Revoke Sessions
                      </button>

                      <button
                        className="rounded-full bg-red-100 px-3 py-1.5 font-semibold text-red-700 text-xs transition hover:bg-red-200 dark:bg-red-500/20 dark:text-red-200"
                        onClick={() =>
                          handleRemoveUser(
                            user._id,
                            user.name ?? user.email ?? 'User'
                          )
                        }
                        type="button"
                      >
                        <Trash2 className="mr-1 inline h-3 w-3" />
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center">
                <p className="text-slate-500 dark:text-slate-400">
                  No users found
                </p>
              </div>
            )}
          </div>

          {/* Load More */}
          {hasNextPage && (
            <div className="flex justify-center">
              <button
                className="rounded-full bg-slate-900 px-6 py-3 font-semibold text-sm text-white transition hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-900"
                disabled={isFetchingNextPage}
                onClick={() => void fetchNextPage()}
                type="button"
              >
                {isFetchingNextPage ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </div>
      </Card>

      {/* Dialogs */}
      {showCreateDialog && (
        <CreateUserDialog
          onClose={() => setShowCreateDialog(false)}
          onSuccess={() => {
            // Optionally refetch users
          }}
        />
      )}

      {passwordDialog && (
        <SetPasswordDialog
          onClose={() => setPasswordDialog(null)}
          userId={passwordDialog.userId}
          userName={passwordDialog.userName}
        />
      )}

      {banDialog && (
        <BanUserDialog
          onClose={() => setBanDialog(null)}
          userId={banDialog.userId}
          userName={banDialog.userName}
        />
      )}
    </div>
  );
}
