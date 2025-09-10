import React, { useRef, useEffect, useState } from 'react';
import { RubiksCubeEngine } from './RubiksCubeEngine';
import { cn, getAdaptiveClasses } from '../../utils/appearanceUtils';
import { Play, Pause, RotateCcw, Shuffle, SkipForward, SkipBack, Rotate3D, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, RotateCw } from 'lucide-react';

interface CubeVisualizerProps {
  algorithm?: string;
}

const CubeVisualizer: React.FC<CubeVisualizerProps> = ({ algorithm = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cubeEngineRef = useRef<RubiksCubeEngine | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [isStepMode, setIsStepMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize the cube engine
  useEffect(() => {
    if (!containerRef.current || cubeEngineRef.current) return;

    try {
      const cubeEngine = new RubiksCubeEngine(containerRef.current);
      cubeEngineRef.current = cubeEngine;
      setIsInitialized(true);
      setError(null);
    } catch (err) {
      console.error('Failed to initialize cube engine:', err);
      setError('Failed to initialize 3D cube. Please refresh the page.');
    }

    return () => {
      if (cubeEngineRef.current) {
        cubeEngineRef.current.dispose();
        cubeEngineRef.current = null;
      }
    };
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (cubeEngineRef.current && containerRef.current) {
        cubeEngineRef.current.handleResize(
          containerRef.current.clientWidth,
          containerRef.current.clientHeight
        );
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isInitialized]);

  // Update animation speed
  useEffect(() => {
    if (cubeEngineRef.current) {
      cubeEngineRef.current.setAnimationSpeed(animationSpeed);
    }
  }, [animationSpeed]);

  const executeAlgorithm = async () => {
    if (!cubeEngineRef.current || !algorithm.trim()) return;

    try {
      setIsPlaying(true);
      setIsPaused(false);
      const moves = cubeEngineRef.current.parseAlgorithm(algorithm);
      setTotalSteps(moves.length);
      setCurrentStep(0);
      
      if (isStepMode) {
        cubeEngineRef.current.setStepMode(true, moves);
      } else {
        await cubeEngineRef.current.executeAlgorithm(algorithm);
      }
    } catch (err) {
      console.error('Failed to execute algorithm:', err);
      setError('Failed to execute algorithm. Please check the notation.');
    } finally {
      if (!isStepMode) {
        setIsPlaying(false);
        setIsPaused(false);
      }
    }
  };

  const executeNextStep = () => {
    if (!cubeEngineRef.current || !isStepMode) return;

    const nextStep = cubeEngineRef.current.executeNextStep();
    if (nextStep) {
      setCurrentStep(prev => prev + 1);
    } else {
      setIsPlaying(false);
      setIsStepMode(false);
    }
  };

  const executePrevStep = () => {
    if (!cubeEngineRef.current || !isStepMode || currentStep <= 0) return;

    const prevStep = cubeEngineRef.current.executePrevStep();
    if (prevStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const resetCube = () => {
    if (cubeEngineRef.current) {
      // Force reset everything - no matter what state we're in
      cubeEngineRef.current.resetCube();
      
      // Reset all UI states and ensure we're ready for new animations
      setIsPlaying(false);
      setIsPaused(false);
      setIsStepMode(false);
      setCurrentStep(0);
      setTotalSteps(0);
      setError(null);
      
      // Small delay to ensure the engine state is fully reset
      setTimeout(() => {
        if (cubeEngineRef.current) {
          // Verify the engine is ready for new animations
          console.log('Visualizer completely reset and ready for new animations');
        }
      }, 100);
    }
  };

  const scrambleCube = () => {
    if (cubeEngineRef.current) {
      const scramble = cubeEngineRef.current.generateScramble();
      executeAlgorithmString(scramble);
    }
  };

  // Orientation control functions - using actual cube rotations
  const rotateLeft = async () => {
    if (!cubeEngineRef.current || isPlaying) return;
    
    try {
      setIsPlaying(true);
      await cubeEngineRef.current.rotateViewLeft();
    } catch (err) {
      console.error('Failed to rotate left:', err);
    } finally {
      setIsPlaying(false);
    }
  };

  const rotateRight = async () => {
    if (!cubeEngineRef.current || isPlaying) return;
    
    try {
      setIsPlaying(true);
      await cubeEngineRef.current.rotateViewRight();
    } catch (err) {
      console.error('Failed to rotate right:', err);
    } finally {
      setIsPlaying(false);
    }
  };

  const rotateUp = async () => {
    if (!cubeEngineRef.current || isPlaying) return;
    
    try {
      setIsPlaying(true);
      await cubeEngineRef.current.rotateViewUp();
    } catch (err) {
      console.error('Failed to rotate up:', err);
    } finally {
      setIsPlaying(false);
    }
  };

  const rotateDown = async () => {
    if (!cubeEngineRef.current || isPlaying) return;
    
    try {
      setIsPlaying(true);
      await cubeEngineRef.current.rotateViewDown();
    } catch (err) {
      console.error('Failed to rotate down:', err);
    } finally {
      setIsPlaying(false);
    }
  };

  const resetOrientation = async () => {
    if (!cubeEngineRef.current || isPlaying) return;
    
    try {
      setIsPlaying(true);
      await cubeEngineRef.current.resetOrientation();
    } catch (err) {
      console.error('Failed to reset orientation:', err);
    } finally {
      setIsPlaying(false);
    }
  };

  // Individual move execution functions
  const executeMove = async (move: string) => {
    if (!cubeEngineRef.current || isPlaying) return;
    
    try {
      setIsPlaying(true);
      await cubeEngineRef.current.executeAlgorithm(move);
    } catch (err) {
      console.error(`Failed to execute move ${move}:`, err);
    } finally {
      setIsPlaying(false);
    }
  };

  const executeAlgorithmString = async (alg: string) => {
    if (!cubeEngineRef.current) return;
    
    try {
      setIsPlaying(true);
      setIsPaused(false);
      await cubeEngineRef.current.executeAlgorithm(alg);
    } catch (err) {
      console.error('Failed to execute algorithm:', err);
    } finally {
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  const flipCubeUpsideDown = async () => {
    if (!cubeEngineRef.current || isPlaying) return;
    
    try {
      setIsPlaying(true);
      // Execute x2 rotation (180 degrees around x-axis, flipping cube upside down)
      await cubeEngineRef.current.executeAlgorithm('x2');
    } catch (err) {
      console.error('Failed to flip cube:', err);
    } finally {
      setIsPlaying(false);
    }
  };

  const pauseExecution = () => {
    if (cubeEngineRef.current) {
      if (isPaused) {
        // Currently paused, so resume
        cubeEngineRef.current.resumeExecution();
        setIsPaused(false);
        setIsPlaying(true);
      } else {
        // Currently playing, so pause
        cubeEngineRef.current.pauseExecution();
        setIsPaused(true);
        setIsPlaying(false);
      }
    }
  };

  const toggleStepMode = () => {
    setIsStepMode(!isStepMode);
    setCurrentStep(0);
    setTotalSteps(0);
  };

  if (error) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-center">
          <div className={cn('text-lg font-medium mb-2', getAdaptiveClasses.text.primary)}>
            {error}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* 3D Container */}
      <div 
        ref={containerRef}
        className="w-full h-64 lg:h-80 relative overflow-hidden rounded-t-lg"
      >
        {!isInitialized && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={cn('text-center', getAdaptiveClasses.text.primary)}>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <div>Loading 3D Cube...</div>
            </div>
          </div>
        )}
      </div>

      {/* Cube Controls - Moves & Rotations */}
        <div className={cn('p-4 rounded-lg border', getAdaptiveClasses.background.secondary, getAdaptiveClasses.border.primary)}>
          <div className="flex flex-col items-center space-y-4">
            <div className={cn('text-sm font-medium', getAdaptiveClasses.text.secondary)}>
              Cube Controls - Moves & Rotations
            </div>
            
            {/* Side by side layout */}
            <div className="flex flex-col lg:flex-row gap-6 items-center justify-center w-full">
              
              {/* Individual Move Buttons */}
              <div className="flex flex-col items-center space-y-3">
                <div className={cn('text-xs font-medium', getAdaptiveClasses.text.tertiary)}>
                  Individual Moves (Blue: Face Moves, Orange: Wide Moves)
                </div>
                <div className="flex flex-wrap items-center justify-center gap-1 max-w-md">
                  {/* Face Moves */}
                  {["U'", "U", "U2", "U2'", "D'", "D", "D2", "D2'", "R'", "R", "R2", "R2'", "L'", "L", "L2", "L2'", "F'", "F", "F2", "F2'", "B'", "B", "B2", "B2'"].map((move) => (
                    <button
                      key={move}
                      onClick={() => executeMove(move)}
                      disabled={!isInitialized || isPlaying}
                      className={cn(
                        'px-2 py-1 text-xs font-mono rounded transition-colors',
                        isInitialized && !isPlaying
                          ? 'bg-primary-600 text-white hover:bg-primary-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      )}
                      title={`${move} move`}
                    >
                      {move}
                    </button>
                  ))}
                  
                  {/* Separator */}
                  <div className={cn('w-px h-4 mx-1', getAdaptiveClasses.border.primary)}></div>
                  
                  {/* Wide Moves */}
                  {["u'", "u", "u2", "u2'", "d'", "d", "d2", "d2'", "r'", "r", "r2", "r2'", "l'", "l", "l2", "l2'", "f'", "f", "f2", "f2'", "b'", "b", "b2", "b2'"].map((move) => (
                    <button
                      key={move}
                      onClick={() => executeMove(move)}
                      disabled={!isInitialized || isPlaying}
                      className={cn(
                        'px-2 py-1 text-xs font-mono rounded transition-colors',
                        isInitialized && !isPlaying
                          ? 'bg-orange-600 text-white hover:bg-orange-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      )}
                      title={`${move} wide move (equivalent to ${move.toUpperCase()}w)`}
                    >
                      {move}
                    </button>
                  ))}
                  
                  {/* Separator */}
                  <div className={cn('w-px h-4 mx-1', getAdaptiveClasses.border.primary)}></div>
                  
                  {/* Middle Layer Moves */}
                  {["M'", "M", "M2", "M2'", "E'", "E", "E2", "E2'", "S'", "S", "S2", "S2'"].map((move) => (
                    <button
                      key={move}
                      onClick={() => executeMove(move)}
                      disabled={!isInitialized || isPlaying}
                      className={cn(
                        'px-2 py-1 text-xs font-mono rounded transition-colors',
                        isInitialized && !isPlaying
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      )}
                      title={`${move} move`}
                    >
                      {move}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vertical Separator for large screens */}
              <div className={cn('hidden lg:block w-px h-24', getAdaptiveClasses.border.primary)}></div>
              
              {/* Orientation Controls */}
              <div className="flex flex-col items-center space-y-3">
                <div className={cn('text-xs font-medium', getAdaptiveClasses.text.tertiary)}>
                  Cube Rotations (x, y)
                </div>
                
                {/* Cross-shaped orientation controls */}
                <div className="grid grid-cols-3 gap-2">
                  {/* Top row */}
                  <div></div>
                  <button
                    onClick={rotateUp}
                    disabled={!isInitialized || isPlaying}
                    className={cn(
                      'p-2 rounded-md transition-colors',
                      isInitialized && !isPlaying
                        ? cn('bg-blue-600 text-white hover:bg-blue-700')
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    )}
                    title="Rotate cube up (x move)"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <div></div>
                  
                  {/* Middle row */}
                  <button
                    onClick={rotateLeft}
                    disabled={!isInitialized || isPlaying}
                    className={cn(
                      'p-2 rounded-md transition-colors',
                      isInitialized && !isPlaying
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    )}
                    title="Rotate cube left (y' move)"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={resetOrientation}
                    disabled={!isInitialized || isPlaying}
                    className={cn(
                      'p-2 rounded-md transition-colors',
                      isInitialized && !isPlaying
                        ? 'bg-orange-600 text-white hover:bg-orange-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    )}
                    title="Reset orientation to default view"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={rotateRight}
                    disabled={!isInitialized || isPlaying}
                    className={cn(
                      'p-2 rounded-md transition-colors',
                      isInitialized && !isPlaying
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    )}
                    title="Rotate cube right (y move)"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  
                  {/* Bottom row */}
                  <div></div>
                  <button
                    onClick={rotateDown}
                    disabled={!isInitialized || isPlaying}
                    className={cn(
                      'p-2 rounded-md transition-colors',
                      isInitialized && !isPlaying
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    )}
                    title="Rotate cube down (x' move)"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <div></div>
                </div>
              </div>
            </div>
            
            <div className={cn('text-xs text-center', getAdaptiveClasses.text.tertiary)}>
              Click moves to execute instantly • Use rotations to change viewing angle
            </div>
          </div>
        </div>

      {/* Control Bar */}
      <div className={cn(
        'px-4 py-3 border-t flex items-center justify-between',
        getAdaptiveClasses.background.secondary,
        getAdaptiveClasses.border.primary
      )}>
        <div className="flex items-center space-x-2">
          {/* Play/Pause Button */}
          <button
            onClick={isPlaying || isPaused ? pauseExecution : executeAlgorithm}
            disabled={!algorithm.trim() || !isInitialized}
            className={cn(
              'p-2 rounded-md transition-colors',
              algorithm.trim() && isInitialized
                ? isPaused 
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            )}
            title={isPaused ? 'Resume execution' : isPlaying ? 'Pause execution' : 'Start execution'}
          >
            {isPaused ? <Play className="w-4 h-4" /> : isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          {/* Step Mode Button */}
          <button
            onClick={toggleStepMode}
            className={cn(
              'p-2 rounded-md transition-colors',
              isStepMode
                ? 'bg-orange-600 text-white hover:bg-orange-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            )}
          >
            <SkipForward className="w-4 h-4" />
          </button>

          {/* Previous Step Button (only in step mode) */}
          {isStepMode && (
            <button
              onClick={executePrevStep}
              disabled={currentStep <= 0}
              className={cn(
                'p-2 rounded-md transition-colors',
                currentStep > 0
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              )}
              title="Previous Step"
            >
              <SkipBack className="w-4 h-4" />
            </button>
          )}

          {/* Next Step Button (only in step mode) */}
          {isStepMode && (
            <button
              onClick={executeNextStep}
              disabled={currentStep >= totalSteps}
              className={cn(
                'p-2 rounded-md transition-colors',
                currentStep < totalSteps
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              )}
              title="Next Step"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          )}

          {/* Step Counter */}
          {isStepMode && totalSteps > 0 && (
            <span className={cn('text-sm', getAdaptiveClasses.text.secondary)}>
              {currentStep} / {totalSteps}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Speed Control */}
          <label className={cn('text-sm', getAdaptiveClasses.text.secondary)}>
            Speed:
          </label>
          <input
            type="range"
            min="0.5"
            max="10"
            step="0.1"
            value={animationSpeed}
            onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
            className="w-20"
          />
          <span className={cn('text-sm w-8', getAdaptiveClasses.text.secondary)}>
            {animationSpeed.toFixed(1)}x
          </span>

          {/* Reset Button - Always works */}
          <button
            onClick={resetCube}
            disabled={!isInitialized}
            className={cn(
              'p-2 rounded-md transition-colors font-semibold',
              isInitialized
                ? 'bg-red-600 text-white hover:bg-red-700 shadow-md'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            )}
            title="Force reset cube to solved state (works in any situation)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Flip Upside Down Button */}
          <button
            onClick={flipCubeUpsideDown}
            disabled={!isInitialized || isPlaying}
            className={cn(
              'p-2 rounded-md transition-colors',
              isInitialized && !isPlaying
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            )}
            title="Flip cube upside down (x2)"
          >
            <Rotate3D className="w-4 h-4" />
          </button>

          {/* Scramble Button */}
          <button
            onClick={scrambleCube}
            disabled={!isInitialized || isPlaying}
            className={cn(
              'p-2 rounded-md transition-colors',
              isInitialized && !isPlaying
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            )}
            title="Generate random scramble"
          >
            <Shuffle className="w-4 h-4" />
          </button>
        </div>
      </div>


      {/* Instructions */}
      <div className={cn(
        'px-4 py-2 text-xs',
        getAdaptiveClasses.background.tertiary,
        getAdaptiveClasses.text.secondary
      )}>
        <strong>Controls:</strong> Click and drag to rotate • Scroll to zoom • Enter algorithm above and click play • Purple button flips cube upside down
      </div>
    </div>
  );
};

export default CubeVisualizer;
