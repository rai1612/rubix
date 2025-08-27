import React from 'react';
import { TimerState, formatTime } from '../../utils/timerUtils';

interface TimerDisplayProps {
  state: TimerState;
  currentTime: number;
  inspectionTimeRemaining: number;
  inspectionTime: number;
  lastSolveTime?: number;
  disabled?: boolean;
  hideTime?: boolean;
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
  className = ''
}) => {
  // Get display time based on current state
  const getDisplayTime = () => {
    if (state === TimerState.FINISHED && lastSolveTime !== undefined) {
      return formatTime(lastSolveTime);
    } else if (state === TimerState.SOLVING) {
      return hideTime ? '???' : formatTime(currentTime);
    } else if (state === TimerState.INSPECTION) {
      const remaining = Math.ceil(inspectionTimeRemaining / 1000);
      return remaining > 0 ? remaining.toString() : 'GO!';
    }
    return '0.00';
  };

  // Get timer color based on state
  const getTimerColor = () => {
    if (state === TimerState.INSPECTION) {
      const remaining = inspectionTimeRemaining / 1000;
      if (remaining <= 3) return 'text-red-500';
      if (remaining <= 8) return 'text-yellow-500';
      return 'text-blue-500';
    } else if (state === TimerState.SOLVING) {
      return hideTime ? 'text-gray-400' : 'text-green-500';
    } else if (state === TimerState.FINISHED) {
      return 'text-gray-900';
    }
    return 'text-gray-600';
  };

  // Get instructions based on state
  const getInstructions = () => {
    switch (state) {
      case TimerState.READY:
        return 'Press SPACE to start inspection';
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
        `}
        style={{ fontFeatureSettings: '"tnum"' }} // Ensure monospace numbers
      >
        {getDisplayTime()}
      </div>

      {/* Inspection Time Progress Bar */}
      {state === TimerState.INSPECTION && (
        <div className="mb-6">
          <div className="w-64 bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-100 ${
                inspectionTimeRemaining / 1000 <= 3 ? 'bg-red-500' :
                inspectionTimeRemaining / 1000 <= 8 ? 'bg-yellow-500' : 'bg-blue-500'
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
          <p className="text-gray-600 text-center mb-8 max-w-md">
            {getInstructions()}
          </p>

          {/* Keyboard Shortcuts - Only when ready or finished */}
          {(state === TimerState.READY || state === TimerState.FINISHED) && (
            <div className="mt-8 text-sm text-gray-500 text-center">
              <p>Keyboard: <kbd className="px-2 py-1 bg-gray-100 rounded">SPACE</kbd> to control timer</p>
              <p><kbd className="px-2 py-1 bg-gray-100 rounded">R</kbd> to reset</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TimerDisplay;
