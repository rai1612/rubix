import React, { createContext, useContext, useState, ReactNode } from 'react';
import { TimerState } from '../utils/timerUtils';

interface TimerContextType {
  timerState: TimerState;
  setTimerState: (state: TimerState) => void;
  isMinimalMode: boolean;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

interface TimerProviderProps {
  children: ReactNode;
}

export const TimerProvider: React.FC<TimerProviderProps> = ({ children }) => {
  const [timerState, setTimerState] = useState<TimerState>(TimerState.READY);
  
  // Determine if we should show minimal interface (hide header during solving)
  const isMinimalMode = timerState === TimerState.INSPECTION || timerState === TimerState.SOLVING;

  return (
    <TimerContext.Provider value={{ timerState, setTimerState, isMinimalMode }}>
      {children}
    </TimerContext.Provider>
  );
};

export const useTimerContext = () => {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimerContext must be used within a TimerProvider');
  }
  return context;
};
