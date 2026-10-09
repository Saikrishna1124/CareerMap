import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

export interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  feel: string;
  isDark: boolean;
  colors: string[];
  variables: Record<string, string>;
}

export const THEMES: ThemeConfig[] = [
  // =========================================================================
  // FLAGSHIP THEMES: 1. PREMIUM DARK & 2. PREMIUM LIGHT
  // =========================================================================
  {
    id: 'careermap-dark',
    name: 'Midnight Obsidian',
    description: 'Flagship executive dark theme. Deep midnight slate canvas with crystalline surfaces, luminous AI indigo accents, and zero-fatigue readability.',
    feel: 'Midnight Obsidian (Flagship Dark)',
    isDark: true,
    colors: ['#0B0F17', '#131926', '#6366F1', '#10B981'],
    variables: {
      '--bg-base': '#0B0F17',
      '--bg-main': '#0F1420',
      '--bg-sidebar': '#090D15',
      '--bg-card': '#131926',
      '--bg-raised': '#1A2234',

      '--border-subtle': '#1E2738',
      '--border-default': '#2A364E',
      '--border-focus': '#6366F1',

      '--accent-primary': '#6366F1',
      '--accent-glow': 'rgba(99, 102, 241, 0.25)',
      '--accent-soft-surface': 'rgba(99, 102, 241, 0.12)',
      '--accent-cyan': '#06B6D4',
      '--accent-cyan-soft': 'rgba(6, 182, 212, 0.12)',
      '--accent-amber': '#F59E0B',
      '--accent-amber-soft': 'rgba(245, 158, 11, 0.12)',

      '--text-primary': '#F8FAFC',
      '--text-secondary': '#94A3B8',
      '--text-muted': '#64748B',
      '--text-link': '#818CF8',

      '--status-success': '#10B981',
      '--status-success-bg': 'rgba(16, 185, 129, 0.12)',
      '--status-warning': '#F59E0B',
      '--status-warning-bg': 'rgba(245, 158, 11, 0.12)',
      '--status-error': '#EF4444',
      '--status-error-bg': 'rgba(239, 68, 68, 0.12)',
      '--status-info': '#3B82F6',
      '--status-info-bg': 'rgba(59, 130, 246, 0.12)',

      '--chart-grid': 'rgba(255, 255, 255, 0.08)',
      '--chart-tooltip-bg': '#1A2234',
      '--chart-tooltip-text': '#F8FAFC',
      '--chart-tooltip-border': '#2A364E',
    }
  },
  {
    id: 'careermap-light',
    name: 'Executive Ivory',
    description: 'Flagship executive light theme. Warm porcelain canvas, crisp optic cards, deep slate typography, and authoritative royal indigo accents.',
    feel: 'Executive Ivory (Flagship Light)',
    isDark: false,
    colors: ['#F8FAFC', '#FFFFFF', '#4F46E5', '#059669'],
    variables: {
      '--bg-base': '#F8FAFC',
      '--bg-main': '#FFFFFF',
      '--bg-sidebar': '#F1F5F9',
      '--bg-card': '#FFFFFF',
      '--bg-raised': '#FFFFFF',

      '--border-subtle': '#E2E8F0',
      '--border-default': '#CBD5E1',
      '--border-focus': '#4F46E5',

      '--accent-primary': '#4F46E5',
      '--accent-glow': 'rgba(79, 70, 229, 0.18)',
      '--accent-soft-surface': '#EEF2FF',
      '--accent-cyan': '#0284C7',
      '--accent-cyan-soft': '#E0F2FE',
      '--accent-amber': '#D97706',
      '--accent-amber-soft': '#FEF3C7',

      '--text-primary': '#0F172A',
      '--text-secondary': '#475569',
      '--text-muted': '#94A3B8',
      '--text-link': '#4F46E5',

      '--status-success': '#059669',
      '--status-success-bg': '#ECFDF5',
      '--status-warning': '#D97706',
      '--status-warning-bg': '#FFFBEB',
      '--status-error': '#DC2626',
      '--status-error-bg': '#FEF2F2',
      '--status-info': '#2563EB',
      '--status-info-bg': '#EFF6FF',

      '--chart-grid': '#E2E8F0',
      '--chart-tooltip-bg': '#FFFFFF',
      '--chart-tooltip-text': '#0F172A',
      '--chart-tooltip-border': '#CBD5E1',
    }
  },

  // =========================================================================
  // ADDITIONAL PRESERVED THEMES
  // =========================================================================
  {
    id: 'warm-slate',
    name: 'Warm Slate',
    description: 'Our classic balanced light theme. Gentle cream surfaces and rich slate text.',
    feel: 'Warm Slate',
    isDark: false,
    colors: ['#F6F2EC', '#EDEAE3', '#DDD5C8', '#4F378B'],
    variables: {
      '--bg-base': '#F6F2EC',
      '--bg-main': '#FFFFFF',
      '--bg-sidebar': '#EDEAE3',
      '--bg-card': '#FFFFFF',
      '--bg-raised': '#F9F8F6',

      '--border-subtle': '#DDD5C8',
      '--border-default': '#C4B5A0',
      '--border-focus': '#4F378B',

      '--accent-primary': '#4F378B',
      '--accent-glow': '#DDD6FE',
      '--accent-soft-surface': '#EDE9FE',
      '--accent-amber': '#D97706',
      '--accent-amber-soft': '#FEF3C7',
      '--accent-cyan': '#0D9488',
      '--accent-cyan-soft': '#CCFBF1',

      '--text-primary': '#1C1917',
      '--text-secondary': '#78716C',
      '--text-muted': '#A8A29E',
      '--text-link': '#4F378B',

      '--status-success': '#16A34A',
      '--status-success-bg': '#DCFCE7',
      '--status-warning': '#D97706',
      '--status-warning-bg': '#FEF3C7',
      '--status-error': '#DC2626',
      '--status-error-bg': '#FEE2E2',
      '--status-info': '#2563EB',
      '--status-info-bg': '#DBEAFE',

      '--chart-grid': '#DDD5C8',
      '--chart-tooltip-bg': '#FFFFFF',
      '--chart-tooltip-text': '#1C1917',
      '--chart-tooltip-border': '#DDD5C8',
    }
  },
  {
    id: 'obsidian-warm',
    name: 'Obsidian Warm',
    description: 'Cozy and protective dark theme with warm wood undertones. Raycast/Arc style.',
    feel: 'Obsidian Warm',
    isDark: true,
    colors: ['#0D0B09', '#141210', '#1C1916', '#7C86FF'],
    variables: {
      '--bg-base': '#0D0B09',
      '--bg-main': '#141210',
      '--bg-sidebar': '#1C1916',
      '--bg-card': '#232018',
      '--bg-raised': '#2C2820',

      '--border-subtle': '#272320',
      '--border-default': '#322E28',
      '--border-focus': '#7C86FF',

      '--accent-primary': '#7C86FF',
      '--accent-glow': '#C4A8FF',
      '--accent-soft-surface': '#2D1F5E',
      '--accent-amber': '#F59E0B',
      '--accent-amber-soft': '#2C1A00',
      '--accent-cyan': '#06B6D4',
      '--accent-cyan-soft': '#1A2C3E',

      '--text-primary': '#F2EDE6',
      '--text-secondary': '#A89F96',
      '--text-muted': '#6B6560',
      '--text-link': '#C4A8FF',

      '--status-success': '#4ADE80',
      '--status-success-bg': '#14301E',
      '--status-warning': '#FCD34D',
      '--status-warning-bg': '#2C1A00',
      '--status-error': '#F87171',
      '--status-error-bg': '#2D1015',
      '--status-info': '#60A5FA',
      '--status-info-bg': '#0C2340',

      '--chart-grid': '#272320',
      '--chart-tooltip-bg': '#232018',
      '--chart-tooltip-text': '#F2EDE6',
      '--chart-tooltip-border': '#322E28',
    }
  },
  {
    id: 'teal-mint-light',
    name: 'Teal Mint',
    description: 'A vibrant, fresh light theme with a soft mint sidebar, crisp white surfaces, and deep teal accents.',
    feel: 'Teal Mint',
    isDark: false,
    colors: ['#E0F2F1', '#FFFFFF', '#B2DFDB', '#00897B'],
    variables: {
      '--bg-base': '#E0F2F1',
      '--bg-main': '#FFFFFF',
      '--bg-sidebar': '#B2DFDB',
      '--bg-card': '#FFFFFF',
      '--bg-raised': '#F0FDF4',

      '--border-subtle': '#80CBC4',
      '--border-default': '#4DB6AC',
      '--border-focus': '#00897B',

      '--accent-primary': '#00897B',
      '--accent-glow': '#E0F2F1',
      '--accent-soft-surface': '#E0F2F1',
      '--accent-cyan': '#26A69A',
      '--accent-cyan-soft': '#E0F2F1',
      '--accent-amber': '#FFB300',
      '--accent-amber-soft': '#FFF8E1',

      '--text-primary': '#004D40',
      '--text-secondary': '#00796B',
      '--text-muted': '#00897B',
      '--text-link': '#00897B',

      '--status-success': '#2E7D32',
      '--status-success-bg': '#E8F5E9',
      '--status-warning': '#EF6C00',
      '--status-warning-bg': '#FFF3E0',
      '--status-error': '#C62828',
      '--status-error-bg': '#FFEBEE',
      '--status-info': '#00897B',
      '--status-info-bg': '#E0F2F1',

      '--chart-grid': '#B2DFDB',
      '--chart-tooltip-bg': '#FFFFFF',
      '--chart-tooltip-text': '#004D40',
      '--chart-tooltip-border': '#80CBC4',
    }
  },
  {
    id: 'emerald-champagne',
    name: 'Emerald Champagne',
    description: 'An opulent, scholarly light theme pairing refined Emerald Ink with rich Champagne surfaces.',
    feel: 'Emerald & Champagne',
    isDark: false,
    colors: ['#F8E7C9', '#064E3B', '#F3DCB7', '#047857'],
    variables: {
      '--bg-base': '#F8E7C9',
      '--bg-main': '#FFFFFF',
      '--bg-sidebar': '#F3DCB7',
      '--bg-card': '#FFFFFF',
      '--bg-raised': '#FFFDF8',

      '--border-subtle': '#E8D5B5',
      '--border-default': '#D4BE98',
      '--border-focus': '#064E3B',

      '--accent-primary': '#064E3B',
      '--accent-glow': '#A7F3D0',
      '--accent-soft-surface': '#ECFDF5',
      '--accent-cyan': '#0D9488',
      '--accent-cyan-soft': '#E6FFFA',
      '--accent-amber': '#D97706',
      '--accent-amber-soft': '#FEF3C7',

      '--text-primary': '#064E3B',
      '--text-secondary': '#1F5747',
      '--text-muted': '#52796F',
      '--text-link': '#047857',

      '--status-success': '#059669',
      '--status-success-bg': '#D1FAE5',
      '--status-warning': '#D97706',
      '--status-warning-bg': '#FEF3C7',
      '--status-error': '#DC2626',
      '--status-error-bg': '#FEE2E2',
      '--status-info': '#0284C7',
      '--status-info-bg': '#E0F2FE',

      '--chart-grid': '#E8D5B5',
      '--chart-tooltip-bg': '#FFFFFF',
      '--chart-tooltip-text': '#064E3B',
      '--chart-tooltip-border': '#E8D5B5',
    }
  },
  {
    id: 'burnt-orange-vanilla',
    name: 'Burnt Orange Vanilla',
    description: 'A cozy, energizing light theme featuring vibrant Burnt Orange accents over creamy warm Vanilla.',
    feel: 'Burnt Orange & Vanilla',
    isDark: false,
    colors: ['#FFF4D6', '#FC6C26', '#FDE8BA', '#291507'],
    variables: {
      '--bg-base': '#FFF4D6',
      '--bg-main': '#FFFFFF',
      '--bg-sidebar': '#FDE8BA',
      '--bg-card': '#FFFFFF',
      '--bg-raised': '#FFF9ED',

      '--border-subtle': '#F5DEB0',
      '--border-default': '#E8C98E',
      '--border-focus': '#FC6C26',

      '--accent-primary': '#FC6C26',
      '--accent-glow': '#FED7AA',
      '--accent-soft-surface': '#FFF0E6',
      '--accent-cyan': '#0284C7',
      '--accent-cyan-soft': '#E0F2FE',
      '--accent-amber': '#EA580C',
      '--accent-amber-soft': '#FFEDD5',

      '--text-primary': '#291507',
      '--text-secondary': '#6C4A32',
      '--text-muted': '#9A7B66',
      '--text-link': '#FC6C26',

      '--status-success': '#16A34A',
      '--status-success-bg': '#DCFCE7',
      '--status-warning': '#D97706',
      '--status-warning-bg': '#FEF3C7',
      '--status-error': '#DC2626',
      '--status-error-bg': '#FEE2E2',
      '--status-info': '#2563EB',
      '--status-info-bg': '#DBEAFE',

      '--chart-grid': '#F5DEB0',
      '--chart-tooltip-bg': '#FFFFFF',
      '--chart-tooltip-text': '#291507',
      '--chart-tooltip-border': '#F5DEB0',
    }
  }
];

