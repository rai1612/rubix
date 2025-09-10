import { useState, useEffect, useCallback } from 'react';
import { TimerSettingsState } from '../components/timer/TimerSettings';
import { DEFAULT_TIMER_SETTINGS } from '../utils/timerUtils';
import { UserService } from '../services/userService';

// Define all application settings interfaces
export interface DisplaySettings {
  showAo5: boolean;
  showAo12: boolean;
  showAo100: boolean;
  showPersonalBest: boolean;
  scrambleFormat: 'single' | 'multiline';
}

export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'auto';
  primaryColor: string;
  fontSize: 'small' | 'medium' | 'large';
  // Note: enableAnimations and compactMode removed - not fully implemented
}

export interface DataSettings {
  // Currently only basic export/import is supported
  // Advanced features like backup and retention will be added when backend support is implemented
}

export interface PrivacySettings {
  // Currently no privacy settings are implemented
  // Features like analytics, statistics sharing, and public profiles will be added when backend support is implemented
}

export interface AllSettings {
  timer: TimerSettingsState;
  display: DisplaySettings;
  appearance: AppearanceSettings;
  data: DataSettings;
  privacy: PrivacySettings;
}

// Default settings
const defaultDisplaySettings: DisplaySettings = {
  showAo5: true,
  showAo12: true,
  showAo100: false,
  showPersonalBest: true,
  scrambleFormat: 'single'
};

const defaultAppearanceSettings: AppearanceSettings = {
  theme: 'auto',
  primaryColor: '#3b82f6',
  fontSize: 'medium'
};

const defaultDataSettings: DataSettings = {
  // No settings currently - placeholder for future features
};

const defaultPrivacySettings: PrivacySettings = {
  // No settings currently - placeholder for future features
};

