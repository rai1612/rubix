import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { SolveService, SolveDto } from '../../services/solveService';
import { PuzzleType } from '../../services/scrambleService';
import { cn, getAdaptiveClasses } from '../../utils/appearanceUtils';
import { HelpCircle } from 'lucide-react';

interface SolveDistributionChartProps {
  puzzleType: PuzzleType;
  sessionId?: string | null; // null means all sessions
  className?: string;
}

interface DistributionBucket {
  range: string;
  count: number;
  percentage: number;
  minTime: number;
  maxTime: number;
  color: string;
}

export const SolveDistributionChart: React.FC<SolveDistributionChartProps> = ({
  puzzleType,
  sessionId = null,
  className = ''
}) => {
  const [data, setData] = useState<DistributionBucket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalSolves, setTotalSolves] = useState(0);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const fetchDistributionData = async () => {
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
          // Get user solves - fetch more pages if needed
          let page = 0;
          let hasMore = true;
          
          while (hasMore && page < 10) { // Limit to prevent infinite loop
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
          setTotalSolves(0);
          return;
        }

        setTotalSolves(allSolves.length);

        // Define time buckets (in milliseconds)
        const buckets = [
          { range: '< 10s', min: 0, max: 10000, color: '#10b981' },
          { range: '10-15s', min: 10000, max: 15000, color: '#3b82f6' },
          { range: '15-20s', min: 15000, max: 20000, color: '#6366f1' },
          { range: '20-25s', min: 20000, max: 25000, color: '#8b5cf6' },
          { range: '25-30s', min: 25000, max: 30000, color: '#f59e0b' },
          { range: '30-45s', min: 30000, max: 45000, color: '#f97316' },
          { range: '45-60s', min: 45000, max: 60000, color: '#ef4444' },
          { range: '> 60s', min: 60000, max: Infinity, color: '#991b1b' }
        ];

        // Count solves in each bucket
        const distributionData: DistributionBucket[] = buckets.map(bucket => {
          const solvesInBucket = allSolves.filter(solve => 
            solve.adjustedTimeMs >= bucket.min && solve.adjustedTimeMs < bucket.max
          );
          
          return {
            range: bucket.range,
            count: solvesInBucket.length,
            percentage: (solvesInBucket.length / allSolves.length) * 100,
            minTime: bucket.min,
            maxTime: bucket.max,
            color: bucket.color
          };
        }).filter(bucket => bucket.count > 0); // Only show buckets with data

        setData(distributionData);
      } catch (error: any) {
        console.error('Failed to fetch distribution data:', error);
        
        // Handle different error types
        if (error.response?.status === 401) {
          setError('Please log in to view your solve distribution');
        } else if (error.response?.status === 404) {
          setError('No solve data found. Complete some solves to see your distribution!');
        } else {
          setError('Failed to load distribution data. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDistributionData();
  }, [puzzleType, sessionId]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-adaptive-primary">{label}</p>
          <p className={cn('text-sm', getAdaptiveClasses.semantic.info)}>
            Count: {data.count} solves ({data.percentage.toFixed(1)}%)
          </p>
          <p className="text-xs text-adaptive-secondary">
            {totalSolves > 0 && `${data.count} out of ${totalSolves} total solves`}
          </p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className={`h-64 bg-gray-50 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto mb-2"></div>
          <p className="text-sm text-adaptive-tertiary">Loading distribution data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`h-64 bg-gray-50 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center">
          <p className={cn('text-sm mb-2', getAdaptiveClasses.semantic.error)}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className={cn('text-xs hover:opacity-80', getAdaptiveClasses.semantic.info)}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={`h-64 bg-gray-50 rounded-lg flex items-center justify-center ${className}`}>
        <p className="text-sm text-adaptive-tertiary">No solve data available for distribution chart</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header with Help */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-adaptive-primary">Solve Time Distribution</h4>
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

      {/* Help Panel */}
      {showHelp && (
        <div className="bg-adaptive-secondary border border-adaptive-primary rounded-lg p-3 mb-4 text-xs">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-adaptive-primary">Distribution Chart Guide</h3>
            <button
              onClick={() => setShowHelp(false)}
              className={cn("hover:opacity-80 transition-opacity", getAdaptiveClasses.semantic.info)}
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-2">
            <div>
              <span className="font-medium text-adaptive-primary">What This Shows:</span>
              <p className="text-adaptive-tertiary">How your solve times are distributed across different time ranges. This helps identify your most common solving speeds and consistency patterns.</p>
            </div>
            
            <div>
              <span className="font-medium text-adaptive-primary">Reading the Chart:</span>
              <p className="text-adaptive-tertiary">
                • <strong>Height of bars</strong> = Number of solves in that time range<br/>
                • <strong>Colors</strong> = Performance levels (green = fast, red = slower)<br/>
                • <strong>Percentages</strong> = What portion of your solves fall in each range
              </p>
            </div>
            
            <div>
              <span className="font-medium text-adaptive-primary">What to Look For:</span>
              <p className="text-adaptive-tertiary">
                A <strong>consistent solver</strong> has most solves clustered in 1-2 adjacent ranges. 
                A <strong>wide distribution</strong> suggests inconsistency that can be improved with practice.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="range" 
              stroke="#666"
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              stroke="#666"
              fontSize={12}
              label={{ value: 'Number of Solves', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Distribution Summary */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
        {data.slice(0, 4).map((bucket, index) => (
          <div key={index} className="text-center p-2 bg-gray-50 rounded">
            <div 
              className="w-3 h-3 rounded mx-auto mb-1" 
              style={{ backgroundColor: bucket.color }}
            ></div>
            <p className="font-medium">{bucket.range}</p>
            <p className="text-adaptive-secondary">{bucket.count} ({bucket.percentage.toFixed(1)}%)</p>
          </div>
        ))}
      </div>

      {/* Total Summary */}
      <div className="mt-3 text-xs text-adaptive-secondary text-center">
        Distribution of {totalSolves} valid solves for {puzzleType.replace('CUBE_', '').toLowerCase()}
      </div>
    </div>
  );
};

export default SolveDistributionChart;
