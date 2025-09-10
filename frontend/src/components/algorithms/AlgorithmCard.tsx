import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Copy, Edit, Trash2, Clock, Hash, Check, Target } from 'lucide-react';
import { Algorithm, algorithmService } from '../../services/algorithmService';

import { cn, getAdaptiveClasses } from '../../utils/appearanceUtils';

interface AlgorithmCardProps {
  algorithm: Algorithm;
  onFavoriteToggle?: (algorithm: Algorithm) => void;
  onEdit?: (algorithm: Algorithm) => void;
  onDelete?: (algorithm: Algorithm) => void;
  showActions?: boolean;
  compact?: boolean;
  clickable?: boolean;
  currentSet?: string; // Current algorithm set for back navigation
}

const AlgorithmCard: React.FC<AlgorithmCardProps> = ({
  algorithm,
  onFavoriteToggle,
  onEdit,
  onDelete,
  showActions = true,
  compact = false,
  clickable = true,
  currentSet
}) => {
  const navigate = useNavigate();
  const [copySuccess, setCopySuccess] = useState(false);

  // Colors are now handled by adaptive classes instead of dynamic generation
  const difficultyLabel = algorithmService.getDifficultyLabel(algorithm.difficulty);

  const handleCopyNotation = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click navigation
    try {
      await navigator.clipboard.writeText(algorithm.notationString);
      setCopySuccess(true);
      // Reset the success state after 2 seconds
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy notation:', err);
      // Fallback for browsers that don't support clipboard API
      try {
        const textArea = document.createElement('textarea');
        textArea.value = algorithm.notationString;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy also failed:', fallbackErr);
      }
    }
  };

  const getDifficultyStars = (difficulty?: number) => {
    if (!difficulty) return [];
    return Array.from({ length: 5 }, (_, i) => i < difficulty);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on action buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    
    if (clickable) {
      const url = currentSet 
        ? `/algorithms/${algorithm.id}?set=${encodeURIComponent(currentSet)}`
        : `/algorithms/${algorithm.id}`;
      navigate(url);
    }
  };


  return (
    <div 
      className={cn(
        'rounded-lg border transition-all duration-200 ease-in-out', 
        getAdaptiveClasses.background.secondary, 
        getAdaptiveClasses.border.primary,
        compact ? 'p-4' : 'p-6',
        clickable && 'cursor-pointer transform-gpu hover:shadow-lg hover:shadow-adaptive-primary/10 hover:scale-[1.02] hover:border-adaptive-info active:scale-[0.98]'
      )}
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={cn('p-2 rounded-lg', getAdaptiveClasses.background.tertiary)}>
            <Hash className={cn('w-4 h-4', getAdaptiveClasses.text.secondary)} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className={cn('text-sm font-medium', getAdaptiveClasses.text.secondary)}>
                {algorithm.algorithmSet}
                {algorithm.caseNumber && ` ${algorithm.caseNumber}`}
              </span>
              {algorithm.isFavorite && (
                <Star className={cn('w-4 h-4 fill-current', getAdaptiveClasses.semantic.warning)} />
              )}
            </div>
            <h3 className={`font-semibold text-adaptive-primary ${compact ? 'text-sm' : 'text-lg'}`}>
              {algorithm.name}
            </h3>
          </div>
        </div>
        
        {showActions && (
          <div className="flex items-center space-x-1">
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent card click navigation
                console.log('Favorite button clicked for algorithm:', algorithm.id, 'Current favorite status:', algorithm.isFavorite);
                onFavoriteToggle?.(algorithm);
              }}
              className={cn('p-2 rounded-lg transition-colors',
                algorithm.isFavorite
                  ? cn(getAdaptiveClasses.semantic.warning, 'hover:bg-adaptive-tertiary')
                  : cn(getAdaptiveClasses.text.tertiary, 'hover:' + getAdaptiveClasses.semantic.warning.replace('text-', ''), 'hover:bg-adaptive-tertiary')
              )}
              title={algorithm.isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Star className={`w-4 h-4 ${algorithm.isFavorite ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleCopyNotation}
              className={cn('p-2 rounded-lg transition-colors', 
                copySuccess 
                  ? cn(getAdaptiveClasses.semantic.success, 'hover:bg-adaptive-tertiary')
                  : cn(getAdaptiveClasses.text.tertiary, 'hover:' + getAdaptiveClasses.semantic.info.replace('text-', ''), 'hover:bg-adaptive-tertiary')
              )}
              title={copySuccess ? "Copied!" : "Copy notation"}
            >
              {copySuccess ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
            {algorithm.isUserAlgorithm && onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent card click navigation
                  onEdit(algorithm);
                }}
                className={cn('p-2 rounded-lg transition-colors', getAdaptiveClasses.text.tertiary, 'hover:' + getAdaptiveClasses.semantic.success.replace('text-', ''), 'hover:bg-adaptive-tertiary')}
                title="Edit algorithm"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
            {algorithm.isUserAlgorithm && onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent card click navigation
                  onDelete(algorithm);
                }}
                className={cn('p-2 rounded-lg transition-colors', getAdaptiveClasses.text.tertiary, 'hover:' + getAdaptiveClasses.semantic.error.replace('text-', ''), 'hover:bg-adaptive-tertiary')}
                title="Delete algorithm"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Algorithm Case Image */}
      {algorithm.imageUrl && (
        <div className="mb-4 flex justify-center">
          <img 
            src={algorithm.imageUrl} 
            alt={`${algorithm.name} case diagram`}
            className="w-20 h-20 object-contain rounded-lg border border-adaptive-tertiary bg-adaptive-background"
            onError={(e) => {
              // Hide image if it fails to load
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Algorithm notation */}
      <div className="mb-3">
        <p className={`font-mono text-adaptive-primary ${compact ? 'text-base' : 'text-lg'} break-all`}>
          {algorithm.notationString}
        </p>
      </div>

      {/* Description */}
      {algorithm.caseDescription && !compact && (
        <p className="text-sm text-adaptive-secondary mb-3">
          {algorithm.caseDescription}
        </p>
      )}

      {/* Metadata */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4">
          {/* Difficulty */}
          {algorithm.difficulty && (
            <div className="flex items-center space-x-1">
              <div className="flex items-center space-x-0.5">
                {getDifficultyStars(algorithm.difficulty).map((filled, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      filled ? cn(getAdaptiveClasses.semantic.warning, 'fill-current') : getAdaptiveClasses.text.tertiary
                    }`}
                  />
                ))}
              </div>
              <span className="text-adaptive-secondary">{difficultyLabel}</span>
            </div>
          )}

          {/* Move count */}
          {algorithm.moveCount && (
            <span className="text-adaptive-secondary">
              {algorithm.moveCount} moves
            </span>
          )}

          {/* Setup moves indicator for OLL/PLL */}
          {algorithm.setupMoves && (algorithm.algorithmSet === 'OLL' || algorithm.algorithmSet === 'PLL') && (
            <div className="flex items-center space-x-1">
              <Target className="w-3 h-3 text-adaptive-tertiary" />
              <span className="text-adaptive-secondary text-xs">Setup available</span>
            </div>
          )}

          {/* Execution time */}
          {algorithm.executionTimeMs && (
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3 text-adaptive-tertiary" />
              <span className="text-adaptive-secondary">
                {algorithmService.formatTime(algorithm.executionTimeMs)}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        {showActions && algorithm.usageCount > 0 && (
          <div className="flex items-center justify-center">
            <span className="text-xs text-adaptive-tertiary">
              {algorithm.usageCount}x practiced
            </span>
          </div>
        )}
      </div>

      {/* Tags */}
      {algorithm.tags && algorithm.tags.length > 0 && !compact && (
        <div className="flex flex-wrap gap-1 mt-3">
          {algorithm.tags.map((tag, index) => (
            <span
              key={index}
              className={cn('px-2 py-1 text-xs rounded-md', getAdaptiveClasses.background.tertiary, getAdaptiveClasses.text.secondary)}
            >
              {tag}
            </span>
          ))}
        </div>
      )}


    </div>
  );
};

export default AlgorithmCard;
