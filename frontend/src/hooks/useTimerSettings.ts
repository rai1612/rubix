import { useCallback, useState } from 'react';
import { DEFAULT_TIMER_SETTINGS } from '../utils/timerUtils';
import { TimerSettingsState } from '../components/timer/TimerSettings';
import { useSettings } from './useSettings';

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
  // Use the main settings hook and extract timer settings
  const { settings: allSettings, updateSettings: updateAllSettings, resetSettings: resetAllSettings, isLoaded } = useSettings();
  
  const settings = allSettings.timer || defaultSettings;
  
  const updateSettings = useCallback(async (newSettings: TimerSettingsState) => {
    await updateAllSettings('timer', newSettings);
  }, [updateAllSettings]);

  const resetSettings = useCallback(async () => {
    await resetAllSettings('timer');
  }, [resetAllSettings]);

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
