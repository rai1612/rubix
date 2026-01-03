import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine, ReferenceArea } from 'recharts';
import { SolveService, formatTime } from '../../services/solveService';
import { PuzzleType } from '../../services/scrambleService';
import { cn, getAdaptiveClasses } from '../../utils/appearanceUtils';
import { RotateCcw, Download, Target, MousePointer2, Info, HelpCircle } from 'lucide-react';

interface TimeProgressionChartProps {
  puzzleType: PuzzleType;
  sessionId?: string | null; // null means all sessions
  className?: string;
}

interface ProgressionDataPoint {
  solveNumber: number;
  time: number;
  ao5?: number;
  ao12?: number;
  formattedTime: string;
  formattedAo5?: string;
  formattedAo12?: string;
  date: string;
  solvedAt: string;
  scramble?: string;
  penalty?: string;
}

export const TimeProgressionChart: React.FC<TimeProgressionChartProps> = ({
  puzzleType,
  sessionId = null,
  className = ''
}) => {
  const [data, setData] = useState<ProgressionDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMetrics, setSelectedMetrics] = useState({
    individualTimes: true,
    ao5: true,
    ao12: false
  });
  
  // Interactive features state
  const [selectedDataPoint, setSelectedDataPoint] = useState<ProgressionDataPoint | null>(null);
  const [zoomDomain, setZoomDomain] = useState<{startIndex?: number, endIndex?: number}>({});
  const [hoveredPoint, setHoveredPoint] = useState<ProgressionDataPoint | null>(null);
  const [isHoveringChart, setIsHoveringChart] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState<{current: number, total: number} | null>(null);
  const [totalSolves, setTotalSolves] = useState(0);
  const [displayedSolves, setDisplayedSolves] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  
  // Drag-to-zoom state
  const [dragZoomEnabled, setDragZoomEnabled] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{x: number, solveNumber: number} | null>(null);
  const [dragEnd, setDragEnd] = useState<{x: number, solveNumber: number} | null>(null);
  const [dragSelection, setDragSelection] = useState<{startIndex: number, endIndex: number} | null>(null);
  const [hasDragged, setHasDragged] = useState(false);

  useEffect(() => {
    const fetchProgressionData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Get solves based on session selection
        let allSolves: any[] = [];
        
        if (sessionId) {
          // Get session-specific solves
          const sessionSolves = await SolveService.getSessionSolves(sessionId);
          allSolves = sessionSolves;
        } else {
          // Get all user solves - fetch multiple pages for comprehensive progression data
          let page = 0;
          let hasMore = true;
          const maxPages = 50; // Limit to prevent excessive loading (5000 solves max)
          
          while (hasMore && page < maxPages) {
            const solvePage = await SolveService.getUserSolves(page, 100);
            allSolves = [...allSolves, ...solvePage.content];
            hasMore = !solvePage.last;
            page++;
            
            // Update loading progress
            setLoadingProgress({ current: page, total: Math.min(maxPages, page + (hasMore ? 5 : 0)) });
            
            // Optional: Add a small delay to prevent overwhelming the server
            if (hasMore && page % 10 === 0) {
              await new Promise(resolve => setTimeout(resolve, 100));
            }
          }
          
          setLoadingProgress(null); // Clear loading progress
        }
        
        if (!allSolves || allSolves.length === 0) {
          setData([]);
          return;
        }

        // Filter by puzzle type and sort by date
        const filteredSolves = allSolves
          .filter(solve => solve.puzzleType === puzzleType)
          .sort((a, b) => new Date(a.solvedAt).getTime() - new Date(b.solvedAt).getTime());

        // For very large datasets, implement intelligent sampling to maintain performance
        let processedSolves = filteredSolves;
        if (filteredSolves.length > 2000) {
          // Sample every nth solve to keep around 1000-1500 data points for performance
          const sampleRate = Math.ceil(filteredSolves.length / 1000);
          processedSolves = filteredSolves.filter((_, index) => index % sampleRate === 0);
          
          // Always include the most recent solves (last 100)
          const recentSolves = filteredSolves.slice(-100);
          const sampledOlderSolves = processedSolves.slice(0, -100);
          processedSolves = [...sampledOlderSolves, ...recentSolves];
        }


        // Debug: Check scramble data in the first few solves
        if (processedSolves.length > 0) {
          console.log('Sample solve data (first 3 solves):');
          processedSolves.slice(0, 3).forEach((solve, i) => {
            console.log(`Solve ${i + 1}:`, {
              id: solve.id,
              scrambleId: solve.scrambleId,
              scrambleText: solve.scrambleText,
              hasScrambleText: !!solve.scrambleText,
              scrambleLength: solve.scrambleText?.length || 0,
              penalty: solve.penalty,
              timeMs: solve.timeMs
            });
          });
        }

        // Calculate rolling averages using the original filtered data for accuracy
        const progressionData: ProgressionDataPoint[] = processedSolves.map((solve) => {
          // Find the actual index in the original filtered data for accurate rolling averages
          const actualIndex = filteredSolves.findIndex(s => s.id === solve.id);
          const validSolves = filteredSolves.slice(0, actualIndex + 1)
            .filter(s => s.penalty !== 'DNF')
            .map(s => s.adjustedTimeMs);

          // Calculate Ao5 (if we have at least 5 solves)
          let ao5: number | undefined;
          if (validSolves.length >= 5) {
            const last5 = validSolves.slice(-5);
            // Remove best and worst, average the middle 3
            const sorted = [...last5].sort((a, b) => a - b);
            const middle3 = sorted.slice(1, 4);
            ao5 = middle3.reduce((sum, time) => sum + time, 0) / 3;
          }

          // Calculate Ao12 (if we have at least 12 solves)
          let ao12: number | undefined;
          if (validSolves.length >= 12) {
            const last12 = validSolves.slice(-12);
            // Remove best and worst, average the middle 10
            const sorted = [...last12].sort((a, b) => a - b);
            const middle10 = sorted.slice(1, 11);
            ao12 = middle10.reduce((sum, time) => sum + time, 0) / 10;
          }

          // Handle chart display time: DNF shows as 0, +2 shows adjusted time
          let chartTime: number;
          let displayTime: string;
          
          if (solve.penalty === 'DNF') {
            chartTime = 0; // Show DNF as 0.00 on the chart
            displayTime = 'DNF';
          } else {
            chartTime = solve.adjustedTimeMs; // For +2, this already includes the penalty
            displayTime = formatTime(solve.adjustedTimeMs);
          }

          return {
            solveNumber: actualIndex + 1, // Use actual position in the full dataset
            time: chartTime, // Use the chart-appropriate time
            ao5,
            ao12,
            formattedTime: displayTime, // Use the display-appropriate format
            formattedAo5: ao5 ? formatTime(ao5) : undefined,
            formattedAo12: ao12 ? formatTime(ao12) : undefined,
            date: new Date(solve.solvedAt).toLocaleDateString(),
            solvedAt: solve.solvedAt,
            scramble: solve.scrambleText,
            penalty: solve.penalty
          };
        });

        // Set statistics for display
        setTotalSolves(filteredSolves.length);
        setDisplayedSolves(processedSolves.length);
        setData(progressionData);
      } catch (error: any) {
        console.error('Failed to fetch progression data:', error);
        
        // Handle different error types
        if (error.response?.status === 401) {
          setError('Please log in to view your progression data');
        } else if (error.response?.status === 404) {
          setError('No solve data found. Complete some solves to see your progression!');
        } else {
          setError('Failed to load progression data. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgressionData();
  }, [puzzleType, sessionId]);

  // Interactive callback functions
  // Note: This function is kept for potential future use but currently unused
  // const handleDataPointClick = useCallback((data: any, index?: number, event?: any) => {
  //   // Only handle click if we haven't dragged and drag-to-zoom isn't interfering
  //   if (!hasDragged && !isDragging && data) {
  //     setSelectedDataPoint(data);
  //   }
  // }, [hasDragged, isDragging]);

  // Handle chart area clicks to detect data point clicks
  const handleChartClick = useCallback((event: any) => {
    // If we have a hovered point from mouse events, use that for click
    if (hoveredPoint && !hasDragged && !isDragging) {
      setSelectedDataPoint(hoveredPoint);
      return;
    }
    
    // Try to get data from activeLabel (X-axis value)
    if (event && event.activeLabel && !hasDragged && !isDragging) {
      const solveNumber = event.activeLabel;
      
      // Find the data point with this solve number from the main data array
      const foundDataPoint = data.find(point => point.solveNumber === solveNumber);
      if (foundDataPoint) {
        setSelectedDataPoint(foundDataPoint);
        return;
      }
    }
    
    // Fallback: Check if we clicked on a data point
    if (event && event.activePayload && event.activePayload.length > 0) {
      const clickedData = event.activePayload[0].payload;
      
      if (!hasDragged && !isDragging && clickedData) {
        setSelectedDataPoint(clickedData);
      }
    }
  }, [hasDragged, isDragging, hoveredPoint, data]);

  const handleResetZoom = useCallback(() => {
    setZoomDomain({});
  }, []);

  const handleMouseEnter = useCallback((data: any) => {
    setIsHoveringChart(true);
    if (data && data.payload) {
      setHoveredPoint(data.payload);
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHoveringChart(false);
    setHoveredPoint(null);
  }, []);

  // Drag-to-zoom handlers
  const handleMouseDown = useCallback((event: any) => {
    if (dragZoomEnabled && event && event.activeLabel !== undefined) {
      const solveNumber = event.activeLabel;
      // Use data instead of displayData to avoid circular dependency
      const dataPoint = data.find(d => d.solveNumber === solveNumber);
      if (dataPoint) {
        setIsDragging(true);
        setDragStart({ x: event.chartX || 0, solveNumber });
        setDragEnd(null);
        setDragSelection(null);
        setHasDragged(false); // Reset drag flag
      }
    }
  }, [dragZoomEnabled, data]);

  const handleMouseMove = useCallback((event: any) => {
    if (dragZoomEnabled && isDragging && dragStart && event && event.activeLabel !== undefined) {
      const solveNumber = event.activeLabel;
      
      // Mark that we've dragged if the solve number is different from start
      if (solveNumber !== dragStart.solveNumber) {
        setHasDragged(true);
      }
      
      setDragEnd({ x: event.chartX || 0, solveNumber });
      
      // Calculate selection range
      const startSolve = Math.min(dragStart.solveNumber, solveNumber);
      const endSolve = Math.max(dragStart.solveNumber, solveNumber);
      const startIndex = data.findIndex(d => d.solveNumber === startSolve);
      const endIndex = data.findIndex(d => d.solveNumber === endSolve) + 1;
      
      if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
        setDragSelection({ startIndex, endIndex });
      }
    }
  }, [dragZoomEnabled, isDragging, dragStart, data]);

  const handleMouseUp = useCallback(() => {
    if (dragZoomEnabled && isDragging) {
      if (hasDragged && dragSelection) {
        // Apply the zoom based on drag selection only if we actually dragged
        if (dragSelection.endIndex - dragSelection.startIndex > 1) {
          setZoomDomain({ 
            startIndex: dragSelection.startIndex, 
            endIndex: dragSelection.endIndex 
          });
        }
      }
    }
    
    // Reset drag state
    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
    setDragSelection(null);
    // Note: Don't reset hasDragged here - let the click handler use it
  }, [dragZoomEnabled, isDragging, hasDragged, dragSelection]);

  // Add global mouse up listener for when mouse leaves chart area
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        handleMouseUp();
      }
    };

    if (isDragging) {
      document.addEventListener('mouseup', handleGlobalMouseUp);
      return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
    }
  }, [isDragging, handleMouseUp]);

  // Reset hasDragged flag after a short delay to allow click events to fire
  useEffect(() => {
    if (!isDragging && hasDragged) {
      const timer = setTimeout(() => {
        setHasDragged(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isDragging, hasDragged]);

  const exportChartData = useCallback(() => {
    const csvContent = [
      ['Solve Number', 'Time', 'Ao5', 'Ao12', 'Date', 'Scramble'].join(','),
      ...data.map(point => [
        point.solveNumber,
        point.formattedTime,
        point.formattedAo5 || '',
        point.formattedAo12 || '',
        point.date,
        point.scramble || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `time-progression-${puzzleType}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }, [data, puzzleType]);

  const formatTooltipTime = (value: number) => {
    return formatTime(value);
  };


  // Metric explanation component
  const MetricTooltip = ({ title, description, calculation }: { title: string, description: string, calculation: string }) => (
    <div className="bg-adaptive-secondary p-3 border border-adaptive-primary rounded-lg shadow-lg max-w-xs z-50">
      <h4 className="font-semibold text-sm text-adaptive-primary mb-1">{title}</h4>
      <p className="text-xs text-adaptive-secondary mb-2">{description}</p>
      <p className="text-xs text-adaptive-tertiary italic">{calculation}</p>
    </div>
  );

  const metricExplanations = {
    individualTimes: {
      title: "Individual Times",
      description: "Shows each solve time as recorded. This represents your raw performance for every single solve.",
      calculation: "Direct solve time including any penalties"
    },
    ao5: {
      title: "Average of 5 (Ao5)",
      description: "Rolling average of your last 5 solves, excluding the best and worst times. This smooths out lucky/unlucky solves.",
      calculation: "Average of middle 3 times from last 5 solves"
    },
    ao12: {
      title: "Average of 12 (Ao12)",
      description: "Rolling average of your last 12 solves, excluding the best and worst times. More stable indicator of consistent performance.",
      calculation: "Average of middle 10 times from last 12 solves"
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      
      return (
        <div 
          className="bg-white p-4 border border-gray-200 rounded-lg shadow-xl max-w-xs cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            if (!hasDragged && !isDragging && dataPoint) {
              setSelectedDataPoint(dataPoint);
            }
          }}
          title="Click to view full details"
        >
          <div className="mb-2">
            <p className="text-sm font-semibold text-adaptive-primary">Solve #{label}</p>
          </div>
          <p className="text-xs text-adaptive-secondary mb-3">{new Date(dataPoint.solvedAt).toLocaleString()}</p>
          
          <div className="space-y-1">
            {payload.map((entry: any) => {
              // Use the formatted time from dataPoint for proper DNF/+2 display
              let displayValue: string;
              if (entry.dataKey === 'time') {
                displayValue = dataPoint.formattedTime;
              } else if (entry.dataKey === 'ao5') {
                displayValue = dataPoint.formattedAo5 || 'N/A';
              } else if (entry.dataKey === 'ao12') {
                displayValue = dataPoint.formattedAo12 || 'N/A';
              } else {
                displayValue = formatTime(entry.value);
              }
              
              return (
                <div key={entry.dataKey} className="flex justify-between items-center">
                  <span className="text-xs font-medium" style={{ color: entry.color }}>
                    {entry.name}:
                  </span>
                  <span className="text-xs font-mono" style={{ color: entry.color }}>
                    {displayValue}
                  </span>
                </div>
              );
            })}
          </div>
          
          {dataPoint.penalty && (
            <div className="mt-2 pt-2 border-t border-gray-100">
              <span className="text-xs text-red-600 font-medium">Penalty: {dataPoint.penalty}</span>
            </div>
          )}
          
          {dataPoint.scramble && (
            <div className="mt-2 pt-2 border-t border-gray-100">
              <p className="text-xs text-adaptive-secondary font-medium mb-1">Scramble:</p>
              <p className="text-xs text-adaptive-tertiary font-mono leading-relaxed" title={dataPoint.scramble}>
                {dataPoint.scramble.length > 50 ? `${dataPoint.scramble.substring(0, 50)}...` : dataPoint.scramble}
              </p>
            </div>
          )}
          
          <div className="mt-2 pt-2 border-t border-gray-100">
            <p className="text-xs text-blue-600 font-medium">Click for full details</p>
          </div>
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
          <p className="text-sm text-adaptive-tertiary">
            {loadingProgress 
              ? `Loading progression data... (${loadingProgress.current}/${loadingProgress.total} pages)`
              : 'Loading progression data...'
            }
          </p>
          {loadingProgress && (
            <div className="mt-2 w-32 mx-auto bg-gray-200 rounded-full h-1">
              <div 
                className="bg-primary-600 h-1 rounded-full transition-all duration-300"
                style={{ width: `${(loadingProgress.current / loadingProgress.total) * 100}%` }}
              ></div>
            </div>
          )}
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
        <p className="text-sm text-adaptive-tertiary">No solve data available for progression chart</p>
      </div>
    );
  }

  // Get the data to display based on zoom
  const displayData = zoomDomain.startIndex !== undefined && zoomDomain.endIndex !== undefined
    ? data.slice(zoomDomain.startIndex, zoomDomain.endIndex)
    : data;

  return (
    <div className={className}>
      {/* Interactive Controls */}
      <div className="mb-4 space-y-3">
        {/* Header with Help Button */}
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-adaptive-primary">Chart Metrics</h4>
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

        {/* Metrics Selection with Tooltips */}
        <div className="flex flex-wrap gap-4">
          <div className="relative group">
            <label className="flex items-center text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={selectedMetrics.individualTimes}
                onChange={(e) => setSelectedMetrics(prev => ({
                  ...prev,
                  individualTimes: e.target.checked
                }))}
                className="mr-2 rounded"
              />
              Individual Times
              <Info className="w-3 h-3 ml-1 text-adaptive-tertiary" />
            </label>
            <div className="absolute bottom-full left-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
              <MetricTooltip {...metricExplanations.individualTimes} />
            </div>
          </div>

          <div className="relative group">
            <label className="flex items-center text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={selectedMetrics.ao5}
                onChange={(e) => setSelectedMetrics(prev => ({
                  ...prev,
                  ao5: e.target.checked
                }))}
                className="mr-2 rounded"
              />
              Ao5
              <Info className="w-3 h-3 ml-1 text-adaptive-tertiary" />
            </label>
            <div className="absolute bottom-full left-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
              <MetricTooltip {...metricExplanations.ao5} />
            </div>
          </div>

          <div className="relative group">
            <label className="flex items-center text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={selectedMetrics.ao12}
                onChange={(e) => setSelectedMetrics(prev => ({
                  ...prev,
                  ao12: e.target.checked
                }))}
                className="mr-2 rounded"
              />
              Ao12
              <Info className="w-3 h-3 ml-1 text-adaptive-tertiary" />
            </label>
            <div className="absolute bottom-full left-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
              <MetricTooltip {...metricExplanations.ao12} />
            </div>
          </div>
        </div>

        {/* Interactive Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1">
            <label className="flex items-center text-xs">
              <input
                type="checkbox"
                checked={dragZoomEnabled}
                onChange={(e) => setDragZoomEnabled(e.target.checked)}
                className="mr-1 rounded"
              />
              <MousePointer2 className="w-3 h-3 mr-1" />
              Drag to Zoom
            </label>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleResetZoom}
              disabled={!zoomDomain.startIndex && !zoomDomain.endIndex}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Zoom
            </button>

            <button
              onClick={exportChartData}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
              title="Export Data"
            >
              <Download className="w-3 h-3" />
              Export
            </button>

          </div>

          {hoveredPoint && !isDragging && (
            <div className="flex items-center gap-1 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
              <Target className="w-3 h-3" />
              Solve #{hoveredPoint.solveNumber}
            </div>
          )}

          {isDragging && dragStart && dragEnd && (
            <div className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
              <MousePointer2 className="w-3 h-3" />
              Selecting #{Math.min(dragStart.solveNumber, dragEnd.solveNumber)} - #{Math.max(dragStart.solveNumber, dragEnd.solveNumber)}
            </div>
          )}

          {dragZoomEnabled && !isDragging && (
            <div className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded">
              <MousePointer2 className="w-3 h-3" />
              <span>Drag to zoom enabled</span>
            </div>
          )}
        </div>

        {/* Help Panel */}
        {showHelp && (
          <div className="bg-adaptive-secondary border border-adaptive-primary rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-adaptive-primary">Chart Guide</h3>
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
                    <span className="font-medium text-adaptive-secondary">Individual Times:</span>
                    <p className="text-adaptive-tertiary">Your raw solve times. Shows every solve including lucky and unlucky attempts.</p>
                  </div>
                  <div>
                    <span className={cn("font-medium", getAdaptiveClasses.semantic.info)}>Ao5 (Average of 5):</span>
                    <p className="text-adaptive-tertiary">Rolling average excluding best/worst from last 5 solves. Good for short-term progress.</p>
                  </div>
                  <div>
                    <span className={cn("font-medium", getAdaptiveClasses.semantic.success)}>Ao12 (Average of 12):</span>
                    <p className="text-adaptive-tertiary">Rolling average excluding best/worst from last 12 solves. More stable, shows consistent improvement.</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-adaptive-primary mb-2">Interactive Features</h4>
                <div className="space-y-2">
                  <div>
                    <span className={cn("font-medium", getAdaptiveClasses.semantic.info)}>Drag to Zoom:</span>
                    <p className="text-adaptive-tertiary">Enable and drag across the chart to zoom into specific solve ranges.</p>
                  </div>
                  <div>
                    <span className={cn("font-medium", getAdaptiveClasses.semantic.warning)}>Click Data Points:</span>
                    <p className="text-adaptive-tertiary">Click any point to see detailed solve information including scramble.</p>
                  </div>
                  <div>
                    <span className={cn("font-medium", getAdaptiveClasses.semantic.error)}>Hover for Details:</span>
                    <p className="text-adaptive-tertiary">Hover over points to see quick solve info with crosshair precision.</p>
                  </div>
                  <div>
                    <span className={cn("font-medium", getAdaptiveClasses.semantic.success)}>Export Data:</span>
                    <p className="text-adaptive-tertiary">Download your progression data as CSV for external analysis.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-t border-adaptive-primary pt-3">
              <h4 className="font-semibold text-adaptive-primary mb-1">Reading Your Progress</h4>
              <p className="text-xs text-adaptive-tertiary">
                <strong>Downward trends</strong> in Ao5/Ao12 indicate improvement. 
                <strong>Individual times</strong> will be scattered, but focus on the <strong>rolling averages</strong> for true progress tracking.
                Large datasets are automatically optimized for performance while maintaining accuracy.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={displayData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onClick={handleChartClick}
            style={{ cursor: isDragging ? 'col-resize' : (dragZoomEnabled || isHoveringChart) ? 'crosshair' : 'default' }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="solveNumber" 
              stroke="#666"
              fontSize={12}
              tickFormatter={(value) => `#${value}`}
              domain={zoomDomain.startIndex !== undefined && zoomDomain.endIndex !== undefined ? [zoomDomain.startIndex + 1, zoomDomain.endIndex] : ['dataMin', 'dataMax']}
            />
            <YAxis 
              stroke="#666"
              fontSize={12}
              tickFormatter={formatTooltipTime}
              domain={['dataMin - 1000', 'dataMax + 1000']}
            />
            <Tooltip 
              content={<CustomTooltip />}
              cursor={{ stroke: '#8884d8', strokeWidth: 1, strokeDasharray: '3 3' }}
            />
            <Legend />
            
            {selectedMetrics.individualTimes && (
              <Line
                type="monotone"
                dataKey="time"
                stroke="#94a3b8"
                strokeWidth={1}
                dot={{ r: 3, strokeWidth: 1, stroke: '#94a3b8', fill: '#fff', cursor: 'pointer' }}
                activeDot={{ r: 6, stroke: '#94a3b8', strokeWidth: 2, fill: '#fff', cursor: 'pointer' }}
                name="Individual Times"
                connectNulls={false}
              />
            )}
            
            {selectedMetrics.ao5 && (
              <Line
                type="monotone"
                dataKey="ao5"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 1, stroke: '#3b82f6', fill: '#fff', cursor: 'pointer' }}
                activeDot={{ r: 7, stroke: '#3b82f6', strokeWidth: 2, fill: '#fff', cursor: 'pointer' }}
                name="Ao5"
                connectNulls={false}
              />
            )}
            
            {selectedMetrics.ao12 && (
              <Line
                type="monotone"
                dataKey="ao12"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 1, stroke: '#10b981', fill: '#fff', cursor: 'pointer' }}
                activeDot={{ r: 7, stroke: '#10b981', strokeWidth: 2, fill: '#fff', cursor: 'pointer' }}
                name="Ao12"
                connectNulls={false}
              />
            )}

            {/* Add reference line for selected data point */}
            {selectedDataPoint && (
              <ReferenceLine 
                x={selectedDataPoint.solveNumber} 
                stroke="#ff6b6b" 
                strokeDasharray="5 5"
                strokeWidth={2}
              />
            )}

            {/* Drag selection visual feedback */}
            {isDragging && dragStart && dragEnd && dragSelection && (
              <ReferenceArea
                x1={Math.min(dragStart.solveNumber, dragEnd.solveNumber)}
                x2={Math.max(dragStart.solveNumber, dragEnd.solveNumber)}
                fill="#3b82f6"
                fillOpacity={0.2}
                stroke="#3b82f6"
                strokeWidth={2}
                strokeDasharray="3 3"
              />
            )}

          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Selected Data Point Details Modal */}
      {selectedDataPoint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedDataPoint(null)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-adaptive-primary">
                Solve #{selectedDataPoint.solveNumber || 'Unknown'} Details
              </h3>
              <button
                onClick={() => setSelectedDataPoint(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-adaptive-secondary">Time</p>
                  <p className="text-lg font-mono font-semibold text-adaptive-primary">
                    {selectedDataPoint.formattedTime || (selectedDataPoint.time ? formatTime(selectedDataPoint.time) : 'N/A')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-adaptive-secondary">Date</p>
                  <p className="text-sm text-adaptive-primary">
                    {selectedDataPoint.solvedAt ? new Date(selectedDataPoint.solvedAt).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>

              {(selectedDataPoint.ao5 || selectedDataPoint.ao12) && (
                <div className="grid grid-cols-2 gap-4">
                  {selectedDataPoint.ao5 && (
                    <div>
                      <p className="text-xs text-adaptive-secondary">Ao5</p>
                      <p className="text-sm font-mono text-blue-600">
                        {selectedDataPoint.formattedAo5 || (selectedDataPoint.ao5 ? formatTime(selectedDataPoint.ao5) : 'N/A')}
                      </p>
                    </div>
                  )}
                  {selectedDataPoint.ao12 && (
                    <div>
                      <p className="text-xs text-adaptive-secondary">Ao12</p>
                      <p className="text-sm font-mono text-green-600">
                        {selectedDataPoint.formattedAo12 || (selectedDataPoint.ao12 ? formatTime(selectedDataPoint.ao12) : 'N/A')}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {selectedDataPoint.penalty && selectedDataPoint.penalty !== 'NONE' && (
                <div>
                  <p className="text-xs text-adaptive-secondary">Penalty</p>
                  <p className="text-sm text-red-600 font-medium">
                    {selectedDataPoint.penalty || 'N/A'}
                  </p>
                </div>
              )}

              <div>
                <p className="text-xs text-adaptive-secondary">Scramble</p>
                {selectedDataPoint.scramble ? (
                  <p className="text-sm font-mono text-adaptive-primary bg-adaptive-secondary p-3 rounded border border-adaptive-primary break-all leading-relaxed">
                    {selectedDataPoint.scramble}
                  </p>
                ) : (
                  <p className="text-sm text-adaptive-tertiary italic">
                    No scramble data available for this solve
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Summary */}
      <div className="mt-4 space-y-2">
        <div className="text-xs text-adaptive-secondary text-center">
          {totalSolves !== displayedSolves ? (
            <>
              Showing {displayedSolves} sampled data points from {totalSolves} total solves
              {data.length > 0 && ` (${data[0].date} - ${data[data.length - 1].date})`}
            </>
          ) : (
            <>
              Showing progression for {displayData.length} of {data.length} total solves
              {data.length > 0 && ` (${data[0].date} - ${data[data.length - 1].date})`}
            </>
          )}
        </div>
        
        {totalSolves !== displayedSolves && (
          <div className="text-xs text-orange-600 text-center">
            Large dataset optimized for performance - recent solves shown in full detail
          </div>
        )}
        
        {zoomDomain.startIndex !== undefined && zoomDomain.endIndex !== undefined && (
          <div className="text-xs text-blue-600 text-center">
            Zoomed to solves #{zoomDomain.startIndex + 1} - #{zoomDomain.endIndex}
          </div>
        )}

        {selectedDataPoint && (
          <div className="text-xs text-red-600 text-center">
            Selected: Solve #{selectedDataPoint.solveNumber} ({selectedDataPoint.formattedTime})
          </div>
        )}
        
      </div>
    </div>
  );
};

export default TimeProgressionChart;
