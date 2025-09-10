import { useEffect } from 'react';
import { useSettings } from './useSettings';
import { generateAdaptiveColorSystem, shouldAdjustColor } from '../utils/colorSystem';
import { hasVisibilityIssues, generateContrastReport } from '../utils/contrastValidator';

export const useAppearance = () => {
  const { settings, isLoaded } = useSettings();

  useEffect(() => {
    if (!isLoaded) return;

    const { appearance } = settings;

    // Apply theme first and get the resolved theme
    const resolvedTheme = applyTheme(appearance.theme);
    
    // Apply primary color with the correct theme context
    applyPrimaryColor(appearance.primaryColor, resolvedTheme);
    applyFontSize(appearance.fontSize);

  }, [settings, isLoaded]); // Watch the entire settings object

  const applyTheme = (theme: 'light' | 'dark' | 'auto'): 'light' | 'dark' => {
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    
    let appliedTheme: 'light' | 'dark';
    
    if (theme === 'auto') {
      // Use system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      appliedTheme = prefersDark ? 'dark' : 'light';
      
      // Listen for system theme changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        if (theme === 'auto') { // Only update if still in auto mode
          const newTheme = e.matches ? 'dark' : 'light';
          root.classList.remove('light', 'dark');
          root.classList.add(newTheme);
          // Re-apply primary color with the new theme
          applyPrimaryColor(settings.appearance.primaryColor, newTheme);
        }
      };
      
      // Remove previous listener if exists
      mediaQuery.removeEventListener('change', handleChange);
      mediaQuery.addEventListener('change', handleChange);
    } else {
      appliedTheme = theme;
    }
    
    root.classList.add(appliedTheme);
    return appliedTheme;
  };

  const applyPrimaryColor = (color: string, theme?: 'light' | 'dark') => {
    const root = document.documentElement;
    // Use the provided theme or fall back to checking the DOM
    const isDark = theme ? theme === 'dark' : root.classList.contains('dark');
    
    // Enhanced visibility checking
    if (shouldAdjustColor(color) || hasVisibilityIssues(color)) {
      console.warn(`⚠️ Color ${color} may cause visibility issues, generating adaptive system...`);
      
      // In development, show detailed contrast report
      if (process.env.NODE_ENV === 'development') {
        console.log(generateContrastReport(color));
      }
    }
    
    // Generate adaptive color system
    const colorSystem = generateAdaptiveColorSystem(color, isDark);
    
    // Apply primary color palette
    Object.entries(colorSystem.primary).forEach(([shade, value]) => {
      root.style.setProperty(`--color-primary-${shade}`, value);
    });
    
    // Apply semantic colors
    root.style.setProperty('--color-success', colorSystem.semantic.success);
    root.style.setProperty('--color-warning', colorSystem.semantic.warning);
    root.style.setProperty('--color-error', colorSystem.semantic.error);
    root.style.setProperty('--color-info', colorSystem.semantic.info);
    
    // Apply theme-aware colors
    root.style.setProperty('--bg-primary', colorSystem.theme.background.primary);
    root.style.setProperty('--bg-secondary', colorSystem.theme.background.secondary);
    root.style.setProperty('--bg-tertiary', colorSystem.theme.background.tertiary);
    
    root.style.setProperty('--text-primary', colorSystem.theme.text.primary);
    root.style.setProperty('--text-secondary', colorSystem.theme.text.secondary);
    root.style.setProperty('--text-tertiary', colorSystem.theme.text.tertiary);
    
    root.style.setProperty('--border-primary', colorSystem.theme.border.primary);
    root.style.setProperty('--border-secondary', colorSystem.theme.border.secondary);
    
    // Apply optimal text colors for primary backgrounds
    root.style.setProperty('--text-on-primary', colorSystem.textColors.onPrimary);
    root.style.setProperty('--text-on-primary-light', colorSystem.textColors.onPrimaryLight);
    root.style.setProperty('--text-on-primary-dark', colorSystem.textColors.onPrimaryDark);
    
    // Log color adjustment info
    if (colorSystem.validation.isAdjusted) {
      console.log(`🎨 Color adjusted for better visibility: ${colorSystem.validation.originalColor} → ${colorSystem.validation.adjustedColor}`);
      console.log(`📊 Contrast ratio: ${colorSystem.validation.contrastRatio.toFixed(2)}:1 ${colorSystem.validation.contrastValid ? '✅' : '⚠️'}`);
    } else {
      console.log(`🎨 Primary color applied: ${color} with adaptive system`);
      console.log(`📊 Contrast ratio: ${colorSystem.validation.contrastRatio.toFixed(2)}:1 ✅`);
    }
  };

  const applyFontSize = (fontSize: 'small' | 'medium' | 'large') => {
    const root = document.documentElement;
    
    // Remove existing font size classes
    root.classList.remove('font-size-small', 'font-size-medium', 'font-size-large');
    
    // Add new font size class
    root.classList.add(`font-size-${fontSize}`);
    
    // Set CSS custom property for dynamic scaling
    const fontScales = {
      small: '0.875',
      medium: '1',
      large: '1.125'
    };
    root.style.setProperty('--font-scale', fontScales[fontSize]);
    
    console.log(`📝 Font size applied: ${fontSize} (scale: ${fontScales[fontSize]})`);
  };

  // Note: applyAnimations and applyCompactMode functions removed - not fully implemented

  return {
    theme: settings.appearance.theme,
    primaryColor: settings.appearance.primaryColor,
    fontSize: settings.appearance.fontSize
  };
};
