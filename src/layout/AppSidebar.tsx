'use client';
import {
  Calendar,
  CheckSquare,
  Grid3X3,
  Mail,
  PieChart,
  Plug,
  Settings,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type React from 'react';
import type { UrlObject } from 'url';
import { useSidebar } from '@/context/SidebarContext';
// import { useUser } from '@clerk/nextjs';
import { useCurrentUser } from '@/lib/convex/hooks';

type SimpleNavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

type ProjectItem = {
  label: string;
  colorClass: string;
};

const primaryNavItems: SimpleNavItem[] = [
  { label: 'Home', href: '/dashboard', icon: <Grid3X3 /> },
  { label: 'Prodify AI', href: '/dashboard/profile', icon: <Plug /> },
  { label: 'My tasks', href: '/dashboard/tasks', icon: <CheckSquare /> },
  { label: 'Inbox', href: '/dashboard/inbox', icon: <Mail /> },
  { label: 'Calendar', href: '/dashboard/calendar', icon: <Calendar /> },
  {
    label: 'Reports & Analytics',
    href: '/dashboard/analytics',
    icon: <PieChart />,
  },
];

const projectItems: ProjectItem[] = [
  { label: 'Product launch', colorClass: 'bg-fuchsia-500' },
  { label: 'Team brainstorm', colorClass: 'bg-sky-500' },
  { label: 'Branding launch', colorClass: 'bg-emerald-400' },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const user = useCurrentUser();

  const isSidebarOpen = isExpanded || isHovered || isMobileOpen;

  const profileName = user?.name ?? 'Courtney Henry';
  const profileEmail = user?.email ?? 'courtney@example.com';
  const avatarUrl = user?.image ?? '/images/user/user-01.jpg';

  const isActive = (href: string) => pathname === href;

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
          <SectionHeading isSidebarOpen={isSidebarOpen} title="Menu" />
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

          <div className="mt-8 space-y-3">
            <div
              className={`flex items-center ${
                isSidebarOpen ? 'justify-between' : 'justify-center'
              }`}
            >
              <SectionHeading
                isSidebarOpen={isSidebarOpen}
                title="My Projects"
              />
              {isSidebarOpen ? (
                <button
                  className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-600 text-xs hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
                  type="button"
                >
                  + Add
                </button>
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-slate-100 font-semibold text-slate-500 text-xl dark:bg-slate-800 dark:text-white">
                  +
                </div>
              )}
            </div>
            <ul className="space-y-2">
              {projectItems.map((project) => (
                <li
                  className={`flex items-center gap-3 rounded-2xl px-3 py-2 font-medium text-slate-600 text-sm dark:text-slate-200 ${
                    isSidebarOpen ? 'justify-start' : 'justify-center'
                  }`}
                  key={project.label}
                >
                  <span
                    aria-hidden="true"
                    className={`h-2.5 w-2.5 rounded-full ${project.colorClass}`}
                  />
                  {isSidebarOpen && (
                    <span className="truncate">{project.label}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 space-y-3">
            <SectionHeading isSidebarOpen={isSidebarOpen} title="Settings" />
            <Link
              className={`flex items-center gap-3 rounded-2xl px-3 py-2 font-medium text-slate-500 text-sm transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/70 ${
                isSidebarOpen ? 'justify-start' : 'justify-center'
              }`}
              href="/login"
              prefetch={false}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-300">
                <Settings />
              </span>
              {isSidebarOpen && <span>Workspace settings</span>}
            </Link>
          </div>
        </div>

        <InviteCard isSidebarOpen={isSidebarOpen} />
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
            Online
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
      {/* {isSidebarOpen ? title : <HorizontaLDots />} */}
      {isSidebarOpen ? title : ''}
    </h2>
  );
}

type InviteCardProps = {
  isSidebarOpen: boolean;
};

function InviteCard({ isSidebarOpen }: InviteCardProps) {
  return (
    <div
      className={`mt-auto rounded-3xl bg-linear-to-br from-purple-500 via-indigo-500 to-sky-500 p-4 text-white shadow-purple-500/40 ${
        isSidebarOpen ? '' : 'flex items-center justify-center'
      }`}
    >
      {isSidebarOpen ? (
        <div className="space-y-3 text-sm">
          <p className="font-semibold text-white/80 text-xs uppercase tracking-[0.2em]">
            Prodify
          </p>
          <p className="font-semibold text-base">
            New members will gain access to public spaces, docs, and dashboards.
          </p>
          <button
            className="w-full rounded-2xl bg-white/20 py-2 font-semibold text-sm backdrop-blur transition hover:bg-white/30"
            type="button"
          >
            + Invite people
          </button>
        </div>
      ) : (
        <span className="font-semibold text-lg">+</span>
      )}
    </div>
  );
}

export default AppSidebar;
