import React, { useRef, useEffect, useState } from 'react';
import { Eye, EyeOff, RotateCcw, Play, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, RotateCw } from 'lucide-react';
import { RubiksCubeEngine } from '../visualizer/RubiksCubeEngine';
import { Algorithm } from '../../services/algorithmService';
import { cn, getAdaptiveClasses } from '../../utils/appearanceUtils';

interface AlgorithmCaseVisualizerProps {
  algorithm: Algorithm;
  size?: 'small' | 'medium' | 'large';
  showControls?: boolean;
  autoSetupCase?: boolean;
  showOrientationControls?: boolean;
}

const AlgorithmCaseVisualizer: React.FC<AlgorithmCaseVisualizerProps> = ({
  algorithm,
  size = 'medium',
  showControls = true,
  autoSetupCase = true,
  showOrientationControls = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cubeEngineRef = useRef<RubiksCubeEngine | null>(null);
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCase, setShowCase] = useState(true);
  const [isSettingUpCase, setIsSettingUpCase] = useState(false);
  const [isExecutingAlgorithm, setIsExecutingAlgorithm] = useState(false);

  // Size configurations
  const sizeConfig = {
    small: { width: 150, height: 150 },
    medium: { width: 200, height: 200 },
    large: { width: 300, height: 300 }
  };

  // Initialize the cube engine
  useEffect(() => {
    if (!containerRef.current || cubeEngineRef.current) return;

    try {
      const cubeEngine = new RubiksCubeEngine(containerRef.current);
      cubeEngineRef.current = cubeEngine;
      setIsInitialized(true);
      setError(null);
    } catch (err) {
      console.error('Failed to initialize case visualizer:', err);
      setError('Failed to initialize cube visualization');
    }

    return () => {
      if (cubeEngineRef.current) {
        cubeEngineRef.current.dispose();
        cubeEngineRef.current = null;
      }
    };
  }, []);

  // Auto-setup the case when initialized
  useEffect(() => {
    if (isInitialized && autoSetupCase && showCase) {
      setupCase();
    }
  }, [isInitialized, autoSetupCase, showCase]);

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

  const setupCase = async () => {
    if (!cubeEngineRef.current || !algorithm.setupMoves) return;

    try {
      setIsSettingUpCase(true);
      setError(null);
      
      // Use the new setupCaseState method for better performance
      await cubeEngineRef.current.setupCaseState(algorithm.setupMoves);
      
    } catch (err) {
      console.error('Failed to setup case:', err);
      setError('Failed to setup case visualization');
    } finally {
      setIsSettingUpCase(false);
    }
  };

  const executeAlgorithm = async () => {
    if (!cubeEngineRef.current || !algorithm.notationString) return;

    try {
      setIsExecutingAlgorithm(true);
      setError(null);
      
      // Execute the algorithm from the current case state
      await cubeEngineRef.current.executeAlgorithm(algorithm.notationString);
      
    } catch (err) {
      console.error('Failed to execute algorithm:', err);
      setError('Failed to execute algorithm');
    } finally {
      setIsExecutingAlgorithm(false);
    }
  };

  const resetToCase = () => {
    if (cubeEngineRef.current) {
      setupCase();
    }
  };

  const toggleCaseVisibility = () => {
    setShowCase(!showCase);
    if (!showCase && cubeEngineRef.current) {
      // If showing case again, setup the case
      setTimeout(() => setupCase(), 100);
    } else if (showCase && cubeEngineRef.current) {
      // If hiding case, reset to solved state
      cubeEngineRef.current.resetCube();
    }
  };

  // Orientation control functions
  const rotateLeft = async () => {
    if (cubeEngineRef.current && !isSettingUpCase && !isExecutingAlgorithm) {
      try {
        await cubeEngineRef.current.rotateViewLeft();
      } catch (err) {
        console.error('Failed to rotate left:', err);
      }
    }
  };

  const rotateRight = async () => {
    if (cubeEngineRef.current && !isSettingUpCase && !isExecutingAlgorithm) {
      try {
        await cubeEngineRef.current.rotateViewRight();
      } catch (err) {
        console.error('Failed to rotate right:', err);
      }
    }
  };

  const rotateUp = async () => {
    if (cubeEngineRef.current && !isSettingUpCase && !isExecutingAlgorithm) {
      try {
        await cubeEngineRef.current.rotateViewUp();
      } catch (err) {
        console.error('Failed to rotate up:', err);
      }
    }
  };

  const rotateDown = async () => {
    if (cubeEngineRef.current && !isSettingUpCase && !isExecutingAlgorithm) {
      try {
        await cubeEngineRef.current.rotateViewDown();
      } catch (err) {
        console.error('Failed to rotate down:', err);
      }
    }
  };

  const resetOrientation = async () => {
    if (cubeEngineRef.current && !isSettingUpCase && !isExecutingAlgorithm) {
      try {
        await cubeEngineRef.current.resetOrientation();
        // No need to re-setup case - orientation reset maintains current state
      } catch (err) {
        console.error('Failed to reset orientation:', err);
      }
    }
  };

  if (error) {
    return (
      <div className={cn(
        'flex items-center justify-center rounded-lg border-2 border-dashed',
        getAdaptiveClasses.border.secondary,
        getAdaptiveClasses.text.tertiary
      )} style={{ width: sizeConfig[size].width, height: sizeConfig[size].height }}>
        <div className="text-center p-4">
          <p className="text-sm">Visualization Error</p>
          <p className="text-xs mt-1">{error}</p>
        </div>
      </div>
    );
  }

  // Don't show visualizer if no setup moves are available
  if (!algorithm.setupMoves) {
    return (
      <div className={cn(
        'flex items-center justify-center rounded-lg border-2 border-dashed',
        getAdaptiveClasses.border.secondary,
        getAdaptiveClasses.text.tertiary
      )} style={{ width: sizeConfig[size].width, height: sizeConfig[size].height }}>
        <div className="text-center p-4">
          <Eye className="w-6 h-6 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No Case Setup</p>
          <p className="text-xs mt-1">Setup moves not available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Cube Container */}
      <div className={cn(
        'relative rounded-lg border overflow-hidden',
        getAdaptiveClasses.background.secondary,
        getAdaptiveClasses.border.primary
      )} style={{ width: sizeConfig[size].width, height: sizeConfig[size].height }}>
        
        {/* Loading Overlay */}
        {(isSettingUpCase || isExecutingAlgorithm) && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
            <div className="text-white text-sm">
              {isSettingUpCase ? 'Setting up case...' : 'Executing algorithm...'}
            </div>
          </div>
        )}

        {/* Cube Visualization */}
        <div 
          ref={containerRef}
          className="w-full h-full"
          style={{ width: sizeConfig[size].width, height: sizeConfig[size].height }}
        />

        {/* Case Label */}
        <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
          {showCase ? 'Case State' : 'Solved State'}
        </div>
      </div>

      {/* Controls */}
      {showControls && (
        <div className="space-y-3">
          {/* Main Controls */}
          <div className="flex items-center justify-center space-x-2">
            <button
              onClick={toggleCaseVisibility}
              className={cn(
                'p-2 rounded-lg transition-colors',
                getAdaptiveClasses.text.secondary,
                'hover:bg-adaptive-tertiary'
              )}
              title={showCase ? 'Show solved state' : 'Show case state'}
            >
              {showCase ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            
            <button
              onClick={resetToCase}
              disabled={isSettingUpCase || !showCase}
              className={cn(
                'p-2 rounded-lg transition-colors',
                getAdaptiveClasses.text.secondary,
                'hover:bg-adaptive-tertiary',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
              title="Reset to case state"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            
            <button
              onClick={executeAlgorithm}
              disabled={isExecutingAlgorithm || !showCase}
              className={cn(
                'p-2 rounded-lg transition-colors',
                getAdaptiveClasses.semantic.success,
                'hover:bg-adaptive-tertiary',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
              title="Execute algorithm"
            >
              <Play className="w-4 h-4" />
            </button>
          </div>

          {/* Orientation Controls */}
          {showOrientationControls && size !== 'small' && (
            <div className="flex flex-col items-center space-y-2">
              <div className={cn('text-xs font-medium', getAdaptiveClasses.text.tertiary)}>
                Cube Rotations
              </div>
              
              {/* Cross-shaped orientation controls */}
              <div className="grid grid-cols-3 gap-1">
                {/* Top row */}
                <div></div>
                <button
                  onClick={rotateUp}
                  className={cn(
                    'p-1.5 rounded-md transition-colors',
                    getAdaptiveClasses.text.tertiary,
                    'hover:bg-adaptive-tertiary'
                  )}
                  title="Rotate cube up (x move)"
                >
                  <ChevronUp className="w-3 h-3" />
                </button>
                <div></div>
                
                {/* Middle row */}
                <button
                  onClick={rotateLeft}
                  className={cn(
                    'p-1.5 rounded-md transition-colors',
                    getAdaptiveClasses.text.tertiary,
                    'hover:bg-adaptive-tertiary'
                  )}
                  title="Rotate cube left (y' move)"
                >
                  <ChevronLeft className="w-3 h-3" />
                </button>
                <button
                  onClick={resetOrientation}
                  className={cn(
                    'p-1.5 rounded-md transition-colors',
                    getAdaptiveClasses.text.tertiary,
                    'hover:bg-adaptive-tertiary'
                  )}
                  title="Reset orientation to default view"
                >
                  <RotateCw className="w-3 h-3" />
                </button>
                <button
                  onClick={rotateRight}
                  className={cn(
                    'p-1.5 rounded-md transition-colors',
                    getAdaptiveClasses.text.tertiary,
                    'hover:bg-adaptive-tertiary'
                  )}
                  title="Rotate cube right (y move)"
                >
                  <ChevronRight className="w-3 h-3" />
                </button>
                
                {/* Bottom row */}
                <div></div>
                <button
                  onClick={rotateDown}
                  className={cn(
                    'p-1.5 rounded-md transition-colors',
                    getAdaptiveClasses.text.tertiary,
                    'hover:bg-adaptive-tertiary'
                  )}
                  title="Rotate cube down (x' move)"
                >
                  <ChevronDown className="w-3 h-3" />
                </button>
                <div></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Case Description */}
      {algorithm.caseDescription && size !== 'small' && (
        <div className="text-center">
          <p className={cn('text-xs', getAdaptiveClasses.text.secondary)}>
            {algorithm.caseDescription}
          </p>
        </div>
      )}
    </div>
  );
};

export default AlgorithmCaseVisualizer;