const defaultTimerSettings: TimerSettingsState = {
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

export const defaultSettings: AllSettings = {
  timer: defaultTimerSettings, // Still needed for useTimerSettings integration
  display: defaultDisplaySettings,
  appearance: defaultAppearanceSettings,
  data: defaultDataSettings,
  privacy: defaultPrivacySettings
};

// Storage keys
const STORAGE_KEYS = {
  timer: 'rubix_timer_settings',
  display: 'rubix_display_settings',
  appearance: 'rubix_appearance_settings',
  data: 'rubix_data_settings',
  privacy: 'rubix_privacy_settings'
} as const;

interface UseSettingsReturn {
  settings: AllSettings;
  updateSettings: (category: keyof AllSettings, newSettings: Partial<AllSettings[keyof AllSettings]>) => void;
  updateAllSettings: (newSettings: Partial<AllSettings>) => Promise<void>;
  resetSettings: (category?: keyof AllSettings) => Promise<void>;
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  exportSettings: () => string;
  importSettings: (settingsJson: string) => Promise<void>;
}

export const useSettings = (): UseSettingsReturn => {
  const [settings, setSettings] = useState<AllSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load settings from localStorage and backend on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // First load from localStorage (for immediate UI)
      const localSettings = loadFromLocalStorage();
      setSettings(localSettings);
      
      // Then try to load from backend and merge
      try {
        const userProfile = await UserService.getUserProfile();
        if (userProfile.preferences) {
          const backendSettings = mergeWithBackendPreferences(localSettings, userProfile.preferences);
          setSettings(backendSettings);
          // Update localStorage with merged settings
          saveToLocalStorage(backendSettings);
        }
      } catch (backendError) {
        console.warn('Failed to load settings from backend, using local settings:', backendError);
      }
      
    } catch (error) {
      console.error('Error loading settings:', error);
      setError('Failed to load settings');
      setSettings(defaultSettings);
    } finally {
      setIsLoaded(true);
      setIsLoading(false);
    }
  };

  const loadFromLocalStorage = (): AllSettings => {
    const loaded: AllSettings = { ...defaultSettings };
    
    Object.entries(STORAGE_KEYS).forEach(([category, key]) => {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          const parsed = JSON.parse(stored);
          (loaded as any)[category] = {
            ...defaultSettings[category as keyof AllSettings],
            ...parsed
          };
        }
      } catch (error) {
        console.warn(`Failed to load ${category} settings from localStorage:`, error);
      }
    });
    
    return loaded;
  };

  const saveToLocalStorage = (settingsToSave: AllSettings) => {
    Object.entries(STORAGE_KEYS).forEach(([category, key]) => {
      try {
        localStorage.setItem(key, JSON.stringify(settingsToSave[category as keyof AllSettings]));
      } catch (error) {
        console.warn(`Failed to save ${category} settings to localStorage:`, error);
      }
    });
  };

  const mergeWithBackendPreferences = (localSettings: AllSettings, preferences: Record<string, any>): AllSettings => {
    const merged = { ...localSettings };
    
    // Merge each category if it exists in preferences
    Object.keys(defaultSettings).forEach(category => {
      if (preferences[category]) {
        (merged as any)[category] = {
          ...localSettings[category as keyof AllSettings],
          ...preferences[category]
        };
      }
    });
    
    return merged;
  };

  const saveToBackend = async (settingsToSave: AllSettings) => {
    try {
      const preferences = {
        timer: settingsToSave.timer,
        display: settingsToSave.display,
        appearance: settingsToSave.appearance,
        data: settingsToSave.data,
        privacy: settingsToSave.privacy
      };
      
      await UserService.updateUserProfile({ preferences });
    } catch (error) {
      console.error('Failed to save settings to backend:', error);
      throw error;
    }
  };

  const updateSettings = useCallback((
    category: keyof AllSettings, 
    newSettings: Partial<AllSettings[keyof AllSettings]>
  ) => {
    const updatedSettings = {
      ...settings,
      [category]: {
        ...settings[category],
        ...newSettings
      }
    };
    
    console.log('Updating settings immediately:', category, newSettings); // Debug log
    
    // Update UI immediately (synchronous)
    setSettings(updatedSettings);
    saveToLocalStorage(updatedSettings);
    
    // Save to backend in background (fire and forget)
    saveToBackendAsync(updatedSettings, category);
  }, [settings]);

  const saveToBackendAsync = async (updatedSettings: AllSettings, category: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await saveToBackend(updatedSettings);
      console.log(`${category} settings saved to backend successfully`); // Debug log
    } catch (error) {
      console.error(`Error saving ${category} settings to backend:`, error);
      setError(`Failed to sync ${category} settings to server`);
      // Don't revert local state - keep UI changes but show error
    } finally {
      setIsLoading(false);
    }
  };

  const updateAllSettings = useCallback(async (newSettings: Partial<AllSettings>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedSettings = {
        ...settings,
        ...newSettings
      };
      
      setSettings(updatedSettings);
      saveToLocalStorage(updatedSettings);
      
      // Save to backend
      await saveToBackend(updatedSettings);
      
    } catch (error) {
      console.error('Error updating all settings:', error);
      setError('Failed to save settings');
      // Revert local state on error
      loadSettings();
    } finally {
      setIsLoading(false);
    }
  }, [settings]);

  const resetSettings = useCallback(async (category?: keyof AllSettings) => {
    setIsLoading(true);
    setError(null);
    
    try {
      let resetSettings: AllSettings;
      
      if (category) {
        resetSettings = {
          ...settings,
          [category]: defaultSettings[category]
        };
      } else {
        resetSettings = { ...defaultSettings };
      }
      
      setSettings(resetSettings);
      saveToLocalStorage(resetSettings);
      
      // Save to backend
      await saveToBackend(resetSettings);
      
    } catch (error) {
      console.error('Error resetting settings:', error);
      setError('Failed to reset settings');
    } finally {
      setIsLoading(false);
    }
  }, [settings]);

  const exportSettings = useCallback((): string => {
    const exportData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      settings: settings
    };
    return JSON.stringify(exportData, null, 2);
  }, [settings]);

  const importSettings = useCallback(async (settingsJson: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const importData = JSON.parse(settingsJson);
      
      if (!importData.settings) {
        throw new Error('Invalid settings format');
      }
      
      // Validate and merge with defaults to ensure all required fields exist
      const importedSettings: AllSettings = {
        timer: { ...defaultSettings.timer, ...importData.settings.timer },
        display: { ...defaultSettings.display, ...importData.settings.display },
        appearance: { ...defaultSettings.appearance, ...importData.settings.appearance },
        data: { ...defaultSettings.data, ...importData.settings.data },
        privacy: { ...defaultSettings.privacy, ...importData.settings.privacy }
      };
      
      await updateAllSettings(importedSettings);
      
    } catch (error) {
      console.error('Error importing settings:', error);
      setError('Failed to import settings. Please check the file format.');
    } finally {
      setIsLoading(false);
    }
  }, [updateAllSettings]);

  return {
    settings,
    updateSettings,
    updateAllSettings,
    resetSettings,
    isLoaded,
    isLoading,
    error,
    exportSettings,
    importSettings
  };
};

export default useSettings;
