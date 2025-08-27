import React, { useState, useEffect } from 'react';
import { TimerDisplay } from '../components/timer/TimerDisplay';
import { TimerControls } from '../components/timer/TimerControls';
import { TimerSettings } from '../components/timer/TimerSettings';
import { ScrambleDisplay } from '../components/scramble/ScrambleDisplay';
import { SessionStatsDisplay } from '../components/statistics/SessionStatsDisplay';
import { useTimer } from '../hooks/useTimer';
import { useSession } from '../hooks/useSession';
import { useTimerSettings, useTimerSound, useTimerVisualEffects } from '../hooks/useTimerSettings';
import { TimerResult, TimerState } from '../utils/timerUtils';
import { PuzzleType, ScrambleService, ClientScrambleGenerator, ScrambleDto } from '../services/scrambleService';
import { SolveService, CreateSolveRequest } from '../services/solveService';

const TimerPage: React.FC = () => {
  const [selectedPuzzleType, setSelectedPuzzleType] = useState<PuzzleType>(PuzzleType.CUBE_3X3);
  const [currentSolveId, setCurrentSolveId] = useState<string | null>(null);
  const [optimisticSolveCount, setOptimisticSolveCount] = useState<number | null>(null);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  
  // Scramble management state
  const [currentScramble, setCurrentScramble] = useState<ScrambleDto | null>(null);
  const [nextScramble, setNextScramble] = useState<ScrambleDto | null>(null);
  const [isGeneratingNext, setIsGeneratingNext] = useState<boolean>(false);
  const [scrambleError, setScrambleError] = useState<string | null>(null);

  // Settings hooks
  const { settings, updateSettings, isLoaded: settingsLoaded } = useTimerSettings();
  const { playSound } = useTimerSound(settings.enableSound);
  const { flashScreen, vibrate } = useTimerVisualEffects();
  
  // Session hook
  const {
    currentSession,
    isLoading: sessionLoading,
    error: sessionError,
    loadOrCreateSession,
    refreshSession
  } = useSession({
    autoLoad: false, // We'll load manually when needed
    refreshInterval: 30000 // Refresh every 30 seconds
  });

  // Enhanced solve completion handler with proper state management
  const handleEnhancedSolveComplete = async (result: TimerResult, isUpdate: boolean = false) => {
    // Enhanced feedback for solve completion
    if (!isUpdate) {
      playSound('stop');
      flashScreen('green');
      vibrate(100);
    }
    
    // Call the original solve completion logic
    if (!currentScramble) {
      console.warn('No scramble available for solve');
      return;
    }

    try {
      if (currentSolveId && isUpdate) {
        // Update existing solve (when penalty is added/removed)
        await SolveService.updateSolve(currentSolveId, {
          timeMs: Math.round(result.time),
          penalty: result.penalty as any,
          notes: undefined
        });
      } else {
        // Create new solve (first time completion)
        if (currentSession) {
          setOptimisticSolveCount((currentSession.solveCount || 0) + 1);
        }
        
        const request: CreateSolveRequest = {
          scrambleId: currentScramble.id,
          timeMs: Math.round(result.time),
          inspectionTimeMs: Math.round(result.inspectionTime),
          penalty: result.penalty as any,
          solvedAt: result.timestamp.toISOString(),
          notes: undefined
        };

        const savedSolve = await SolveService.createSolve(request);
        setCurrentSolveId(savedSolve.id);
      }
      
      // Refresh session data
      if (currentSession) {
        await refreshSession();
        setOptimisticSolveCount(null);
      }
    } catch (error) {
      console.error('Failed to save/update solve:', error);
    }
  };

  // Timer hook with settings integration and state callbacks
  const {
    state: timerState,
    currentTime,
    inspectionTimeRemaining,
    lastResult,
    reset: resetTimer,
    addPenalty,
    removePenalty
  } = useTimer({
    inspectionTime: settings.inspectionTime,
    mode: settings.mode,
    onSolveComplete: handleEnhancedSolveComplete,
    autoReset: false,
    enableKeyboard: true
  });

  // Function to generate a scramble
  const generateScramble = async (): Promise<ScrambleDto | null> => {
    try {
      setScrambleError(null);
      const newScramble = await ScrambleService.generateScramble(selectedPuzzleType);
      return newScramble;
    } catch (error) {
      console.error('Failed to generate scramble:', error);
      setScrambleError('Failed to generate scramble');
      
      // Fallback: generate offline scramble
      try {
        const offlineScrambleText = ClientScrambleGenerator.generateOfflineScramble(selectedPuzzleType);
        const offlineScramble: ScrambleDto = {
          id: `offline-${Date.now()}`,
          scrambleText: offlineScrambleText,
          puzzleType: selectedPuzzleType,
          algorithmMoves: offlineScrambleText.split(' ').length,
          moveCount: offlineScrambleText.split(' ').length,
          generatedAt: new Date().toISOString(),
          isCustom: false
        };
        setScrambleError(null);
        return offlineScramble;
      } catch (fallbackError) {
        console.error('Failed to generate fallback scramble:', fallbackError);
        setScrambleError('Failed to generate scramble');
        return null;
      }
    }
  };

  // Function to generate next scramble in background
  const generateNextScramble = async () => {
    if (isGeneratingNext) return;
    
    setIsGeneratingNext(true);
    try {
      const newScramble = await generateScramble();
      if (newScramble) {
        setNextScramble(newScramble);
      }
    } finally {
      setIsGeneratingNext(false);
    }
  };

  // Function to swap to next scramble instantly
  const swapToNextScramble = () => {
    if (nextScramble) {
      setCurrentScramble(nextScramble);
      setNextScramble(null);
      // Immediately start generating the next one
      generateNextScramble();
    } else {
      // Fallback: generate new scramble normally
      handleGenerateNewScramble();
    }
  };

  // Function to generate new scramble (for manual generation)
  const handleGenerateNewScramble = async () => {
    const newScramble = await generateScramble();
    if (newScramble) {
      setCurrentScramble(newScramble);
    }
  };



  // Handle manual scramble generation (from button press)
  const handleGenerateScramble = () => {
    // Only allow manual generation when timer is ready
    if (timerState === TimerState.READY) {
      handleGenerateNewScramble();
      setCurrentSolveId(null);
      setOptimisticSolveCount(null);
    }
  };



  // Handle timer reset
  const handleReset = () => {
    resetTimer();
    setCurrentSolveId(null);
    setOptimisticSolveCount(null);
    // Note: Scramble generation will be handled by useEffect when state becomes READY
  };

  // Load session and generate initial scramble on component mount
  useEffect(() => {
    loadOrCreateSession();
    
    // Generate initial scramble only if we don't have one
    if (!currentScramble) {
      handleGenerateNewScramble();
    }
  }, [loadOrCreateSession]); // Only depend on loadOrCreateSession

  // Handle timer state changes for sound effects and scramble pre-generation
  useEffect(() => {
    switch (timerState) {
      case TimerState.INSPECTION:
        playSound('start');
        break;
      case TimerState.SOLVING:
        playSound('ready');
        // Start generating next scramble as soon as solving begins
        generateNextScramble();
        break;
      case TimerState.FINISHED:
        // Instantly swap to pre-generated scramble - no delay!
        swapToNextScramble();
        break;
      default:
        break;
    }
  }, [timerState, playSound]);

  // Debug: Track session changes
  useEffect(() => {
    console.log('TimerPage: currentSession changed:', {
      id: currentSession?.id,
      solveCount: currentSession?.solveCount,
      averageTimeMs: currentSession?.averageTimeMs,
      bestTimeMs: currentSession?.bestTimeMs
    });
  }, [currentSession]);



  // Determine if we should show minimal interface (only timer during solving)
  const isMinimalMode = timerState === TimerState.INSPECTION || timerState === TimerState.SOLVING;

  return (
    <div className="max-w-6xl mx-auto">
      {isMinimalMode ? (
        /* Minimal Solving Interface - Only Timer */
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-full max-w-4xl">
            <TimerDisplay
              state={timerState}
              currentTime={currentTime}
              inspectionTimeRemaining={inspectionTimeRemaining}
              inspectionTime={settings.inspectionTime}
              lastSolveTime={lastResult?.time}
              hideTime={settings.hideTime}
              disabled={!currentScramble || !settingsLoaded}
            />
          </div>
        </div>
      ) : (
        /* Full Interface - All Components */
        <div className="space-y-8 py-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Practice Timer</h1>
            <p className="text-gray-600">
              Generate scrambles, time your solves, and track your progress
            </p>
          </div>

          {/* Puzzle Type Selector */}
          <div className="flex justify-center">
            <div className="bg-white rounded-lg border border-gray-200 p-1 inline-flex">
              <button
                onClick={() => setSelectedPuzzleType(PuzzleType.CUBE_2X2)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedPuzzleType === PuzzleType.CUBE_2X2
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                2x2
              </button>
              <button
                onClick={() => setSelectedPuzzleType(PuzzleType.CUBE_3X3)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedPuzzleType === PuzzleType.CUBE_3X3
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                3x3
              </button>
              <button
                onClick={() => setSelectedPuzzleType(PuzzleType.CUBE_4X4)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedPuzzleType === PuzzleType.CUBE_4X4
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                4x4
              </button>
            </div>
          </div>

          {/* Scramble Display */}
          <div className="flex justify-center">
            <div className="w-full max-w-2xl">
                          <ScrambleDisplay
              scramble={currentScramble}
              isGenerating={false} // We handle loading states differently now
              onGenerateNew={handleGenerateScramble}
            />
              {scrambleError && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">
                    Failed to generate scramble: {scrambleError}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Timer Display */}
          <div className="flex justify-center">
            <div className="w-full max-w-4xl">
              <TimerDisplay
                state={timerState}
                currentTime={currentTime}
                inspectionTimeRemaining={inspectionTimeRemaining}
                inspectionTime={settings.inspectionTime}
                lastSolveTime={lastResult?.time}
                hideTime={settings.hideTime}
                disabled={!currentScramble || !settingsLoaded}
              />
            </div>
          </div>

          {/* Timer Controls */}
          <div className="flex justify-center">
            <div className="w-full max-w-lg">
              <TimerControls
                lastResult={lastResult}
                onAddPenalty={addPenalty}
                onRemovePenalty={removePenalty}
                onReset={handleReset}
                onOpenSettings={() => setShowSettings(true)}
                disabled={timerState === TimerState.SOLVING || timerState === TimerState.INSPECTION}
              />
            </div>
          </div>

          {/* Session Stats */}
          <SessionStatsDisplay
            session={currentSession}
            isLoading={sessionLoading}
            error={sessionError}
            optimisticSolveCount={optimisticSolveCount}
            puzzleType={selectedPuzzleType}
          />

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-blue-900 mb-2">How to Use</h3>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• Press <kbd className="px-2 py-1 bg-blue-100 rounded text-xs">SPACE</kbd> to start inspection</li>
              <li>• Press <kbd className="px-2 py-1 bg-blue-100 rounded text-xs">SPACE</kbd> again to start solving</li>
              <li>• Press <kbd className="px-2 py-1 bg-blue-100 rounded text-xs">SPACE</kbd> when finished to stop the timer</li>
              <li>• Use <kbd className="px-2 py-1 bg-blue-100 rounded text-xs">2</kbd> for +2 penalty, <kbd className="px-2 py-1 bg-blue-100 rounded text-xs">D</kbd> for DNF</li>
              <li>• Press <kbd className="px-2 py-1 bg-blue-100 rounded text-xs">R</kbd> to reset and get a new scramble</li>
            </ul>
          </div>
        </div>
      )}

      {/* Timer Settings Modal - Always available */}
      <TimerSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSettingsChange={updateSettings}
      />
    </div>
  );
};

export default TimerPage;
