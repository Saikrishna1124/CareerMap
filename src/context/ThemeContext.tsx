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
  {
    id: 'warm-slate',
    name: 'Warm Slate',
    description: 'Our default balanced light theme. Gentle cream surfaces and rich slate text.',
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
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return 'light';
  });

  const [contrastMode, setContrastMode] = useState<boolean>(() => {
    return localStorage.getItem('contrastMode') === 'true';
  });

  const [activeDarkTheme, setActiveDarkTheme] = useState<string>(() => {
    const saved = localStorage.getItem('careermap-theme');
    if (saved === 'crimson-dusk' || saved === 'cyber-pastel' || saved === 'bento-grid-dark') return 'obsidian-warm';
    if (
      saved === 'emerald-forest' ||
      saved === 'midnight-ocean' ||
      saved === 'sunset-glow' ||
      saved === 'mint-rose' ||
      saved === 'mint-rose-light' ||
      saved === 'ocean-breeze-light' ||
      saved === 'nordic-glacier-light'
    )
      return 'teal-mint-light';
    return saved || 'obsidian-warm';
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
      selectDarkTheme('warm-slate');
    } else {
      selectDarkTheme('obsidian-warm');
    }
  };

  const setTheme = (t: Theme) => {
    if (t === 'light') {
      selectDarkTheme('warm-slate');
    } else {
      selectDarkTheme('obsidian-warm');
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

  return (
    <ThemeContext.Provider value={{
      theme,
      setTheme,
      toggleTheme,
      contrastMode,
      toggleContrastMode,
      activeDarkTheme,
      selectDarkTheme
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
