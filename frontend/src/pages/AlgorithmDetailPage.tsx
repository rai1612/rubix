import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, Star, Copy, Play, Target, TrendingUp, 
  Eye, EyeOff, Hash, Clock, X, Trophy, RotateCcw,
  Share2, ChevronRight, BarChart3
} from 'lucide-react';
import { Algorithm, algorithmService } from '../services/algorithmService';
import AlgorithmCaseVisualizer from '../components/algorithms/AlgorithmCaseVisualizer';
import AlgorithmPracticeMode from '../components/algorithms/AlgorithmPracticeMode';
import AlgorithmTrainer from '../components/algorithms/AlgorithmTrainer';
import { cn, getAdaptiveClasses, buttonVariants, cardVariants } from '../utils/appearanceUtils';
import { useAlgorithmMutations } from '../hooks/useAlgorithms';

interface AlgorithmDetailPageProps {}

interface AlgorithmStats {
  totalPracticeTime: number;
  averageExecutionTime: number;
  bestTime: number;
  practiceStreak: number;
  lastPracticed: string;
  practiceDates: string[]; // Array of practice dates for streak calculation
}

const AlgorithmDetailPage: React.FC<AlgorithmDetailPageProps> = () => {
  const { algorithmId } = useParams<{ algorithmId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // State
  const [algorithm, setAlgorithm] = useState<Algorithm | null>(null);
  const [similarAlgorithms, setSimilarAlgorithms] = useState<Algorithm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'practice' | 'trainer' | 'stats'>('overview');
  const [showVisualizer, setShowVisualizer] = useState(true);
  const [algorithmStats, setAlgorithmStats] = useState<AlgorithmStats | null>(null);
  const [showQuickPractice, setShowQuickPractice] = useState(false);
  const [quickPracticeTimer, setQuickPracticeTimer] = useState(0);
  const [quickPracticeRunning, setQuickPracticeRunning] = useState(false);
  const [quickPracticeStartTime, setQuickPracticeStartTime] = useState<number | null>(null);
  const [quickPracticeResult, setQuickPracticeResult] = useState<{time: number, isPersonalBest: boolean} | null>(null);

  // Hooks
  const { toggleFavorite, practiceAlgorithm } = useAlgorithmMutations();

  // Quick practice timer effect (using requestAnimationFrame like normal timer)
  useEffect(() => {
    let animationFrame: number;
    
    const updateTimer = () => {
      if (quickPracticeRunning && quickPracticeStartTime) {
        setQuickPracticeTimer(performance.now() - quickPracticeStartTime);
        animationFrame = requestAnimationFrame(updateTimer);
      }
    };
    
    if (quickPracticeRunning && quickPracticeStartTime) {
      animationFrame = requestAnimationFrame(updateTimer);
    }
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [quickPracticeRunning, quickPracticeStartTime]);


  // Load algorithm data
  useEffect(() => {
    if (!algorithmId) {
      setError('No algorithm ID provided');
      setLoading(false);
      return;
    }

    const loadAlgorithm = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load algorithm details
        const algorithmData = await algorithmService.getAlgorithmById(algorithmId);
        setAlgorithm(algorithmData);
        
        // Load similar algorithms
        try {
          const similar = await algorithmService.getSimilarAlgorithms(algorithmId, 4);
          setSimilarAlgorithms(similar);
        } catch (err) {
          console.warn('Failed to load similar algorithms:', err);
          setSimilarAlgorithms([]);
        }

        // Initialize algorithm stats based on actual usage
        let stats = null;
        
        // Only create stats if the algorithm has been practiced AND we have timing data
        // Note: usageCount > 0 means it was practiced, but we need actual timing stats from backend
        if (algorithmData.usageCount > 0 && algorithmData.executionTimeSeconds && algorithmData.executionTimeSeconds > 0) {
          // Convert seconds to milliseconds for frontend consistency
          const bestTimeMs = algorithmData.executionTimeSeconds * 1000;
          const practiceDates: string[] = []; // This should come from backend API in the future
          
          stats = {
            totalPracticeTime: bestTimeMs * algorithmData.usageCount, // Rough estimate
            averageExecutionTime: bestTimeMs, // Currently same as best time
            bestTime: bestTimeMs, // Best time from backend
            practiceStreak: 0, // Will be calculated from practice dates
            lastPracticed: new Date().toISOString(), // Should come from backend
            practiceDates: practiceDates
          };
          
          stats.practiceStreak = calculatePracticeStreak(practiceDates);
        }
        // If usageCount > 0 but no executionTimeSeconds, stats remains null
        // This means the algorithm was practiced but we don't have detailed timing data
        
        setAlgorithmStats(stats);
        
      } catch (err) {
        console.error('Failed to load algorithm:', err);
        setError('Failed to load algorithm details');
      } finally {
        setLoading(false);
      }
    };

    loadAlgorithm();
  }, [algorithmId]);

  // Handlers
  const handleBack = () => {
    const currentSet = searchParams.get('set');
    if (currentSet) {
      // Navigate back to algorithms page with the set selected
      navigate(`/algorithms?set=${encodeURIComponent(currentSet)}`);
    } else {
      // Navigate back to main algorithms page
      navigate('/algorithms');
    }
  };

  const handleFavoriteToggle = useCallback(async () => {
    if (!algorithm) return;
    
    try {
      const updatedAlgorithm = await toggleFavorite(algorithm.id);
      setAlgorithm(updatedAlgorithm);
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  }, [algorithm, toggleFavorite]);

  const handlePractice = useCallback(() => {
    if (!algorithm) return;
    setShowQuickPractice(true);
    setQuickPracticeResult(null);
    setQuickPracticeTimer(0);
  }, [algorithm]);

  const startQuickPracticeTimer = useCallback(() => {
    const startTime = performance.now();
    setQuickPracticeStartTime(startTime);
    setQuickPracticeRunning(true);
    setQuickPracticeTimer(0);
  }, []);

  const stopQuickPracticeTimer = useCallback(async () => {
    if (!quickPracticeStartTime || !algorithm) return;
    
    const endTime = performance.now();
    const practiceTime = endTime - quickPracticeStartTime;
    
    setQuickPracticeRunning(false);
    
    // Check if this is a personal best
    const currentBest = algorithmStats?.bestTime || algorithm.executionTimeMs || Infinity;
    const isPersonalBest = practiceTime < currentBest;
    
    // Update algorithm stats
    const today = new Date().toISOString();
    const todayDateString = new Date().toDateString();
    
    if (algorithmStats) {
      // Update existing stats
      const updatedPracticeDates = [...algorithmStats.practiceDates];
      const hasToday = updatedPracticeDates.some(date => 
        new Date(date).toDateString() === todayDateString
      );
      
      if (!hasToday) {
        updatedPracticeDates.push(today);
      }
      
      const newStats = {
        ...algorithmStats,
        bestTime: isPersonalBest ? practiceTime : algorithmStats.bestTime,
        averageExecutionTime: (algorithmStats.averageExecutionTime + practiceTime) / 2,
        totalPracticeTime: algorithmStats.totalPracticeTime + practiceTime,
        lastPracticed: today,
        practiceDates: updatedPracticeDates,
        practiceStreak: calculatePracticeStreak(updatedPracticeDates)
      };
      
      setAlgorithmStats(newStats);
    } else {
      // Create new stats for first-time practice
      const newPracticeDates = [today];
      const newStats = {
        bestTime: practiceTime,
        averageExecutionTime: practiceTime,
        totalPracticeTime: practiceTime,
        lastPracticed: today,
        practiceDates: newPracticeDates,
        practiceStreak: calculatePracticeStreak(newPracticeDates)
      };
      
      setAlgorithmStats(newStats);
    }
    
    setQuickPracticeResult({ time: practiceTime, isPersonalBest });
    
    // Update backend with timing data
    try {
      const practiceData = {
        executionTimeMs: practiceTime,
        isPersonalBest: isPersonalBest,
        practiceDate: today
      };
      const updatedAlgorithm = await practiceAlgorithm(algorithm.id, practiceData);
      if (updatedAlgorithm) {
        setAlgorithm(updatedAlgorithm);
      }
    } catch (err) {
      console.error('Failed to update practice count:', err);
    }
  }, [quickPracticeStartTime, algorithm, algorithmStats, practiceAlgorithm]);

  const resetQuickPractice = useCallback(() => {
    setQuickPracticeRunning(false);
    setQuickPracticeStartTime(null);
    setQuickPracticeTimer(0);
    setQuickPracticeResult(null);
  }, []);

  const closeQuickPractice = useCallback(() => {
    setShowQuickPractice(false);
    resetQuickPractice();
  }, [resetQuickPractice]);

  // Keyboard shortcuts for quick practice
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (showQuickPractice) {
        if (event.key === 'Escape') {
          closeQuickPractice();
        } else if (event.key === ' ' || event.key === 'Enter') {
          event.preventDefault();
          if (!quickPracticeRunning && !quickPracticeResult) {
            startQuickPracticeTimer();
          } else if (quickPracticeRunning) {
            stopQuickPracticeTimer();
          } else if (quickPracticeResult) {
            resetQuickPractice();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showQuickPractice, quickPracticeRunning, quickPracticeResult, closeQuickPractice, startQuickPracticeTimer, stopQuickPracticeTimer, resetQuickPractice]);

  const handleCopyNotation = async () => {
    if (!algorithm) return;
    
    try {
      await navigator.clipboard.writeText(algorithm.notationString);
      // Could add a toast notification here
    } catch (err) {
      console.error('Failed to copy notation:', err);
    }
  };

  const handleShare = async () => {
    if (!algorithm) return;
    
    const shareData = {
      title: `${algorithm.name} - ${algorithm.algorithmSet}`,
      text: `Check out this ${algorithm.algorithmSet} algorithm: ${algorithm.notationString}`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
      }
    } catch (err) {
      console.error('Failed to share:', err);
    }
  };

  const handleStartPracticeMode = () => {
    setViewMode('practice');
  };

  const handleExitPracticeMode = () => {
    setViewMode('overview');
  };

  const handleStartTrainer = () => {
    setViewMode('trainer');
  };

  const handleExitTrainer = () => {
    setViewMode('overview');
  };

  const getDifficultyStars = (difficulty?: number) => {
    if (!difficulty) return [];
    return Array.from({ length: 5 }, (_, i) => i < difficulty);
  };

  const formatTime = (ms: number) => {
    if (ms < 0) return '--';
    
    const totalSeconds = ms / 1000;
    
    if (totalSeconds >= 60) {
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${minutes}:${seconds.toFixed(2).padStart(5, '0')}`;
    } else {
      return totalSeconds.toFixed(2);
    }
  };

  const calculatePracticeStreak = (practiceDates: string[]): number => {
    if (!practiceDates || practiceDates.length === 0) return 0;
    
    // Sort dates in descending order (most recent first)
    const sortedDates = practiceDates
      .map(date => new Date(date).toDateString())
      .filter((date, index, arr) => arr.indexOf(date) === index) // Remove duplicates
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    if (sortedDates.length === 0) return 0;
    
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
    
    // Check if the most recent practice was today or yesterday
    if (sortedDates[0] !== today && sortedDates[0] !== yesterday) {
      return 0; // Streak is broken
    }
    
    let streak = 0;
    let currentDate = new Date();
    
    // Count consecutive days
    for (const practiceDate of sortedDates) {
      const expectedDate = new Date(currentDate).toDateString();
      
      if (practiceDate === expectedDate) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1); // Move to previous day
      } else {
        break; // Streak is broken
      }
    }
    
    return streak;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-adaptive-secondary">
        <div className="max-w-6xl mx-auto p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-adaptive-tertiary rounded w-1/3"></div>
            <div className="h-64 bg-adaptive-tertiary rounded"></div>
            <div className="h-32 bg-adaptive-tertiary rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !algorithm) {
    return (
      <div className="min-h-screen bg-adaptive-secondary flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-adaptive-primary mb-4">Algorithm Not Found</h1>
          <p className="text-adaptive-secondary mb-6">{error || 'The requested algorithm could not be found.'}</p>
          <button onClick={handleBack} className={buttonVariants.primary}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {searchParams.get('set') ? `Back to ${searchParams.get('set')}` : 'Back to Algorithms'}
          </button>
        </div>
      </div>
    );
  }

  // Practice mode view
  if (viewMode === 'practice') {
    return (
      <AlgorithmPracticeMode
        algorithm={algorithm}
        onExit={handleExitPracticeMode}
        onPracticeComplete={(alg, time) => {
          console.log(`Practice completed for ${alg.name} in ${time}ms`);
          handleExitPracticeMode();
        }}
      />
    );
  }

  // Trainer mode view
  if (viewMode === 'trainer') {
    return (
      <AlgorithmTrainer
        algorithms={[algorithm]}
        onExit={handleExitTrainer}
      />
    );
  }

  return (
    <div className="min-h-screen bg-adaptive-secondary">
      {/* Header */}
      <div className="bg-adaptive-secondary border-b border-adaptive-primary px-6 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="flex items-center space-x-2 text-adaptive-secondary hover:text-adaptive-primary transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>{searchParams.get('set') ? `Back to ${searchParams.get('set')}` : 'Back to Algorithms'}</span>
            </button>
            <div className="h-6 w-px bg-adaptive-primary" />
            <div>
              <div className="flex items-center space-x-2">
                <span className={cn('text-sm font-medium', getAdaptiveClasses.text.secondary)}>
                  {algorithm.algorithmSet}
                  {algorithm.caseNumber && ` ${algorithm.caseNumber}`}
                </span>
                {algorithm.isFavorite && (
                  <Star className={cn('w-4 h-4 fill-current', getAdaptiveClasses.semantic.warning)} />
                )}
              </div>
              <h1 className="text-xl font-semibold text-adaptive-primary">{algorithm.name}</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* View Mode Tabs */}
            <div className="flex items-center space-x-1 bg-adaptive-tertiary rounded-lg p-1">
              <button
                onClick={() => setViewMode('overview')}
                className={cn('px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                  viewMode === 'overview'
                    ? 'bg-primary-600 text-on-primary'
                    : 'text-adaptive-secondary hover:text-adaptive-primary'
                )}
              >
                Overview
              </button>
              <button
                onClick={() => setViewMode('stats')}
                className={cn('px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                  viewMode === 'stats'
                    ? 'bg-primary-600 text-on-primary'
                    : 'text-adaptive-secondary hover:text-adaptive-primary'
                )}
              >
                <BarChart3 className="w-4 h-4 mr-1" />
                Stats
              </button>
            </div>
            
            {/* Action Buttons */}
            <button
              onClick={handleShare}
              className={cn('p-2 rounded-lg transition-colors', getAdaptiveClasses.text.tertiary, 'hover:bg-adaptive-tertiary')}
              title="Share algorithm"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleFavoriteToggle}
              className={cn('p-2 rounded-lg transition-colors',
                algorithm.isFavorite
                  ? cn(getAdaptiveClasses.semantic.warning, 'hover:bg-adaptive-tertiary')
                  : cn(getAdaptiveClasses.text.tertiary, 'hover:bg-adaptive-tertiary')
              )}
              title="Toggle favorite"
            >
              <Star className={`w-4 h-4 ${algorithm.isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6">
        {viewMode === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Algorithm Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Algorithm Card */}
              <div className={cn(cardVariants.default, 'bg-adaptive-secondary border-adaptive-primary')}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={cn('p-3 rounded-lg', getAdaptiveClasses.background.tertiary)}>
                      <Hash className={cn('w-6 h-6', getAdaptiveClasses.text.secondary)} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-adaptive-primary">{algorithm.name}</h2>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-adaptive-secondary">{algorithm.algorithmSet}</span>
                        {algorithm.caseNumber && (
                          <span className="text-adaptive-secondary">Case #{algorithm.caseNumber}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Algorithm Case Image */}
                {algorithm.imageUrl && (
                  <div className="mb-6">
                    <h3 className="font-medium text-adaptive-primary mb-2">Case Diagram</h3>
                    <div className="flex justify-center">
                      <img 
                        src={algorithm.imageUrl} 
                        alt={`${algorithm.name} case diagram`}
                        className="w-32 h-32 object-contain rounded-lg border border-adaptive-tertiary bg-adaptive-background p-2"
                        onError={(e) => {
                          // Hide the entire section if image fails to load
                          const section = (e.target as HTMLImageElement).closest('.mb-6');
                          if (section) {
                            (section as HTMLElement).style.display = 'none';
                          }
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Algorithm Notation */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-adaptive-primary">Algorithm</h3>
                    <button
                      onClick={handleCopyNotation}
                      className={cn('p-1.5 rounded-lg transition-colors', getAdaptiveClasses.text.tertiary, 'hover:bg-adaptive-tertiary')}
                      title="Copy notation"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <div className={cn('p-4 rounded-lg font-mono text-lg bg-adaptive-tertiary border', getAdaptiveClasses.border.primary)}>
                    {algorithm.notationString}
                  </div>
                </div>

                {/* Setup Moves */}
                {algorithm.setupMoves && (algorithm.algorithmSet === 'OLL' || algorithm.algorithmSet === 'PLL') && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-adaptive-primary">Setup Moves</h3>
                      <button
                        onClick={() => navigator.clipboard.writeText(algorithm.setupMoves || '')}
                        className={cn('p-1.5 rounded-lg transition-colors', getAdaptiveClasses.text.tertiary, 'hover:bg-adaptive-tertiary')}
                        title="Copy setup moves"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <div className={cn('p-4 rounded-lg font-mono text-lg bg-adaptive-tertiary border', getAdaptiveClasses.border.primary)}>
                      {algorithm.setupMoves}
                    </div>
                    <p className="text-xs text-adaptive-tertiary mt-2">
                      {algorithm.algorithmSet === 'OLL' 
                        ? 'Execute these moves from a solved last layer to create this OLL case'
                        : 'Execute these moves from an oriented last layer (OLL solved) to create this PLL case'
                      }
                    </p>
                  </div>
                )}

                {/* Description */}
                {algorithm.caseDescription && (
                  <div className="mb-6">
                    <h3 className="font-medium text-adaptive-primary mb-2">Description</h3>
                    <p className="text-adaptive-secondary">{algorithm.caseDescription}</p>
                  </div>
                )}

                {/* Metadata */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {/* Difficulty */}
                  {algorithm.difficulty && (
                    <div>
                      <div className="text-sm text-adaptive-tertiary mb-1">Difficulty</div>
                      <div className="flex items-center space-x-1">
                        <div className="flex items-center space-x-0.5">
                          {getDifficultyStars(algorithm.difficulty).map((filled, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                filled ? cn(getAdaptiveClasses.semantic.warning, 'fill-current') : getAdaptiveClasses.text.tertiary
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-adaptive-secondary">
                          {algorithmService.getDifficultyLabel(algorithm.difficulty)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Move Count */}
                  {algorithm.moveCount && (
                    <div>
                      <div className="text-sm text-adaptive-tertiary mb-1">Moves</div>
                      <div className="text-adaptive-primary font-medium">{algorithm.moveCount}</div>
                    </div>
                  )}

                  {/* Execution Time */}
                  {algorithm.executionTimeMs && (
                    <div>
                      <div className="text-sm text-adaptive-tertiary mb-1">Avg Time</div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-adaptive-tertiary" />
                        <span className="text-adaptive-primary font-medium">
                          {formatTime(algorithm.executionTimeMs)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Usage Count */}
                  <div>
                    <div className="text-sm text-adaptive-tertiary mb-1">Practiced</div>
                    <div className="text-adaptive-primary font-medium">{algorithm.usageCount}x</div>
                  </div>
                </div>

                {/* Tags */}
                {algorithm.tags && algorithm.tags.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-medium text-adaptive-primary mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {algorithm.tags.map((tag, index) => (
                        <span
                          key={index}
                          className={cn('px-3 py-1 text-sm rounded-full', getAdaptiveClasses.background.tertiary, getAdaptiveClasses.text.secondary)}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleStartPracticeMode}
                    className={buttonVariants.primary}
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Practice Mode
                  </button>
                  <button
                    onClick={handleStartTrainer}
                    className={buttonVariants.secondary}
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Quick Trainer
                  </button>
                  <button
                    onClick={handlePractice}
                    className={buttonVariants.ghost}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Quick Practice
                  </button>
                </div>
              </div>

              {/* Similar Algorithms */}
              {similarAlgorithms.length > 0 && (
                <div className={cn(cardVariants.default, 'bg-adaptive-secondary border-adaptive-primary')}>
                  <h3 className="font-medium text-adaptive-primary mb-4">Similar Algorithms</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {similarAlgorithms.map((similar) => (
                      <div
                        key={similar.id}
                        onClick={() => navigate(`/algorithms/${similar.id}`)}
                        className={cn(
                          'p-3 rounded-lg border cursor-pointer hover:shadow-sm transition-all',
                          getAdaptiveClasses.background.tertiary,
                          getAdaptiveClasses.border.primary
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-adaptive-primary">{similar.name}</span>
                          <ChevronRight className="w-4 h-4 text-adaptive-tertiary" />
                        </div>
                        <div className="text-sm text-adaptive-secondary font-mono">
                          {similar.notationString}
                        </div>
                        <div className="flex items-center justify-between mt-2 text-xs text-adaptive-tertiary">
                          <span>{similar.algorithmSet}</span>
                          {similar.moveCount && <span>{similar.moveCount} moves</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Visualizer */}
            <div className="space-y-6">
              {/* Case Visualizer */}
              <div className={cn(cardVariants.default, 'bg-adaptive-secondary border-adaptive-primary')}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-adaptive-primary">Case Visualization</h3>
                  <button
                    onClick={() => setShowVisualizer(!showVisualizer)}
                    className={cn('p-1.5 rounded-lg transition-colors', getAdaptiveClasses.text.tertiary, 'hover:bg-adaptive-tertiary')}
                    title={showVisualizer ? 'Hide visualizer' : 'Show visualizer'}
                  >
                    {showVisualizer ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                
                {showVisualizer && (
                  <div className="flex justify-center">
                    <AlgorithmCaseVisualizer
                      algorithm={algorithm}
                      size="large"
                      showControls={true}
                      autoSetupCase={true}
                      showOrientationControls={true}
                    />
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className={cn(cardVariants.default, 'bg-adaptive-secondary border-adaptive-primary')}>
                <h3 className="font-medium text-adaptive-primary mb-4">Quick Stats</h3>
                {algorithmStats ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-adaptive-secondary">Best Time</span>
                      <span className="font-medium text-adaptive-primary">
                        {formatTime(algorithmStats.bestTime)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-adaptive-secondary">Average Time</span>
                      <span className="font-medium text-adaptive-primary">
                        {formatTime(algorithmStats.averageExecutionTime)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-adaptive-secondary">Practice Streak</span>
                      <span className="font-medium text-adaptive-primary">
                        {algorithmStats.practiceStreak} days
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-adaptive-secondary">Total Practice</span>
                      <span className="font-medium text-adaptive-primary">
                        {formatTime(algorithmStats.totalPracticeTime)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="text-adaptive-tertiary mb-2">
                      <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    </div>
                    {algorithm.usageCount > 0 ? (
                      <>
                        <p className="text-sm text-adaptive-secondary">Practice data not available</p>
                        <p className="text-xs text-adaptive-tertiary mt-1">This algorithm has been practiced {algorithm.usageCount}x, but detailed timing data is not available from the server.</p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-adaptive-secondary">No practice data yet</p>
                        <p className="text-xs text-adaptive-tertiary mt-1">Start practicing to see your stats!</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {viewMode === 'stats' && (
          <div className="space-y-6">
            <div className={cn(cardVariants.default, 'bg-adaptive-secondary border-adaptive-primary')}>
              <h2 className="text-xl font-semibold text-adaptive-primary mb-6">Detailed Statistics</h2>
              
              {algorithmStats ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {algorithm.usageCount}
                    </div>
                    <div className="text-sm text-adaptive-secondary">Total Sessions</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {formatTime(algorithmStats.bestTime)}
                    </div>
                    <div className="text-sm text-adaptive-secondary">Best Time</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-600 mb-2">
                      {formatTime(algorithmStats.averageExecutionTime)}
                    </div>
                    <div className="text-sm text-adaptive-secondary">Average Time</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {algorithmStats.practiceStreak}
                    </div>
                    <div className="text-sm text-adaptive-secondary">Day Streak</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-adaptive-tertiary mb-4">
                    <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  </div>
                  {algorithm.usageCount > 0 ? (
                    <>
                      <h3 className="text-lg font-medium text-adaptive-primary mb-2">Detailed Statistics Not Available</h3>
                      <p className="text-adaptive-secondary mb-4">This algorithm has been practiced {algorithm.usageCount}x, but detailed timing statistics are not available from the server.</p>
                      <p className="text-sm text-adaptive-tertiary">Use the Quick Practice feature to generate new timing statistics!</p>
                    </>
                  ) : (
                    <>
                      <h3 className="text-lg font-medium text-adaptive-primary mb-2">No Statistics Available</h3>
                      <p className="text-adaptive-secondary mb-4">This algorithm hasn't been practiced yet.</p>
                      <p className="text-sm text-adaptive-tertiary">Use the Quick Practice feature to start building your statistics!</p>
                    </>
                  )}
                </div>
              )}
            </div>
            
            <div className={cn(cardVariants.default, 'bg-adaptive-secondary border-adaptive-primary')}>
              <h3 className="font-medium text-adaptive-primary mb-4">Practice History</h3>
              <div className="text-center py-8 text-adaptive-secondary">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Detailed practice history coming soon!</p>
                <p className="text-sm mt-2">Track your progress over time with charts and analytics.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Practice Modal */}
      {showQuickPractice && algorithm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={cn(cardVariants.default, 'bg-adaptive-secondary border-adaptive-primary max-w-md w-full mx-4')}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-adaptive-primary">Quick Practice</h3>
              <button
                onClick={closeQuickPractice}
                className={cn('p-2 rounded-lg transition-colors', getAdaptiveClasses.text.tertiary, 'hover:bg-adaptive-tertiary')}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Algorithm Info */}
            <div className="text-center mb-6">
              <h4 className="font-medium text-adaptive-primary mb-2">{algorithm.name}</h4>
              <div className={cn('p-3 rounded-lg font-mono text-lg bg-adaptive-tertiary border', getAdaptiveClasses.border.primary)}>
                {algorithm.notationString}
              </div>
            </div>

            {/* Timer Display */}
            <div className="text-center mb-6">
              <div className="text-4xl font-bold font-mono text-adaptive-primary mb-2">
                {formatTime(quickPracticeTimer)}
              </div>
              <div className="text-sm text-adaptive-secondary">
                {quickPracticeRunning ? 'Timing...' : quickPracticeResult ? 'Completed!' : 'Ready to start'}
              </div>
            </div>

            {/* Result Display */}
            {quickPracticeResult && (
              <div className={cn('mb-6 p-4 rounded-lg text-center',
                quickPracticeResult.isPersonalBest 
                  ? 'bg-green-100 border border-green-200'
                  : 'bg-blue-100 border border-blue-200'
              )}>
                {quickPracticeResult.isPersonalBest && (
                  <div className="flex items-center justify-center mb-2">
                    <Trophy className="w-5 h-5 text-green-600 mr-2" />
                    <span className="font-semibold text-green-800">Personal Best!</span>
                  </div>
                )}
                <div className={cn('text-2xl font-bold mb-1',
                  quickPracticeResult.isPersonalBest ? 'text-green-800' : 'text-blue-800'
                )}>
                  {formatTime(quickPracticeResult.time)}
                </div>
                <div className={cn('text-sm',
                  quickPracticeResult.isPersonalBest ? 'text-green-700' : 'text-blue-700'
                )}>
                  {quickPracticeResult.isPersonalBest ? 'New record!' : 'Good job!'}
                </div>
              </div>
            )}

            {/* Control Buttons */}
            <div className="flex gap-3">
              {!quickPracticeRunning && !quickPracticeResult && (
                <button
                  onClick={startQuickPracticeTimer}
                  className={cn(buttonVariants.primary, 'flex-1')}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Timer
                </button>
              )}

              {quickPracticeRunning && (
                <button
                  onClick={stopQuickPracticeTimer}
                  className={cn(buttonVariants.secondary, 'flex-1')}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Stop Timer
                </button>
              )}

              {quickPracticeResult && (
                <>
                  <button
                    onClick={resetQuickPractice}
                    className={buttonVariants.ghost}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Try Again
                  </button>
                  <button
                    onClick={closeQuickPractice}
                    className={cn(buttonVariants.primary, 'flex-1')}
                  >
                    Done
                  </button>
                </>
              )}
            </div>

            {/* Instructions */}
            {!quickPracticeRunning && !quickPracticeResult && (
              <div className="mt-4 p-3 bg-adaptive-tertiary rounded-lg">
                <p className="text-sm text-adaptive-secondary text-center mb-2">
                  Click "Start Timer" when you're ready to execute the algorithm. 
                  Click "Stop Timer" when you're done.
                </p>
                <p className="text-xs text-adaptive-tertiary text-center">
                  Keyboard: Space/Enter to start/stop, Escape to close
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AlgorithmDetailPage;
