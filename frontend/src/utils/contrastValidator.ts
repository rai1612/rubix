/**
 * Contrast Validation Utility for rubiX
 * 
 * This utility helps validate and test color combinations for accessibility
 * and visibility issues, especially with extreme color choices.
 */

import { 
  getContrastRatio,
  generateAdaptiveColorSystem,
  validatePrimaryColorContrast
} from './colorSystem';

export interface ContrastTestResult {
  color: string;
  name: string;
  contrastRatio: number;
  wcagAA: boolean;
  wcagAAA: boolean;
  recommendation: string;
}

export interface ColorSystemValidation {
  primaryColor: string;
  isValid: boolean;
  issues: string[];
  recommendations: string[];
  testResults: ContrastTestResult[];
}

// Test colors that are known to be problematic
const EDGE_CASE_COLORS = [
  { name: 'Very Light Yellow', color: '#FFFF99' },
  { name: 'Very Light Blue', color: '#E6F3FF' },
  { name: 'Very Dark Purple', color: '#1A0D26' },
  { name: 'Pure White', color: '#FFFFFF' },
  { name: 'Pure Black', color: '#000000' },
  { name: 'Bright Red', color: '#FF0000' },
  { name: 'Bright Green', color: '#00FF00' },
  { name: 'Bright Blue', color: '#0000FF' },
  { name: 'Hot Pink', color: '#FF69B4' },
  { name: 'Lime Green', color: '#32CD32' },
];

// Common background colors used in the app
const TEST_BACKGROUNDS = [
  { name: 'White Background', color: '#FFFFFF' },
  { name: 'Light Gray Background', color: '#F9FAFB' },
  { name: 'Dark Background', color: '#1F2937' },
  { name: 'Card Background', color: '#FFFFFF' },
];

/**
 * Test a color against common backgrounds
 */
export const testColorContrast = (color: string, colorName: string): ContrastTestResult[] => {
  return TEST_BACKGROUNDS.map(bg => {
    const ratio = getContrastRatio(color, bg.color);
    const wcagAA = ratio >= 4.5;
    const wcagAAA = ratio >= 7.0;
    
    let recommendation = '';
    if (!wcagAA) {
      recommendation = 'Fails WCAG AA - needs adjustment for accessibility';
    } else if (!wcagAAA) {
      recommendation = 'Passes WCAG AA but not AAA - consider improvement';
    } else {
      recommendation = 'Excellent contrast - meets all standards';
    }
    
    return {
      color,
      name: `${colorName} on ${bg.name}`,
      contrastRatio: ratio,
      wcagAA,
      wcagAAA,
      recommendation
    };
  });
};

/**
 * Validate an entire color system for potential issues
 */
export const validateColorSystem = (primaryColor: string): ColorSystemValidation => {
  const issues: string[] = [];
  const recommendations: string[] = [];
  const testResults: ContrastTestResult[] = [];
  
  // Test the primary color itself
  const contrastValidation = validatePrimaryColorContrast(primaryColor);
  if (!contrastValidation.isValid) {
    issues.push(`Primary color ${primaryColor} has poor contrast (${contrastValidation.contrastRatio.toFixed(2)}:1)`);
    recommendations.push(`Use adjusted color ${contrastValidation.adjustedColor} instead`);
  }
  
  // Generate the full color system
  const colorSystem = generateAdaptiveColorSystem(primaryColor, false);
  
  // Test primary color shades
  const primaryShades = ['100', '600', '700', '800'];
  primaryShades.forEach(shade => {
    const shadeColor = colorSystem.primary[shade];
    const results = testColorContrast(shadeColor, `Primary ${shade}`);
    testResults.push(...results);
    
    // Check for specific issues
    results.forEach(result => {
      if (!result.wcagAA && result.name.includes('White Background')) {
        issues.push(`Primary ${shade} (${shadeColor}) fails contrast on white backgrounds`);
        recommendations.push(`Consider using text-on-primary utilities for Primary ${shade} backgrounds`);
      }
    });
  });
  
  // Test semantic colors
  Object.entries(colorSystem.semantic).forEach(([name, color]) => {
    const results = testColorContrast(color, `Semantic ${name}`);
    testResults.push(...results);
    
    results.forEach(result => {
      if (!result.wcagAA) {
        issues.push(`Semantic ${name} color has poor contrast on some backgrounds`);
      }
    });
  });
  
  // Test theme colors
  const themeTests = [
    { name: 'Text Primary', color: colorSystem.theme.text.primary },
    { name: 'Text Secondary', color: colorSystem.theme.text.secondary },
    { name: 'Background Primary', color: colorSystem.theme.background.primary },
    { name: 'Background Secondary', color: colorSystem.theme.background.secondary },
  ];
  
  themeTests.forEach(test => {
    const results = testColorContrast(test.color, test.name);
    testResults.push(...results);
  });
  
  // General recommendations
  if (issues.length === 0) {
    recommendations.push('Color system looks good! All major contrast requirements are met.');
  } else {
    recommendations.push('Use the adaptive color classes to ensure proper contrast');
    recommendations.push('Test your color choices with the browser developer tools');
  }
  
  return {
    primaryColor,
    isValid: issues.length === 0,
    issues,
    recommendations,
    testResults
  };
};

/**
 * Test all edge case colors to see how the system handles them
 */
export const testEdgeCases = (): ColorSystemValidation[] => {
  return EDGE_CASE_COLORS.map(testColor => 
    validateColorSystem(testColor.color)
  );
};

/**
 * Get a human-readable contrast report
 */
export const generateContrastReport = (primaryColor: string): string => {
  const validation = validateColorSystem(primaryColor);
  
  let report = `🎨 Color System Validation Report for ${primaryColor}\n`;
  report += `${'='.repeat(50)}\n\n`;
  
  if (validation.isValid) {
    report += `✅ Overall Status: PASSED\n\n`;
  } else {
    report += `⚠️ Overall Status: NEEDS ATTENTION\n\n`;
  }
  
  if (validation.issues.length > 0) {
    report += `🚨 Issues Found:\n`;
    validation.issues.forEach((issue, i) => {
      report += `${i + 1}. ${issue}\n`;
    });
    report += `\n`;
  }
  
  report += `💡 Recommendations:\n`;
  validation.recommendations.forEach((rec, i) => {
    report += `${i + 1}. ${rec}\n`;
  });
  report += `\n`;
  
  report += `📊 Detailed Test Results:\n`;
  validation.testResults
    .filter(result => !result.wcagAA) // Show only problematic results
    .forEach(result => {
      report += `❌ ${result.name}: ${result.contrastRatio.toFixed(2)}:1 - ${result.recommendation}\n`;
    });
  
  const passedTests = validation.testResults.filter(result => result.wcagAA).length;
  const totalTests = validation.testResults.length;
  report += `\n✅ ${passedTests}/${totalTests} tests passed WCAG AA standards\n`;
  
  return report;
};

/**
 * Quick function to check if a color will have visibility issues
 */
export const hasVisibilityIssues = (color: string): boolean => {
  const validation = validateColorSystem(color);
  return !validation.isValid || validation.issues.length > 0;
};

/**
 * Get the safest version of a color for use in the app
 */
export const getSafeColor = (color: string): string => {
  const contrastValidation = validatePrimaryColorContrast(color);
  return contrastValidation.adjustedColor;
};
