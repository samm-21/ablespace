'use client';
import { useEffect } from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { ColorMode } from '@/types';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="light" enableSystem={false}>
      {children}
    </NextThemesProvider>
  );
}

export function useColorMode() {
  const setColorMode = (color: ColorMode) => {
    document.documentElement.setAttribute('data-color', color);
    localStorage.setItem('pyramid_color', color);
  };

  const getColorMode = (): ColorMode => {
    if (typeof window === 'undefined') return 'blue';
    return (localStorage.getItem('pyramid_color') as ColorMode) || 'blue';
  };

  return { setColorMode, getColorMode };
}

export function ColorModeApplier() {
  useEffect(() => {
    const color = localStorage.getItem('pyramid_color') || 'blue';
    document.documentElement.setAttribute('data-color', color);
  }, []);
  return null;
}
