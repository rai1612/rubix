import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  Eye, 
  Hash, 
  Calendar,
  Repeat,
  Copy,
  Check,
  Zap,
  TrendingUp,
  TrendingDown,
  Trophy,
  Target
} from 'lucide-react';
import { SolveDto, formatTime, formatTimeWithPenalty, PenaltyType } from '../../services/solveService';
import { PuzzleType } from '../../services/scrambleService';

interface SolveDetailItemProps {
  solve: SolveDto;
  index: number;
  onRetryScramble?: (scrambleText: string, puzzleType: PuzzleType, originalScrambleId?: string) => void;
  allSolves?: SolveDto[]; // All solves for comparison (to find previous attempts on same scramble)
}

export const SolveDetailItem: React.FC<SolveDetailItemProps> = ({
  solve,
  index,
  onRetryScramble,
  allSolves = []
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedScramble, setCopiedScramble] = useState(false);

  // Find other attempts on the same scramble
  const otherAttempts = allSolves.filter(s => 
    s.scrambleId === solve.scrambleId && s.id !== solve.id
  );
  
  // Check if this is a retry attempt
  const isRetryAttempt = solve.notes?.includes('Retry attempt') || otherAttempts.length > 0;
  
  // Find best attempt on this scramble
  const bestAttempt = [solve, ...otherAttempts]
    .filter(s => s.penalty !== PenaltyType.DNF)
    .reduce((best, current) => 
      current.adjustedTimeMs < best.adjustedTimeMs ? current : best
    );
  
  // Check if this is the best attempt
  const isBestAttempt = bestAttempt.id === solve.id;
  
  // Find previous attempt (chronologically before this one)
  const previousAttempt = otherAttempts
    .filter(s => new Date(s.solvedAt) < new Date(solve.solvedAt))
    .sort((a, b) => new Date(b.solvedAt).getTime() - new Date(a.solvedAt).getTime())[0];
  
  // Calculate improvement
  const improvement = previousAttempt && solve.penalty !== PenaltyType.DNF 
    ? previousAttempt.adjustedTimeMs - solve.adjustedTimeMs 
    : null;

  const handleCopyScramble = async () => {
    if (!solve.scrambleText) return;

    try {
      await navigator.clipboard.writeText(solve.scrambleText);
      setCopiedScramble(true);
      setTimeout(() => setCopiedScramble(false), 2000);
    } catch (error) {
      console.error('Failed to copy scramble:', error);
    }
  };

  const handleRetryScramble = () => {
    if (onRetryScramble && solve.scrambleText) {
      onRetryScramble(solve.scrambleText, solve.puzzleType, solve.scrambleId);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  const getPenaltyColor = (penalty: PenaltyType) => {
    switch (penalty) {
      case PenaltyType.DNF:
        return 'text-red-600 bg-red-50 border-red-200';
      case PenaltyType.PLUS_TWO:
        return 'text-orange-600 bg-orange-50 border-orange-200';
      default:
        return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const getPenaltyText = (penalty: PenaltyType) => {
    switch (penalty) {
      case PenaltyType.DNF:
        return 'DNF';
      case PenaltyType.PLUS_TWO:
        return '+2';
      default:
        return 'OK';
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg bg-white hover:shadow-sm transition-shadow">
      {/* Compact Header */}
      <div 
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <span className="text-gray-500 font-mono w-6 text-right text-sm">
            {index + 1}.
          </span>
          <span className={`font-mono font-bold text-lg ${
            solve.penalty === PenaltyType.DNF 
              ? 'text-red-600' 
              : solve.penalty === PenaltyType.PLUS_TWO 
              ? 'text-orange-600' 
              : 'text-gray-900'
          }`}>
            {formatTimeWithPenalty(solve)}
          </span>
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getPenaltyColor(solve.penalty)}`}>
            {getPenaltyText(solve.penalty)}
          </span>
          
          {/* Retry attempt indicator */}
          {isRetryAttempt && (
            <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              <Repeat className="w-3 h-3" />
              <span>Retry</span>
            </span>
          )}
          
          {/* Best attempt indicator */}
          {isBestAttempt && otherAttempts.length > 0 && (
            <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200">
              <Trophy className="w-3 h-3" />
              <span>Best</span>
            </span>
          )}
          
          {/* Improvement indicator */}
          {improvement !== null && (
            <span className={`flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border ${
              improvement > 0 
                ? 'bg-green-50 text-green-700 border-green-200' 
                : 'bg-red-50 text-red-700 border-red-200'
            }`}>
              {improvement > 0 ? (
                <>
                  <TrendingUp className="w-3 h-3" />
                  <span>-{formatTime(Math.abs(improvement))}</span>
                </>
              ) : (
                <>
                  <TrendingDown className="w-3 h-3" />
                  <span>+{formatTime(Math.abs(improvement))}</span>
                </>
              )}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">
            {formatDate(solve.solvedAt)}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-gray-100 p-4 space-y-4">
          {/* Solve Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-xs text-gray-500">Solve Time</p>
                <p className="text-sm font-mono font-semibold">{formatTime(solve.timeMs)}</p>
              </div>
            </div>
            
            {solve.inspectionTimeMs > 0 && (
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-purple-500" />
                <div>
                  <p className="text-xs text-gray-500">Inspection</p>
                  <p className="text-sm font-mono font-semibold">{formatTime(solve.inspectionTimeMs)}</p>
                </div>
              </div>
            )}
            
            {solve.moveCount && (
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-green-500" />
                <div>
                  <p className="text-xs text-gray-500">Moves</p>
                  <p className="text-sm font-mono font-semibold">{solve.moveCount}</p>
                </div>
              </div>
            )}
            
            {solve.tps && (
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                <div>
                  <p className="text-xs text-gray-500">TPS</p>
                  <p className="text-sm font-mono font-semibold">{solve.tps.toFixed(2)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Full Date and Session */}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date(solve.solvedAt).toLocaleString()}</span>
            </div>
            {solve.sessionName && (
              <div>
                <span className="text-gray-400">Session:</span> {solve.sessionName}
              </div>
            )}
          </div>

          {/* Scramble */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-900">Scramble</h4>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyScramble}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                  title="Copy scramble"
                >
                  {copiedScramble ? (
                    <>
                      <Check className="w-3 h-3 text-green-500" />
                      <span className="text-green-500">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
                
                {onRetryScramble && (
                  <button
                    onClick={handleRetryScramble}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                    title="Retry this scramble"
                  >
                    <Repeat className="w-3 h-3" />
                    <span>Retry</span>
                  </button>
                )}
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3 border">
              <div className="flex flex-wrap gap-1.5 justify-center">
                {solve.scrambleText?.split(' ').map((move, idx) => (
                  <span
                    key={idx}
                    className="bg-white px-2 py-1 rounded border text-sm font-mono font-semibold text-gray-700 shadow-sm"
                  >
                    {move}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Notes */}
          {solve.notes && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-900">Notes</h4>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-gray-700">{solve.notes}</p>
              </div>
            </div>
          )}

          {/* Tags */}
          {solve.tags && solve.tags.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-900">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {solve.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Other Attempts on Same Scramble */}
          {otherAttempts.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Other Attempts ({otherAttempts.length})
              </h4>
              <div className="space-y-2">
                {otherAttempts
                  .sort((a, b) => new Date(b.solvedAt).getTime() - new Date(a.solvedAt).getTime())
                  .map((attempt) => (
                    <div key={attempt.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                      <div className="flex items-center gap-2">
                        <span className={`font-mono text-sm font-semibold ${
                          attempt.penalty === PenaltyType.DNF 
                            ? 'text-red-600' 
                            : attempt.penalty === PenaltyType.PLUS_TWO 
                            ? 'text-orange-600' 
                            : 'text-gray-900'
                        }`}>
                          {formatTimeWithPenalty(attempt)}
                        </span>
                        {attempt.id === bestAttempt.id && (
                          <Trophy className="w-3 h-3 text-yellow-500" />
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDate(attempt.solvedAt)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SolveDetailItem;
