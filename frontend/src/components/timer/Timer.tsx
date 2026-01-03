import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Square, RotateCcw } from 'lucide-react';
import { formatTime, TimerState, TimerMode } from '../../utils/timerUtils';
import { getTimerStateClass, buttonVariants, cn } from '../../utils/appearanceUtils';

interface TimerProps {
  inspectionTime?: number; // seconds
  onSolveComplete?: (time: number, inspectionTime: number) => void;
  onTimerStateChange?: (state: TimerState) => void;
  mode?: TimerMode;
  disabled?: boolean;
  className?: string;
}

export const Timer: React.FC<TimerProps> = ({
  inspectionTime = 15,
  onSolveComplete,
  onTimerStateChange,
  mode = TimerMode.NORMAL,
  disabled = false,
  className = ''
}) => {
  // Timer state
  const [timerState, setTimerState] = useState<TimerState>(TimerState.READY);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentInspectionTime, setCurrentInspectionTime] = useState(0);
  const [finalTime, setFinalTime] = useState<number | null>(null);
  
  // Refs for accurate timing
  const startTimeRef = useRef<number>(0);
  const inspectionStartRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);
  const keyDownTimeRef = useRef<number>(0);
  const isKeyDownRef = useRef<boolean>(false);
  
  // Timer animation loop
  const updateTimer = useCallback(() => {
    const now = performance.now();
    
    if (timerState === TimerState.INSPECTION) {
      const elapsed = now - inspectionStartRef.current;
      const remaining = Math.max(0, (inspectionTime * 1000) - elapsed);
      setCurrentInspectionTime(remaining);
      
      // Auto-start solving after inspection time
      if (remaining <= 0) {
        setTimerState(TimerState.SOLVING);
        startTimeRef.current = now;
        setCurrentTime(0);
      }
    } else if (timerState === TimerState.SOLVING) {
      const elapsed = now - startTimeRef.current;
      setCurrentTime(elapsed);
    }
    
    if (timerState === TimerState.INSPECTION || timerState === TimerState.SOLVING) {
      animationFrameRef.current = requestAnimationFrame(updateTimer);
    }
  }, [timerState, inspectionTime]);

  // Start timer animation
  useEffect(() => {
    if (timerState === TimerState.INSPECTION || timerState === TimerState.SOLVING) {
      animationFrameRef.current = requestAnimationFrame(updateTimer);
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [updateTimer, timerState]);

  // Notify parent of state changes
  useEffect(() => {
    onTimerStateChange?.(timerState);
  }, [timerState, onTimerStateChange]);

  // Timer control functions
  const startInspection = useCallback(() => {
    if (disabled || timerState !== TimerState.READY) return;
    
    setTimerState(TimerState.INSPECTION);
    inspectionStartRef.current = performance.now();
    setCurrentInspectionTime(inspectionTime * 1000);
    setCurrentTime(0);
    setFinalTime(null);
  }, [disabled, timerState, inspectionTime]);

  const startSolving = useCallback(() => {
    if (disabled) return;
    
    if (timerState === TimerState.INSPECTION) {
      // Skip remaining inspection time
      setTimerState(TimerState.SOLVING);
      startTimeRef.current = performance.now();
      setCurrentTime(0);
    } else if (timerState === TimerState.READY && mode === TimerMode.NO_INSPECTION) {
      // Start solving directly (no inspection)
      setTimerState(TimerState.SOLVING);
      startTimeRef.current = performance.now();
      setCurrentTime(0);
      setFinalTime(null);
    }
  }, [disabled, timerState, mode]);

  const stopTimer = useCallback(() => {
    if (disabled || timerState !== TimerState.SOLVING) return;
    
    const endTime = performance.now();
    const totalTime = endTime - startTimeRef.current;
    const totalInspectionTime = inspectionTime * 1000 - currentInspectionTime;
    
    setTimerState(TimerState.FINISHED);
    setFinalTime(totalTime);
    
    // Notify parent with final times
    onSolveComplete?.(totalTime, Math.max(0, totalInspectionTime));
  }, [disabled, timerState, onSolveComplete, inspectionTime, currentInspectionTime]);

  const resetTimer = useCallback(() => {
    if (disabled) return;
    
    setTimerState(TimerState.READY);
    setCurrentTime(0);
    setCurrentInspectionTime(0);
    setFinalTime(null);
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, [disabled]);

  // Keyboard controls
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (disabled) return;
    
    // Only handle spacebar for timer control
    if (event.code === 'Space') {
      // Prevent default immediately and stop propagation
      event.preventDefault();
      event.stopPropagation();
      
      if (event.repeat) return;
      
      if (!isKeyDownRef.current) {
        isKeyDownRef.current = true;
        keyDownTimeRef.current = performance.now();
        
        if (timerState === TimerState.READY) {
          if (mode === TimerMode.NO_INSPECTION) {
            startSolving();
          } else {
            startInspection();
          }
        } else if (timerState === TimerState.INSPECTION) {
          startSolving();
        } else if (timerState === TimerState.SOLVING) {
          stopTimer();
        } else if (timerState === TimerState.FINISHED) {
          resetTimer();
        }
      }
    }
    
    // Reset timer with 'r' key
    if (event.code === 'KeyR' && !event.repeat) {
      resetTimer();
    }
  }, [disabled, timerState, mode, startInspection, startSolving, stopTimer, resetTimer]);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    if (event.code === 'Space') {
      // Prevent default and stop propagation on keyup as well
      event.preventDefault();
      event.stopPropagation();
      
      isKeyDownRef.current = false;
    }
  }, []);

  // Set up keyboard listeners
  useEffect(() => {
    // Use capture phase to ensure we catch the event early
    document.addEventListener('keydown', handleKeyDown, { capture: true });
    document.addEventListener('keyup', handleKeyUp, { capture: true });
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown, { capture: true });
      document.removeEventListener('keyup', handleKeyUp, { capture: true });
    };
  }, [handleKeyDown, handleKeyUp]);

  // Touch controls for mobile
  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    event.preventDefault();
    if (disabled) return;
    
    if (timerState === TimerState.READY) {
      if (mode === TimerMode.NO_INSPECTION) {
        startSolving();
      } else {
        startInspection();
      }
    } else if (timerState === TimerState.INSPECTION) {
      startSolving();
    } else if (timerState === TimerState.SOLVING) {
      stopTimer();
    } else if (timerState === TimerState.FINISHED) {
      resetTimer();
    }
  }, [disabled, timerState, mode, startInspection, startSolving, stopTimer, resetTimer]);

  // Get display time and color
  const getDisplayTime = () => {
    if (timerState === TimerState.FINISHED && finalTime !== null) {
      return formatTime(finalTime);
    } else if (timerState === TimerState.SOLVING) {
      return formatTime(currentTime);
    } else if (timerState === TimerState.INSPECTION) {
      const remaining = Math.ceil(currentInspectionTime / 1000);
      return remaining > 0 ? remaining.toString() : 'GO!';
    }
    return '0.00';
  };

  const getTimerColor = () => {
    if (timerState === TimerState.INSPECTION) {
      const remaining = currentInspectionTime / 1000;
      if (remaining <= 3) return getTimerStateClass('inspection-danger');
      if (remaining <= 8) return getTimerStateClass('inspection-warning');
      return getTimerStateClass('inspection');
    } else if (timerState === TimerState.SOLVING) {
      return getTimerStateClass('solving');
    } else if (timerState === TimerState.FINISHED) {
      return getTimerStateClass('finished');
    }
    return getTimerStateClass('ready');
  };

  const getInstructions = () => {
    switch (timerState) {
      case TimerState.READY:
        return mode === TimerMode.NO_INSPECTION 
          ? 'Press SPACE to start solving' 
          : 'Press SPACE to start inspection';
      case TimerState.INSPECTION:
        return 'Inspect your cube, then SPACE to start';
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
          text-8xl md:text-9xl font-mono font-bold mb-8 cursor-pointer select-none
          transition-colors duration-200 ${getTimerColor()}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
        `}
        onTouchStart={handleTouchStart}
        style={{ fontFeatureSettings: '"tnum"' }} // Ensure monospace numbers
      >
        {getDisplayTime()}
      </div>

      {/* Inspection Time Indicator */}
      {timerState === TimerState.INSPECTION && (
        <div className="mb-6">
          <div className="w-64 bg-adaptive-tertiary rounded-full h-2">
            <div
              className={cn(
                'h-2 rounded-full transition-all duration-100',
                currentInspectionTime / 1000 <= 3 ? 'bg-red-500' :
                currentInspectionTime / 1000 <= 8 ? 'bg-yellow-500' : 'bg-blue-500'
              )}
              style={{
                width: `${(currentInspectionTime / (inspectionTime * 1000)) * 100}%`
              }}
            />
          </div>
        </div>
      )}

      {/* Instructions */}
      <p className="text-adaptive-secondary text-center mb-8 max-w-md">
        {getInstructions()}
      </p>

      {/* Control Buttons */}
      <div className="flex items-center space-x-4">
        {timerState === TimerState.READY && (
          <button
            onClick={mode === TimerMode.NO_INSPECTION ? startSolving : startInspection}
            disabled={disabled}
            className={cn(buttonVariants.primary, 'px-6 py-3')}
          >
            <Play className="w-5 h-5 mr-2" />
            <span>{mode === TimerMode.NO_INSPECTION ? 'Start' : 'Inspect'}</span>
          </button>
        )}

        {timerState === TimerState.SOLVING && (
          <button
            onClick={stopTimer}
            disabled={disabled}
            className={cn(buttonVariants.danger, 'px-6 py-3')}
          >
            <Square className="w-5 h-5 mr-2" />
            <span>Stop</span>
          </button>
        )}

        <button
          onClick={resetTimer}
          disabled={disabled}
          className={cn(buttonVariants.secondary, 'px-6 py-3')}
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          <span>Reset</span>
        </button>
      </div>

      {/* Keyboard Shortcuts */}
      <div className="mt-8 text-sm text-adaptive-tertiary text-center">
        <p>Keyboard: <kbd className="px-2 py-1 bg-adaptive-tertiary border border-adaptive-primary rounded">SPACE</kbd> to control timer</p>
        <p><kbd className="px-2 py-1 bg-adaptive-tertiary border border-adaptive-primary rounded">R</kbd> to reset</p>
      </div>
    </div>
  );
};

export default Timer;
