import React from 'react';
import { BookOpen, Trophy, Target } from 'lucide-react';
import { AlgorithmSetSummary, algorithmService } from '../../services/algorithmService';
import { cn, getAdaptiveClasses } from '../../utils/appearanceUtils';

interface AlgorithmSetCardProps {
  summary: AlgorithmSetSummary;
  onClick?: (summary: AlgorithmSetSummary) => void;
}

const AlgorithmSetCard: React.FC<AlgorithmSetCardProps> = ({ summary, onClick }) => {
  const progressPercentage = algorithmService.getProgressPercentage(summary.learnedCount, summary.totalCount);
  const progressLabel = algorithmService.formatProgressLabel(summary.learnedCount, summary.totalCount);
  // Colors are now handled by adaptive classes instead of dynamic generation

  return (
    <div 
      className={cn(
        'rounded-lg border p-6 cursor-pointer transition-all duration-200 ease-in-out',
        'hover:shadow-lg hover:shadow-adaptive-primary/10 hover:scale-[1.02] hover:border-adaptive-info',
        'transform-gpu active:scale-[0.98]',
        getAdaptiveClasses.background.secondary,
        getAdaptiveClasses.border.primary
      )}
      onClick={() => onClick?.(summary)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className={cn('p-3 rounded-lg', getAdaptiveClasses.background.tertiary)}>
          <BookOpen className={cn('w-6 h-6', getAdaptiveClasses.text.secondary)} />
        </div>
        <div className="text-right">
          <span className="text-sm text-adaptive-tertiary">{summary.totalCount} cases</span>
          {summary.isAdvanced && (
            <div className="flex items-center justify-end mt-1">
              <Trophy className={cn('w-4 h-4 mr-1', getAdaptiveClasses.semantic.warning)} />
              <span className={cn('text-xs font-medium', getAdaptiveClasses.semantic.warning)}>Advanced</span>
            </div>
          )}
        </div>
      </div>

      {/* Title and Description */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-adaptive-primary mb-2 flex items-center">
          {summary.displayName}
          {summary.isLastLayer && (
            <Target className={cn('w-4 h-4 ml-2', getAdaptiveClasses.semantic.info)} />
          )}
        </h3>
        <p className="text-adaptive-secondary text-sm">
          {summary.description}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-adaptive-primary">Progress</span>
          <span className={cn('text-sm font-medium', 
            progressPercentage >= 80 ? getAdaptiveClasses.semantic.success :
            progressPercentage >= 60 ? getAdaptiveClasses.semantic.info :
            progressPercentage >= 40 ? getAdaptiveClasses.semantic.warning :
            getAdaptiveClasses.semantic.error
          )}>
            {progressLabel}
          </span>
        </div>
        <div className={cn('w-full rounded-full h-2', getAdaptiveClasses.background.tertiary)}>
          <div
            className={cn('h-2 rounded-full transition-all duration-300',
              progressPercentage >= 80 ? 'bg-success' :
              progressPercentage >= 60 ? 'bg-info' :
              progressPercentage >= 40 ? 'bg-warning' :
              'bg-error'
            )}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Statistics */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 text-sm text-adaptive-secondary">
          {summary.averageDifficulty && (
            <div className="flex items-center space-x-1">
              <span>Avg. Difficulty:</span>
              <span className="font-medium">{summary.averageDifficulty.toFixed(1)}/5</span>
            </div>
          )}
          {summary.averageMoveCount && (
            <div className="flex items-center space-x-1">
              <span>Avg. Moves:</span>
              <span className="font-medium">{Math.round(summary.averageMoveCount)}</span>
            </div>
          )}
        </div>
        
      </div>

      {/* Completion Status */}
      {progressPercentage === 100 && (
        <div className={cn('mt-3 flex items-center justify-center p-2 rounded-lg', getAdaptiveClasses.backgroundSemantic.success)}>
          <Trophy className={cn('w-4 h-4 mr-2', getAdaptiveClasses.semantic.success)} />
          <span className={cn('font-medium text-sm', getAdaptiveClasses.semantic.success)}>Completed!</span>
        </div>
      )}
    </div>
  );
};

export default AlgorithmSetCard;
