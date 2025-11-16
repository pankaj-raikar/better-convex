'use client';
import type React from 'react';
import { useSidebar } from '@/context/SidebarContext';

const Backdrop: React.FC = () => {
  const { isMobileOpen, toggleMobileSidebar } = useSidebar();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
      e.preventDefault();
      toggleMobileSidebar();
    }
  };

  if (!isMobileOpen) {
    return null;
  }

  return (
    <div
      aria-label="Close sidebar"
      className="fixed inset-0 z-40 bg-gray-900/50 lg:hidden"
      onClick={toggleMobileSidebar}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    />
  );
};

export default Backdrop;
