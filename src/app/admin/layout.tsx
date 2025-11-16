'use client';
import { redirect } from 'next/navigation';
import type React from 'react';

import { useSidebar } from '@/context/SidebarContext';
import AdminSidebar from '@/layout/AdminSidebar';
import AppHeader from '@/layout/AppHeader';
import Backdrop from '@/layout/Backdrop';
import { useAuthStatus } from '@/lib/convex/hooks';
import '../globals.css';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuthStatus();
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  // Redirect to login if not authenticated and not loading
  if (!isLoading && !isAuthenticated) {
    redirect('/login');
  }

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Dynamic class for main content margin based on sidebar state
  const mainContentMargin = isMobileOpen
    ? 'ml-0'
    : isExpanded || isHovered
      ? 'lg:ml-[290px]'
      : 'lg:ml-[90px]';

  return (
    <div className="min-h-screen xl:flex">
      {/* Sidebar and Backdrop */}
      <AdminSidebar />
      <Backdrop />
      {/* Main Content Area */}
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}
      >
        {/* Header */}
        <AppHeader />
        {/* Page Content */}
        <div className="mx-auto max-w-7xl p-4 md:p-6">{children}</div>
      </div>
    </div>
  );
}
