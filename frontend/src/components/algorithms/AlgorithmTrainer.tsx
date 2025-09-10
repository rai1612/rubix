import React, { useState, useCallback, useEffect } from 'react';
import { ArrowLeft, Target, Clock, TrendingUp, BarChart3, Trophy, Zap, Brain } from 'lucide-react';
import { Algorithm } from '../../services/algorithmService';
import { Timer } from '../timer/Timer';
import { TimerState, TimerMode, formatTime } from '../../utils/timerUtils';

import { cn, getAdaptiveClasses } from '../../utils/appearanceUtils';

interface AlgorithmTrainerProps {
  algorithms: Algorithm[];
  onExit: () => void;
}

interface DrillSession {
  id: string;
  mode: DrillMode;
  algorithms: Algorithm[];
  attempts: DrillAttempt[];
  startTime: Date;
  endTime?: Date;
  settings: DrillSettings;
  stats: SessionStats;
}

interface DrillAttempt {
  id: string;
  algorithm: Algorithm;
  timeMs: number;
  correct: boolean;
  userInput?: string;
  timestamp: Date;
  penalty?: 'plus2' | 'dnf';
}

interface DrillSettings {
  timeLimit?: number; // seconds
  maxAttempts?: number;
  shuffleAlgorithms: boolean;
  autoAdvance: boolean;
  recognitionMode: boolean;
}

interface SessionStats {
  totalAttempts: number;
  correctAttempts: number;
  averageTime: number;
  bestTime: number;
  worstTime: number;
  accuracy: number;
  improvementRate: number;
  algorithmsLearned: number;
}

enum DrillMode {
  RECOGNITION = 'recognition',
  EXECUTION = 'execution',
  TIME_ATTACK = 'time_attack',
  ENDURANCE = 'endurance'
}

