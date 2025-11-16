'use client';

import type React from 'react';
import { createContext, use, useCallback, useSyncExternalStore } from 'react';

type Theme = 'light' | 'dark';

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') {
    return 'light';
  }
  return (localStorage.getItem('theme') as Theme | null) || 'light';
};

let currentTheme: Theme = getInitialTheme();
const listeners = new Set<() => void>();

const applyThemePreference = (theme: Theme) => {
  if (typeof window === 'undefined') {
    return;
  }
  document.documentElement.classList.toggle('dark', theme === 'dark');
  localStorage.setItem('theme', theme);
};

if (typeof window !== 'undefined') {
  applyThemePreference(currentTheme);
}

const setCurrentTheme = (nextTheme: Theme) => {
  if (currentTheme === nextTheme) {
    return;
  }
  currentTheme = nextTheme;
  applyThemePreference(nextTheme);
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const getSnapshot = (): Theme => currentTheme;
const getServerSnapshot = (): Theme => 'light';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const theme = useSyncExternalStore<Theme>(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const toggleTheme = useCallback(() => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setCurrentTheme(nextTheme);
  }, [theme]);

  return <ThemeContext value={{ theme, toggleTheme }}>{children}</ThemeContext>;
};

export const useTheme = (): ThemeContextType => {
  const context = use(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
