import { useState, useEffect, useCallback } from 'react';
import { TimerMode, TimerPrecision, DEFAULT_TIMER_SETTINGS } from '../utils/timerUtils';
import { TimerSettingsState } from '../components/timer/TimerSettings';

const STORAGE_KEY = 'rubix_timer_settings';

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

interface UseTimerSettingsReturn {
  settings: TimerSettingsState;
  updateSettings: (newSettings: TimerSettingsState) => void;
  resetSettings: () => void;
  isLoaded: boolean;
}

export const useTimerSettings = (): UseTimerSettingsReturn => {
  const [settings, setSettings] = useState<TimerSettingsState>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedSettings = JSON.parse(stored);
        
        // Validate and merge with defaults to handle new settings
        const validatedSettings: TimerSettingsState = {
          ...defaultSettings,
          ...parsedSettings,
          // Ensure enum values are valid
          mode: Object.values(TimerMode).includes(parsedSettings.mode) 
            ? parsedSettings.mode 
            : defaultSettings.mode,
          precision: [TimerPrecision.CENTISECONDS, TimerPrecision.MILLISECONDS].includes(parsedSettings.precision)
            ? parsedSettings.precision
            : defaultSettings.precision,
          // Validate numeric ranges
          inspectionTime: Math.max(0, Math.min(30, parsedSettings.inspectionTime || defaultSettings.inspectionTime)),
          inspectionWarningTime: Math.max(3, Math.min(10, parsedSettings.inspectionWarningTime || defaultSettings.inspectionWarningTime))
        };
        
        setSettings(validatedSettings);
      }
    } catch (error) {
      console.warn('Error loading timer settings, using defaults:', error);
      setSettings(defaultSettings);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save settings to localStorage whenever they change
  const updateSettings = useCallback((newSettings: TimerSettingsState) => {
    try {
      setSettings(newSettings);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving timer settings:', error);
    }
  }, []);

  // Reset to default settings
  const resetSettings = useCallback(() => {
    try {
      setSettings(defaultSettings);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSettings));
    } catch (error) {
      console.error('Error resetting timer settings:', error);
    }
  }, []);

  return {
    settings,
    updateSettings,
    resetSettings,
    isLoaded
  };
};

// Hook for managing timer sound effects
export const useTimerSound = (enabled: boolean) => {
  const playSound = useCallback((soundType: 'start' | 'stop' | 'warning' | 'ready') => {
    if (!enabled) return;

    try {
      // Create audio context for sound generation
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Different sounds for different events
      switch (soundType) {
        case 'start':
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.1);
          break;
          
        case 'stop':
          oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.15);
          gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.15);
          break;
          
        case 'warning':
          oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
          gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.2);
          break;
          
        case 'ready':
          oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
          gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.05);
          break;
      }
    } catch (error) {
      console.warn('Error playing timer sound:', error);
    }
  }, [enabled]);

  return { playSound };
};

// Hook for managing timer visual effects
export const useTimerVisualEffects = () => {
  const [isFlashing, setIsFlashing] = useState(false);

  const flashScreen = useCallback((color: 'red' | 'green' | 'yellow' = 'green', duration: number = 200) => {
    setIsFlashing(true);
    
    // Add flash effect to document body
    const flashClass = `timer-flash-${color}`;
    document.body.classList.add(flashClass);
    
    setTimeout(() => {
      document.body.classList.remove(flashClass);
      setIsFlashing(false);
    }, duration);
  }, []);

  const vibrate = useCallback((pattern: number | number[] = 100) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }, []);

  return {
    isFlashing,
    flashScreen,
    vibrate
  };
};

export default useTimerSettings;
