import React from 'react';
import { Plus, X, RotateCcw, Settings } from 'lucide-react';
import { TimerResult, PenaltyType, formatTimeWithPenalty } from '../../utils/timerUtils';
import { cn, getAdaptiveClasses, buttonVariants } from '../../utils/appearanceUtils';

interface TimerControlsProps {
  lastResult: TimerResult | null;
  onAddPenalty: (penalty: PenaltyType) => void;
  onRemovePenalty: () => void;
  onReset: () => void;
  onOpenSettings?: () => void;
  disabled?: boolean;
  precision?: number;
  className?: string;
}

export const TimerControls: React.FC<TimerControlsProps> = ({
  lastResult,
  onAddPenalty,
  onRemovePenalty,
  onReset,
  onOpenSettings,
  disabled = false,
  precision = 2,
  className = ''
}) => {
  const hasPenalty = lastResult?.penalty !== PenaltyType.NONE;
  const isDNF = lastResult?.penalty === PenaltyType.DNF;
  const isPlusTwo = lastResult?.penalty === PenaltyType.PLUS_TWO;

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      {/* Last Result Display */}
      {lastResult && (
        <div className="text-center">
          <div className="text-2xl font-mono font-bold text-adaptive-primary mb-2">
            {formatTimeWithPenalty(lastResult, precision)}
          </div>
          {lastResult.inspectionTime > 0 && (
            <div className="text-sm text-adaptive-tertiary">
              Inspection: {(lastResult.inspectionTime / 1000).toFixed(1)}s
            </div>
          )}
        </div>
      )}

      {/* Penalty Controls */}
      {lastResult && (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onAddPenalty(PenaltyType.PLUS_TWO)}
            disabled={disabled || isPlusTwo || isDNF}
            className={`
              flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors
              ${isPlusTwo 
                ? 'bg-orange-100 text-orange-800 border border-orange-200' 
                : cn(getAdaptiveClasses.background.tertiary, 'hover:' + getAdaptiveClasses.backgroundSemantic.warning.replace('bg-', ''), getAdaptiveClasses.text.primary, 'hover:' + getAdaptiveClasses.semantic.warning.replace('text-', ''), getAdaptiveClasses.border.primary)
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
            title="Add +2 penalty"
          >
            <Plus className="w-4 h-4" />
            <span>+2</span>
          </button>

          <button
            onClick={() => onAddPenalty(PenaltyType.DNF)}
            disabled={disabled || isDNF}
            className={`
              flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors
              ${isDNF 
                ? cn(getAdaptiveClasses.backgroundSemantic.error, 'text-on-primary', 'border border-error')
                : cn(getAdaptiveClasses.background.tertiary, 'hover:' + getAdaptiveClasses.backgroundSemantic.error.replace('bg-', ''), getAdaptiveClasses.text.primary, 'hover:' + getAdaptiveClasses.semantic.error.replace('text-', ''), getAdaptiveClasses.border.primary)
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
            title="Mark as DNF (Did Not Finish)"
          >
            <X className="w-4 h-4" />
            <span>DNF</span>
          </button>

          {hasPenalty && (
            <button
              onClick={onRemovePenalty}
              disabled={disabled}
              className={cn('flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed', getAdaptiveClasses.background.tertiary, 'hover:' + getAdaptiveClasses.backgroundSemantic.success.replace('bg-', ''), getAdaptiveClasses.text.primary, 'hover:' + getAdaptiveClasses.semantic.success.replace('text-', ''), getAdaptiveClasses.border.primary)}
              title="Remove penalty"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Clear</span>
            </button>
          )}
        </div>
      )}

      {/* Action Controls */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onReset}
          disabled={disabled}
          className={cn(buttonVariants.secondary, 'flex items-center space-x-2')}
          title="Reset timer (R key)"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset</span>
        </button>

        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            disabled={disabled}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-on-primary rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Timer settings"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        )}
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="text-xs text-adaptive-tertiary text-center space-y-1">
        <div>
          <kbd className="px-1 py-0.5 bg-adaptive-tertiary rounded text-xs">SPACE</kbd> - Start/Stop timer
        </div>
        <div>
          <kbd className="px-1 py-0.5 bg-adaptive-tertiary rounded text-xs">R</kbd> - Reset • 
          <kbd className="px-1 py-0.5 bg-adaptive-tertiary rounded text-xs">2</kbd> - +2 penalty • 
          <kbd className="px-1 py-0.5 bg-adaptive-tertiary rounded text-xs">D</kbd> - DNF • 
          <kbd className="px-1 py-0.5 bg-adaptive-tertiary rounded text-xs">C</kbd> - Clear penalty
        </div>
      </div>
    </div>
  );
};

export default TimerControls;
