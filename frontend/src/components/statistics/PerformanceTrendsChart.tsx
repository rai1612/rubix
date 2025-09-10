import React, { useState, useEffect } from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { SolveService, SolveDto, formatTime } from '../../services/solveService';
import { PuzzleType } from '../../services/scrambleService';
import { cn, getAdaptiveClasses } from '../../utils/appearanceUtils';
import { HelpCircle } from 'lucide-react';

interface PerformanceTrendsChartProps {
  puzzleType: PuzzleType;
  sessionId?: string | null; // null means all sessions
  className?: string;
}

interface TrendDataPoint {
  period: string;
  avgTime: number;
  bestTime: number;
  solveCount: number;
  consistency: number; // Standard deviation
  formattedAvg: string;
  formattedBest: string;
  date: Date;
}

type TimePeriod = 'daily' | 'weekly' | 'monthly';

export const PerformanceTrendsChart: React.FC<PerformanceTrendsChartProps> = ({
  puzzleType,
  sessionId = null,
  className = ''
}) => {
  const [data, setData] = useState<TrendDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('weekly');
  const [showMetrics, setShowMetrics] = useState({
    avgTime: true,
    bestTime: true,
    solveCount: false,
    consistency: false
  });
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const fetchTrendsData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Get solves based on session selection
        let allSolves: SolveDto[] = [];
        
        if (sessionId) {
          // Get session-specific solves
          const sessionSolves = await SolveService.getSessionSolves(sessionId);
          allSolves = sessionSolves.filter(solve => 
            solve.puzzleType === puzzleType && solve.penalty !== 'DNF'
          );
        } else {
          // Get user solves - fetch multiple pages for more comprehensive data
          let page = 0;
          let hasMore = true;
          
          while (hasMore && page < 15) { // Get more data for trends
            const solvePage = await SolveService.getUserSolves(page, 100);
            const filteredSolves = solvePage.content.filter(solve => 
              solve.puzzleType === puzzleType && solve.penalty !== 'DNF'
            );
            
            allSolves = [...allSolves, ...filteredSolves];
            hasMore = !solvePage.last;
            page++;
          }
        }

        if (allSolves.length === 0) {
          setData([]);
          return;
        }

        // Group solves by time period
        const groupedData = groupSolvesByPeriod(allSolves, timePeriod);
        
        // Calculate trends for each period
        const trendsData: TrendDataPoint[] = Object.entries(groupedData)
          .map(([period, solves]) => {
            const times = solves.map(s => s.adjustedTimeMs);
            const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
            const bestTime = Math.min(...times);
            
            // Calculate consistency (standard deviation)
            const variance = times.reduce((sum, time) => sum + Math.pow(time - avgTime, 2), 0) / times.length;
            const consistency = Math.sqrt(variance);
            
            return {
              period,
              avgTime,
              bestTime,
              solveCount: solves.length,
              consistency,
              formattedAvg: formatTime(avgTime),
              formattedBest: formatTime(bestTime),
              date: new Date(solves[0].solvedAt)
            };
          })
          .sort((a, b) => a.date.getTime() - b.date.getTime())
          .slice(-20); // Show last 20 periods

        setData(trendsData);
      } catch (error: any) {
        console.error('Failed to fetch trends data:', error);
        
        // Handle different error types
        if (error.response?.status === 401) {
          setError('Please log in to view your performance trends');
        } else if (error.response?.status === 404) {
          setError('No solve data found. Complete some solves to see your trends!');
        } else {
          setError('Failed to load trends data. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrendsData();
  }, [puzzleType, timePeriod, sessionId]);

  const groupSolvesByPeriod = (solves: SolveDto[], period: TimePeriod): Record<string, SolveDto[]> => {
    const grouped: Record<string, SolveDto[]> = {};
    
    solves.forEach(solve => {
      const date = new Date(solve.solvedAt);
      let key: string;
      
      switch (period) {
        case 'daily':
          key = date.toISOString().split('T')[0]; // YYYY-MM-DD
          break;
        case 'weekly':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay()); // Start of week
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'monthly':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        default:
          key = date.toISOString().split('T')[0];
      }
      
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(solve);
    });
    
    return grouped;
  };

  const formatPeriodLabel = (period: string) => {
    switch (timePeriod) {
      case 'daily':
        return new Date(period).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case 'weekly':
        const weekStart = new Date(period);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      case 'monthly':
        const [year, month] = period.split('-');
        return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      default:
        return period;
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-adaptive-primary">{formatPeriodLabel(label)}</p>
          <p className="text-xs text-adaptive-secondary mb-2">{data.solveCount} solves</p>
          {payload.map((entry: any) => {
            if (entry.dataKey === 'solveCount') {
              return (
                <p key={entry.dataKey} className="text-sm" style={{ color: entry.color }}>
                  {entry.name}: {entry.value}
                </p>
              );
            } else if (entry.dataKey === 'consistency') {
              return (
                <p key={entry.dataKey} className="text-sm" style={{ color: entry.color }}>
                  {entry.name}: {formatTime(entry.value)}
                </p>
              );
            } else {
              return (
                <p key={entry.dataKey} className="text-sm" style={{ color: entry.color }}>
                  {entry.name}: {formatTime(entry.value)}
                </p>
              );
            }
          })}
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className={`h-80 bg-gray-50 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto mb-2"></div>
          <p className="text-sm text-adaptive-tertiary">Loading trends data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`h-80 bg-gray-50 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center">
          <p className="text-sm text-error mb-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-xs text-info hover:opacity-80"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={`h-80 bg-gray-50 rounded-lg flex items-center justify-center ${className}`}>
        <p className="text-sm text-adaptive-tertiary">No solve data available for trends analysis</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Controls */}
      <div className="mb-4 space-y-3">
        {/* Header with Help Button */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <span className="text-sm font-medium text-adaptive-primary py-1">Period:</span>
            {(['daily', 'weekly', 'monthly'] as TimePeriod[]).map(period => (
              <button
                key={period}
                onClick={() => setTimePeriod(period)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  timePeriod === period
                    ? 'bg-primary-600 text-on-primary'
                    : 'bg-adaptive-tertiary text-adaptive-primary hover:bg-adaptive-secondary'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowHelp(!showHelp)}
            className={cn(
              "flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-colors",
              showHelp 
                ? "bg-info text-on-info" 
                : "bg-adaptive-tertiary text-adaptive-primary hover:bg-adaptive-secondary"
            )}
            title="Show chart help and explanations"
          >
            <HelpCircle className="w-3 h-3" />
            Help
          </button>
        </div>

        {/* Metrics Selector */}
        <div className="flex flex-wrap gap-3">
          <label className="flex items-center text-sm">
            <input
              type="checkbox"
              checked={showMetrics.avgTime}
              onChange={(e) => setShowMetrics(prev => ({
                ...prev,
                avgTime: e.target.checked
              }))}
              className="mr-2 rounded"
            />
            Average Time
          </label>
          <label className="flex items-center text-sm">
            <input
              type="checkbox"
              checked={showMetrics.bestTime}
              onChange={(e) => setShowMetrics(prev => ({
                ...prev,
                bestTime: e.target.checked
              }))}
              className="mr-2 rounded"
            />
            Best Time
          </label>
          <label className="flex items-center text-sm">
            <input
              type="checkbox"
              checked={showMetrics.solveCount}
              onChange={(e) => setShowMetrics(prev => ({
                ...prev,
                solveCount: e.target.checked
              }))}
              className="mr-2 rounded"
            />
            Solve Count
          </label>
          <label className="flex items-center text-sm">
            <input
              type="checkbox"
              checked={showMetrics.consistency}
              onChange={(e) => setShowMetrics(prev => ({
                ...prev,
                consistency: e.target.checked
              }))}
              className="mr-2 rounded"
            />
            Consistency
          </label>
        </div>

        {/* Help Panel */}
        {showHelp && (
          <div className="bg-adaptive-secondary border border-adaptive-primary rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-adaptive-primary">Performance Trends Guide</h3>
              <button
                onClick={() => setShowHelp(false)}
                className={cn("hover:opacity-80 transition-opacity", getAdaptiveClasses.semantic.info)}
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <h4 className="font-semibold text-adaptive-primary mb-2">Metrics Explained</h4>
                <div className="space-y-2">
                  <div>
                    <span className={cn("font-medium", getAdaptiveClasses.semantic.info)}>Average Time:</span>
                    <p className="text-adaptive-tertiary">Mean solve time for each period. Shows your overall performance level and long-term trends.</p>
                  </div>
                  <div>
                    <span className={cn("font-medium", getAdaptiveClasses.semantic.success)}>Best Time:</span>
                    <p className="text-adaptive-tertiary">Fastest solve in each period. Indicates your peak performance and potential.</p>
                  </div>
                  <div>
                    <span className={cn("font-medium", getAdaptiveClasses.semantic.warning)}>Consistency (σ):</span>
                    <p className="text-adaptive-tertiary">Standard deviation of times. Lower values mean more consistent solving. Dashed line shows variability.</p>
                  </div>
                  <div>
                    <span className="font-medium text-adaptive-secondary">Solve Count:</span>
                    <p className="text-adaptive-tertiary">Number of solves per period. Gray bars show practice volume and activity level.</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-adaptive-primary mb-2">Time Periods</h4>
                <div className="space-y-2">
                  <div>
                    <span className={cn("font-medium", getAdaptiveClasses.semantic.info)}>Daily:</span>
                    <p className="text-adaptive-tertiary">Day-by-day analysis. Best for tracking short-term progress and daily practice effects.</p>
                  </div>
                  <div>
                    <span className={cn("font-medium", getAdaptiveClasses.semantic.warning)}>Weekly:</span>
                    <p className="text-adaptive-tertiary">Week-by-week trends. Smooths out daily variations while showing meaningful progress patterns.</p>
                  </div>
                  <div>
                    <span className={cn("font-medium", getAdaptiveClasses.semantic.success)}>Monthly:</span>
                    <p className="text-adaptive-tertiary">Month-by-month overview. Shows long-term improvement and seasonal patterns in your solving.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-t border-adaptive-primary pt-3">
              <h4 className="font-semibold text-adaptive-primary mb-1">Reading Your Trends</h4>
              <p className="text-xs text-adaptive-tertiary">
                <strong>Downward trends</strong> in average and best times indicate improvement. 
                <strong>Decreasing consistency</strong> (lower σ) shows you're becoming more reliable.
                <strong>Higher solve counts</strong> with improving times suggest effective practice.
                Use different time periods to spot patterns: daily for immediate feedback, weekly for progress tracking, monthly for long-term analysis.
              </p>
            </div>
            
            <div className="border-t border-adaptive-primary pt-3">
              <h4 className="font-semibold text-adaptive-primary mb-1">Interpretation Tips</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-adaptive-tertiary">
                    <strong className={cn(getAdaptiveClasses.semantic.success)}>Good Signs:</strong> Steady downward average times, improving best times, decreasing consistency values, sustained solve counts.
                  </p>
                </div>
                <div>
                  <p className="text-adaptive-tertiary">
                    <strong className={cn(getAdaptiveClasses.semantic.warning)}>Watch For:</strong> Plateaus in averages, increasing consistency, declining solve counts, or best times not improving.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="period" 
              stroke="#666"
              fontSize={12}
              tickFormatter={formatPeriodLabel}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              yAxisId="time"
              orientation="left"
              stroke="#666"
              fontSize={12}
              tickFormatter={(value) => formatTime(value)}
            />
            {showMetrics.solveCount && (
              <YAxis 
                yAxisId="count"
                orientation="right"
                stroke="#666"
                fontSize={12}
              />
            )}
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            {showMetrics.avgTime && (
              <Line
                yAxisId="time"
                type="monotone"
                dataKey="avgTime"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="Average Time"
              />
            )}
            
            {showMetrics.bestTime && (
              <Line
                yAxisId="time"
                type="monotone"
                dataKey="bestTime"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="Best Time"
              />
            )}
            
            {showMetrics.consistency && (
              <Line
                yAxisId="time"
                type="monotone"
                dataKey="consistency"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="Consistency (σ)"
                strokeDasharray="5 5"
              />
            )}
            
            {showMetrics.solveCount && (
              <Bar
                yAxisId="count"
                dataKey="solveCount"
                fill="#e5e7eb"
                name="Solve Count"
                opacity={0.6}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Summary */}
      <div className="mt-4 text-xs text-adaptive-secondary text-center">
        {timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)} performance trends 
        ({data.length} {timePeriod.slice(0, -2)} periods shown)
      </div>
    </div>
  );
};

export default PerformanceTrendsChart;
