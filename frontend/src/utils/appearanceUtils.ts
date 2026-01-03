/**
 * Appearance Utilities for rubiX
 * 
 * This file provides utility functions and constants to help components
 * adapt to different appearance settings (theme, primary color, font size, etc.)
 */

// CSS class generators for adaptive styling
export const appearanceClasses = {
  // Theme-adaptive classes
  text: {
    primary: 'text-adaptive-primary',
    secondary: 'text-adaptive-secondary', 
    tertiary: 'text-adaptive-tertiary'
  },
  
  bg: {
    primary: 'bg-adaptive-primary',
    secondary: 'bg-adaptive-secondary',
    tertiary: 'bg-adaptive-tertiary'
  },
  
  border: {
    primary: 'border-adaptive-primary',
    secondary: 'border-adaptive-secondary'
  },
  
  // Primary color classes (adapt to user's chosen color)
  primary: {
    text: {
      50: 'text-primary-50',
      100: 'text-primary-100',
      200: 'text-primary-200',
      300: 'text-primary-300',
      400: 'text-primary-400',
      500: 'text-primary-500',
      600: 'text-primary-600',
      700: 'text-primary-700',
      800: 'text-primary-800',
      900: 'text-primary-900'
    },
    bg: {
      50: 'bg-primary-50',
      100: 'bg-primary-100',
      200: 'bg-primary-200',
      300: 'bg-primary-300',
      400: 'bg-primary-400',
      500: 'bg-primary-500',
      600: 'bg-primary-600',
      700: 'bg-primary-700',
      800: 'bg-primary-800',
      900: 'bg-primary-900'
    },
    border: {
      50: 'border-primary-50',
      100: 'border-primary-100',
      200: 'border-primary-200',
      300: 'border-primary-300',
      400: 'border-primary-400',
      500: 'border-primary-500',
      600: 'border-primary-600',
      700: 'border-primary-700',
      800: 'border-primary-800',
      900: 'border-primary-900'
    },
    ring: {
      50: 'ring-primary-50',
      100: 'ring-primary-100',
      200: 'ring-primary-200',
      300: 'ring-primary-300',
      400: 'ring-primary-400',
      500: 'ring-primary-500',
      600: 'ring-primary-600',
      700: 'ring-primary-700',
      800: 'ring-primary-800',
      900: 'ring-primary-900'
    }
  },
  
  // Common component classes
  card: 'card',
  button: {
    primary: 'btn-primary'
  }
};

// Utility function to combine classes
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// Common button class combinations
export const buttonVariants = {
  primary: cn(
    'px-4 py-2 rounded-lg font-medium transition-all duration-200',
    'bg-primary-600 hover:bg-primary-700 text-on-primary',
    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed'
  ),
  
  secondary: cn(
    'px-4 py-2 rounded-lg font-medium transition-all duration-200',
    'bg-adaptive-tertiary hover:bg-adaptive-tertiary border border-adaptive-primary',
    'text-adaptive-primary hover:bg-opacity-80',
    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed'
  ),
  
  ghost: cn(
    'px-4 py-2 rounded-lg font-medium transition-all duration-200',
    'hover:bg-adaptive-tertiary text-adaptive-secondary hover:text-adaptive-primary',
    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed'
  ),
  
  danger: cn(
    'px-4 py-2 rounded-lg font-medium transition-all duration-200',
    'bg-red-600 hover:bg-red-700 text-on-primary',
    'focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed'
  ),
  
  success: cn(
    'px-4 py-2 rounded-lg font-medium transition-all duration-200',
    'bg-green-600 hover:bg-green-700 text-on-primary',
    'focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed'
  )
};

// Common card class combinations
export const cardVariants = {
  default: cn(
    'card rounded-lg p-6'
  ),
  
  compact: cn(
    'card rounded-lg p-4'
  ),
  
  interactive: cn(
    'card rounded-lg p-6 cursor-pointer',
    'hover:shadow-md transition-all duration-200'
  )
};

// Input field class combinations
export const inputVariants = {
  default: cn(
    'w-full px-3 py-2 rounded-lg border transition-all duration-200',
    'bg-adaptive-secondary border-adaptive-primary text-adaptive-primary',
    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
    'disabled:opacity-50 disabled:cursor-not-allowed'
  ),
  
  error: cn(
    'w-full px-3 py-2 rounded-lg border transition-all duration-200',
    'bg-adaptive-secondary border-red-500 text-adaptive-primary',
    'focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent',
    'disabled:opacity-50 disabled:cursor-not-allowed'
  )
};

// Text class combinations
export const textVariants = {
  heading: {
    h1: cn('text-3xl font-bold', appearanceClasses.text.primary),
    h2: cn('text-2xl font-semibold', appearanceClasses.text.primary),
    h3: cn('text-xl font-semibold', appearanceClasses.text.primary),
    h4: cn('text-lg font-medium', appearanceClasses.text.primary),
    h5: cn('text-base font-medium', appearanceClasses.text.primary),
    h6: cn('text-sm font-medium', appearanceClasses.text.primary)
  },
  
  body: {
    large: cn('text-lg', appearanceClasses.text.primary),
    default: cn('text-base', appearanceClasses.text.primary),
    small: cn('text-sm', appearanceClasses.text.secondary),
    xs: cn('text-xs', appearanceClasses.text.tertiary)
  },
  
  muted: cn('text-sm', appearanceClasses.text.tertiary)
};

