import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider, ColorModeApplier } from '@/components/ThemeProvider';

export const metadata: Metadata = {
  title: 'Pyramid — Task Management',
  description: 'Manage your tasks and projects efficiently with Pyramid',
  keywords: ['task management', 'project management', 'productivity', 'kanban'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeProvider>
          <ColorModeApplier />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
