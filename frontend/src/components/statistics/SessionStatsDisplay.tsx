import React, { useState, useEffect } from 'react';
import { Clock, Target, TrendingUp, BarChart3, List, Activity, ChevronDown, ChevronUp } from 'lucide-react';
import { SessionDto, SessionStats } from '../../services/sessionService';
import { SolveService, SolveDto, formatTime, formatTimeWithPenalty, PenaltyType } from '../../services/solveService';
import { PuzzleType } from '../../services/scrambleService';

interface SessionStatsDisplayProps {
  session: SessionDto | null;
  isLoading: boolean;
  error: string | null;
  optimisticSolveCount?: number | null;
  puzzleType?: PuzzleType;
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
  puzzleType = PuzzleType.CUBE_3X3
}) => {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [recentSolves, setRecentSolves] = useState<SolveDto[]>([]);
  const [showRecentSolves, setShowRecentSolves] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingRecentSolves, setLoadingRecentSolves] = useState(false);

  // Fetch statistics
  useEffect(() => {
    const fetchStats = async () => {
      if (!session) return;
      
      setLoadingStats(true);
      try {
        const stats = await SolveService.getStatistics(puzzleType);
        setStatistics(stats);
      } catch (error) {
        console.error('Failed to fetch statistics:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [session, puzzleType]);

  // Fetch recent solves when expanding
  useEffect(() => {
    const fetchRecentSolves = async () => {
      if (!showRecentSolves || !session) return;
      
      setLoadingRecentSolves(true);
      try {
        const solves = await SolveService.getRecentSolves(10);
        setRecentSolves(solves);
      } catch (error) {
        console.error('Failed to fetch recent solves:', error);
      } finally {
        setLoadingRecentSolves(false);
      }
    };

    fetchRecentSolves();
  }, [showRecentSolves, session]);

  // Calculate session stats for display with optimistic updates
  const sessionStats = session ? {
    ...SessionStats.calculateStats(session),
    solveCount: optimisticSolveCount !== null ? optimisticSolveCount : (session.solveCount || 0)
  } : null;

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Loading session...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center py-8">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!sessionStats) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center py-8">
          <p className="text-sm text-gray-500">No session data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Current Session</h2>
        <div className="flex items-center gap-2">
          {session && (
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${
              session.isActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {session.isActive ? 'Active' : 'Ended'}
            </span>
          )}
        </div>
      </div>

      {/* Session Basic Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-center mb-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{sessionStats.solveCount}</p>
          <p className="text-sm text-gray-600">Solves</p>
        </div>
        
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="flex items-center justify-center mb-2">
            <Activity className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{sessionStats.averageTime}s</p>
          <p className="text-sm text-gray-600">Average</p>
        </div>
        
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="flex items-center justify-center mb-2">
            <Target className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-600">{sessionStats.bestTime}s</p>
          <p className="text-sm text-gray-600">Best</p>
        </div>
        
        <div className="text-center p-4 bg-yellow-50 rounded-lg">
          <div className="flex items-center justify-center mb-2">
            <Clock className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{sessionStats.duration}</p>
          <p className="text-sm text-gray-600">Duration</p>
        </div>
      </div>

      {/* Rolling Averages */}
      {statistics && (
        <div className="border-t border-gray-200 pt-6 mb-6">
          <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Rolling Averages
          </h3>
          
          {loadingStats ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-lg font-bold text-gray-900">
                  {statistics.currentAo5 ? formatTime(statistics.currentAo5) : '--'}
                </p>
                <p className="text-sm text-gray-600">Ao5</p>
              </div>
              
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-lg font-bold text-gray-900">
                  {statistics.currentAo12 ? formatTime(statistics.currentAo12) : '--'}
                </p>
                <p className="text-sm text-gray-600">Ao12</p>
              </div>
              
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-lg font-bold text-gray-900">
                  {statistics.currentAo100 ? formatTime(statistics.currentAo100) : '--'}
                </p>
                <p className="text-sm text-gray-600">Ao100</p>
              </div>
            </div>
          )}
          
          {statistics.personalBest && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Personal Best: <span className="font-semibold text-green-600">{formatTime(statistics.personalBest)}</span>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Recent Solves Toggle */}
      <div className="border-t border-gray-200 pt-6">
        <button
          onClick={() => setShowRecentSolves(!showRecentSolves)}
          className="w-full flex items-center justify-between text-md font-medium text-gray-900 hover:text-gray-700 transition-colors"
        >
          <div className="flex items-center gap-2">
            <List className="w-4 h-4" />
            Recent Solves
          </div>
          {showRecentSolves ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {/* Recent Solves List */}
        {showRecentSolves && (
          <div className="mt-4">
            {loadingRecentSolves ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              </div>
            ) : recentSolves.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {recentSolves.map((solve, index) => (
                  <div
                    key={solve.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500 font-mono w-6 text-right">
                        {index + 1}.
                      </span>
                      <span className={`font-mono font-semibold ${
                        solve.penalty === PenaltyType.DNF 
                          ? 'text-red-600' 
                          : solve.penalty === PenaltyType.PLUS_TWO 
                          ? 'text-orange-600' 
                          : 'text-gray-900'
                      }`}>
                        {formatTimeWithPenalty(solve)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(solve.solvedAt).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">No recent solves</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Session Info */}
      {session && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            Session: {session.name}
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionStatsDisplay;
