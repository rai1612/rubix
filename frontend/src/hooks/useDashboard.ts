import { useState, useEffect, useCallback } from 'react';
import { SolveService, formatTime } from '../services/solveService';
import { SessionService, SessionDto } from '../services/sessionService';
import { PuzzleType } from '../services/scrambleService';
import { AuthService } from '../services/authService';

export interface DashboardStats {
  totalSolves: number;
  currentAo5: string;
  personalBest: string;
  todaySolves: number;
  personalBestRaw?: number;
  currentAo5Raw?: number;
}

export interface RecentSession {
  id: string;
  name: string;
  solveCount: number;
  averageTime: string;
  bestTime: string;
  timeAgo: string;
  isActive: boolean;
}

export interface UseDashboardReturn {
  stats: DashboardStats | null;
  recentSessions: RecentSession[];
  todaySessions: RecentSession[];
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  refreshDashboard: () => Promise<void>;
}

export const useDashboard = (): UseDashboardReturn => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([]);
  const [todaySessions, setTodaySessions] = useState<RecentSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Helper function to calculate time ago
  const getTimeAgo = useCallback((dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    }
  }, []);

  // Helper function to format session data
  const formatSessionData = useCallback((sessions: SessionDto[]): RecentSession[] => {
    return sessions.map(session => ({
      id: session.id,
      name: session.name,
      solveCount: session.solveCount,
      averageTime: session.averageTimeMs ? formatTime(session.averageTimeMs) : '--',
      bestTime: session.bestTimeMs ? formatTime(session.bestTimeMs) : '--',
      timeAgo: session.startedAt ? getTimeAgo(session.startedAt) : '--',
      isActive: session.isActive
    }));
  }, [getTimeAgo]);

  // Check if today (for filtering today's sessions) - utility function
  // const isToday = useCallback((dateString: string): boolean => {
  //   const date = new Date(dateString);
  //   const today = new Date();
  //   return date.toDateString() === today.toDateString();
  // }, []);

  const loadDashboardData = useCallback(async () => {
    if (!AuthService.isAuthenticated()) {
      setIsAuthenticated(false);
      return;
    }

    setIsAuthenticated(true);
    setIsLoading(true);
    setError(null);

    try {
      // Fetch all data in parallel
      const [solveStats, todaySolves, recentSessionsData] = await Promise.all([
        SolveService.getStatistics(PuzzleType.CUBE_3X3),
        SolveService.getTodaysSolves(),
        SessionService.getUserSessions(10)
      ]);

      // Format solve statistics
      const dashboardStats: DashboardStats = {
        totalSolves: Number(solveStats.totalSolves) || 0,
        currentAo5: solveStats.currentAo5 ? formatTime(solveStats.currentAo5) : '--',
        personalBest: solveStats.personalBest ? formatTime(solveStats.personalBest) : '--',
        todaySolves: todaySolves.length,
        personalBestRaw: solveStats.personalBest,
        currentAo5Raw: solveStats.currentAo5 || undefined
      };

      setStats(dashboardStats);

      // Format recent sessions
      const formattedSessions = formatSessionData(recentSessionsData);
      setRecentSessions(formattedSessions);

      // Filter today's sessions
      const todaySessionsFiltered = formattedSessions.filter(session => 
        session.timeAgo.includes('hour') || session.timeAgo.includes('minute')
      );
      setTodaySessions(todaySessionsFiltered);

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load dashboard data';
      setError(message);
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [formatSessionData]);

  const refreshDashboard = useCallback(async () => {
    await loadDashboardData();
  }, [loadDashboardData]);

  // Load data on mount and when authentication state changes
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Check authentication state periodically
  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(AuthService.isAuthenticated());
    };

    // Check every minute
    const interval = setInterval(checkAuth, 60000);
    checkAuth(); // Initial check

    return () => clearInterval(interval);
  }, []);

  return {
    stats,
    recentSessions,
    todaySessions,
    isLoading,
    error,
    isAuthenticated,
    refreshDashboard
  };
};
