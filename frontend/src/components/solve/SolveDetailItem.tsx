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
import { cn, getAdaptiveClasses } from '../../utils/appearanceUtils';
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
  const validAttempts = [solve, ...otherAttempts].filter(s => s.penalty !== PenaltyType.DNF);
  const bestAttempt = validAttempts.length > 0 
    ? validAttempts.reduce((best, current) => 
        current.adjustedTimeMs < best.adjustedTimeMs ? current : best
      )
    : solve; // Fallback to current solve if no valid attempts
  
  // Check if this is the best attempt (only meaningful if there are multiple valid attempts)
  const isBestAttempt = validAttempts.length > 1 && bestAttempt.id === solve.id;
  
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
        return cn('text-on-primary', getAdaptiveClasses.backgroundSemantic.error, 'border-error');
      case PenaltyType.PLUS_TWO:
        return cn('text-on-primary', getAdaptiveClasses.backgroundSemantic.warning, 'border-warning');
      default:
        return cn('text-on-primary', getAdaptiveClasses.backgroundSemantic.success, 'border-success');
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
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-adaptive-tertiary transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <span className="text-adaptive-tertiary font-mono w-6 text-right text-sm">
            {index + 1}.
          </span>
          <span className={`font-mono font-bold text-lg ${
            solve.penalty === PenaltyType.DNF 
              ? getAdaptiveClasses.semantic.error
              : solve.penalty === PenaltyType.PLUS_TWO 
              ? getAdaptiveClasses.semantic.warning
              : getAdaptiveClasses.text.primary
          }`}>
            {formatTimeWithPenalty(solve)}
          </span>
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getPenaltyColor(solve.penalty)}`}>
            {getPenaltyText(solve.penalty)}
          </span>
          
          {/* Retry attempt indicator */}
          {isRetryAttempt && (
            <span className={cn('flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border', getAdaptiveClasses.backgroundSemantic.info, 'text-on-primary', 'border-info')}>
              <Repeat className="w-3 h-3" />
              <span>Retry</span>
            </span>
          )}
          
          {/* Best attempt indicator */}
          {isBestAttempt && (
            <span className={cn('flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border', getAdaptiveClasses.backgroundSemantic.warning, 'text-on-primary', 'border-warning')}>
              <Trophy className="w-3 h-3" />
              <span>Best</span>
            </span>
          )}
          
          {/* Improvement indicator */}
          {improvement !== null && (
            <span             className={cn('flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border',
              improvement > 0 
                ? cn(getAdaptiveClasses.backgroundSemantic.success, 'text-on-primary', 'border-success')
                : cn(getAdaptiveClasses.backgroundSemantic.error, 'text-on-primary', 'border-error')
            )}>
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
          <span className="text-xs text-adaptive-tertiary">
            {formatDate(solve.solvedAt)}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-adaptive-tertiary" />
          ) : (
            <ChevronDown className="w-4 h-4 text-adaptive-tertiary" />
          )}
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-gray-100 p-4 space-y-4">
          {/* Solve Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Clock className={cn('w-4 h-4', getAdaptiveClasses.semantic.info)} />
              <div>
                <p className="text-xs text-adaptive-tertiary">Solve Time</p>
                <p className="text-sm font-mono font-semibold">{formatTime(solve.timeMs)}</p>
              </div>
            </div>
            
            {solve.inspectionTimeMs > 0 && (
              <div className="flex items-center gap-2">
                <Eye className={cn('w-4 h-4', getAdaptiveClasses.text.secondary)} />
                <div>
                  <p className="text-xs text-adaptive-tertiary">Inspection</p>
                  <p className="text-sm font-mono font-semibold">{formatTime(solve.inspectionTimeMs)}</p>
                </div>
              </div>
            )}
            
            {solve.moveCount && (
              <div className="flex items-center gap-2">
                <Hash className={cn('w-4 h-4', getAdaptiveClasses.semantic.success)} />
                <div>
                  <p className="text-xs text-adaptive-tertiary">Moves</p>
                  <p className="text-sm font-mono font-semibold">{solve.moveCount}</p>
                </div>
              </div>
            )}
            
            {solve.tps && (
              <div className="flex items-center gap-2">
                <Zap className={cn('w-4 h-4', getAdaptiveClasses.semantic.warning)} />
                <div>
                  <p className="text-xs text-adaptive-tertiary">TPS</p>
                  <p className="text-sm font-mono font-semibold">{solve.tps.toFixed(2)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Full Date and Session */}
          <div className="flex items-center gap-4 text-sm text-adaptive-secondary">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date(solve.solvedAt).toLocaleString()}</span>
            </div>
            {solve.sessionName && (
              <div>
                <span className="text-adaptive-tertiary">Session:</span> {solve.sessionName}
              </div>
            )}
          </div>

          {/* Scramble */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-adaptive-primary">Scramble</h4>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyScramble}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-adaptive-tertiary hover:text-adaptive-primary transition-colors"
                  title="Copy scramble"
                >
                  {copiedScramble ? (
                    <>
                      <Check className={cn('w-3 h-3', getAdaptiveClasses.semantic.success)} />
                      <span className={getAdaptiveClasses.semantic.success}>Copied!</span>
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
                    className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-on-primary rounded-md transition-colors"
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
                    className="bg-white px-2 py-1 rounded border text-sm font-mono font-semibold text-adaptive-primary shadow-sm"
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
              <h4 className="text-sm font-semibold text-adaptive-primary">Notes</h4>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-adaptive-primary">{solve.notes}</p>
              </div>
            </div>
          )}

          {/* Tags */}
          {solve.tags && solve.tags.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-adaptive-primary">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {solve.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className={cn('px-2 py-1 text-xs rounded-full', getAdaptiveClasses.backgroundSemantic.info, 'text-on-primary')}
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
              <h4 className="text-sm font-semibold text-adaptive-primary flex items-center gap-2">
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
                            ? getAdaptiveClasses.semantic.error
                            : attempt.penalty === PenaltyType.PLUS_TWO 
                            ? getAdaptiveClasses.semantic.warning
                            : getAdaptiveClasses.text.primary
                        }`}>
                          {formatTimeWithPenalty(attempt)}
                        </span>
                        {attempt.id === bestAttempt.id && (
                          <Trophy className={cn('w-3 h-3', getAdaptiveClasses.semantic.warning)} />
                        )}
                      </div>
                      <span className="text-xs text-adaptive-tertiary">
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
