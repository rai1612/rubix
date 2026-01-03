import React, { useState, useEffect } from 'react';
import { Clock, Target, TrendingUp, BarChart3, List, Activity, ChevronDown, ChevronUp } from 'lucide-react';
import { SessionDto, SessionStats } from '../../services/sessionService';
import { SolveService, SolveDto, formatTime } from '../../services/solveService';
import { PuzzleType } from '../../services/scrambleService';
import { SolveDetailItem } from '../solve/SolveDetailItem';
import { useSettings } from '../../hooks/useSettings';
import { cn, getAdaptiveClasses } from '../../utils/appearanceUtils';

interface SessionStatsDisplayProps {
  session: SessionDto | null;
  isLoading: boolean;
  error: string | null;
  optimisticSolveCount?: number | null;
  puzzleType?: PuzzleType;
  refreshTrigger?: number; // Add trigger to force statistics refresh
  onRetryScramble?: (scrambleText: string, puzzleType: PuzzleType, originalScrambleId?: string) => void; // Add retry callback
}

interface Statistics {
  currentAo5?: number;
  currentAo12?: number;
  currentAo100?: number;
  personalBest?: number;
  totalSolves: number;
}

export const SessionStatsDisplay: React.FC<SessionStatsDisplayProps> = ({
  session,
  isLoading,
  error,
  optimisticSolveCount,
  puzzleType = PuzzleType.CUBE_3X3,
  refreshTrigger,
  onRetryScramble
}) => {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [recentSolves, setRecentSolves] = useState<SolveDto[]>([]);
  const [showRecentSolves, setShowRecentSolves] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingRecentSolves, setLoadingRecentSolves] = useState(false);
  
  // Get display settings
  const { settings } = useSettings();
  const displaySettings = settings.display;

  // Fetch statistics (now session-specific)
  useEffect(() => {
    const fetchStats = async () => {
      if (!session || !session.id) {
        console.log('📊 No session available for statistics fetch');
        return;
      }
      
      setLoadingStats(true);
      try {
        console.log('📊 Fetching SESSION-SPECIFIC statistics for session:', session.id);
        console.log('📊 Session details:', { 
          id: session.id, 
          name: session.name, 
          isActive: session.isActive,
          solveCount: session.solveCount 
        });
        
        const stats = await SolveService.getSessionStatistics(session.id);
        console.log('📊 Session statistics received:', stats);
        setStatistics(stats);
      } catch (error) {
        console.error('❌ Failed to fetch session statistics:', error);
        console.error('❌ Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          sessionId: session.id,
          sessionName: session.name,
          errorType: error?.constructor?.name
        });
        
        // Check if it's a specific session ownership or validation error
        if (error instanceof Error && (
          error.message.includes('Session not found') ||
          error.message.includes('User does not own this session') ||
          error.message.includes('not owned by you')
        )) {
          console.error('🚨 Session ownership/validation error detected');
          setStatistics(null);
          return; // Don't fallback for ownership errors
        }
        
        // Fallback to global statistics if session-specific fails
        try {
          console.log('📊 Falling back to global statistics...');
          const globalStats = await SolveService.getStatistics(puzzleType);
          console.log('📊 Global statistics received as fallback:', globalStats);
          setStatistics(globalStats);
        } catch (fallbackError) {
          console.error('❌ Failed to fetch fallback statistics:', fallbackError);
          setStatistics(null);
        }
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [session, puzzleType, refreshTrigger]); // Add refreshTrigger to dependencies

  // Fetch recent solves when expanding (now session-specific)
  useEffect(() => {
    const fetchRecentSolves = async () => {
      if (!showRecentSolves || !session) return;
      
      setLoadingRecentSolves(true);
      try {
        console.log('📋 Fetching SESSION-SPECIFIC recent solves for session:', session.id);
        const solves = await SolveService.getSessionSolves(session.id);
        console.log('📋 Session solves received:', solves.length, 'solves');
        // Take only the most recent 10 for the "recent solves" section
        setRecentSolves(solves.slice(0, 10));
      } catch (error) {
        console.error('❌ Failed to fetch session solves:', error);
        // Fallback to global recent solves if session-specific fails
        try {
          console.log('📋 Falling back to global recent solves...');
          const globalSolves = await SolveService.getRecentSolves(10);
          setRecentSolves(globalSolves);
        } catch (fallbackError) {
          console.error('❌ Failed to fetch fallback recent solves:', fallbackError);
        }
      } finally {
        setLoadingRecentSolves(false);
      }
    };

    fetchRecentSolves();
  }, [showRecentSolves, session, refreshTrigger]); // Add refreshTrigger for recent solves too

  // Calculate session stats for display with optimistic updates
  const sessionStats = session ? {
    ...SessionStats.calculateStats(session),
    solveCount: optimisticSolveCount !== null ? optimisticSolveCount : (session.solveCount || 0)
  } : null;

  if (isLoading) {
    return (
      <div className="bg-adaptive-secondary rounded-lg border border-adaptive-primary p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-sm text-adaptive-tertiary mt-2">Loading session...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-adaptive-secondary rounded-lg border border-adaptive-primary p-6">
        <div className="text-center py-8">
          <p className="text-sm text-error">{error}</p>
        </div>
      </div>
    );
  }

  if (!sessionStats) {
    return (
      <div className="bg-adaptive-secondary rounded-lg border border-adaptive-primary p-6">
        <div className="text-center py-8">
          <p className="text-sm text-adaptive-tertiary">No session data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-adaptive-secondary rounded-lg border border-adaptive-primary p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-adaptive-primary">Current Session</h2>
        <div className="flex items-center gap-2">
          {session && (
            <span className={cn(
              'px-3 py-1 text-xs font-medium rounded-full',
              session.isActive 
                ? cn(getAdaptiveClasses.backgroundSemantic.success, 'text-on-primary')
                : cn(getAdaptiveClasses.background.tertiary, getAdaptiveClasses.text.secondary)
            )}>
              {session.isActive ? 'Active' : 'Ended'}
            </span>
          )}
        </div>
      </div>

      {/* Session Basic Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className={cn('text-center p-4 rounded-lg', getAdaptiveClasses.background.tertiary)}>
          <div className="flex items-center justify-center mb-2">
            <BarChart3 className={cn('w-5 h-5', getAdaptiveClasses.semantic.info)} />
          </div>
          <p className={cn('text-2xl font-bold', getAdaptiveClasses.text.primary)}>{sessionStats.solveCount}</p>
          <p className={cn('text-sm', getAdaptiveClasses.text.secondary)}>Solves</p>
        </div>
        
        <div className={cn('text-center p-4 rounded-lg', getAdaptiveClasses.background.tertiary)}>
          <div className="flex items-center justify-center mb-2">
            <Activity className={cn('w-5 h-5', getAdaptiveClasses.text.secondary)} />
          </div>
          <p className={cn('text-2xl font-bold', getAdaptiveClasses.text.primary)}>{sessionStats.averageTime}s</p>
          <p className={cn('text-sm', getAdaptiveClasses.text.secondary)}>Average</p>
        </div>
        
        <div className={cn('text-center p-4 rounded-lg', getAdaptiveClasses.background.tertiary)}>
          <div className="flex items-center justify-center mb-2">
            <Target className={cn('w-5 h-5', getAdaptiveClasses.semantic.success)} />
          </div>
          <p className={cn('text-2xl font-bold', getAdaptiveClasses.semantic.success)}>{sessionStats.bestTime}s</p>
          <p className={cn('text-sm', getAdaptiveClasses.text.secondary)}>Best</p>
        </div>
        
        <div className={cn('text-center p-4 rounded-lg', getAdaptiveClasses.background.tertiary)}>
          <div className="flex items-center justify-center mb-2">
            <Clock className={cn('w-5 h-5', getAdaptiveClasses.semantic.warning)} />
          </div>
          <p className={cn('text-2xl font-bold', getAdaptiveClasses.text.primary)}>{sessionStats.duration}</p>
          <p className={cn('text-sm', getAdaptiveClasses.text.secondary)}>Duration</p>
        </div>
      </div>

      {/* Rolling Averages */}
      {statistics && (
        <div className="border-t border-adaptive-primary pt-6 mb-6">
          <h3 className="text-md font-medium text-adaptive-primary mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Session Rolling Averages
            <span className="text-xs text-adaptive-tertiary font-normal ml-1">(Session-specific)</span>
          </h3>
          
          {loadingStats ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {displaySettings.showAo5 && (
                <div className="text-center p-3 bg-adaptive-tertiary rounded-lg">
                  <p className="text-lg font-bold text-adaptive-primary">
                    {statistics.currentAo5 ? formatTime(statistics.currentAo5) : '--'}
                  </p>
                  <p className="text-sm text-adaptive-secondary">Ao5</p>
                </div>
              )}
              
              {displaySettings.showAo12 && (
                <div className="text-center p-3 bg-adaptive-tertiary rounded-lg">
                  <p className="text-lg font-bold text-adaptive-primary">
                    {statistics.currentAo12 ? formatTime(statistics.currentAo12) : '--'}
                  </p>
                  <p className="text-sm text-adaptive-secondary">Ao12</p>
                </div>
              )}
              
              {displaySettings.showAo100 && (
                <div className="text-center p-3 bg-adaptive-tertiary rounded-lg">
                  <p className="text-lg font-bold text-adaptive-primary">
                    {statistics.currentAo100 ? formatTime(statistics.currentAo100) : '--'}
                  </p>
                  <p className="text-sm text-adaptive-secondary">Ao100</p>
                </div>
              )}
            </div>
          )}
          
          {displaySettings.showPersonalBest && statistics.personalBest && (
            <div className="mt-4 text-center">
              <p className="text-sm text-adaptive-secondary">
                Personal Best: <span className="font-semibold text-success">{formatTime(statistics.personalBest)}</span>
                <span className="text-xs text-adaptive-tertiary ml-1">(All-time)</span>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Recent Solves Toggle */}
      <div className="border-t border-adaptive-primary pt-6">
        <button
          onClick={() => setShowRecentSolves(!showRecentSolves)}
          className="w-full flex items-center justify-between text-md font-medium text-adaptive-primary hover:text-adaptive-secondary transition-colors"
        >
          <div className="flex items-center gap-2">
            <List className="w-4 h-4" />
            Recent Solves
            <span className="text-xs text-adaptive-tertiary font-normal ml-1">(Session-specific)</span>
          </div>
          {showRecentSolves ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {/* Recent Solves List */}
        {showRecentSolves && (
          <div className="mt-4">
            {loadingRecentSolves ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
              </div>
            ) : recentSolves.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {recentSolves.map((solve, index) => (
                  <SolveDetailItem
                    key={solve.id}
                    solve={solve}
                    index={index}
                    onRetryScramble={onRetryScramble}
                    allSolves={recentSolves}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-adaptive-tertiary">No recent solves</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Session Info */}
      {session && (
        <div className="mt-4 pt-4 border-t border-adaptive-primary">
          <div className="text-xs text-adaptive-tertiary text-center">
            Session: {session.name}
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionStatsDisplay;
