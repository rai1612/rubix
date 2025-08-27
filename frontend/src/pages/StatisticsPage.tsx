import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Target, Clock, Activity, AlertTriangle } from 'lucide-react';
import { SolveService, SolveStatistics, TimeDistribution, formatTime } from '../services/solveService';
import { PuzzleType } from '../services/scrambleService';

const StatisticsPage: React.FC = () => {
  const [selectedPuzzleType, setSelectedPuzzleType] = useState<PuzzleType>(PuzzleType.CUBE_3X3);
  const [statistics, setStatistics] = useState<SolveStatistics | null>(null);
  const [timeDistribution, setTimeDistribution] = useState<TimeDistribution | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch statistics
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const [statsData, distributionData] = await Promise.all([
          SolveService.getStatistics(selectedPuzzleType),
          SolveService.getTimeDistribution(selectedPuzzleType)
        ]);
        
        setStatistics(statsData);
        setTimeDistribution(distributionData);
      } catch (error) {
        console.error('Failed to fetch statistics:', error);
        setError('Failed to load statistics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedPuzzleType]);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-gray-500 mt-4">Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Statistics</h1>
        <p className="text-gray-600">
          Track your progress and analyze your solving performance
        </p>
      </div>

      {/* Puzzle Type Selector */}
      <div className="flex justify-center">
        <div className="bg-white rounded-lg border border-gray-200 p-1 inline-flex">
          <button
            onClick={() => setSelectedPuzzleType(PuzzleType.CUBE_2X2)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedPuzzleType === PuzzleType.CUBE_2X2
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            2x2
          </button>
          <button
            onClick={() => setSelectedPuzzleType(PuzzleType.CUBE_3X3)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedPuzzleType === PuzzleType.CUBE_3X3
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            3x3
          </button>
          <button
            onClick={() => setSelectedPuzzleType(PuzzleType.CUBE_4X4)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedPuzzleType === PuzzleType.CUBE_4X4
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            4x4
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Current Ao5</h3>
            <p className="text-2xl font-bold text-gray-900">
              {statistics.currentAo5 ? formatTime(statistics.currentAo5) : '--'}
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Current Ao12</h3>
            <p className="text-2xl font-bold text-gray-900">
              {statistics.currentAo12 ? formatTime(statistics.currentAo12) : '--'}
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Personal Best</h3>
            <p className="text-2xl font-bold text-gray-900">
              {statistics.personalBest ? formatTime(statistics.personalBest) : '--'}
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Total Solves</h3>
            <p className="text-2xl font-bold text-gray-900">{statistics.totalSolves}</p>
          </div>

          {statistics.currentAo100 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Activity className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">Current Ao100</h3>
              <p className="text-2xl font-bold text-gray-900">
                {formatTime(statistics.currentAo100)}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Time Progression</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Chart coming soon...</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Solve Distribution</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Chart coming soon...</p>
          </div>
        </div>
      </div>

      {/* Time Distribution */}
      {timeDistribution && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Time Distribution</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="text-center p-4 bg-emerald-50 rounded-lg">
              <p className="text-2xl font-bold text-emerald-600">{timeDistribution.sub10Count}</p>
              <p className="text-sm text-gray-600">Sub-10</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{timeDistribution.sub15Count}</p>
              <p className="text-sm text-gray-600">Sub-15</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{timeDistribution.sub20Count}</p>
              <p className="text-sm text-gray-600">Sub-20</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">{timeDistribution.sub30Count}</p>
              <p className="text-sm text-gray-600">Sub-30</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">{timeDistribution.sub60Count}</p>
              <p className="text-sm text-gray-600">Sub-60</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{timeDistribution.plus60Count}</p>
              <p className="text-sm text-gray-600">60s+</p>
            </div>
          </div>
          
          {/* Penalty Statistics */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-md font-medium text-gray-900 mb-4">Penalty Statistics</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{timeDistribution.totalCount}</p>
                <p className="text-sm text-gray-600">Total Solves</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">{timeDistribution.plusTwoCount}</p>
                <p className="text-sm text-gray-600">+2 Penalties</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-600">{timeDistribution.dnfCount}</p>
                <p className="text-sm text-gray-600">DNFs</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatisticsPage;
