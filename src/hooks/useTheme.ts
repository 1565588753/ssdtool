import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 8套差异化主题配色方案
export const themes = [
  {
    id: 'cyber-blue-dark',
    name: '赛博蓝(深色)',
    mode: 'dark',
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
    bg: {
      base: '#0f172a',
      card: '#1e293b',
      hover: '#334155',
      text: '#f8fafc',
      textSecondary: '#94a3b8',
      border: 'rgba(255, 255, 255, 0.1)',
    },
  },
  {
    id: 'light-minimal',
    name: '极简白',
    mode: 'light',
    primary: {
      50: '#f3f4f6',
      100: '#e5e7eb',
      200: '#d1d5db',
      300: '#9ca3af',
      400: '#6b7280',
      500: '#4b5563',
      600: '#374151',
      700: '#1f2937',
      800: '#111827',
      900: '#030712',
    },
    accent: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
    gradient: 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)',
    glowColor: 'rgba(14, 165, 233, 0.3)',
    bg: {
      base: '#f8fafc',
      card: '#ffffff',
      hover: '#f1f5f9',
      text: '#0f172a',
      textSecondary: '#64748b',
      border: 'rgba(0, 0, 0, 0.1)',
    },
  },
  {
    id: 'midnight-purple',
    name: '午夜紫',
    mode: 'dark',
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
    bg: {
      base: '#0a0a0f',
      card: '#12101f',
      hover: '#1e1b2e',
      text: '#faf5ff',
      textSecondary: '#a78bfa',
      border: 'rgba(168, 85, 247, 0.2)',
    },
  },
  {
    id: 'nature-green',
    name: '自然绿',
    mode: 'light',
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
      50: '#fef7ed',
      100: '#fdedd6',
      200: '#fcd5a9',
      300: '#f9b877',
      400: '#f49641',
      500: '#e97422',
      600: '#cd5713',
      700: '#a74414',
      800: '#863816',
      900: '#6f3016',
    },
    gradient: 'linear-gradient(135deg, #16a34a 0%, #e97422 100%)',
    glowColor: 'rgba(34, 197, 94, 0.3)',
    bg: {
      base: '#f0fdf4',
      card: '#ffffff',
      hover: '#dcfce7',
      text: '#14532d',
      textSecondary: '#65a30d',
      border: 'rgba(22, 163, 74, 0.2)',
    },
  },
  {
    id: 'sunset-ocean',
    name: '日落海',
    mode: 'dark',
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
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
    gradient: 'linear-gradient(135deg, #ea580c 0%, #0284c7 100%)',
    glowColor: 'rgba(249, 115, 22, 0.4)',
    bg: {
      base: '#0f172a',
      card: '#1e1b21',
      hover: '#2d1f1f',
      text: '#fff7ed',
      textSecondary: '#f9a8d4',
      border: 'rgba(249, 115, 22, 0.2)',
    },
  },
  {
    id: 'modern-gray',
    name: '现代灰',
    mode: 'light',
    primary: {
      50: '#fafafa',
      100: '#f4f4f5',
      200: '#e4e4e7',
      300: '#d4d4d8',
      400: '#a1a1aa',
      500: '#71717a',
      600: '#52525b',
      700: '#3f3f46',
      800: '#27272a',
      900: '#18181b',
    },
    accent: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
    gradient: 'linear-gradient(135deg, #3f3f46 0%, #0ea5e9 100%)',
    glowColor: 'rgba(14, 165, 233, 0.3)',
    bg: {
      base: '#f4f4f5',
      card: '#ffffff',
      hover: '#e4e4e7',
      text: '#18181b',
      textSecondary: '#71717a',
      border: 'rgba(63, 63, 70, 0.2)',
    },
  },
  {
    id: 'neon-pink',
    name: '霓虹粉',
    mode: 'dark',
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
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
    gradient: 'linear-gradient(135deg, #db2777 0%, #0ea5e9 100%)',
    glowColor: 'rgba(236, 72, 153, 0.5)',
    bg: {
      base: '#0f0a0f',
      card: '#1a101a',
      hover: '#2d1b2d',
      text: '#fdf2f8',
      textSecondary: '#f472b6',
      border: 'rgba(236, 72, 153, 0.3)',
    },
  },
  {
    id: 'forest-dark',
    name: '森林黑',
    mode: 'dark',
    primary: {
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
    accent: {
      50: '#fef9c3',
      100: '#fef08a',
      200: '#fde047',
      300: '#facc15',
      400: '#eab308',
      500: '#ca8a04',
      600: '#a16207',
      700: '#854d0e',
      800: '#713f12',
      900: '#543310',
    },
    gradient: 'linear-gradient(135deg, #059669 0%, #ca8a04 100%)',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    bg: {
      base: '#050605',
      card: '#0f1714',
      hover: '#1a241a',
      text: '#ecfdf5',
      textSecondary: '#6ee7b7',
      border: 'rgba(16, 185, 129, 0.2)',
    },
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
    --theme-bg-base: ${theme.bg.base};
    --theme-bg-card: ${theme.bg.card};
    --theme-bg-hover: ${theme.bg.hover};
    --theme-text: ${theme.bg.text};
    --theme-text-secondary: ${theme.bg.textSecondary};
    --theme-border: ${theme.bg.border};
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
      currentTheme: 'cyber-blue-dark',
      setTheme: (themeId: string) => {
        set({ currentTheme: themeId });
        get().applyTheme();
      },
      applyTheme: () => {
        const theme = get().currentTheme;
        const css = getThemeCSS(theme);
        const themeData = themes.find(t => t.id === theme) || themes[0];
        
        document.documentElement.style.cssText = css;
        
        // 根据主题模式设置背景色
        document.body.style.backgroundColor = themeData.bg.base;
        document.body.style.color = themeData.bg.text;
      },
    }),
    {
      name: 'theme-storage',
    }
  )
);
