import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, RotateCcw, Target, Timer, TrendingUp, ChevronRight, ChevronLeft } from 'lucide-react';
import { Algorithm } from '../../services/algorithmService';
import { Timer as TimerComponent } from '../timer/Timer';
import { TimerState, TimerMode, formatTime } from '../../utils/timerUtils';

import { ScrambleService, PuzzleType, ScrambleDto } from '../../services/scrambleService';
import { cn, getAdaptiveClasses, inputVariants, buttonVariants, cardVariants } from '../../utils/appearanceUtils';

interface AlgorithmPracticeModeProps {
  algorithm: Algorithm;
  onExit: () => void;
  onPracticeComplete?: (algorithm: Algorithm, practiceTime: number) => void;
}

interface PracticeSession {
  algorithm: Algorithm;
  attempts: PracticeAttempt[];
  startTime: Date;
  totalTime: number;
  averageTime: number;
  bestTime: number;
  successRate: number;
}

interface PracticeAttempt {
  id: string;
  time: number;
  success: boolean;
  scramble: string;
  timestamp: Date;
  penalty?: 'plus2' | 'dnf';
}

export const AlgorithmPracticeMode: React.FC<AlgorithmPracticeModeProps> = ({
  algorithm,
  onExit,
  onPracticeComplete: _onPracticeComplete
}) => {
  // Practice session state
  const [practiceSession, setPracticeSession] = useState<PracticeSession>({
    algorithm,
    attempts: [],
    startTime: new Date(),
    totalTime: 0,
    averageTime: 0,
    bestTime: 0,
    successRate: 0
  });

  // Current practice state
  const [currentScramble, setCurrentScramble] = useState<ScrambleDto | null>(null);
  const [practiceMode, setPracticeMode] = useState<'recognition' | 'execution' | 'full'>('recognition');
  const [currentStep, setCurrentStep] = useState(0);
  const [isShowingSolution, setIsShowingSolution] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Timer state for execution practice
  const [_timerState, setTimerState] = useState<TimerState>(TimerState.READY);
  const [_currentTime, _setCurrentTime] = useState(0);
  const [_practiceTimer, _setPracticeTimer] = useState<number | null>(null);

  // Practice statistics
  const [showStats, setShowStats] = useState(false);

  // Algorithm steps (split the notation into individual moves)
  const algorithmSteps = algorithm.notationString.split(' ').filter(step => step.trim());

  // Generate practice scramble based on algorithm trigger pattern
  const generatePracticeScramble = useCallback(async () => {
    try {
      // For now, generate a standard 3x3 scramble
      // TODO: In the future, we could generate scrambles that lead to the specific case
      const puzzleType = algorithm.algorithmSet.includes('2x2') ? PuzzleType.CUBE_2X2 :
                         algorithm.algorithmSet.includes('4x4') ? PuzzleType.CUBE_4X4 :
                         PuzzleType.CUBE_3X3;
      
      const scramble = await ScrambleService.generateScramble(puzzleType);
      setCurrentScramble(scramble);
    } catch (error) {
      console.error('Failed to generate practice scramble:', error);
      // Generate a simple scramble as fallback
      const fallbackScramble: ScrambleDto = {
        id: `practice-${Date.now()}`,
        scrambleText: "R U R' U' R U R' U'",
        puzzleType: PuzzleType.CUBE_3X3,
        algorithmMoves: 8,
        moveCount: 8,
        generatedAt: new Date().toISOString(),
        isCustom: true
      };
      setCurrentScramble(fallbackScramble);
    }
  }, [algorithm]);

  // Initialize practice session
  useEffect(() => {
    generatePracticeScramble();
  }, [generatePracticeScramble]);

  // Handle recognition practice
  const handleRecognitionSubmit = () => {
    const normalizedInput = userInput.trim().toUpperCase().replace(/\s+/g, ' ');
    const normalizedAlgorithm = algorithm.notationString.trim().toUpperCase().replace(/\s+/g, ' ');
    
    const correct = normalizedInput === normalizedAlgorithm;
    setIsCorrect(correct);
    
    if (correct) {
      setFeedback('Correct! Well done!');
      // Record successful attempt
      const attempt: PracticeAttempt = {
        id: `attempt-${Date.now()}`,
        time: 0,
        success: true,
        scramble: currentScramble?.scrambleText || '',
        timestamp: new Date()
      };
      
      setPracticeSession(prev => ({
        ...prev,
        attempts: [...prev.attempts, attempt]
      }));
      
      // Move to next after delay
      setTimeout(() => {
        setUserInput('');
        setIsCorrect(null);
        setFeedback(null);
        generatePracticeScramble();
      }, 1500);
    } else {
      setFeedback(`Incorrect. The correct algorithm is: ${algorithm.notationString}`);
    }
  };

  // Handle execution practice timing
  const handleExecutionComplete = (time: number, _inspectionTime: number) => {
    const attempt: PracticeAttempt = {
      id: `attempt-${Date.now()}`,
      time: time,
      success: true,
      scramble: currentScramble?.scrambleText || '',
      timestamp: new Date()
    };
    
    setPracticeSession(prev => {
      const newAttempts = [...prev.attempts, attempt];
      const successfulAttempts = newAttempts.filter(a => a.success);
      const totalTime = successfulAttempts.reduce((sum, a) => sum + a.time, 0);
      const averageTime = successfulAttempts.length > 0 ? totalTime / successfulAttempts.length : 0;
      const bestTime = successfulAttempts.length > 0 ? Math.min(...successfulAttempts.map(a => a.time)) : 0;
      const successRate = newAttempts.length > 0 ? (successfulAttempts.length / newAttempts.length) * 100 : 0;
      
      return {
        ...prev,
        attempts: newAttempts,
        totalTime,
        averageTime,
        bestTime,
        successRate
      };
    });
    
    // Generate new scramble for next attempt
    setTimeout(() => {
      generatePracticeScramble();
    }, 1000);
  };

  // Handle step-by-step execution
  const nextStep = () => {
    if (currentStep < algorithmSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Completed the algorithm
      setFeedback('Algorithm completed successfully!');
      setIsCorrect(true);
      setTimeout(() => {
        setCurrentStep(0);
        setFeedback(null);
        setIsCorrect(null);
        generatePracticeScramble();
      }, 2000);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const resetSteps = () => {
    setCurrentStep(0);
    setFeedback(null);
    setIsCorrect(null);
  };

  // Practice mode selector
  const renderModeSelector = () => (
    <div className="flex items-center justify-center space-x-4 mb-6">
      <button
        onClick={() => setPracticeMode('recognition')}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          practiceMode === 'recognition'
            ? 'bg-primary-600 text-on-primary'
            : 'bg-adaptive-tertiary text-adaptive-primary hover:bg-adaptive-secondary'
        }`}
      >
        <Target className="w-4 h-4 inline mr-2" />
        Recognition
      </button>
      <button
        onClick={() => setPracticeMode('execution')}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          practiceMode === 'execution'
            ? 'bg-green-600 text-on-primary'
            : 'bg-adaptive-tertiary text-adaptive-primary hover:bg-adaptive-secondary'
        }`}
      >
        <Timer className="w-4 h-4 inline mr-2" />
        Execution
      </button>
      <button
        onClick={() => setPracticeMode('full')}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          practiceMode === 'full'
            ? 'bg-primary-600 text-on-primary'
            : 'bg-adaptive-tertiary text-adaptive-primary hover:bg-adaptive-secondary'
        }`}
      >
        <TrendingUp className="w-4 h-4 inline mr-2" />
        Step-by-Step
      </button>
    </div>
  );

  // Recognition practice UI
  const renderRecognitionPractice = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Algorithm Recognition</h3>
        <p className="text-adaptive-secondary">
          Look at the case and type the correct algorithm
        </p>
      </div>

      <div className={cn(cardVariants.default, 'bg-adaptive-tertiary')}>
        <div className="mb-4">
          <h4 className="font-medium text-adaptive-primary mb-2">Case: {algorithm.name}</h4>
          {algorithm.caseDescription && (
            <p className="text-adaptive-secondary text-sm">{algorithm.caseDescription}</p>
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
              onKeyPress={(e) => e.key === 'Enter' && handleRecognitionSubmit()}
              className={cn(
                isCorrect === null ? inputVariants.default : 
                isCorrect === true ? cn(inputVariants.default, 'border-green-500 bg-green-50 text-green-900') :
                cn(inputVariants.default, 'border-red-500 bg-red-50 text-red-900'),
                'font-mono'
              )}
              placeholder="e.g., R U R' U'"
              disabled={isCorrect !== null}
            />
          </div>

          {feedback && (
            <div className={cn('p-3 rounded-md',
              isCorrect 
                ? 'bg-green-100 text-green-800 border border-green-200'
                : 'bg-red-100 text-red-800 border border-red-200'
            )}>
              {feedback}
            </div>
          )}

          <div className="flex justify-between">
            <button
              onClick={() => setIsShowingSolution(!isShowingSolution)}
              className={cn('text-sm hover:opacity-80', getAdaptiveClasses.semantic.info)}
            >
              {isShowingSolution ? 'Hide' : 'Show'} Solution
            </button>
            <button
              onClick={handleRecognitionSubmit}
              disabled={!userInput.trim() || isCorrect !== null}
              className={buttonVariants.primary}
            >
              Check Answer
            </button>
          </div>

          {isShowingSolution && (
            <div className={cn('p-3 rounded-md bg-blue-100 border border-blue-200')}>
              <p className={cn('font-mono text-blue-800')}>{algorithm.notationString}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Execution practice UI
  const renderExecutionPractice = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Algorithm Execution</h3>
        <p className="text-adaptive-secondary">
          Execute the algorithm as quickly and accurately as possible
        </p>
      </div>

      <div className={cn(cardVariants.default, 'bg-adaptive-tertiary text-center')}>
        <h4 className="font-medium text-adaptive-primary mb-2">{algorithm.name}</h4>
        <p className="font-mono text-lg text-adaptive-primary mb-4">{algorithm.notationString}</p>
        {algorithm.caseDescription && (
          <p className="text-adaptive-secondary text-sm">{algorithm.caseDescription}</p>
        )}
      </div>

      <div className="flex justify-center">
        <TimerComponent
          inspectionTime={15}
          onSolveComplete={handleExecutionComplete}
          onTimerStateChange={setTimerState}
          mode={TimerMode.NORMAL}
          className="w-full max-w-md"
        />
      </div>
    </div>
  );

  // Step-by-step practice UI
  const renderStepByStepPractice = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Step-by-Step Execution</h3>
        <p className="text-adaptive-secondary">
          Practice the algorithm one move at a time
        </p>
      </div>

      <div className={cn(cardVariants.default, 'bg-adaptive-tertiary')}>
        <h4 className="font-medium text-adaptive-primary mb-4">{algorithm.name}</h4>
        
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-adaptive-secondary">
              Step {currentStep + 1} of {algorithmSteps.length}
            </span>
            <span className="text-sm text-adaptive-secondary">
              Progress: {Math.round(((currentStep + 1) / algorithmSteps.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-adaptive-tertiary rounded-full h-2 border border-adaptive-primary">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / algorithmSteps.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="text-center mb-6">
          <div className={cn('inline-flex items-center space-x-2 bg-adaptive-secondary px-6 py-4 rounded-lg border-2 border-primary-500')}>
            <span className={cn('text-2xl font-mono font-bold text-primary-600')}>
              {algorithmSteps[currentStep]}
            </span>
          </div>
        </div>

        <div className="flex justify-center space-x-4 mb-4">
          <button
            onClick={previousStep}
            disabled={currentStep === 0}
            className={buttonVariants.secondary}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            <span>Previous</span>
          </button>
          
          <button
            onClick={nextStep}
            className={buttonVariants.primary}
          >
            <span>{currentStep === algorithmSteps.length - 1 ? 'Complete' : 'Next'}</span>
            <ChevronRight className="w-4 h-4 ml-2" />
          </button>
          
          <button
            onClick={resetSteps}
            className={buttonVariants.ghost}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>

        {feedback && (
          <div className={cn('p-3 rounded-md text-center',
            isCorrect 
              ? 'bg-green-100 text-green-800 border border-green-200'
              : 'bg-blue-100 text-blue-800 border border-blue-200'
          )}>
            {feedback}
          </div>
        )}
      </div>

      <div className={cn(cardVariants.default, 'bg-adaptive-secondary border-adaptive-primary')}>
        <h5 className="font-medium text-adaptive-primary mb-2">Full Algorithm:</h5>
        <div className="flex flex-wrap gap-2">
          {algorithmSteps.map((step, index) => (
            <span
              key={index}
              className={`px-3 py-1 rounded-md font-mono text-sm ${
                index <= currentStep
                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                  : 'bg-adaptive-tertiary text-adaptive-secondary border border-adaptive-primary'
              }`}
            >
              {step}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  // Practice statistics
  const renderStats = () => (
    <div className={cn(cardVariants.default, 'bg-adaptive-secondary border-adaptive-primary')}>
      <h4 className="font-medium text-adaptive-primary mb-4">Practice Statistics</h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{practiceSession.attempts.length}</div>
          <div className="text-sm text-adaptive-secondary">Attempts</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {practiceSession.successRate.toFixed(1)}%
          </div>
          <div className="text-sm text-adaptive-secondary">Success Rate</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-adaptive-primary">
            {practiceSession.averageTime > 0 ? formatTime(practiceSession.averageTime) : '--'}
          </div>
          <div className="text-sm text-adaptive-secondary">Average Time</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {practiceSession.bestTime > 0 ? formatTime(practiceSession.bestTime) : '--'}
          </div>
          <div className="text-sm text-adaptive-secondary">Best Time</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-adaptive-secondary">
      {/* Header */}
      <div className="bg-adaptive-secondary border-b border-adaptive-primary px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onExit}
              className="flex items-center space-x-2 text-adaptive-secondary hover:text-adaptive-primary transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Algorithms</span>
            </button>
            <div className="h-6 w-px bg-adaptive-primary" />
            <div>
              <h1 className="text-xl font-semibold text-adaptive-primary">Practice Mode</h1>
              <p className="text-sm text-adaptive-secondary">{algorithm.name} - {algorithm.algorithmSet}</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowStats(!showStats)}
            className={buttonVariants.primary}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Stats</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {showStats && renderStats()}
        
        {renderModeSelector()}
        
        {practiceMode === 'recognition' && renderRecognitionPractice()}
        {practiceMode === 'execution' && renderExecutionPractice()}
        {practiceMode === 'full' && renderStepByStepPractice()}
      </div>
    </div>
  );
};

export default AlgorithmPracticeMode;
