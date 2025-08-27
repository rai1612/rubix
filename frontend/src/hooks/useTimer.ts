import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  TimerState, 
  TimerMode, 
  TimerResult, 
  PenaltyType,
  calculateAdjustedTime 
} from '../utils/timerUtils';

interface UseTimerOptions {
  inspectionTime?: number; // seconds
  mode?: TimerMode;
  onSolveComplete?: (result: TimerResult, isUpdate?: boolean) => void;
  autoReset?: boolean;
  enableKeyboard?: boolean;
}

interface UseTimerReturn {
  // State
  state: TimerState;
  currentTime: number;
  inspectionTimeRemaining: number;
  lastResult: TimerResult | null;
  
  // Controls
  start: () => void;
  stop: () => void;
  reset: () => void;
  
  // Penalty management
  addPenalty: (penalty: PenaltyType) => void;
  removePenalty: () => void;
  
  // Settings
  setInspectionTime: (seconds: number) => void;
  setMode: (mode: TimerMode) => void;
  
  // Status
  isRunning: boolean;
  canStart: boolean;
  canStop: boolean;
}

export const useTimer = (options: UseTimerOptions = {}): UseTimerReturn => {
  const {
    inspectionTime: initialInspectionTime = 15,
    mode: initialMode = TimerMode.NORMAL,
    onSolveComplete,
    autoReset = false,
    enableKeyboard = true
  } = options;

  // State
  const [state, setState] = useState<TimerState>(TimerState.READY);
  const [currentTime, setCurrentTime] = useState(0);
  const [inspectionTimeRemaining, setInspectionTimeRemaining] = useState(0);
  const [lastResult, setLastResult] = useState<TimerResult | null>(null);
  const [inspectionTime, setInspectionTimeState] = useState(initialInspectionTime);
  const [mode, setModeState] = useState(initialMode);

  // Refs for precise timing
  const startTimeRef = useRef<number>(0);
  const inspectionStartTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);
  const keyDownRef = useRef<boolean>(false);

  // Animation loop for updating display
  const updateDisplay = useCallback(() => {
    const now = performance.now();

    if (state === TimerState.INSPECTION) {
      const elapsed = now - inspectionStartTimeRef.current;
      const remaining = Math.max(0, (inspectionTime * 1000) - elapsed);
      setInspectionTimeRemaining(remaining);

      // Auto-transition to solving when inspection time expires
      if (remaining <= 0) {
        setState(TimerState.SOLVING);
        startTimeRef.current = now;
        setCurrentTime(0);
      }
    } else if (state === TimerState.SOLVING) {
      const elapsed = now - startTimeRef.current;
      setCurrentTime(elapsed);
    }

    // Continue animation if timer is active
    if (state === TimerState.INSPECTION || state === TimerState.SOLVING) {
      animationFrameRef.current = requestAnimationFrame(updateDisplay);
    }
  }, [state, inspectionTime]);

  // Start/stop animation loop
  useEffect(() => {
    if (state === TimerState.INSPECTION || state === TimerState.SOLVING) {
      animationFrameRef.current = requestAnimationFrame(updateDisplay);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [updateDisplay, state]);

  // Timer control functions
  const start = useCallback(() => {
    if (state !== TimerState.READY) return;

    const now = performance.now();

    if (mode === TimerMode.NO_INSPECTION) {
      // Start solving directly
      setState(TimerState.SOLVING);
      startTimeRef.current = now;
      setCurrentTime(0);
    } else {
      // Start inspection phase
      setState(TimerState.INSPECTION);
      inspectionStartTimeRef.current = now;
      setInspectionTimeRemaining(inspectionTime * 1000);
    }

    setLastResult(null);
  }, [state, mode, inspectionTime]);

  const skipInspection = useCallback(() => {
    if (state !== TimerState.INSPECTION) return;

    setState(TimerState.SOLVING);
    startTimeRef.current = performance.now();
    setCurrentTime(0);
  }, [state]);

  const stop = useCallback(() => {
    if (state !== TimerState.SOLVING) return;

    const endTime = performance.now();
    const solveTime = endTime - startTimeRef.current;
    const usedInspectionTime = mode === TimerMode.NO_INSPECTION 
      ? 0 
      : Math.max(0, (inspectionTime * 1000) - inspectionTimeRemaining);

    const result: TimerResult = {
      time: solveTime,
      inspectionTime: usedInspectionTime,
      penalty: PenaltyType.NONE,
      adjustedTime: solveTime,
      timestamp: new Date()
    };

    setState(TimerState.FINISHED);
    setLastResult(result);
    
    // Notify callback (new solve completion)
    onSolveComplete?.(result, false);

    // Auto-reset if enabled
    if (autoReset) {
      setTimeout(reset, 2000);
    }
  }, [state, mode, inspectionTime, inspectionTimeRemaining, onSolveComplete, autoReset]);

  const reset = useCallback(() => {
    setState(TimerState.READY);
    setCurrentTime(0);
    setInspectionTimeRemaining(0);
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  // Penalty management
  const addPenalty = useCallback((penalty: PenaltyType) => {
    if (!lastResult) return;

    const updatedResult: TimerResult = {
      ...lastResult,
      penalty,
      adjustedTime: calculateAdjustedTime(lastResult.time, penalty)
    };

    setLastResult(updatedResult);
    onSolveComplete?.(updatedResult, true);
  }, [lastResult, onSolveComplete]);

  const removePenalty = useCallback(() => {
    if (!lastResult) return;

    const updatedResult: TimerResult = {
      ...lastResult,
      penalty: PenaltyType.NONE,
      adjustedTime: lastResult.time
    };

    setLastResult(updatedResult);
    onSolveComplete?.(updatedResult, true);
  }, [lastResult, onSolveComplete]);

  // Settings
  const setInspectionTime = useCallback((seconds: number) => {
    if (seconds >= 0 && seconds <= 60) {
      setInspectionTimeState(seconds);
    }
  }, []);

  const setMode = useCallback((newMode: TimerMode) => {
    setModeState(newMode);
  }, []);

  // Keyboard controls
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enableKeyboard || event.repeat) return;

    switch (event.code) {
      case 'Space':
        event.preventDefault();
        if (!keyDownRef.current) {
          keyDownRef.current = true;
          
          if (state === TimerState.READY) {
            start();
          } else if (state === TimerState.INSPECTION) {
            skipInspection();
          } else if (state === TimerState.SOLVING) {
            stop();
          } else if (state === TimerState.FINISHED) {
            reset();
          }
        }
        break;

      case 'KeyR':
        event.preventDefault();
        reset();
        break;

      case 'Digit2':
        if (state === TimerState.FINISHED && lastResult?.penalty !== PenaltyType.PLUS_TWO) {
          addPenalty(PenaltyType.PLUS_TWO);
        }
        break;

      case 'KeyD':
        if (state === TimerState.FINISHED && lastResult?.penalty !== PenaltyType.DNF) {
          addPenalty(PenaltyType.DNF);
        }
        break;

      case 'KeyC':
        if (state === TimerState.FINISHED && lastResult?.penalty !== PenaltyType.NONE) {
          removePenalty();
        }
        break;
    }
  }, [enableKeyboard, state, start, skipInspection, stop, reset, addPenalty, removePenalty, lastResult]);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    if (event.code === 'Space') {
      keyDownRef.current = false;
    }
  }, []);

  // Set up keyboard listeners
  useEffect(() => {
    if (enableKeyboard) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('keyup', handleKeyUp);

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('keyup', handleKeyUp);
      };
    }
  }, [enableKeyboard, handleKeyDown, handleKeyUp]);

  // Computed properties
  const isRunning = state === TimerState.INSPECTION || state === TimerState.SOLVING;
  const canStart = state === TimerState.READY;
  const canStop = state === TimerState.SOLVING;

  return {
    // State
    state,
    currentTime,
    inspectionTimeRemaining,
    lastResult,
    
    // Controls
    start,
    stop,
    reset,
    
    // Penalty management
    addPenalty,
    removePenalty,
    
    // Settings
    setInspectionTime,
    setMode,
    
    // Status
    isRunning,
    canStart,
    canStop
  };
};

export default useTimer;
