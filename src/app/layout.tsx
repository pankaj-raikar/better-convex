import type { Metadata } from 'next';
import { Geist, Geist_Mono, Outfit } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Better Convex - Todo App',
  description: 'A feature-rich todo application built with Convex',
};

const outfit = Outfit({
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`antialiased ${outfit.className} dark:bg-gray-900`}>
        <Providers>
          {/* <BreadcrumbNav /> */}
          {children}
        </Providers>
      </body>
    </html>
  );
}
