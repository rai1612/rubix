import React, { useState, useEffect } from 'react';
import { X, Settings, Volume2, VolumeX, Zap, Clock } from 'lucide-react';
import { TimerMode, TimerPrecision, DEFAULT_TIMER_SETTINGS } from '../../utils/timerUtils';

interface TimerSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  settings: TimerSettingsState;
  onSettingsChange: (settings: TimerSettingsState) => void;
}

export interface TimerSettingsState {
  inspectionTime: number;
  mode: TimerMode;
  precision: number;
  enableSound: boolean;
  enableHoldToStart: boolean;
  hideTime: boolean;
  enableInspectionWarning: boolean;
  customInspectionTimes: boolean;
  inspectionWarningTime: number;
}

export const TimerSettings: React.FC<TimerSettingsProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange
}) => {
  const [localSettings, setLocalSettings] = useState<TimerSettingsState>(() => {
    // Ensure inspection time meets minimum requirement
    const validatedSettings = { ...settings };
    if (validatedSettings.inspectionTime < 5) {
      validatedSettings.inspectionTime = 5;
    }
    // Ensure warning time meets minimum requirement
    if (validatedSettings.inspectionWarningTime < 4) {
      validatedSettings.inspectionWarningTime = Math.min(4, validatedSettings.inspectionTime - 1);
    }
    return validatedSettings;
  });

  // Sync local settings with props when modal opens
  useEffect(() => {
    if (isOpen) {
      // Ensure inspection time meets minimum requirement
      const validatedSettings = { ...settings };
      if (validatedSettings.inspectionTime < 5) {
        validatedSettings.inspectionTime = 5;
      }
      // Ensure warning time meets minimum requirement
      if (validatedSettings.inspectionWarningTime < 4) {
        validatedSettings.inspectionWarningTime = Math.min(4, validatedSettings.inspectionTime - 1);
      }
      setLocalSettings(validatedSettings);
    }
  }, [isOpen, settings]);

  const handleSave = () => {
    onSettingsChange(localSettings);
    onClose();
  };

  const handleReset = () => {
    const defaultSettings: TimerSettingsState = {
      inspectionTime: DEFAULT_TIMER_SETTINGS.inspectionTime,
      mode: DEFAULT_TIMER_SETTINGS.mode,
      precision: DEFAULT_TIMER_SETTINGS.precision,
      enableSound: DEFAULT_TIMER_SETTINGS.enableSound,
      enableHoldToStart: DEFAULT_TIMER_SETTINGS.enableHoldToStart,
      hideTime: false,
      enableInspectionWarning: true,
      customInspectionTimes: false,
      inspectionWarningTime: 8
    };
    setLocalSettings(defaultSettings);
  };

  const updateSetting = <K extends keyof TimerSettingsState>(
    key: K,
    value: TimerSettingsState[K]
  ) => {
    setLocalSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      
      // If inspection time changes, validate and adjust warning time
      if (key === 'inspectionTime') {
        const inspectionTime = value as number;
        const maxWarningTime = Math.max(4, inspectionTime - 1);
        const minWarningTime = 4;
        
        // Adjust warning time if it's now out of bounds
        if (newSettings.inspectionWarningTime > maxWarningTime) {
          newSettings.inspectionWarningTime = maxWarningTime;
        } else if (newSettings.inspectionWarningTime < minWarningTime) {
          newSettings.inspectionWarningTime = minWarningTime;
        }
      }
      
      // If mode changes away from NO_INSPECTION, disable hold-to-start
      if (key === 'mode' && value !== TimerMode.NO_INSPECTION) {
        newSettings.enableHoldToStart = false;
      }
      
      // If mode changes away from NORMAL, disable inspection warnings
      if (key === 'mode' && value !== TimerMode.NORMAL) {
        newSettings.enableInspectionWarning = false;
      }
      
      // Ensure inspection time is never less than 5 seconds
      if (key === 'inspectionTime' && typeof value === 'number' && value < 5) {
        newSettings.inspectionTime = 5;
      }
      
      return newSettings;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-adaptive-primary" />
            <h2 className="text-lg font-semibold text-adaptive-primary">Timer Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="text-adaptive-tertiary hover:text-adaptive-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Content */}
        <div className="p-6 space-y-6">
          {/* Timer Mode */}
          <div>
            <label className="block text-sm font-medium text-adaptive-primary mb-3">
              Timer Mode
            </label>
            <div className="space-y-2">
              {Object.values(TimerMode).map((mode) => (
                <label key={mode} className="flex items-center">
                  <input
                    type="radio"
                    value={mode}
                    checked={localSettings.mode === mode}
                    onChange={(e) => updateSetting('mode', e.target.value as TimerMode)}
                    className="mr-3 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-adaptive-primary">
                    {mode === TimerMode.NORMAL && 'Normal (15s inspection + solve)'}
                    {mode === TimerMode.NO_INSPECTION && 'No Inspection (direct solve)'}
                    {mode === TimerMode.STACKMAT && 'Stackmat Compatible'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Inspection Time */}
          {localSettings.mode === TimerMode.NORMAL && (
            <div>
              <label className="block text-sm font-medium text-adaptive-primary mb-2">
                Inspection Time (seconds)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="5"
                  max="30"
                  step="1"
                  value={localSettings.inspectionTime}
                  onChange={(e) => updateSetting('inspectionTime', parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm text-adaptive-secondary w-8 text-center">
                  {localSettings.inspectionTime}s
                </span>
              </div>
              <div className="flex justify-between text-xs text-adaptive-tertiary mt-1">
                <span>5s</span>
                <span>30s</span>
              </div>
            </div>
          )}

          {/* Precision */}
          <div>
            <label className="block text-sm font-medium text-adaptive-primary mb-3">
              Time Precision
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  value={TimerPrecision.CENTISECONDS}
                  checked={localSettings.precision === TimerPrecision.CENTISECONDS}
                  onChange={(e) => updateSetting('precision', parseInt(e.target.value))}
                  className="mr-3 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-adaptive-primary">Centiseconds (12.34)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value={TimerPrecision.MILLISECONDS}
                  checked={localSettings.precision === TimerPrecision.MILLISECONDS}
                  onChange={(e) => updateSetting('precision', parseInt(e.target.value))}
                  className="mr-3 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-adaptive-primary">Milliseconds (12.345)</span>
              </label>
            </div>
          </div>

          {/* Audio Settings */}
          <div>
            <label className="block text-sm font-medium text-adaptive-primary mb-3">
              Audio & Feedback
            </label>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={localSettings.enableSound}
                  onChange={(e) => updateSetting('enableSound', e.target.checked)}
                  className="mr-3 text-primary-600 focus:ring-primary-500"
                />
                <Volume2 className="w-4 h-4 mr-2 text-adaptive-tertiary" />
                <span className="text-sm text-adaptive-primary">Enable sound effects</span>
              </label>
              
              {/* Only show inspection warnings in Normal mode */}
              {localSettings.mode === TimerMode.NORMAL && (
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={localSettings.enableInspectionWarning}
                    onChange={(e) => updateSetting('enableInspectionWarning', e.target.checked)}
                    className="mr-3 text-primary-600 focus:ring-primary-500"
                  />
                  <Clock className="w-4 h-4 mr-2 text-adaptive-tertiary" />
                  <span className="text-sm text-adaptive-primary">Inspection time warnings</span>
                </label>
              )}
            </div>
          </div>

          {/* Inspection Warning Time */}
          {localSettings.enableInspectionWarning && localSettings.mode === TimerMode.NORMAL && (
            <div>
              <label className="block text-sm font-medium text-adaptive-primary mb-2">
                Warning at (seconds remaining)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="4"
                  max={Math.max(4, localSettings.inspectionTime - 1)}
                  step="1"
                  value={localSettings.inspectionWarningTime}
                  onChange={(e) => updateSetting('inspectionWarningTime', parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm text-adaptive-secondary w-8 text-center">
                  {localSettings.inspectionWarningTime}s
                </span>
              </div>
              <div className="text-xs text-adaptive-tertiary mt-1">
                Range: 4s - {Math.max(4, localSettings.inspectionTime - 1)}s (warns before 3s red zone)
              </div>
            </div>
          )}

          {/* Advanced Settings */}
          <div>
            <label className="block text-sm font-medium text-adaptive-primary mb-3">
              Advanced
            </label>
            <div className="space-y-3">
              {/* Only show hold-to-start in No Inspection mode */}
              {localSettings.mode === TimerMode.NO_INSPECTION && (
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={localSettings.enableHoldToStart}
                    onChange={(e) => updateSetting('enableHoldToStart', e.target.checked)}
                    className="mr-3 text-primary-600 focus:ring-primary-500"
                  />
                  <Zap className="w-4 h-4 mr-2 text-adaptive-tertiary" />
                  <span className="text-sm text-adaptive-primary">
                    Hold spacebar to ready, release to start
                  </span>
                </label>
              )}
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={localSettings.hideTime}
                  onChange={(e) => updateSetting('hideTime', e.target.checked)}
                  className="mr-3 text-primary-600 focus:ring-primary-500"
                />
                <VolumeX className="w-4 h-4 mr-2 text-adaptive-tertiary" />
                <span className="text-sm text-adaptive-primary">Hide time while solving</span>
              </label>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            onClick={handleReset}
            className="text-sm text-adaptive-secondary hover:text-adaptive-primary transition-colors"
          >
            Reset to defaults
          </button>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-adaptive-secondary hover:text-adaptive-primary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-on-primary rounded-lg transition-colors"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimerSettings;