export const AlgorithmTrainer: React.FC<AlgorithmTrainerProps> = ({
  algorithms,
  onExit
}) => {
  // Drill state
  const [currentMode, setCurrentMode] = useState<DrillMode | null>(null);
  const [currentSession, setCurrentSession] = useState<DrillSession | null>(null);
  const [currentAlgorithmIndex, setCurrentAlgorithmIndex] = useState(0);
  const [sessionActive, setSessionActive] = useState(false);
  
  // UI state
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [drillSettings, setDrillSettings] = useState<DrillSettings>({
    timeLimit: 30,
    maxAttempts: 50,
    shuffleAlgorithms: true,
    autoAdvance: true,
    recognitionMode: true
  });

  // Timer state
  const [_timerState, setTimerState] = useState<TimerState>(TimerState.READY);
  const [sessionTimer, setSessionTimer] = useState(0);
  
  // Time Attack specific state
  const [timeAttackTimer, setTimeAttackTimer] = useState(0);
  const [timeAttackActive, setTimeAttackActive] = useState(false);
  const [timeAttackStartTime, setTimeAttackStartTime] = useState<Date | null>(null);

  // Time Attack timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (timeAttackActive && timeAttackStartTime) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - timeAttackStartTime.getTime()) / 1000);
        const remaining = Math.max(0, (drillSettings.timeLimit || 60) - elapsed);
        setTimeAttackTimer(remaining);
        
        if (remaining === 0) {
          // Time's up!
          setTimeAttackActive(false);
          setSessionActive(false);
          setShowStats(true);
          if (currentSession) {
            const completedSession = {
              ...currentSession,
              endTime: new Date()
            };
            setCurrentSession(completedSession);
          }
        }
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timeAttackActive, timeAttackStartTime, drillSettings.timeLimit, currentSession]);

  // Get current algorithm
  const getCurrentAlgorithm = useCallback(() => {
    if (!currentSession || currentAlgorithmIndex >= currentSession.algorithms.length) {
      return null;
    }
    return currentSession.algorithms[currentAlgorithmIndex];
  }, [currentSession, currentAlgorithmIndex]);

  // Initialize drill session
  const startDrillSession = useCallback((mode: DrillMode) => {
    let sessionAlgorithms = [...algorithms];
    
    if (drillSettings.shuffleAlgorithms) {
      sessionAlgorithms = sessionAlgorithms.sort(() => Math.random() - 0.5);
    }
    
    const session: DrillSession = {
      id: `session-${Date.now()}`,
      mode,
      algorithms: sessionAlgorithms,
      attempts: [],
      startTime: new Date(),
      settings: { ...drillSettings },
      stats: {
        totalAttempts: 0,
        correctAttempts: 0,
        averageTime: 0,
        bestTime: Infinity,
        worstTime: 0,
        accuracy: 0,
        improvementRate: 0,
        algorithmsLearned: 0
      }
    };
    
    setCurrentSession(session);
    setCurrentAlgorithmIndex(0);
    setSessionActive(true);
    setUserInput('');
    setFeedback(null);
    setIsCorrect(null);
    setCurrentMode(mode);
    
    // Initialize Time Attack mode
    if (mode === DrillMode.TIME_ATTACK) {
      const now = new Date();
      setTimeAttackStartTime(now);
      setTimeAttackTimer(drillSettings.timeLimit || 60);
      setTimeAttackActive(true);
    } else {
      setTimeAttackActive(false);
      setTimeAttackStartTime(null);
      setTimeAttackTimer(0);
    }
  }, [algorithms, drillSettings]);

  // Handle recognition attempt
  const handleRecognitionAttempt = useCallback(() => {
    const algorithm = getCurrentAlgorithm();
    if (!algorithm || !currentSession) return;

    const normalizedInput = userInput.trim().toUpperCase().replace(/\s+/g, ' ');
    const normalizedAlgorithm = algorithm.notationString.trim().toUpperCase().replace(/\s+/g, ' ');
    const correct = normalizedInput === normalizedAlgorithm;

    const attempt: DrillAttempt = {
      id: `attempt-${Date.now()}`,
      algorithm,
      timeMs: sessionTimer * 1000,
      correct,
      userInput,
      timestamp: new Date()
    };

    setIsCorrect(correct);
    
    if (correct) {
      setFeedback('Correct! Well done!');
    } else {
      setFeedback(`Incorrect. The correct algorithm is: ${algorithm.notationString}`);
    }

    // Update session
    const updatedSession = {
      ...currentSession,
      attempts: [...currentSession.attempts, attempt],
      stats: calculateSessionStats([...currentSession.attempts, attempt])
    };
    
    setCurrentSession(updatedSession);

    // Auto advance if enabled
    if (drillSettings.autoAdvance) {
      setTimeout(() => {
        advanceToNextAlgorithm();
      }, 2000);
    }
  }, [userInput, getCurrentAlgorithm, currentSession, sessionTimer, drillSettings.autoAdvance]);

  // Handle execution timing
  const handleExecutionComplete = useCallback((time: number, _inspectionTime: number) => {
    const algorithm = getCurrentAlgorithm();
    if (!algorithm || !currentSession) return;

    const attempt: DrillAttempt = {
      id: `attempt-${Date.now()}`,
      algorithm,
      timeMs: time,
      correct: true, // Assume execution is correct for now
      timestamp: new Date()
    };

    setIsCorrect(true);
    setFeedback(`Completed in ${formatTime(time)}!`);

    // Update session
    const updatedSession = {
      ...currentSession,
      attempts: [...currentSession.attempts, attempt],
      stats: calculateSessionStats([...currentSession.attempts, attempt])
    };
    
    setCurrentSession(updatedSession);

    // Auto advance
    setTimeout(() => {
      advanceToNextAlgorithm();
    }, 1500);
  }, [getCurrentAlgorithm, currentSession]);

  // Calculate session statistics
  const calculateSessionStats = useCallback((attempts: DrillAttempt[]): SessionStats => {
    const correctAttempts = attempts.filter(a => a.correct);
    const times = correctAttempts.map(a => a.timeMs);
    const totalTime = times.reduce((sum, time) => sum + time, 0);
    
    return {
      totalAttempts: attempts.length,
      correctAttempts: correctAttempts.length,
      averageTime: correctAttempts.length > 0 ? totalTime / correctAttempts.length : 0,
      bestTime: times.length > 0 ? Math.min(...times) : 0,
      worstTime: times.length > 0 ? Math.max(...times) : 0,
      accuracy: attempts.length > 0 ? (correctAttempts.length / attempts.length) * 100 : 0,
      improvementRate: 0, // Would need historical data
      algorithmsLearned: new Set(correctAttempts.map(a => a.algorithm.id)).size
    };
  }, []);

  // Advance to next algorithm
  const advanceToNextAlgorithm = useCallback(() => {
    if (!currentSession) return;

    if (currentAlgorithmIndex >= currentSession.algorithms.length - 1) {
      // Session completed
      setSessionActive(false);
      setShowStats(true);
      const completedSession = {
        ...currentSession,
        endTime: new Date()
      };
      setCurrentSession(completedSession);
    } else {
      setCurrentAlgorithmIndex(currentAlgorithmIndex + 1);
      setUserInput('');
      setFeedback(null);
      setIsCorrect(null);
      setSessionTimer(0);
    }
  }, [currentSession, currentAlgorithmIndex]);

  // Go back to mode selection
  const goBackToModeSelection = useCallback(() => {
    setSessionActive(false);
    setCurrentSession(null);
    setCurrentMode(null);
    setCurrentAlgorithmIndex(0);
    setUserInput('');
    setFeedback(null);
    setIsCorrect(null);
    setShowStats(false);
    setSessionTimer(0);
    setTimeAttackActive(false);
    setTimeAttackStartTime(null);
    setTimeAttackTimer(0);
  }, []);

  // Drill mode selector
  const renderModeSelector = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {Object.values(DrillMode).map((mode) => {
        const modeConfig = {
          [DrillMode.RECOGNITION]: { 
            icon: Brain, 
            label: 'Recognition', 
            color: 'blue',
            description: 'Practice identifying algorithms from scramble patterns. Input the correct algorithm sequence.'
          },
          [DrillMode.EXECUTION]: { 
            icon: Zap, 
            label: 'Execution', 
            color: 'green',
            description: 'Focus on executing algorithms quickly and smoothly. Time your performance.'
          },

          [DrillMode.TIME_ATTACK]: { 
            icon: Clock, 
            label: 'Time Attack', 
            color: 'red',
            description: 'Race against a countdown timer! Answer as many algorithms correctly as possible before time runs out.'
          },
          [DrillMode.ENDURANCE]: { 
            icon: Trophy, 
            label: 'Endurance', 
            color: 'orange',
            description: 'Extended practice session to build consistency and muscle memory over time.'
          }
        };

        const config = modeConfig[mode];
        const Icon = config.icon;

        return (
          <button
            key={mode}
            onClick={() => startDrillSession(mode)}
            disabled={sessionActive}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              currentMode === mode
                ? 'border-primary-500 bg-adaptive-tertiary'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div className="flex items-start space-x-3">
              <Icon className={`w-6 h-6 mt-1 flex-shrink-0 ${
                currentMode === mode ? 'text-primary-600' : 'text-adaptive-secondary'
              }`} />
              <div className="flex-1 min-w-0">
                <div className={`font-medium mb-1 ${
                  currentMode === mode ? 'text-primary-800' : 'text-adaptive-primary'
                }`}>
                  {config.label}
                </div>
                <div className={`text-xs leading-relaxed ${
                  currentMode === mode ? 'text-primary-700' : 'text-adaptive-secondary'
                }`}>
                  {config.description}
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );

  // Settings panel
  const renderSettings = () => (
    <div className="bg-gray-50 rounded-lg p-4 mb-6">
      <h3 className="font-medium text-adaptive-primary mb-3">Drill Settings</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={drillSettings.shuffleAlgorithms}
            onChange={(e) => setDrillSettings(prev => ({ ...prev, shuffleAlgorithms: e.target.checked }))}
            disabled={sessionActive}
            className="rounded"
          />
          <span className="text-sm">Shuffle algorithms</span>
        </label>
        

        
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={drillSettings.autoAdvance}
            onChange={(e) => setDrillSettings(prev => ({ ...prev, autoAdvance: e.target.checked }))}
            disabled={sessionActive}
            className="rounded"
          />
          <span className="text-sm">Auto advance</span>
        </label>
      </div>
    </div>
  );

  // Recognition drill UI
  const renderRecognitionDrill = () => {
    const algorithm = getCurrentAlgorithm();
    if (!algorithm) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={goBackToModeSelection}
            className="flex items-center space-x-2 text-adaptive-secondary hover:text-adaptive-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Modes</span>
          </button>
          <div className="text-center flex-1">
            <h3 className="text-xl font-semibold mb-2">Algorithm Recognition Drill</h3>
            <p className="text-adaptive-secondary">
              Algorithm {currentAlgorithmIndex + 1} of {currentSession?.algorithms.length}
            </p>
          </div>
          <div className="w-24"></div> {/* Spacer for balance */}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-center mb-6">
            <h4 className="font-medium text-adaptive-primary mb-2">{algorithm.name}</h4>
            <p className="text-sm text-adaptive-secondary">{algorithm.algorithmSet}</p>
            {algorithm.caseDescription && (
              <p className="text-adaptive-secondary text-sm mt-2">{algorithm.caseDescription}</p>
            )}
          </div>



          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-adaptive-primary mb-2">
                Enter the algorithm:
              </label>
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleRecognitionAttempt()}
                className={cn('form-input font-mono',
                  isCorrect === true ? 'border-success bg-success' :
                  isCorrect === false ? 'border-error bg-error' :
                  ''
                )}
                placeholder="e.g., R U R' U'"
                disabled={isCorrect !== null}
              />
            </div>

            {feedback && (
              <div className={cn('p-3 rounded-md',
                isCorrect 
                  ? cn(getAdaptiveClasses.backgroundSemantic.success, 'text-on-primary')
                  : cn(getAdaptiveClasses.backgroundSemantic.error, 'text-on-primary')
              )}>
                {feedback}
              </div>
            )}

            <div className="flex justify-between">
              <button
                onClick={() => advanceToNextAlgorithm()}
                className="text-adaptive-secondary hover:text-adaptive-primary text-sm"
              >
                Skip Algorithm
              </button>
              <button
                onClick={handleRecognitionAttempt}
                disabled={!userInput.trim() || isCorrect !== null}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-on-primary px-4 py-2 rounded-md"
              >
                Check Answer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Execution drill UI
  const renderExecutionDrill = () => {
    const algorithm = getCurrentAlgorithm();
    if (!algorithm) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={goBackToModeSelection}
            className="flex items-center space-x-2 text-adaptive-secondary hover:text-adaptive-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Modes</span>
          </button>
          <div className="text-center flex-1">
            <h3 className="text-xl font-semibold mb-2">Algorithm Execution Drill</h3>
            <p className="text-adaptive-secondary">
              Algorithm {currentAlgorithmIndex + 1} of {currentSession?.algorithms.length}
            </p>
          </div>
          <div className="w-24"></div> {/* Spacer for balance */}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <h4 className="font-medium text-adaptive-primary mb-2">{algorithm.name}</h4>
          <p className="font-mono text-lg text-adaptive-primary mb-4">{algorithm.notationString}</p>
          {algorithm.caseDescription && (
            <p className="text-adaptive-secondary text-sm">{algorithm.caseDescription}</p>
          )}
        </div>

        <div className="flex justify-center">
          <Timer
            inspectionTime={15}
            onSolveComplete={handleExecutionComplete}
            onTimerStateChange={setTimerState}
            mode={TimerMode.NO_INSPECTION}
            className="w-full max-w-md"
          />
        </div>
      </div>
    );
  };

  // Time Attack drill UI
  const renderTimeAttackDrill = () => {
    const algorithm = getCurrentAlgorithm();
    if (!algorithm) return null;

    const formatTimer = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={goBackToModeSelection}
            className="flex items-center space-x-2 text-adaptive-secondary hover:text-adaptive-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Modes</span>
          </button>
          <div className="text-center flex-1">
            <h3 className="text-xl font-semibold mb-2">Time Attack Mode</h3>
            <p className="text-adaptive-secondary">
              Algorithm {currentAlgorithmIndex + 1} of {currentSession?.algorithms.length}
            </p>
          </div>
          <div className="w-24"></div> {/* Spacer for balance */}
        </div>

        {/* Timer Display */}
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
          <div className="text-center">
            <Clock className="w-12 h-12 mx-auto mb-3 text-red-600" />
            <div className={`text-4xl font-bold mb-2 ${
              timeAttackTimer <= 10 ? 'text-red-600 animate-pulse' : 'text-red-500'
            }`}>
              {formatTimer(timeAttackTimer)}
            </div>
            <p className="text-red-700 text-sm">Time Remaining</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-center mb-6">
            <h4 className="font-medium text-adaptive-primary mb-2">{algorithm.name}</h4>
            <p className="text-sm text-adaptive-secondary">{algorithm.algorithmSet}</p>
            {algorithm.caseDescription && (
              <p className="text-adaptive-secondary text-sm mt-2">{algorithm.caseDescription}</p>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-adaptive-primary mb-2">
                Enter the algorithm quickly:
              </label>
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleRecognitionAttempt()}
                className={cn('form-input font-mono',
                  isCorrect === true ? 'border-success bg-success' :
                  isCorrect === false ? 'border-error bg-error' :
                  ''
                )}
                placeholder="e.g., R U R' U'"
                disabled={isCorrect !== null || !timeAttackActive}
                autoFocus
              />
            </div>

            {feedback && (
              <div className={cn('p-3 rounded-md',
                isCorrect 
                  ? cn(getAdaptiveClasses.backgroundSemantic.success, 'text-on-primary')
                  : cn(getAdaptiveClasses.backgroundSemantic.error, 'text-on-primary')
              )}>
                {feedback}
              </div>
            )}

            <div className="flex justify-between">
              <button
                onClick={() => advanceToNextAlgorithm()}
                className="text-adaptive-secondary hover:text-adaptive-primary text-sm"
                disabled={!timeAttackActive}
              >
                Skip Algorithm
              </button>
              <button
                onClick={handleRecognitionAttempt}
                disabled={!userInput.trim() || isCorrect !== null || !timeAttackActive}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-on-primary px-4 py-2 rounded-md"
              >
                Submit Answer
              </button>
            </div>
          </div>
        </div>

        {/* Score Display */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-center">
            <h5 className="font-medium text-adaptive-primary mb-2">Current Score</h5>
            <div className="flex justify-center space-x-6">
              <div>
                <div className="text-2xl font-bold text-green-600">{currentSession?.stats.correctAttempts || 0}</div>
                <div className="text-xs text-adaptive-secondary">Correct</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-adaptive-primary">{currentSession?.stats.totalAttempts || 0}</div>
                <div className="text-xs text-adaptive-secondary">Total</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {currentSession?.stats.totalAttempts ? Math.round(currentSession.stats.accuracy) : 0}%
                </div>
                <div className="text-xs text-adaptive-secondary">Accuracy</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Session statistics
  const renderSessionStats = () => {
    if (!currentSession) return null;

    const { stats } = currentSession;

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-adaptive-primary">Session Statistics</h3>
          <BarChart3 className="w-6 h-6 text-adaptive-tertiary" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className={cn('text-3xl font-bold', getAdaptiveClasses.semantic.info)}>{stats.totalAttempts}</div>
            <div className="text-sm text-adaptive-secondary">Total Attempts</div>
          </div>
          <div className="text-center">
            <div className={cn('text-3xl font-bold', getAdaptiveClasses.semantic.success)}>{stats.accuracy.toFixed(1)}%</div>
            <div className="text-sm text-adaptive-secondary">Accuracy</div>
          </div>
          <div className="text-center">
            <div className={cn('text-3xl font-bold', getAdaptiveClasses.text.secondary)}>
              {stats.averageTime > 0 ? formatTime(stats.averageTime) : '--'}
            </div>
            <div className="text-sm text-adaptive-secondary">Average Time</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">
              {stats.bestTime < Infinity ? formatTime(stats.bestTime) : '--'}
            </div>
            <div className="text-sm text-adaptive-secondary">Best Time</div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setShowStats(false)}
              className="px-4 py-2 text-adaptive-secondary hover:text-adaptive-primary border border-gray-300 rounded-lg"
            >
              Continue Training
            </button>
            <button
              onClick={() => currentMode && startDrillSession(currentMode)}
              disabled={!currentMode}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-on-primary rounded-lg"
            >
              Start New Session
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onExit}
              className="flex items-center space-x-2 text-adaptive-secondary hover:text-adaptive-primary transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Algorithms</span>
            </button>
            <div className="h-6 w-px bg-gray-300" />
            <div>
              <h1 className="text-xl font-semibold text-adaptive-primary">Algorithm Trainer</h1>
              <p className="text-sm text-adaptive-secondary">{algorithms.length} algorithms loaded</p>
            </div>
          </div>
          
          {(sessionActive || currentSession) && (
            <button
              onClick={() => setShowStats(!showStats)}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-on-primary px-4 py-2 rounded-lg transition-colors"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Stats</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {showStats && renderSessionStats()}
        
        {!sessionActive && !showStats && (
          <>
            {renderSettings()}
            {renderModeSelector()}
            
            <div className="text-center py-8">
              <Target className="w-12 h-12 text-adaptive-tertiary mx-auto mb-3" />
              <h2 className="text-lg font-semibold text-adaptive-primary mb-2">Choose Your Training Mode</h2>
              <p className="text-adaptive-secondary text-sm">
                Each mode offers a different type of practice to improve your algorithm skills
              </p>
            </div>
          </>
        )}
        
        {sessionActive && !showStats && (
          <>
            {currentMode === DrillMode.RECOGNITION && renderRecognitionDrill()}
            {currentMode === DrillMode.EXECUTION && renderExecutionDrill()}
            {currentMode === DrillMode.TIME_ATTACK && renderTimeAttackDrill()}
            {currentMode === DrillMode.ENDURANCE && renderRecognitionDrill()}
          </>
        )}
      </div>
    </div>
  );
};

export default AlgorithmTrainer;
