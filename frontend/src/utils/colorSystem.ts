/**
 * Smart Color System for rubiX
 * 
 * This system ensures consistent theming and good visual contrast
 * for any color profile selected by the user.
 */

// Color conversion utilities
export const hexToHsl = (hex: string): [number, number, number] => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return [h * 360, s * 100, l * 100];
};

export const hslToHex = (h: number, s: number, l: number): string => {
  h = h / 360;
  s = s / 100;
  l = l / 100;

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  const toHex = (c: number) => {
    const hex = Math.round(c * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

// Calculate relative luminance for contrast checking
export const getLuminance = (hex: string): number => {
  const rgb = [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16)
  ].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
};

// Calculate contrast ratio between two colors
export const getContrastRatio = (color1: string, color2: string): number => {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
};

// Check if a color combination meets accessibility standards
export const meetsAccessibilityStandards = (foreground: string, background: string): {
  aa: boolean;
  aaa: boolean;
  ratio: number;
} => {
  const ratio = getContrastRatio(foreground, background);
  return {
    aa: ratio >= 4.5,   // WCAG AA standard
    aaa: ratio >= 7,    // WCAG AAA standard
    ratio
  };
};

// Smart color palette generator that ensures good contrast and visual harmony
export const generateSmartColorPalette = (baseColor: string): {
  [key: string]: string;
} => {
  const [h, s, l] = hexToHsl(baseColor);
  
  // Ensure minimum saturation for vibrant colors
  const adjustedS = Math.max(s, 40);
  
  // Generate palette with consistent lightness progression
  const palette = {
    50: hslToHex(h, Math.min(adjustedS * 0.3, 20), 96),
    100: hslToHex(h, Math.min(adjustedS * 0.4, 30), 92),
    200: hslToHex(h, Math.min(adjustedS * 0.5, 40), 84),
    300: hslToHex(h, Math.min(adjustedS * 0.6, 50), 72),
    400: hslToHex(h, Math.min(adjustedS * 0.8, 70), 60),
    500: hslToHex(h, adjustedS, Math.max(Math.min(l, 55), 45)), // Base color, ensure good contrast
    600: hslToHex(h, Math.min(adjustedS * 1.1, 85), 42),
    700: hslToHex(h, Math.min(adjustedS * 1.2, 90), 35),
    800: hslToHex(h, Math.min(adjustedS * 1.3, 95), 28),
    900: hslToHex(h, Math.min(adjustedS * 1.4, 100), 20)
  };

  return palette;
};

// Generate semantic colors that work well with any primary color
export const generateSemanticColors = (primaryColor: string): {
  success: string;
  warning: string;
  error: string;
  info: string;
} => {
  const [primaryH] = hexToHsl(primaryColor);
  
  return {
    success: hslToHex((primaryH + 120) % 360, 65, 45), // Green-ish, 120° from primary
    warning: hslToHex((primaryH + 60) % 360, 85, 55),  // Yellow-ish, 60° from primary  
    error: hslToHex((primaryH + 180) % 360, 75, 50),   // Red-ish, opposite on color wheel
    info: hslToHex((primaryH + 200) % 360, 70, 55)     // Blue-ish, complementary
  };
};

// Ensure text has good contrast against any background
export const getOptimalTextColor = (backgroundColor: string, lightText = '#ffffff', darkText = '#1f2937'): string => {
  const lightContrast = getContrastRatio(lightText, backgroundColor);
  const darkContrast = getContrastRatio(darkText, backgroundColor);
  
  // Return the color with better contrast, preferring dark text when contrast is similar
  return lightContrast > darkContrast ? lightText : darkText;
};

// Generate theme-aware colors that adapt to light/dark mode
export const generateThemeAwareColors = (primaryColor: string, isDark: boolean): {
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  border: {
    primary: string;
    secondary: string;
  };
} => {
  const [h, s] = hexToHsl(primaryColor);
  
  if (isDark) {
    return {
      background: {
        primary: hslToHex(h, Math.min(s * 0.3, 15), 8),   // Very dark with hint of primary hue
        secondary: hslToHex(h, Math.min(s * 0.2, 12), 12), // Slightly lighter
        tertiary: hslToHex(h, Math.min(s * 0.15, 10), 16)  // Card backgrounds
      },
      text: {
        primary: hslToHex(h, Math.min(s * 0.1, 5), 95),    // Almost white with hint of hue
        secondary: hslToHex(h, Math.min(s * 0.15, 8), 75), // Muted text
        tertiary: hslToHex(h, Math.min(s * 0.2, 12), 55)   // Very muted text
      },
      border: {
        primary: hslToHex(h, Math.min(s * 0.25, 15), 25),  // Subtle borders
        secondary: hslToHex(h, Math.min(s * 0.3, 20), 35)  // More visible borders
      }
    };
  } else {
    return {
      background: {
        primary: hslToHex(h, Math.min(s * 0.1, 5), 98),    // Almost white with hint of hue
        secondary: hslToHex(h, Math.min(s * 0.05, 3), 100), // Pure white
        tertiary: hslToHex(h, Math.min(s * 0.15, 8), 96)   // Card backgrounds
      },
      text: {
        primary: hslToHex(h, Math.min(s * 0.3, 20), 15),   // Dark text with hint of hue
        secondary: hslToHex(h, Math.min(s * 0.2, 15), 35), // Muted text
        tertiary: hslToHex(h, Math.min(s * 0.15, 12), 55)  // Very muted text
      },
      border: {
        primary: hslToHex(h, Math.min(s * 0.1, 8), 85),    // Subtle borders
        secondary: hslToHex(h, Math.min(s * 0.15, 12), 75) // More visible borders
      }
    };
  }
};

// Validate and adjust color for better accessibility
export const validateAndAdjustColor = (color: string, context: 'primary' | 'background' | 'text' = 'primary'): string => {
  const [h, s, l] = hexToHsl(color);
  
  switch (context) {
    case 'primary':
      // Ensure primary colors have good saturation and appropriate lightness
      const adjustedS = Math.max(Math.min(s, 85), 40); // Between 40-85%
      const adjustedL = Math.max(Math.min(l, 60), 35);  // Between 35-60%
      return hslToHex(h, adjustedS, adjustedL);
      
    case 'background':
      // Background colors should be neutral
      return hslToHex(h, Math.min(s, 10), l > 50 ? Math.max(l, 95) : Math.min(l, 15));
      
    case 'text':
      // Text colors should have high contrast
      return l > 50 ? hslToHex(h, Math.min(s, 20), Math.min(l, 25)) : hslToHex(h, Math.min(s, 20), Math.max(l, 85));
      
    default:
      return color;
  }
};

// Enhanced contrast validation for primary colors on white backgrounds
export const validatePrimaryColorContrast = (color: string): {
  isValid: boolean;
  adjustedColor: string;
  contrastRatio: number;
} => {
  const whiteBackground = '#ffffff';
  const darkBackground = '#1f2937';
  
  const lightContrast = getContrastRatio(color, whiteBackground);
  const darkContrast = getContrastRatio(color, darkBackground);
  
  // For primary colors, we need at least 3:1 contrast (AA Large)
  const minContrast = 3.0;
  
  if (lightContrast >= minContrast && darkContrast >= minContrast) {
    return {
      isValid: true,
      adjustedColor: color,
      contrastRatio: Math.min(lightContrast, darkContrast)
    };
  }
  
  // Adjust the color for better contrast
  const [h, s, l] = hexToHsl(color);
  let adjustedL = l;
  
  // If too light, darken it
  if (lightContrast < minContrast) {
    adjustedL = Math.min(adjustedL, 45); // Cap lightness for light backgrounds
  }
  
  // If too dark, lighten it for dark backgrounds
  if (darkContrast < minContrast) {
    adjustedL = Math.max(adjustedL, 55); // Ensure minimum lightness for dark backgrounds
  }
  
  // Ensure it's not too extreme
  adjustedL = Math.max(Math.min(adjustedL, 65), 25);
  
  const adjustedColor = hslToHex(h, Math.max(s, 50), adjustedL);
  const newContrast = Math.min(
    getContrastRatio(adjustedColor, whiteBackground),
    getContrastRatio(adjustedColor, darkBackground)
  );
  
  return {
    isValid: newContrast >= minContrast,
    adjustedColor,
    contrastRatio: newContrast
  };
};

// Generate optimal text colors for primary color backgrounds
export const generateOptimalTextColors = (primaryColor: string): {
  onPrimary: string;
  onPrimaryLight: string;
  onPrimaryDark: string;
} => {
  const primaryPalette = generateSmartColorPalette(primaryColor);
  
  return {
    onPrimary: getOptimalTextColor(primaryPalette['600']),
    onPrimaryLight: getOptimalTextColor(primaryPalette['100']),
    onPrimaryDark: getOptimalTextColor(primaryPalette['800'])
  };
};

// Main function to generate complete adaptive color system
export const generateAdaptiveColorSystem = (baseColor: string, isDark: boolean = false) => {
  // Enhanced validation with contrast checking
  const contrastValidation = validatePrimaryColorContrast(baseColor);
  const validatedColor = contrastValidation.adjustedColor;
  
  // Generate smart palette
  const primaryPalette = generateSmartColorPalette(validatedColor);
  
  // Generate semantic colors
  const semanticColors = generateSemanticColors(validatedColor);
  
  // Generate theme-aware colors
  const themeColors = generateThemeAwareColors(validatedColor, isDark);
  
  // Generate optimal text colors
  const textColors = generateOptimalTextColors(validatedColor);
  
  return {
    primary: primaryPalette,
    semantic: semanticColors,
    theme: themeColors,
    textColors,
    validation: {
      originalColor: baseColor,
      adjustedColor: validatedColor,
      isAdjusted: baseColor !== validatedColor,
      contrastRatio: contrastValidation.contrastRatio,
      contrastValid: contrastValidation.isValid
    }
  };
};

// Export utility for checking if current color needs adjustment
export const shouldAdjustColor = (color: string): boolean => {
  const [, s, l] = hexToHsl(color);
  
  // Check if color might cause visibility issues
  return (
    s < 30 ||  // Too desaturated
    l < 25 ||  // Too dark for primary use
    l > 75     // Too light for primary use
  );
};
