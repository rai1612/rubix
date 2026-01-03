import React from 'react';
import { RefreshCw, Copy, Check, Download } from 'lucide-react';
import { ScrambleDto, getPuzzleDisplayName } from '../../services/scrambleService';
import { useSettings } from '../../hooks/useSettings';
import { cn, getAdaptiveClasses, buttonVariants, cardVariants } from '../../utils/appearanceUtils';

interface ScrambleDisplayProps {
  scramble: ScrambleDto | null;
  isGenerating?: boolean;
  onGenerateNew?: () => void;
  className?: string;
}

export const ScrambleDisplay: React.FC<ScrambleDisplayProps> = ({
  scramble,
  isGenerating = false,
  onGenerateNew,
  className = ''
}) => {
  const [copied, setCopied] = React.useState(false);
  const { settings } = useSettings();
  const displaySettings = settings.display;

  const handleCopyScramble = async () => {
    if (!scramble?.scrambleText) return;

    try {
      await navigator.clipboard.writeText(scramble.scrambleText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy scramble:', error);
    }
  };

  const handleDownloadScramble = () => {
    if (!scramble) return;

    const content = `Puzzle: ${getPuzzleDisplayName(scramble.puzzleType)}
Scramble: ${scramble.scrambleText}
Moves: ${scramble.moveCount}
Generated: ${new Date(scramble.generatedAt).toLocaleString()}`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scramble-${scramble.id.substring(0, 8)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!scramble && !isGenerating) {
    return (
      <div className={cn(cardVariants.default, 'text-center', className)}>
        <p className={cn('mb-4', getAdaptiveClasses.text.tertiary)}>No scramble generated yet</p>
        {onGenerateNew && (
          <button
            onClick={onGenerateNew}
            className={buttonVariants.primary}
          >
            Generate Scramble
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <h3 className={cn('text-lg font-semibold', getAdaptiveClasses.text.primary)}>
            {scramble ? getPuzzleDisplayName(scramble.puzzleType) : 'Generating...'}
          </h3>
          {scramble && (
            <span className={cn(
              'bg-primary-100 text-xs px-2 py-1 rounded-full',
              getAdaptiveClasses.textOnPrimary.light
            )}>
              {scramble.moveCount} moves
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {scramble && (
            <>
              <button
                onClick={handleCopyScramble}
                className={cn(
                  'p-2 transition-colors',
                  getAdaptiveClasses.text.tertiary,
                  'hover:text-adaptive-secondary'
                )}
                title="Copy scramble"
              >
                {copied ? (
                  <Check className={cn('w-4 h-4', getAdaptiveClasses.semantic.success)} />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
              
              <button
                onClick={handleDownloadScramble}
                className={cn(
                  'p-2 transition-colors',
                  getAdaptiveClasses.text.tertiary,
                  'hover:text-adaptive-secondary'
                )}
                title="Download scramble"
              >
                <Download className="w-4 h-4" />
              </button>
            </>
          )}
          
          {onGenerateNew && (
            <button
              onClick={() => {
                console.log('Scramble refresh button clicked');
                onGenerateNew();
              }}
              disabled={isGenerating}
              className={cn(
                'p-2 transition-colors disabled:opacity-50',
                getAdaptiveClasses.text.tertiary,
                'hover:text-adaptive-secondary'
              )}
              title="Generate new scramble"
            >
              <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Scramble Text */}
      <div className="mb-4">
        {scramble ? (
          <div className={cn('font-mono text-lg leading-relaxed break-words', getAdaptiveClasses.text.primary)}>
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3 sm:p-4 border border-gray-200">
              <div className="flex flex-wrap gap-1 sm:gap-1.5 justify-center items-center min-h-[2.5rem] sm:min-h-[3rem]">
                {isGenerating ? (
                  <div className={cn('italic flex items-center space-x-2', getAdaptiveClasses.text.tertiary)}>
                    <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                    <span>Generating new scramble...</span>
                  </div>
                ) : (
                  displaySettings.scrambleFormat === 'multiline' ? (
                    // Multi-line format (5 moves per line)
                    (() => {
                      const moves = scramble.scrambleText.split(' ');
                      const lines = [];
                      for (let i = 0; i < moves.length; i += 5) {
                        lines.push(moves.slice(i, i + 5));
                      }
                      return (
                        <div className="space-y-2 w-full">
                          {lines.map((lineMoves, lineIndex) => (
                            <div key={lineIndex} className="flex flex-wrap gap-1 sm:gap-1.5 justify-center">
                              {lineMoves.map((move, moveIndex) => (
                                <span
                                  key={`${scramble.id}-${lineIndex}-${moveIndex}`}
                                  className="bg-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-md border border-gray-300 text-center font-bold text-adaptive-primary shadow-sm min-w-[2.5rem] sm:min-w-[3rem] transition-all duration-150 hover:bg-primary-50 hover:border-primary-300 hover:shadow-md select-none text-sm sm:text-base"
                                  style={{
                                    fontFamily: 'JetBrains Mono, Consolas, monospace'
                                  }}
                                >
                                  {move}
                                </span>
                              ))}
                            </div>
                          ))}
                        </div>
                      );
                    })()
                  ) : (
                    // Single line format (default)
                    scramble.scrambleText.split(' ').map((move, index) => (
                      <span
                        key={`${scramble.id}-${index}`}
                        className="bg-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-md border border-gray-300 text-center font-bold text-adaptive-primary shadow-sm min-w-[2.5rem] sm:min-w-[3rem] transition-all duration-150 hover:bg-primary-50 hover:border-primary-300 hover:shadow-md select-none text-sm sm:text-base"
                        style={{
                          fontFamily: 'JetBrains Mono, Consolas, monospace'
                        }}
                      >
                        {move}
                      </span>
                    ))
                  )
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-100 rounded-lg p-4 text-center text-adaptive-tertiary">
            No scramble available
          </div>
        )}
      </div>

      {/* Metadata */}
      {scramble && (
        <div className="flex items-center justify-between text-sm text-adaptive-tertiary border-t pt-4">
          <div className="flex items-center space-x-4">
            <span>
              Generated: {new Date(scramble.generatedAt).toLocaleTimeString()}
            </span>
            {scramble.isCustom && scramble.createdByUsername && (
              <span>
                By: {scramble.createdByUsername}
              </span>
            )}
            {scramble.difficultyRating && (
              <span className="flex items-center">
                Difficulty: 
                <span className="ml-1 flex">
                  {Array.from({ length: 5 }, (_, i) => (
                    <span
                      key={i}
                      className={`text-xs ${
                        i < scramble.difficultyRating! 
                          ? getAdaptiveClasses.semantic.warning 
                          : getAdaptiveClasses.text.tertiary
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </span>
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {scramble.isCustom && (
              <span className={cn('text-xs px-2 py-1 rounded-full', getAdaptiveClasses.backgroundSemantic.info, getAdaptiveClasses.semantic.info)}>
                Custom
              </span>
            )}
            <span className="text-xs text-adaptive-tertiary">
              ID: {scramble.id.substring(0, 8)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScrambleDisplay;