// Helper function to get CSS variable values
export const getCSSVariable = (variable: string): string => {
  if (typeof window !== 'undefined') {
    return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  }
  return '';
};

// Helper function to check if dark mode is active
export const isDarkMode = (): boolean => {
  if (typeof window !== 'undefined') {
    return document.documentElement.classList.contains('dark');
  }
  return false;
};

// Utility functions for adaptive styling
export const getAdaptiveClasses = {
  // Background classes that adapt to theme
  background: {
    primary: 'bg-adaptive-primary',
    secondary: 'bg-adaptive-secondary', 
    tertiary: 'bg-adaptive-tertiary'
  },
  
  // Text classes that adapt to theme
  text: {
    primary: 'text-adaptive-primary',
    secondary: 'text-adaptive-secondary',
    tertiary: 'text-adaptive-tertiary'
  },
  
  // Border classes that adapt to theme
  border: {
    primary: 'border-adaptive-primary',
    secondary: 'border-adaptive-secondary'
  },
  
  // Semantic colors (automatically adapt to primary color)
  semantic: {
    success: 'text-success',
    warning: 'text-warning', 
    error: 'text-error',
    info: 'text-info'
  },
  
  // Background semantic colors
  backgroundSemantic: {
    success: 'bg-success',
    warning: 'bg-warning',
    error: 'bg-error', 
    info: 'bg-info'
  },
  
  // Optimal text colors for primary backgrounds
  textOnPrimary: {
    default: 'text-on-primary',      // For primary-600 backgrounds
    light: 'text-on-primary-light',  // For primary-100 backgrounds
    dark: 'text-on-primary-dark'     // For primary-800 backgrounds
  }
};

// Helper function to get timer state colors (adaptive)
export const getTimerStateClass = (state: string): string => {
  switch (state) {
    case 'ready': return 'timer-ready';
    case 'inspection': return 'timer-inspection';
    case 'inspection-warning': return 'timer-inspection-warning';
    case 'inspection-danger': return 'timer-inspection-danger';
    case 'solving': return 'timer-solving';
    case 'finished': return 'timer-finished';
    default: return 'timer-ready';
  }
};

// Helper function to get time category colors (adaptive)
export const getTimeCategoryClass = (category: string): string => {
  switch (category) {
    case 'excellent': return 'time-excellent';
    case 'good': return 'time-good';
    case 'average': return 'time-average';
    case 'slow': return 'time-slow';
    case 'poor': return 'time-poor';
    default: return 'text-adaptive-primary';
  }
};

// Helper function to get scramble state colors (adaptive)
export const getScrambleStateClass = (state: string): string => {
  switch (state) {
    case 'generating': return 'scramble-generating';
    case 'ready': return 'scramble-ready';
    case 'error': return 'scramble-error';
    default: return 'scramble-ready';
  }
};

// Helper function to get optimal text color for primary backgrounds
export const getPrimaryTextClass = (shade: 'light' | 'default' | 'dark' = 'default'): string => {
  switch (shade) {
    case 'light': return getAdaptiveClasses.textOnPrimary.light;   // For bg-primary-100
    case 'dark': return getAdaptiveClasses.textOnPrimary.dark;     // For bg-primary-800
    default: return getAdaptiveClasses.textOnPrimary.default;      // For bg-primary-600
  }
};

// Helper function to create contrast-safe primary color combinations
export const createPrimaryColorCombo = (backgroundShade: string, textShade?: 'light' | 'default' | 'dark'): string => {
  const bgClass = `bg-primary-${backgroundShade}`;
  
  // Auto-determine text color based on background shade
  let textClass: string;
  if (textShade) {
    textClass = getPrimaryTextClass(textShade);
  } else {
    // Auto-select based on background shade
    const shade = parseInt(backgroundShade);
    if (shade <= 200) textClass = getPrimaryTextClass('light');
    else if (shade >= 700) textClass = getPrimaryTextClass('dark');
    else textClass = getPrimaryTextClass('default');
  }
  
  return cn(bgClass, textClass);
};

// Note: isCompactMode and isReducedMotion helper functions removed - features not fully implemented

// Example usage in components:
/*
import { appearanceClasses, buttonVariants, cardVariants, cn } from '@/utils/appearanceUtils';

// Basic usage
<div className={appearanceClasses.bg.secondary}>
  <h2 className={appearanceClasses.text.primary}>Title</h2>
  <p className={appearanceClasses.text.secondary}>Description</p>
</div>

// Button usage
<button className={buttonVariants.primary}>
  Primary Button
</button>

// Card usage
<div className={cardVariants.interactive}>
  Card content
</div>

// Custom combinations
<div className={cn(
  appearanceClasses.bg.secondary,
  appearanceClasses.border.primary,
  'rounded-lg p-4'
)}>
  Custom styled component
</div>

// Primary color usage (adapts to user's chosen color)
<div className={appearanceClasses.primary.bg[600]}>
  This background uses the user's chosen primary color
</div>
*/