interface ThemeContextType {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  contrastMode: boolean;
  toggleContrastMode: () => void;
  activeDarkTheme: string;
  selectDarkTheme: (themeId: string) => void;
  isDark: boolean;
  currentThemeConfig: ThemeConfig;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;
    const prefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  });

  const [contrastMode, setContrastMode] = useState<boolean>(() => {
    return localStorage.getItem('contrastMode') === 'true';
  });

  const [activeDarkTheme, setActiveDarkTheme] = useState<string>(() => {
    const saved = localStorage.getItem('careermap-theme');
    // If user has a valid saved theme, use it
    if (saved && THEMES.some(t => t.id === saved)) return saved;
    // Otherwise fallback based on saved theme mode or system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') return 'careermap-dark';
    if (savedTheme === 'light') return 'careermap-light';
    const prefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'careermap-dark' : 'careermap-light';
  });

  // Inject variables to documentElement
  const applyThemeVars = (themeId: string) => {
    const config = THEMES.find(t => t.id === themeId);
    if (!config) return;
    const root = document.documentElement;
    Object.entries(config.variables).forEach(([key, val]) => {
      root.style.setProperty(key, val);
    });
  };

  useEffect(() => {
    const config = THEMES.find(t => t.id === activeDarkTheme);
    if (config) {
      if (config.isDark) {
        document.documentElement.classList.add('dark');
        setThemeState('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        setThemeState('light');
        localStorage.setItem('theme', 'light');
      }
      applyThemeVars(activeDarkTheme);
    }
  }, [activeDarkTheme]);

  useEffect(() => {
    localStorage.setItem('contrastMode', String(contrastMode));
    if (contrastMode) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [contrastMode]);

  const toggleTheme = () => {
    const config = THEMES.find(t => t.id === activeDarkTheme);
    if (config?.isDark) {
      selectDarkTheme('careermap-light');
    } else {
      selectDarkTheme('careermap-dark');
    }
  };

  const setTheme = (t: Theme) => {
    if (t === 'light') {
      selectDarkTheme('careermap-light');
    } else {
      selectDarkTheme('careermap-dark');
    }
  };

  const selectDarkTheme = (themeId: string) => {
    localStorage.setItem('careermap-theme', themeId);
    setActiveDarkTheme(themeId);
    const config = THEMES.find(t => t.id === themeId);
    if (config) {
      const nextMode = config.isDark ? 'dark' : 'light';
      setThemeState(nextMode);
      localStorage.setItem('theme', nextMode);
      if (config.isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      applyThemeVars(themeId);
    }
  };

  const toggleContrastMode = () => {
    setContrastMode(prev => !prev);
  };

  const currentThemeConfig = THEMES.find(t => t.id === activeDarkTheme) || THEMES[0];

  return (
    <ThemeContext.Provider value={{
      theme,
      setTheme,
      toggleTheme,
      contrastMode,
      toggleContrastMode,
      activeDarkTheme,
      selectDarkTheme,
      isDark: theme === 'dark',
      currentThemeConfig
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
