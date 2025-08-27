import React from 'react';
import { RefreshCw, Copy, Check, Download } from 'lucide-react';
import { ScrambleDto, formatScramble, getPuzzleDisplayName } from '../../services/scrambleService';

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
      <div className={`bg-gray-50 rounded-lg p-6 text-center ${className}`}>
        <p className="text-gray-500 mb-4">No scramble generated yet</p>
        {onGenerateNew && (
          <button
            onClick={onGenerateNew}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
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
          <h3 className="text-lg font-semibold text-gray-900">
            {scramble ? getPuzzleDisplayName(scramble.puzzleType) : 'Generating...'}
          </h3>
          {scramble && (
            <span className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
              {scramble.moveCount} moves
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {scramble && (
            <>
              <button
                onClick={handleCopyScramble}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Copy scramble"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
              
              <button
                onClick={handleDownloadScramble}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Download scramble"
              >
                <Download className="w-4 h-4" />
              </button>
            </>
          )}
          
          {onGenerateNew && (
            <button
              onClick={onGenerateNew}
              disabled={isGenerating}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
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
          <div className="font-mono text-lg leading-relaxed text-gray-800 break-words">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3 sm:p-4 border border-gray-200">
              <div className="flex flex-wrap gap-1 sm:gap-1.5 justify-center items-center min-h-[2.5rem] sm:min-h-[3rem]">
                {isGenerating ? (
                  <div className="text-gray-500 italic flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                    <span>Generating new scramble...</span>
                  </div>
                ) : (
                  scramble.scrambleText.split(' ').map((move, index) => (
                    <span
                      key={`${scramble.id}-${index}`}
                      className="bg-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-md border border-gray-300 text-center font-bold text-gray-900 shadow-sm min-w-[2.5rem] sm:min-w-[3rem] transition-all duration-150 hover:bg-primary-50 hover:border-primary-300 hover:shadow-md select-none text-sm sm:text-base"
                      style={{
                        fontFamily: 'JetBrains Mono, Consolas, monospace'
                      }}
                    >
                      {move}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-100 rounded-lg p-4 text-center text-gray-500">
            No scramble available
          </div>
        )}
      </div>

      {/* Metadata */}
      {scramble && (
        <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-4">
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
                          ? 'text-yellow-400' 
                          : 'text-gray-300'
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
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                Custom
              </span>
            )}
            <span className="text-xs text-gray-400">
              ID: {scramble.id.substring(0, 8)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScrambleDisplay;
