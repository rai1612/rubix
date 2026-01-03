// Timer-related utilities and types
import { getAdaptiveClasses } from './appearanceUtils';

export enum TimerState {
  READY = 'READY',
  INSPECTION = 'INSPECTION', 
  SOLVING = 'SOLVING',
  FINISHED = 'FINISHED'
}

export enum TimerMode {
  NORMAL = 'NORMAL',        // 15s inspection + solve
  NO_INSPECTION = 'NO_INSPECTION', // Direct solve
  STACKMAT = 'STACKMAT'     // External timer integration
}

export interface TimerResult {
  time: number;           // Total solve time in milliseconds
  inspectionTime: number; // Inspection time used in milliseconds
  penalty: PenaltyType;
  adjustedTime: number;   // Time after penalties applied
  timestamp: Date;
}

export enum PenaltyType {
  NONE = 'NONE',
  PLUS_TWO = 'PLUS_TWO',
  DNF = 'DNF'
}

/**
 * Format time in milliseconds to a readable string
 * @param timeMs Time in milliseconds
 * @param precision Number of decimal places (default: 2)
 * @returns Formatted time string (e.g., "12.34", "1:23.45")
 */
export const formatTime = (timeMs: number, precision: number = 2): string => {
  if (timeMs < 0) return '--';
  
  const totalSeconds = timeMs / 1000;
  
  if (totalSeconds >= 60) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toFixed(precision).padStart(precision + 3, '0')}`;
  } else {
    return totalSeconds.toFixed(precision);
  }
};

/**
 * Format time for display with penalty indication
 * @param result Timer result object
 * @param precision Number of decimal places (default: 2)
 * @returns Formatted string with penalty notation
 */
export const formatTimeWithPenalty = (result: TimerResult, precision: number = 2): string => {
  if (result.penalty === PenaltyType.DNF) {
    return 'DNF';
  }
  
  const baseTime = formatTime(result.time, precision);
  return result.penalty === PenaltyType.PLUS_TWO ? `${baseTime}+` : baseTime;
};

/**
 * Parse time string to milliseconds
 * @param timeStr Time string (e.g., "12.34", "1:23.45")
 * @returns Time in milliseconds, or null if invalid
 */
export const parseTime = (timeStr: string): number | null => {
  if (!timeStr || timeStr.trim() === '') return null;
  
  const str = timeStr.trim();
  
  // Handle DNF
  if (str.toUpperCase() === 'DNF') return null;
  
  // Handle time with penalty (+2)
  const cleanStr = str.replace('+', '');
  
  // Check for minutes:seconds format
  if (cleanStr.includes(':')) {
    const parts = cleanStr.split(':');
    if (parts.length !== 2) return null;
    
    const minutes = parseInt(parts[0], 10);
    const seconds = parseFloat(parts[1]);
    
    if (isNaN(minutes) || isNaN(seconds)) return null;
    if (seconds >= 60) return null;
    
    return (minutes * 60 + seconds) * 1000;
  } else {
    // Seconds only format
    const seconds = parseFloat(cleanStr);
    if (isNaN(seconds)) return null;
    
    return seconds * 1000;
  }
};

/**
 * Calculate adjusted time with penalties
 * @param originalTime Original solve time in milliseconds
 * @param penalty Penalty type
 * @returns Adjusted time in milliseconds
 */
export const calculateAdjustedTime = (originalTime: number, penalty: PenaltyType): number => {
  switch (penalty) {
    case PenaltyType.PLUS_TWO:
      return originalTime + 2000; // +2 seconds
    case PenaltyType.DNF:
      return Number.MAX_SAFE_INTEGER; // Large number for sorting
    case PenaltyType.NONE:
    default:
      return originalTime;
  }
};

/**
 * Get timer color based on state and time
 * @param state Current timer state
 * @param inspectionTimeRemaining Remaining inspection time in seconds
 * @returns CSS color class
 */
export const getTimerStateColor = (state: TimerState, inspectionTimeRemaining?: number): string => {
  switch (state) {
    case TimerState.READY:
      return 'timer-ready';
    case TimerState.INSPECTION:
      if (inspectionTimeRemaining !== undefined) {
        if (inspectionTimeRemaining <= 3) return 'timer-inspection-danger';
        if (inspectionTimeRemaining <= 8) return 'timer-inspection-warning';
      }
      return 'timer-inspection';
    case TimerState.SOLVING:
      return 'timer-solving';
    case TimerState.FINISHED:
      return 'timer-finished';
    default:
      return 'timer-ready';
  }
};

/**
 * Validate inspection time
 * @param inspectionTime Inspection time in seconds
 * @returns True if valid
 */
export const isValidInspectionTime = (inspectionTime: number): boolean => {
  return inspectionTime >= 0 && inspectionTime <= 30;
};

/**
 * Get average of times (excluding DNFs unless all are DNF)
 * @param times Array of timer results
 * @returns Average time in milliseconds, or null if no valid times
 */
export const calculateAverage = (times: TimerResult[]): number | null => {
  const validTimes = times.filter(t => t.penalty !== PenaltyType.DNF);
  
  if (validTimes.length === 0) return null;
  
  const sum = validTimes.reduce((acc, time) => acc + time.adjustedTime, 0);
  return sum / validTimes.length;
};

/**
 * Calculate Average of X (AoX) with best/worst removal
 * @param times Array of timer results (should be exactly X times)
 * @param removeCount Number of best and worst times to remove
 * @returns Average in milliseconds, or null if impossible to calculate
 */
export const calculateAverageOfX = (times: TimerResult[], removeCount: number = 1): number | null => {
  if (times.length < removeCount * 2 + 1) return null;
  
  // Count DNFs
  const dnfCount = times.filter(t => t.penalty === PenaltyType.DNF).length;
  
  // If more than removeCount DNFs, the average is DNF
  if (dnfCount > removeCount) return null;
  
  // Sort times (DNFs at the end)
  const sortedTimes = [...times].sort((a, b) => {
    if (a.penalty === PenaltyType.DNF && b.penalty === PenaltyType.DNF) return 0;
    if (a.penalty === PenaltyType.DNF) return 1;
    if (b.penalty === PenaltyType.DNF) return -1;
    return a.adjustedTime - b.adjustedTime;
  });
  
  // Remove best and worst (DNFs are already at the end)
  const validTimes = sortedTimes.slice(removeCount, -removeCount);
  
  return calculateAverage(validTimes);
};

/**
 * Format average time for display
 * @param averageMs Average time in milliseconds
 * @returns Formatted string or "DNF"
 */
export const formatAverage = (averageMs: number | null): string => {
  if (averageMs === null) return 'DNF';
  return formatTime(averageMs);
};

/**
 * Check if time is a personal best
 * @param newTime New time result
 * @param previousBest Previous best time (null if none)
 * @returns True if new personal best
 */
export const isPersonalBest = (newTime: TimerResult, previousBest: TimerResult | null): boolean => {
  if (!previousBest) return newTime.penalty !== PenaltyType.DNF;
  if (newTime.penalty === PenaltyType.DNF) return false;
  if (previousBest.penalty === PenaltyType.DNF) return true;
  
  return newTime.adjustedTime < previousBest.adjustedTime;
};

/**
 * Get relative time description
 * @param timeMs Time in milliseconds
 * @returns Description like "Sub-10", "Sub-20", etc.
 */
export const getTimeCategory = (timeMs: number): string => {
  const seconds = timeMs / 1000;
  
  if (seconds < 10) return 'Sub-10';
  if (seconds < 15) return 'Sub-15';
  if (seconds < 20) return 'Sub-20';
  if (seconds < 30) return 'Sub-30';
  if (seconds < 60) return 'Sub-1:00';
  
  return '1:00+';
};

/**
 * Generate color based on solve time for visualization
 * @param timeMs Time in milliseconds
 * @param personalBest Personal best time in milliseconds
 * @returns CSS color class
 */
export const getTimeColor = (timeMs: number, personalBest?: number): string => {
  if (personalBest && timeMs <= personalBest) return getAdaptiveClasses.semantic.success;
  
  const seconds = timeMs / 1000;
  
  if (seconds < 12) return getAdaptiveClasses.semantic.success;
  if (seconds < 18) return getAdaptiveClasses.semantic.info;
  if (seconds < 25) return getAdaptiveClasses.semantic.warning;
  if (seconds < 35) return getAdaptiveClasses.semantic.warning;
  
  return getAdaptiveClasses.semantic.error;
};

/**
 * Timer precision settings
 */
export const TimerPrecision = {
  CENTISECONDS: 2,
  MILLISECONDS: 3
} as const;

export type TimerPrecisionType = typeof TimerPrecision[keyof typeof TimerPrecision];

/**
 * Default timer settings
 */
export const DEFAULT_TIMER_SETTINGS = {
  inspectionTime: 15,
  mode: TimerMode.NORMAL,
  precision: TimerPrecision.CENTISECONDS,
  enableSound: true,
  enableHoldToStart: false
} as const;
