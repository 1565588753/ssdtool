import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 8套改进的差异化主题配色方案
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
      active: '#475569',
      text: '#f8fafc',
      textSecondary: '#94a3b8',
      textMuted: '#64748b',
      border: 'rgba(255, 255, 255, 0.1)',
      borderLight: 'rgba(255, 255, 255, 0.2)',
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
      base: '#ffffff',
      card: '#f8fafc',
      hover: '#f1f5f9',
      active: '#e2e8f0',
      text: '#1e293b',
      textSecondary: '#475569',
      textMuted: '#64748b',
      border: 'rgba(0, 0, 0, 0.1)',
      borderLight: 'rgba(0, 0, 0, 0.2)',
    },
  },
  {
    id: 'midnight-black',
    name: '午夜黑',
    mode: 'dark',
    primary: {
      50: '#f0fdfa',
      100: '#ccfbf1',
      200: '#99f6e4',
      300: '#5eead4',
      400: '#2dd4bf',
      500: '#14b8a6',
      600: '#0d9488',
      700: '#0f766e',
      800: '#115e59',
      900: '#134e4a',
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
    gradient: 'linear-gradient(135deg, #14b8a6 0%, #0ea5e9 100%)',
    glowColor: 'rgba(20, 184, 166, 0.4)',
    bg: {
      base: '#020617',
      card: '#0f172a',
      hover: '#1e293b',
      active: '#334155',
      text: '#e2e8f0',
      textSecondary: '#cbd5e1',
      textMuted: '#64748b',
      border: 'rgba(30, 41, 59, 0.8)',
      borderLight: 'rgba(71, 85, 105, 0.8)',
    },
  },
  {
    id: 'sunrise-gold',
    name: '晨曦金',
    mode: 'light',
    primary: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    accent: {
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
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
    glowColor: 'rgba(245, 158, 11, 0.3)',
    bg: {
      base: '#fafaf9',
      card: '#f5f5f4',
      hover: '#e7e5e4',
      active: '#d6d3d1',
      text: '#1c1917',
      textSecondary: '#44403c',
      textMuted: '#78716c',
      border: 'rgba(214, 211, 209, 0.8)',
      borderLight: 'rgba(168, 162, 158, 0.8)',
    },
  },
  {
    id: 'lavender-purple',
    name: '薰衣草',
    mode: 'light',
    primary: {
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
    accent: {
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
    gradient: 'linear-gradient(135deg, #d946ef 0%, #a855f7 100%)',
    glowColor: 'rgba(217, 70, 239, 0.3)',
    bg: {
      base: '#faf5ff',
      card: '#f3e8ff',
      hover: '#e9d5ff',
      active: '#d8b4fe',
      text: '#581c87',
      textSecondary: '#7e22ce',
      textMuted: '#a855f7',
      border: 'rgba(216, 180, 254, 0.8)',
      borderLight: 'rgba(192, 132, 252, 0.8)',
    },
  },
  {
    id: 'emerald-green',
    name: '翡翠绿',
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
    gradient: 'linear-gradient(135deg, #22c55e 0%, #06b6d4 100%)',
    glowColor: 'rgba(34, 197, 94, 0.3)',
    bg: {
      base: '#ecfdf5',
      card: '#d1fae5',
      hover: '#a7f3d0',
      active: '#6ee7b7',
      text: '#064e3b',
      textSecondary: '#047857',
      textMuted: '#059669',
      border: 'rgba(110, 231, 183, 0.8)',
      borderLight: 'rgba(52, 211, 153, 0.8)',
    },
  },
  {
    id: 'rose-red',
    name: '玫瑰红',
    mode: 'light',
    primary: {
      50: '#fff1f2',
      100: '#ffe4e6',
      200: '#fecdd3',
      300: '#fda4af',
      400: '#fb7185',
      500: '#f43f5e',
      600: '#e11d48',
      700: '#be123c',
      800: '#9f1239',
      900: '#881337',
    },
    accent: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    gradient: 'linear-gradient(135deg, #f43f5e 0%, #fbbf24 100%)',
    glowColor: 'rgba(244, 63, 94, 0.3)',
    bg: {
      base: '#fff1f2',
      card: '#ffe4e6',
      hover: '#fecdd3',
      active: '#fda4af',
      text: '#881337',
      textSecondary: '#9f1239',
      textMuted: '#be123c',
      border: 'rgba(253, 164, 175, 0.8)',
      borderLight: 'rgba(251, 113, 133, 0.8)',
    },
  },
  {
    id: 'sky-blue',
    name: '天空蓝',
    mode: 'light',
    primary: {
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
    accent: {
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
    gradient: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)',
    glowColor: 'rgba(14, 165, 233, 0.3)',
    bg: {
      base: '#f0f9ff',
      card: '#e0f2fe',
      hover: '#bae6fd',
      active: '#7dd3fc',
      text: '#0c4a6e',
      textSecondary: '#075985',
      textMuted: '#0369a1',
      border: 'rgba(125, 211, 252, 0.8)',
      borderLight: 'rgba(56, 189, 248, 0.8)',
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
    --theme-bg-active: ${theme.bg.active};
    --theme-text: ${theme.bg.text};
    --theme-text-secondary: ${theme.bg.textSecondary};
    --theme-text-muted: ${theme.bg.textMuted};
    --theme-border: ${theme.bg.border};
    --theme-border-light: ${theme.bg.borderLight};
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
