import { useState, useEffect, useCallback } from 'react';
import { SolveService, SolveDto, PenaltyType, formatTime } from '../services/solveService';
import { AuthService } from '../services/authService';

export interface TodayStats {
  solveCount: number;
  averageTime: string;
  bestTime: string;
  averageTimeRaw?: number;
  bestTimeRaw?: number;
}

interface UseTodayStatsReturn {
  stats: TodayStats | null;
  isLoading: boolean;
  error: string | null;
  refreshStats: () => Promise<void>;
}

/**
 * Calculate today's statistics from today's solves
 */
const calculateTodayStats = (todaysSolves: SolveDto[]): TodayStats => {
  // Filter out DNF solves for calculations
  const validSolves = todaysSolves.filter(solve => solve.penalty !== PenaltyType.DNF);
  
  if (validSolves.length === 0) {
    return {
      solveCount: todaysSolves.length,
      averageTime: '--',
      bestTime: '--',
    };
  }

  // Calculate average time
  const totalTime = validSolves.reduce((sum, solve) => sum + solve.adjustedTimeMs, 0);
  const averageTimeMs = totalTime / validSolves.length;

  // Find best time
  const bestTimeMs = Math.min(...validSolves.map(solve => solve.adjustedTimeMs));

  return {
    solveCount: todaysSolves.length,
    averageTime: formatTime(averageTimeMs),
    bestTime: formatTime(bestTimeMs),
    averageTimeRaw: averageTimeMs,
    bestTimeRaw: bestTimeMs,
  };
};

/**
 * Hook to manage today's statistics
 */
export const useTodayStats = (): UseTodayStatsReturn => {
  const [stats, setStats] = useState<TodayStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTodayStats = useCallback(async () => {
    if (!AuthService.isAuthenticated()) {
      setStats(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch today's solves
      const todaysSolves = await SolveService.getTodaysSolves();
      
      // Calculate statistics
      const todayStats = calculateTodayStats(todaysSolves);
      setStats(todayStats);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load today\'s statistics';
      setError(message);
      console.error('Failed to load today\'s statistics:', err);
      
      // Set default stats on error
      setStats({
        solveCount: 0,
        averageTime: '--',
        bestTime: '--',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshStats = useCallback(async () => {
    await loadTodayStats();
  }, [loadTodayStats]);

  useEffect(() => {
    loadTodayStats();
  }, [loadTodayStats]);

  return {
    stats,
    isLoading,
    error,
    refreshStats,
  };
};

export default useTodayStats;
