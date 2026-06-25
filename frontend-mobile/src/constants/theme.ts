/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    primary: '#4f46e5',
    primaryHover: '#4338ca',
    primaryGlow: 'rgba(79, 70, 229, 0.12)',
    primaryGlowStrong: 'rgba(79, 70, 229, 0.3)',
    
    success: '#10b981',
    successBg: '#d1fae5',
    warning: '#f59e0b',
    warningBg: '#fef3c7',
    danger: '#ef4444',
    dangerBg: '#fee2e2',
    
    badgePendingText: '#92400e',
    badgeApprovedText: '#065f46',
    badgeRejectedText: '#991b1b',
    
    background: '#f8fafc',
    bgSurface: '#ffffff',
    bgSurfaceHover: '#f1f5f9',
    border: '#e2e8f0',
    
    text: '#0f172a',
    textMuted: '#475569',
    textSecondary: '#475569',
    
    // Legacy mapping compatibility
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
  },
  dark: {
    primary: '#6366f1',
    primaryHover: '#818cf8',
    primaryGlow: 'rgba(99, 102, 241, 0.15)',
    primaryGlowStrong: 'rgba(99, 102, 241, 0.4)',
    
    success: '#34d399',
    successBg: 'rgba(16, 185, 129, 0.15)',
    warning: '#fbbf24',
    warningBg: 'rgba(245, 158, 11, 0.15)',
    danger: '#f87171',
    dangerBg: 'rgba(239, 68, 68, 0.15)',
    
    badgePendingText: '#fbbf24',
    badgeApprovedText: '#34d399',
    badgeRejectedText: '#f87171',
    
    background: '#0b0f19',
    bgSurface: '#111827',
    bgSurfaceHover: '#1f2937',
    border: '#1f2937',
    
    text: '#f8fafc',
    textMuted: '#94a3b8',
    textSecondary: '#94a3b8',
    
    // Legacy mapping compatibility
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
  },
} as const;

export const Gradients = {
  light: ['#ffffff', '#eef2ff'] as const,
  dark: ['#111827', '#1e1b4b'] as const,
  primaryLight: ['#4f46e5', '#7c3aed'] as const,
  primaryDark: ['#6366f1', '#a78bfa'] as const,
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
