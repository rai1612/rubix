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
  const [localSettings, setLocalSettings] = useState<TimerSettingsState>(settings);

  // Sync local settings with props when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalSettings(settings);
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
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-semibold text-gray-900">Timer Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Content */}
        <div className="p-6 space-y-6">
          {/* Timer Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
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
                  <span className="text-sm text-gray-700">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Inspection Time (seconds)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="1"
                  value={localSettings.inspectionTime}
                  onChange={(e) => updateSetting('inspectionTime', parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm text-gray-600 w-8 text-center">
                  {localSettings.inspectionTime}s
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0s</span>
                <span>30s</span>
              </div>
            </div>
          )}

          {/* Precision */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
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
                <span className="text-sm text-gray-700">Centiseconds (12.34)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value={TimerPrecision.MILLISECONDS}
                  checked={localSettings.precision === TimerPrecision.MILLISECONDS}
                  onChange={(e) => updateSetting('precision', parseInt(e.target.value))}
                  className="mr-3 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Milliseconds (12.345)</span>
              </label>
            </div>
          </div>

          {/* Audio Settings */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
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
                <Volume2 className="w-4 h-4 mr-2 text-gray-500" />
                <span className="text-sm text-gray-700">Enable sound effects</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={localSettings.enableInspectionWarning}
                  onChange={(e) => updateSetting('enableInspectionWarning', e.target.checked)}
                  className="mr-3 text-primary-600 focus:ring-primary-500"
                />
                <Clock className="w-4 h-4 mr-2 text-gray-500" />
                <span className="text-sm text-gray-700">Inspection time warnings</span>
              </label>
            </div>
          </div>

          {/* Inspection Warning Time */}
          {localSettings.enableInspectionWarning && localSettings.mode === TimerMode.NORMAL && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Warning at (seconds remaining)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="3"
                  max="10"
                  step="1"
                  value={localSettings.inspectionWarningTime}
                  onChange={(e) => updateSetting('inspectionWarningTime', parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm text-gray-600 w-8 text-center">
                  {localSettings.inspectionWarningTime}s
                </span>
              </div>
            </div>
          )}

          {/* Advanced Settings */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Advanced
            </label>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={localSettings.enableHoldToStart}
                  onChange={(e) => updateSetting('enableHoldToStart', e.target.checked)}
                  className="mr-3 text-primary-600 focus:ring-primary-500"
                />
                <Zap className="w-4 h-4 mr-2 text-gray-500" />
                <span className="text-sm text-gray-700">Hold spacebar to start (0.5s)</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={localSettings.hideTime}
                  onChange={(e) => updateSetting('hideTime', e.target.checked)}
                  className="mr-3 text-primary-600 focus:ring-primary-500"
                />
                <VolumeX className="w-4 h-4 mr-2 text-gray-500" />
                <span className="text-sm text-gray-700">Hide time while solving</span>
              </label>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            onClick={handleReset}
            className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            Reset to defaults
          </button>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
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
