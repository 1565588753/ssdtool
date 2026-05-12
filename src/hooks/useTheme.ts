import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 5套预设主题配色方案
export const themes = [
  {
    id: 'cyber-blue',
    name: '赛博蓝',
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    accent: {
      50: '#ecfeff',
      100: '#cffafe',
      200: '#a5f3fc',
      300: '#67e8f9',
      400: '#22d3ee',
      500: '#06b6d4',
      600: '#0891b2',
      700: '#0e7490',
      800: '#155e75',
      900: '#164e63',
    },
    gradient: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
    glowColor: 'rgba(6, 182, 212, 0.4)',
  },
  {
    id: 'purple-magic',
    name: '紫晶幻',
    primary: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#a855f7',
      600: '#9333ea',
      700: '#7e22ce',
      800: '#6b21a8',
      900: '#581c87',
    },
    accent: {
      50: '#fdf4ff',
      100: '#fae8ff',
      200: '#f5d0fe',
      300: '#f0abfc',
      400: '#e879f9',
      500: '#d946ef',
      600: '#c026d3',
      700: '#a21caf',
      800: '#86198f',
      900: '#701a75',
    },
    gradient: 'linear-gradient(135deg, #9333ea 0%, #d946ef 100%)',
    glowColor: 'rgba(217, 70, 239, 0.4)',
  },
  {
    id: 'forest-green',
    name: '森林绿',
    primary: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    accent: {
      50: '#ecfdf5',
      100: '#d1fae5',
      200: '#a7f3d0',
      300: '#6ee7b7',
      400: '#34d399',
      500: '#10b981',
      600: '#059669',
      700: '#047857',
      800: '#065f46',
      900: '#064e3b',
    },
    gradient: 'linear-gradient(135deg, #16a34a 0%, #10b981 100%)',
    glowColor: 'rgba(16, 185, 129, 0.4)',
  },
  {
    id: 'sunset-orange',
    name: '日落橙',
    primary: {
      50: '#fff7ed',
      100: '#ffedd5',
      200: '#fed7aa',
      300: '#fdba74',
      400: '#fb923c',
      500: '#f97316',
      600: '#ea580c',
      700: '#c2410c',
      800: '#9a3412',
      900: '#7c2d12',
    },
    accent: {
      50: '#fef3c7',
      100: '#fde68a',
      200: '#fcd34d',
      300: '#fbbf24',
      400: '#f59e0b',
      500: '#d97706',
      600: '#b45309',
      700: '#92400e',
      800: '#78350f',
      900: '#451a03',
    },
    gradient: 'linear-gradient(135deg, #ea580c 0%, #f59e0b 100%)',
    glowColor: 'rgba(245, 158, 11, 0.4)',
  },
  {
    id: 'rose-pink',
    name: '玫瑰粉',
    primary: {
      50: '#fdf2f8',
      100: '#fce7f3',
      200: '#fbcfe8',
      300: '#f9a8d4',
      400: '#f472b6',
      500: '#ec4899',
      600: '#db2777',
      700: '#be185d',
      800: '#9d174d',
      900: '#831843',
    },
    accent: {
      50: '#ffe4e6',
      100: '#fecdd3',
      200: '#fda4af',
      300: '#fb7185',
      400: '#f43f5e',
      500: '#e11d48',
      600: '#be123c',
      700: '#9f1239',
      800: '#881337',
      900: '#4c0519',
    },
    gradient: 'linear-gradient(135deg, #db2777 0%, #e11d48 100%)',
    glowColor: 'rgba(225, 29, 72, 0.4)',
  },
];

// 获取CSS变量样式
export const getThemeCSS = (themeId: string) => {
  const theme = themes.find(t => t.id === themeId) || themes[0];
  return `
    --theme-primary-50: ${theme.primary[50]};
    --theme-primary-100: ${theme.primary[100]};
    --theme-primary-200: ${theme.primary[200]};
    --theme-primary-300: ${theme.primary[300]};
    --theme-primary-400: ${theme.primary[400]};
    --theme-primary-500: ${theme.primary[500]};
    --theme-primary-600: ${theme.primary[600]};
    --theme-primary-700: ${theme.primary[700]};
    --theme-primary-800: ${theme.primary[800]};
    --theme-primary-900: ${theme.primary[900]};
    --theme-accent-50: ${theme.accent[50]};
    --theme-accent-100: ${theme.accent[100]};
    --theme-accent-200: ${theme.accent[200]};
    --theme-accent-300: ${theme.accent[300]};
    --theme-accent-400: ${theme.accent[400]};
    --theme-accent-500: ${theme.accent[500]};
    --theme-accent-600: ${theme.accent[600]};
    --theme-accent-700: ${theme.accent[700]};
    --theme-accent-800: ${theme.accent[800]};
    --theme-accent-900: ${theme.accent[900]};
    --theme-gradient: ${theme.gradient};
    --theme-glow-color: ${theme.glowColor};
  `;
};

interface ThemeState {
  currentTheme: string;
  setTheme: (themeId: string) => void;
  applyTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      currentTheme: 'cyber-blue',
      setTheme: (themeId: string) => {
        set({ currentTheme: themeId });
        get().applyTheme();
      },
      applyTheme: () => {
        const theme = get().currentTheme;
        const css = getThemeCSS(theme);
        document.documentElement.style.cssText = css;
      },
    }),
    {
      name: 'theme-storage',
    }
  )
);
