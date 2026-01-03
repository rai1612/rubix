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
  enableHoldToStart?: boolean;
}

interface UseTimerReturn {
  // State
  state: TimerState;
  currentTime: number;
  inspectionTimeRemaining: number;
  lastResult: TimerResult | null;
  
  // Hold to start state
  isHolding: boolean;
  
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
    enableKeyboard = true,
    enableHoldToStart = false
  } = options;

  // State
  const [state, setState] = useState<TimerState>(TimerState.READY);
  const [currentTime, setCurrentTime] = useState(0);
  const [inspectionTimeRemaining, setInspectionTimeRemaining] = useState(0);
  const [lastResult, setLastResult] = useState<TimerResult | null>(null);
  const [inspectionTime, setInspectionTimeState] = useState(initialInspectionTime);
  const [mode, setModeState] = useState(initialMode);
  const [isHolding, setIsHolding] = useState(false);

  // Sync settings when options change
  useEffect(() => {
    setInspectionTimeState(initialInspectionTime);
  }, [initialInspectionTime]);

  useEffect(() => {
    setModeState(initialMode);
  }, [initialMode]);

  // Refs for precise timing
  const startTimeRef = useRef<number>(0);
  const inspectionStartTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);
  const keyDownRef = useRef<boolean>(false);
  const holdStartTimeRef = useRef<number>(0);
  const holdTimeoutRef = useRef<number | null>(null);

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

  // No need for progress animation anymore - we use simple hold/release mechanism

  // Keyboard controls
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enableKeyboard) return;

    switch (event.code) {
      case 'Space':
        // Prevent default immediately and stop propagation
        event.preventDefault();
        event.stopPropagation();
        
        if (event.repeat) return;
        
        if (!keyDownRef.current) {
          keyDownRef.current = true;
          holdStartTimeRef.current = performance.now();
          
          // For timer start actions (READY state), use hold-to-ready if enabled and in NO_INSPECTION mode
          if (state === TimerState.READY && enableHoldToStart && mode === TimerMode.NO_INSPECTION) {
            setIsHolding(true);
            // Timer will start on key release
          } else {
            // For all other states, trigger immediately or if hold-to-start is disabled/not applicable
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
  }, [enableKeyboard, state, start, skipInspection, stop, reset, addPenalty, removePenalty, lastResult, enableHoldToStart, mode]);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    if (event.code === 'Space') {
      // Prevent default and stop propagation on keyup as well
      event.preventDefault();
      event.stopPropagation();
      
      keyDownRef.current = false;
      
      // If we were holding in READY state with hold-to-start enabled, start the timer now
      if (isHolding && state === TimerState.READY && enableHoldToStart && mode === TimerMode.NO_INSPECTION) {
        console.log('Spacebar released, starting timer...');
        setIsHolding(false);
        start();
      } else if (isHolding) {
        // For other cases, just reset holding state
        setIsHolding(false);
      }
      
      // Clear any pending hold timeout (though we shouldn't have any now)
      if (holdTimeoutRef.current) {
        clearTimeout(holdTimeoutRef.current);
        holdTimeoutRef.current = null;
      }
    }
  }, [isHolding, state, enableHoldToStart, mode, start]);

  // Set up keyboard listeners
  useEffect(() => {
    if (enableKeyboard) {
      // Use capture phase to ensure we catch the event early
      document.addEventListener('keydown', handleKeyDown, { capture: true });
      document.addEventListener('keyup', handleKeyUp, { capture: true });

      return () => {
        document.removeEventListener('keydown', handleKeyDown, { capture: true });
        document.removeEventListener('keyup', handleKeyUp, { capture: true });
        
        // Clean up any pending hold timeout
        if (holdTimeoutRef.current) {
          clearTimeout(holdTimeoutRef.current);
          holdTimeoutRef.current = null;
        }
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
    
    // Hold to start state
    isHolding,
    
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
