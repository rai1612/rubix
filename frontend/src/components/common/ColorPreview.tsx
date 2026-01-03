import React from 'react';
import { useSettings } from '../../hooks/useSettings';
import { shouldAdjustColor, generateAdaptiveColorSystem } from '../../utils/colorSystem';

interface ColorPreviewProps {
  className?: string;
}

export const ColorPreview: React.FC<ColorPreviewProps> = ({ className = '' }) => {
  const { settings } = useSettings();
  const { primaryColor, theme } = settings.appearance;
  
  const isDark = theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const needsAdjustment = shouldAdjustColor(primaryColor);
  const colorSystem = generateAdaptiveColorSystem(primaryColor, isDark);
  
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Color adjustment warning */}
      {needsAdjustment && (
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-warning rounded-full"></div>
            <span className="text-sm text-warning font-medium">
              Color adjusted for better visibility
            </span>
          </div>
          <div className="mt-2 text-xs text-adaptive-secondary">
            Original: {colorSystem.validation.originalColor} → Optimized: {colorSystem.validation.adjustedColor}
          </div>
        </div>
      )}
      
      {/* Primary color palette preview */}
      <div>
        <div className="text-xs font-medium text-adaptive-secondary mb-2">Primary Colors</div>
        <div className="flex space-x-1">
          {Object.entries(colorSystem.primary).map(([shade, color]) => (
            <div
              key={shade}
              className="w-6 h-6 rounded border border-adaptive-primary"
              style={{ backgroundColor: color }}
              title={`${shade}: ${color}`}
            />
          ))}
        </div>
      </div>
      
      {/* Semantic colors preview */}
      <div>
        <div className="text-xs font-medium text-adaptive-secondary mb-2">Semantic Colors</div>
        <div className="flex space-x-1">
          <div
            className="w-6 h-6 rounded border border-adaptive-primary"
            style={{ backgroundColor: colorSystem.semantic.success }}
            title={`Success: ${colorSystem.semantic.success}`}
          />
          <div
            className="w-6 h-6 rounded border border-adaptive-primary"
            style={{ backgroundColor: colorSystem.semantic.warning }}
            title={`Warning: ${colorSystem.semantic.warning}`}
          />
          <div
            className="w-6 h-6 rounded border border-adaptive-primary"
            style={{ backgroundColor: colorSystem.semantic.error }}
            title={`Error: ${colorSystem.semantic.error}`}
          />
          <div
            className="w-6 h-6 rounded border border-adaptive-primary"
            style={{ backgroundColor: colorSystem.semantic.info }}
            title={`Info: ${colorSystem.semantic.info}`}
          />
        </div>
      </div>
      
      {/* Theme colors preview */}
      <div>
        <div className="text-xs font-medium text-adaptive-secondary mb-2">Theme Colors</div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="space-y-1">
            <div className="text-adaptive-tertiary">Backgrounds</div>
            <div className="flex space-x-1">
              <div
                className="w-4 h-4 rounded border border-adaptive-primary"
                style={{ backgroundColor: colorSystem.theme.background.primary }}
                title={`Primary: ${colorSystem.theme.background.primary}`}
              />
              <div
                className="w-4 h-4 rounded border border-adaptive-primary"
                style={{ backgroundColor: colorSystem.theme.background.secondary }}
                title={`Secondary: ${colorSystem.theme.background.secondary}`}
              />
              <div
                className="w-4 h-4 rounded border border-adaptive-primary"
                style={{ backgroundColor: colorSystem.theme.background.tertiary }}
                title={`Tertiary: ${colorSystem.theme.background.tertiary}`}
              />
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-adaptive-tertiary">Text</div>
            <div className="flex space-x-1">
              <div
                className="w-4 h-4 rounded border border-adaptive-primary"
                style={{ backgroundColor: colorSystem.theme.text.primary }}
                title={`Primary: ${colorSystem.theme.text.primary}`}
              />
              <div
                className="w-4 h-4 rounded border border-adaptive-primary"
                style={{ backgroundColor: colorSystem.theme.text.secondary }}
                title={`Secondary: ${colorSystem.theme.text.secondary}`}
              />
              <div
                className="w-4 h-4 rounded border border-adaptive-primary"
                style={{ backgroundColor: colorSystem.theme.text.tertiary }}
                title={`Tertiary: ${colorSystem.theme.text.tertiary}`}
              />
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-adaptive-tertiary">Borders</div>
            <div className="flex space-x-1">
              <div
                className="w-4 h-4 rounded border border-adaptive-primary"
                style={{ backgroundColor: colorSystem.theme.border.primary }}
                title={`Primary: ${colorSystem.theme.border.primary}`}
              />
              <div
                className="w-4 h-4 rounded border border-adaptive-primary"
                style={{ backgroundColor: colorSystem.theme.border.secondary }}
                title={`Secondary: ${colorSystem.theme.border.secondary}`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
