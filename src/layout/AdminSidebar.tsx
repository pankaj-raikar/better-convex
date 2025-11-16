'use client';
import type { UrlObject } from 'node:url';
import {
  Bell,
  Calendar,
  Database,
  FileDown,
  FileText,
  FileUp,
  Grid3X3,
  Key,
  Link2,
  Palette,
  Settings,
  Shield,
  Timer,
  Users,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type React from 'react';
import { useSidebar } from '@/context/SidebarContext';
import { useCurrentUser } from '@/lib/convex/hooks';

type SimpleNavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
};

const primaryNavItems: SimpleNavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: <Grid3X3 /> },
  { label: 'User management', href: '/admin/users', icon: <Users /> },
  { label: 'Appearance', href: '/admin/appearance', icon: <Palette /> },
  { label: 'Database', href: '/admin/database', icon: <Database /> },
  { label: 'Connections', href: '/admin/connections', icon: <Link2 /> },
  { label: 'Timezones', href: '/admin/timezones', icon: <Timer /> },
  {
    label: 'Notifications',
    href: '/admin/notifications',
    icon: <Bell />,
    badge: 4,
  },
];

const venturesNavItems: SimpleNavItem[] = [
  { label: 'Security & access', href: '/admin/security', icon: <Key /> },
  { label: 'Authentication', href: '/admin/authentication', icon: <Shield /> },
  { label: 'Payments', href: '/admin/payments', icon: <Calendar /> },
  { label: 'Import data', href: '/admin/import', icon: <FileUp /> },
  { label: 'Export data', href: '/admin/export', icon: <FileDown /> },
];

const AdminSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const user = useCurrentUser();

  const isSidebarOpen = isExpanded || isHovered || isMobileOpen;

  const profileName = user?.name ?? 'Admin User';
  const profileEmail = user?.email ?? 'admin@example.com';
  const avatarUrl = user?.image ?? '/images/user/user-01.jpg';

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={`fixed top-0 left-0 z-50 mt-16 flex h-screen flex-col border-slate-200 border-r bg-white px-4 text-slate-900 transition-all duration-300 ease-in-out lg:mt-0 dark:border-slate-800 dark:bg-slate-900 ${
        isSidebarOpen ? 'w-[290px]' : 'w-[90px]'
      }
        ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex h-full flex-col pt-8 pb-6">
        <ProfileCard
          avatarUrl={avatarUrl}
          email={profileEmail}
          isSidebarOpen={isSidebarOpen}
          name={profileName}
        />

        <div className="no-scrollbar mt-6 flex-1 overflow-y-auto pb-6">
          <SectionHeading isSidebarOpen={isSidebarOpen} title="GENERAL" />
          <ul className="space-y-1">
            {primaryNavItems.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.label}>
                  <Link
                    className={`group flex items-center gap-3 rounded-2xl px-1 py-2 font-medium text-sm transition ${
                      isSidebarOpen ? 'justify-start' : 'justify-center'
                    } ${
                      active
                        ? 'bg-slate-900 text-white dark:bg-white/10'
                        : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/70'
                    }`}
                    href={item.href as unknown as UrlObject}
                    prefetch={false}
                  >
                    <span
                      className={`${
                        isSidebarOpen ? 'ml-2' : ''
                      } relative flex h-10 w-10 items-center justify-center rounded-2xl border text-base ${
                        active
                          ? 'border-transparent bg-white/20 text-white dark:bg-white/10'
                          : 'border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {item.icon}
                      {item.badge && isSidebarOpen && (
                        <span className="-top-1 -right-1 absolute inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 font-semibold text-white text-xs">
                          {item.badge}
                        </span>
                      )}
                    </span>
                    {isSidebarOpen && (
                      <span className="flex-1 truncate">{item.label}</span>
                    )}
                    {item.badge && isSidebarOpen && (
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 font-semibold text-slate-600 text-xs dark:bg-slate-800 dark:text-slate-200">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-8 space-y-3">
            <SectionHeading isSidebarOpen={isSidebarOpen} title="ADMIN" />
            <ul className="space-y-1">
              {venturesNavItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.label}>
                    <Link
                      className={`group flex items-center gap-3 rounded-2xl px-1 py-2 font-medium text-sm transition ${
                        isSidebarOpen ? 'justify-start' : 'justify-center'
                      } ${
                        active
                          ? 'bg-slate-900 text-white dark:bg-white/10'
                          : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/70'
                      }`}
                      href={item.href as unknown as UrlObject}
                      prefetch={false}
                    >
                      <span
                        className={`${
                          isSidebarOpen ? 'ml-2' : ''
                        } flex h-10 w-10 items-center justify-center rounded-2xl border text-base ${
                          active
                            ? 'border-transparent bg-white/20 text-white dark:bg-white/10'
                            : 'border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {item.icon}
                      </span>
                      {isSidebarOpen && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="mt-8 space-y-3">
            <ul className="space-y-1">
              <li>
                <Link
                  className={`group flex items-center gap-3 rounded-2xl px-1 py-2 font-medium text-sm transition ${
                    isSidebarOpen ? 'justify-start' : 'justify-center'
                  } ${
                    isActive('/admin/settings')
                      ? 'bg-slate-900 text-white dark:bg-white/10'
                      : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/70'
                  }`}
                  href={'/admin/settings' as unknown as UrlObject}
                  prefetch={false}
                >
                  <span
                    className={`${
                      isSidebarOpen ? 'ml-2' : ''
                    } flex h-10 w-10 items-center justify-center rounded-2xl border text-base ${
                      isActive('/admin/settings')
                        ? 'border-transparent bg-white/20 text-white dark:bg-white/10'
                        : 'border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-300'
                    }`}
                  >
                    <Settings />
                  </span>
                  {isSidebarOpen && <span className="truncate">Settings</span>}
                </Link>
              </li>
              <li>
                <Link
                  className={`group flex items-center gap-3 rounded-2xl px-1 py-2 font-medium text-sm transition ${
                    isSidebarOpen ? 'justify-start' : 'justify-center'
                  } ${
                    isActive('/admin/documentation')
                      ? 'bg-slate-900 text-white dark:bg-white/10'
                      : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/70'
                  }`}
                  href={'/admin/documentation' as unknown as UrlObject}
                  prefetch={false}
                >
                  <span
                    className={`${
                      isSidebarOpen ? 'ml-2' : ''
                    } flex h-10 w-10 items-center justify-center rounded-2xl border text-base ${
                      isActive('/admin/documentation')
                        ? 'border-transparent bg-white/20 text-white dark:bg-white/10'
                        : 'border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-300'
                    }`}
                  >
                    <FileText />
                  </span>
                  {isSidebarOpen && (
                    <span className="truncate">Documentation</span>
                  )}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </aside>
  );
};

type ProfileCardProps = {
  avatarUrl: string;
  email: string;
  isSidebarOpen: boolean;
  name: string;
};

function ProfileCard({
  avatarUrl,
  email,
  isSidebarOpen,
  name,
}: ProfileCardProps) {
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-2 shadow-[0_15px_40px_-25px_rgba(15,23,42,0.35)] dark:border-slate-800 dark:bg-slate-800/60 ${
        isSidebarOpen ? '' : 'justify-center'
      }`}
    >
      <div className="relative">
        <Image
          alt={name}
          className="h-12 w-12 rounded-2xl object-cover"
          height={48}
          src={avatarUrl}
          unoptimized
          width={48}
        />
        <span className="-right-1 -bottom-1 absolute inline-flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-emerald-400 dark:border-slate-800" />
      </div>
      {isSidebarOpen && (
        <div>
          <p className="font-semibold text-slate-900 text-sm dark:text-white">
            {name}
          </p>
          <p className="text-slate-500 text-xs dark:text-slate-300">{email}</p>
          <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 font-semibold text-[11px] text-emerald-600 uppercase tracking-wide dark:bg-emerald-500/15 dark:text-emerald-200">
            Admin
          </span>
        </div>
      )}
    </div>
  );
}

type SectionHeadingProps = {
  isSidebarOpen: boolean;
  title: string;
};

function SectionHeading({ isSidebarOpen, title }: SectionHeadingProps) {
  return (
    <h2
      className={`mb-3 flex font-semibold text-slate-400 text-xs uppercase tracking-wide ${
        isSidebarOpen ? 'justify-start' : 'justify-center'
      }`}
    >
      {isSidebarOpen ? title : ''}
    </h2>
  );
}

export default AdminSidebar;
