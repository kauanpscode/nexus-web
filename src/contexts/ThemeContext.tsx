'use client';

import React, { createContext, useContext, useEffect, useMemo, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { getContrastTextColor, adjustColorBrightness, hexToRgba } from '../utils/colors';

interface CompanyTheme {
  primary: string;
  secondary: string;
  primaryHover: string;
  primaryContrast: string;
  primaryLight: string;
  bubbleSent: string;
  empresaNome: string;
  empresaLogo: string | null;
}

interface ThemeContextData {
  theme: CompanyTheme;
}

const ThemeContext = createContext<ThemeContextData>({} as ThemeContextData);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { empresa } = useAuth();

  const theme: CompanyTheme = useMemo(() => {
    const primary = empresa?.cor_primaria || '#0A4D68';
    const secondary = empresa?.cor_secundaria || '#088395';
    const primaryHover = adjustColorBrightness(primary, -15);
    const primaryContrast = getContrastTextColor(primary);
    const primaryLight = hexToRgba(primary, 0.1);
    const bubbleSent = hexToRgba(primary, 0.15);
    const empresaNome = empresa?.nome_fantasia || empresa?.nome || 'Tchat Corporativo';
    const empresaLogo = empresa?.logo_url || null;

    return {
      primary,
      secondary,
      primaryHover,
      primaryContrast,
      primaryLight,
      bubbleSent,
      empresaNome,
      empresaLogo,
    };
  }, [empresa]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.style.setProperty('--primary-color', theme.primary);
      root.style.setProperty('--secondary-color', theme.secondary);
      root.style.setProperty('--primary-hover', theme.primaryHover);
      root.style.setProperty('--primary-contrast', theme.primaryContrast);
      root.style.setProperty('--primary-light', theme.primaryLight);
      root.style.setProperty('--primary-bubble', theme.bubbleSent);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextData {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser utilizado dentro de ThemeProvider');
  }
  return context;
}
