import React from 'react';
import { TimerState, TimerMode, formatTime } from '../../utils/timerUtils';
import { getAdaptiveClasses } from '../../utils/appearanceUtils';

interface TimerDisplayProps {
  state: TimerState;
  currentTime: number;
  inspectionTimeRemaining: number;
  inspectionTime: number;
  lastSolveTime?: number;
  disabled?: boolean;
  hideTime?: boolean;
  mode?: TimerMode;
  precision?: number;
  enableInspectionWarning?: boolean;
  inspectionWarningTime?: number;
  isHolding?: boolean;
  className?: string;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
  state,
  currentTime,
  inspectionTimeRemaining,
  inspectionTime,
  lastSolveTime,
  disabled = false,
  hideTime = false,
  mode = TimerMode.NORMAL,
  precision = 2,
  enableInspectionWarning = true,
  inspectionWarningTime = 8,
  isHolding = false,
  className = ''
}) => {
  // Get display time based on current state
  const getDisplayTime = () => {
    if (state === TimerState.FINISHED && lastSolveTime !== undefined) {
      return formatTime(lastSolveTime, precision);
    } else if (state === TimerState.SOLVING) {
      return hideTime ? '???' : formatTime(currentTime, precision);
    } else if (state === TimerState.INSPECTION) {
      const remaining = Math.ceil(inspectionTimeRemaining / 1000);
      return remaining > 0 ? remaining.toString() : 'GO!';
    }
    return precision === 3 ? '0.000' : '0.00';
  };

  // Get timer color based on state
  const getTimerColor = () => {
    if (state === TimerState.INSPECTION) {
      const remaining = inspectionTimeRemaining / 1000;
      if (remaining <= 3) return getAdaptiveClasses.semantic.error; // Critical warning (always red at 3s)
      if (enableInspectionWarning && remaining <= inspectionWarningTime) return getAdaptiveClasses.semantic.warning;
      return getAdaptiveClasses.semantic.info;
    } else if (state === TimerState.SOLVING) {
      return hideTime ? 'text-adaptive-tertiary' : getAdaptiveClasses.semantic.success;
    } else if (state === TimerState.FINISHED) {
      return 'text-adaptive-primary';
    }
    return 'text-adaptive-secondary';
  };

  // Get instructions based on state and mode
  const getInstructions = () => {
    switch (state) {
      case TimerState.READY:
        if (mode === TimerMode.NO_INSPECTION) {
          return 'Press SPACE to start solving';
        } else if (mode === TimerMode.STACKMAT) {
          return 'Use your Stackmat timer to start';
        } else {
          return 'Press SPACE to start inspection';
        }
      case TimerState.INSPECTION:
        return 'Inspect your cube, then SPACE to start solving';
      case TimerState.SOLVING:
        return 'Solving... Press SPACE when finished';
      case TimerState.FINISHED:
        return 'Great job! Press SPACE for new solve';
      default:
        return '';
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-[400px] ${className}`}>
      {/* Main Timer Display */}
      <div
        className={`
          text-8xl md:text-9xl lg:text-[10rem] font-mono font-bold mb-8 select-none
          transition-all duration-300 ${getTimerColor()}
          ${disabled ? 'opacity-50' : ''}
          ${state === TimerState.SOLVING || state === TimerState.INSPECTION ? 'scale-110' : 'scale-100'}
          ${isHolding ? 'scale-105' : ''}
        `}
        style={{ fontFeatureSettings: '"tnum"' }} // Ensure monospace numbers
      >
        {getDisplayTime()}
      </div>

      {/* Hold to Release Indicator */}
      {isHolding && (
        <div className="mb-6">
          <div className="w-64 bg-primary-100 border-2 border-primary-500 rounded-lg h-4 flex items-center justify-center">
            <div className="w-full bg-primary-500 rounded h-2" />
          </div>
          <p className="text-sm text-primary-600 font-medium mt-2">Ready! Release spacebar to start</p>
        </div>
      )}

      {/* Inspection Time Progress Bar */}
      {state === TimerState.INSPECTION && (
        <div className="mb-6">
          <div className="w-64 bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-100 ${
                inspectionTimeRemaining / 1000 <= 3 ? 'bg-red-500' :
                (enableInspectionWarning && inspectionTimeRemaining / 1000 <= inspectionWarningTime) ? 'bg-yellow-500' : 'bg-blue-500'
              }`}
              style={{
                width: `${(inspectionTimeRemaining / (inspectionTime * 1000)) * 100}%`
              }}
            />
          </div>
        </div>
      )}

      {/* Instructions - Only show when not actively solving */}
      {state !== TimerState.SOLVING && (
        <>
          <p className="text-adaptive-secondary text-center mb-8 max-w-md">
            {getInstructions()}
          </p>

          {/* Keyboard Shortcuts - Only when ready or finished */}
          {(state === TimerState.READY || state === TimerState.FINISHED) && (
            <div className="mt-8 text-sm text-adaptive-tertiary text-center">
              <p>Keyboard: <kbd className="px-2 py-1 bg-adaptive-tertiary rounded">SPACE</kbd> to control timer</p>
              <p><kbd className="px-2 py-1 bg-adaptive-tertiary rounded">R</kbd> to reset</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TimerDisplay;
