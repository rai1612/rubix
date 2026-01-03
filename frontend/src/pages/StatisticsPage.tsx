import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Target, Clock, Activity, AlertTriangle } from 'lucide-react';
import { SolveService, SolveStatistics, TimeDistribution, formatTime } from '../services/solveService';
import { PuzzleType } from '../services/scrambleService';
import { TimeProgressionChart } from '../components/statistics/TimeProgressionChart';
import { SolveDistributionChart } from '../components/statistics/SolveDistributionChart';
import { PerformanceTrendsChart } from '../components/statistics/PerformanceTrendsChart';
import { GettingStartedGuide } from '../components/statistics/GettingStartedGuide';
import { SessionSelector } from '../components/statistics/SessionSelector';
import { AuthService } from '../services/authService';
import { cn, getAdaptiveClasses } from '../utils/appearanceUtils';

const StatisticsPage: React.FC = () => {
  const [selectedPuzzleType, setSelectedPuzzleType] = useState<PuzzleType>(PuzzleType.CUBE_3X3);
  const [statistics, setStatistics] = useState<SolveStatistics | null>(null);
  const [timeDistribution, setTimeDistribution] = useState<TimeDistribution | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasSolves, setHasSolves] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  // Check authentication status
  useEffect(() => {
    setIsLoggedIn(AuthService.isAuthenticated());
  }, []);

  // Fetch statistics
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      // Check if user is logged in
      if (!AuthService.isAuthenticated()) {
        setIsLoggedIn(false);
        setHasSolves(false);
        setIsLoading(false);
        return;
      }

      setIsLoggedIn(true);
      
      try {
        // Fetch data based on session selection
        const [statsData, distributionData] = await Promise.all([
          selectedSessionId 
            ? SolveService.getSessionStatistics(selectedSessionId)
            : SolveService.getStatistics(selectedPuzzleType),
          selectedSessionId
            ? SolveService.getSessionTimeDistribution(selectedSessionId)
            : SolveService.getTimeDistribution(selectedPuzzleType)
        ]);
        
        setStatistics(statsData);
        setTimeDistribution(distributionData);
        setHasSolves(statsData.totalSolves > 0);
      } catch (error: any) {
        console.error('Failed to fetch statistics:', error);
        
        // Handle different error types
        if (error.response?.status === 401) {
          setIsLoggedIn(false);
          setError('Please log in to view your statistics');
        } else if (error.response?.status === 404) {
          setHasSolves(false);
          setError('No solve data found. Complete some solves to see your statistics!');
        } else {
          setError('Failed to load statistics. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedPuzzleType, selectedSessionId]);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-sm text-adaptive-tertiary mt-4">Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12">
          <AlertTriangle className={cn('w-12 h-12 mx-auto mb-4', getAdaptiveClasses.semantic.error)} />
          <p className={cn('mb-4', getAdaptiveClasses.semantic.error)}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary-600 text-on-primary rounded-lg hover:bg-primary-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-adaptive-primary mb-2">Statistics</h1>
        <p className="text-adaptive-secondary">
          Track your progress and analyze your solving performance with interactive charts
        </p>
      </div>

      {/* Getting Started Guide (show when not logged in or no data) */}
      {(!isLoggedIn || !hasSolves) && (
        <GettingStartedGuide 
          isLoggedIn={isLoggedIn} 
          hasSolves={hasSolves} 
        />
      )}


      {/* Show main content only when user is logged in and has data */}
      {isLoggedIn && hasSolves && (
        <>
          {/* Session Selector */}
          <SessionSelector
            selectedSessionId={selectedSessionId}
            onSessionChange={setSelectedSessionId}
            puzzleType={selectedPuzzleType}
          />

          {/* Puzzle Type Selector */}
          <div className="flex justify-center">
        <div className="bg-adaptive-secondary rounded-lg border border-adaptive-primary p-1 inline-flex">
          <button
            onClick={() => setSelectedPuzzleType(PuzzleType.CUBE_2X2)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedPuzzleType === PuzzleType.CUBE_2X2
                ? 'bg-primary-600 text-on-primary'
                : 'text-adaptive-secondary hover:text-adaptive-primary'
            }`}
          >
            2x2
          </button>
          <button
            onClick={() => setSelectedPuzzleType(PuzzleType.CUBE_3X3)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedPuzzleType === PuzzleType.CUBE_3X3
                ? 'bg-primary-600 text-on-primary'
                : 'text-adaptive-secondary hover:text-adaptive-primary'
            }`}
          >
            3x3
          </button>
          <button
            onClick={() => setSelectedPuzzleType(PuzzleType.CUBE_4X4)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedPuzzleType === PuzzleType.CUBE_4X4
                ? 'bg-primary-600 text-on-primary'
                : 'text-adaptive-secondary hover:text-adaptive-primary'
            }`}
          >
            4x4
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-adaptive-secondary rounded-lg border border-adaptive-primary p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={cn('p-2 rounded-lg', getAdaptiveClasses.background.tertiary)}>
                <Target className={cn('w-6 h-6', getAdaptiveClasses.semantic.info)} />
              </div>
            </div>
            <h3 className="text-sm font-medium text-adaptive-secondary mb-1">Current Ao5</h3>
            <p className="text-2xl font-bold text-adaptive-primary">
              {statistics.currentAo5 ? formatTime(statistics.currentAo5) : '--'}
            </p>
          </div>

          <div className="bg-adaptive-secondary rounded-lg border border-adaptive-primary p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={cn('p-2 rounded-lg', getAdaptiveClasses.background.tertiary)}>
                <BarChart3 className={cn('w-6 h-6', getAdaptiveClasses.semantic.success)} />
              </div>
            </div>
            <h3 className="text-sm font-medium text-adaptive-secondary mb-1">Current Ao12</h3>
            <p className="text-2xl font-bold text-adaptive-primary">
              {statistics.currentAo12 ? formatTime(statistics.currentAo12) : '--'}
            </p>
          </div>

          <div className="bg-adaptive-secondary rounded-lg border border-adaptive-primary p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={cn('p-2 rounded-lg', getAdaptiveClasses.background.tertiary)}>
                <TrendingUp className={cn('w-6 h-6', getAdaptiveClasses.semantic.warning)} />
              </div>
            </div>
            <h3 className="text-sm font-medium text-adaptive-secondary mb-1">Personal Best</h3>
            <p className="text-2xl font-bold text-adaptive-primary">
              {statistics.personalBest ? formatTime(statistics.personalBest) : '--'}
            </p>
          </div>

          <div className="bg-adaptive-secondary rounded-lg border border-adaptive-primary p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={cn('p-2 rounded-lg', getAdaptiveClasses.background.tertiary)}>
                <Clock className={cn('w-6 h-6', getAdaptiveClasses.text.secondary)} />
              </div>
            </div>
            <h3 className="text-sm font-medium text-adaptive-secondary mb-1">Total Solves</h3>
            <p className="text-2xl font-bold text-adaptive-primary">{statistics.totalSolves}</p>
          </div>

          {statistics.currentAo100 && (
            <div className="bg-adaptive-secondary rounded-lg border border-adaptive-primary p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={cn('p-2 rounded-lg', getAdaptiveClasses.background.tertiary)}>
                  <Activity className={cn('w-6 h-6', getAdaptiveClasses.semantic.info)} />
                </div>
              </div>
              <h3 className="text-sm font-medium text-adaptive-secondary mb-1">Current Ao100</h3>
              <p className="text-2xl font-bold text-adaptive-primary">
                {formatTime(statistics.currentAo100)}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Interactive Charts */}
      <div className="space-y-6">
        {/* Advanced Performance Trends - Full Width */}
        <div className="bg-adaptive-secondary rounded-lg border border-adaptive-primary p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className={cn('w-5 h-5', getAdaptiveClasses.text.secondary)} />
            <h3 className="text-lg font-semibold text-adaptive-primary">Performance Trends</h3>
            <span className="text-xs text-adaptive-tertiary bg-adaptive-tertiary px-2 py-1 rounded-full">Advanced</span>
            {selectedSessionId && (
              <span className="text-xs text-info bg-info px-2 py-1 rounded-full">
                Session View
              </span>
            )}
          </div>
          <PerformanceTrendsChart 
            puzzleType={selectedPuzzleType} 
            sessionId={selectedSessionId}
          />
        </div>

        {/* Basic Charts - Full Width */}
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-adaptive-secondary rounded-lg border border-adaptive-primary p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className={cn('w-5 h-5', getAdaptiveClasses.semantic.info)} />
              <h3 className="text-lg font-semibold text-adaptive-primary">Time Progression</h3>
              {selectedSessionId && (
                <span className="text-xs text-info bg-info px-2 py-1 rounded-full">
                  Session View
                </span>
              )}
            </div>
            <TimeProgressionChart 
              puzzleType={selectedPuzzleType} 
              sessionId={selectedSessionId}
            />
          </div>

          <div className="bg-adaptive-secondary rounded-lg border border-adaptive-primary p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className={cn('w-5 h-5', getAdaptiveClasses.semantic.success)} />
              <h3 className="text-lg font-semibold text-adaptive-primary">Solve Distribution</h3>
              {selectedSessionId && (
                <span className="text-xs text-info bg-info px-2 py-1 rounded-full">
                  Session View
                </span>
              )}
            </div>
            <SolveDistributionChart 
              puzzleType={selectedPuzzleType} 
              sessionId={selectedSessionId}
            />
          </div>
        </div>
      </div>

      {/* Time Distribution */}
      {timeDistribution && (
        <div className="bg-adaptive-secondary rounded-lg border border-adaptive-primary p-6">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-lg font-semibold text-adaptive-primary">Time Distribution</h3>
            {selectedSessionId && (
              <span className="text-xs text-info bg-info px-2 py-1 rounded-full">
                Session View
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className={cn('text-center p-4 rounded-lg', getAdaptiveClasses.background.tertiary)}>
              <p className={cn('text-2xl font-bold', getAdaptiveClasses.semantic.success)}>{timeDistribution.sub10Count}</p>
              <p className={cn('text-sm', getAdaptiveClasses.text.secondary)}>Sub-10</p>
            </div>
            <div className={cn('text-center p-4 rounded-lg', getAdaptiveClasses.background.tertiary)}>
              <p className={cn('text-2xl font-bold', getAdaptiveClasses.semantic.success)}>{timeDistribution.sub15Count}</p>
              <p className={cn('text-sm', getAdaptiveClasses.text.secondary)}>Sub-15</p>
            </div>
            <div className={cn('text-center p-4 rounded-lg', getAdaptiveClasses.background.tertiary)}>
              <p className={cn('text-2xl font-bold', getAdaptiveClasses.semantic.info)}>{timeDistribution.sub20Count}</p>
              <p className={cn('text-sm', getAdaptiveClasses.text.secondary)}>Sub-20</p>
            </div>
            <div className={cn('text-center p-4 rounded-lg', getAdaptiveClasses.background.tertiary)}>
              <p className={cn('text-2xl font-bold', getAdaptiveClasses.semantic.warning)}>{timeDistribution.sub30Count}</p>
              <p className={cn('text-sm', getAdaptiveClasses.text.secondary)}>Sub-30</p>
            </div>
            <div className={cn('text-center p-4 rounded-lg', getAdaptiveClasses.background.tertiary)}>
              <p className={cn('text-2xl font-bold', getAdaptiveClasses.semantic.warning)}>{timeDistribution.sub60Count}</p>
              <p className={cn('text-sm', getAdaptiveClasses.text.secondary)}>Sub-60</p>
            </div>
            <div className={cn('text-center p-4 rounded-lg', getAdaptiveClasses.background.tertiary)}>
              <p className={cn('text-2xl font-bold', getAdaptiveClasses.semantic.error)}>{timeDistribution.plus60Count}</p>
              <p className={cn('text-sm', getAdaptiveClasses.text.secondary)}>60s+</p>
            </div>
          </div>
          
          {/* Penalty Statistics */}
          <div className="mt-6 pt-6 border-t border-adaptive-primary">
            <h4 className="text-md font-medium text-adaptive-primary mb-4">Penalty Statistics</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-adaptive-tertiary rounded-lg">
                <p className="text-2xl font-bold text-adaptive-primary">{timeDistribution.totalCount}</p>
                <p className="text-sm text-adaptive-secondary">Total Solves</p>
              </div>
              <div className={cn('text-center p-4 rounded-lg', getAdaptiveClasses.background.tertiary)}>
                <p className={cn('text-2xl font-bold', getAdaptiveClasses.semantic.warning)}>{timeDistribution.plusTwoCount}</p>
                <p className={cn('text-sm', getAdaptiveClasses.text.secondary)}>+2 Penalties</p>
              </div>
              <div className={cn('text-center p-4 rounded-lg', getAdaptiveClasses.background.tertiary)}>
                <p className={cn('text-2xl font-bold', getAdaptiveClasses.semantic.error)}>{timeDistribution.dnfCount}</p>
                <p className={cn('text-sm', getAdaptiveClasses.text.secondary)}>DNFs</p>
              </div>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};

export default StatisticsPage;
