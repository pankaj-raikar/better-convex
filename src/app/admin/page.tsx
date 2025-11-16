'use client';

import { api } from '@convex/_generated/api';
import { Shield, TrendingUp, Users } from 'lucide-react';
import { useAuthQuery } from '@/lib/convex/hooks';

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

export default function AdminDashboard() {
  // Fetch dashboard stats
  const { data: stats } = useAuthQuery(api.admin.getDashboardStats, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#c7d2fe,transparent_55%)] opacity-60 dark:bg-[radial-gradient(circle_at_top,#312e81,transparent_55%)]" />
        <div className="relative">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h1 className="font-semibold text-3xl text-slate-900 dark:text-white">
                Admin Dashboard
              </h1>
              <p className="text-lg text-slate-500 dark:text-slate-400">
                Welcome back! Here's an overview of your system.
              </p>
            </div>
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
                {stats?.recentUsers?.length ?? 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <div className="space-y-4">
          <h2 className="font-semibold text-slate-900 text-xl dark:text-white">
            Quick Actions
          </h2>
          <div className="grid @3xl:grid-cols-2 gap-4">
            <a
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-800"
              href="/admin/users"
            >
              <Users className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">
                  Manage Users
                </p>
                <p className="text-slate-500 text-sm dark:text-slate-400">
                  View and manage user accounts
                </p>
              </div>
            </a>
            <a
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-800"
              href="/admin/settings"
            >
              <Shield className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">
                  System Settings
                </p>
                <p className="text-slate-500 text-sm dark:text-slate-400">
                  Configure system preferences
                </p>
              </div>
            </a>
          </div>
        </div>
      </Card>
    </div>
  );
}
