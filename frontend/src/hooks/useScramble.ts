import { useState, useCallback, useEffect } from 'react';
import { 
  ScrambleService, 
  ScrambleDto, 
  PuzzleType, 
  ClientScrambleGenerator 
} from '../services/scrambleService';

interface UseScrambleOptions {
  puzzleType?: PuzzleType;
  autoGenerate?: boolean;
  enableOffline?: boolean;
}

interface UseScrambleReturn {
  scramble: ScrambleDto | null;
  isGenerating: boolean;
  error: string | null;
  generateScramble: () => Promise<void>;
  generateOfflineScramble: () => void;
  validateScramble: (scrambleText: string) => Promise<boolean>;
  clearError: () => void;
}

export const useScramble = (options: UseScrambleOptions = {}): UseScrambleReturn => {
  const {
    puzzleType = PuzzleType.CUBE_3X3,
    autoGenerate = false,
    enableOffline = true
  } = options;

  const [scramble, setScramble] = useState<ScrambleDto | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateScramble = useCallback(async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const newScramble = await ScrambleService.generateScramble(puzzleType);
      setScramble(newScramble);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate scramble';
      setError(errorMessage);
      
      // Fallback to offline generation if enabled
      if (enableOffline) {
        try {
          generateOfflineScramble();
          setError(null); // Clear error if offline generation succeeds
        } catch (offlineErr) {
          console.error('Offline scramble generation failed:', offlineErr);
        }
      }
    } finally {
      setIsGenerating(false);
    }
  }, [puzzleType, enableOffline]);

  const generateOfflineScramble = useCallback(() => {
    try {
      const offlineScrambleText = ClientScrambleGenerator.generateOfflineScramble(puzzleType);
      
      // Create a scramble-like object for offline use
      const offlineScramble: ScrambleDto = {
        id: `offline-${Date.now()}`,
        scrambleText: offlineScrambleText,
        puzzleType,
        algorithmMoves: offlineScrambleText.split(' ').length,
        moveCount: offlineScrambleText.split(' ').length,
        generatedAt: new Date().toISOString(),
        isCustom: false
      };
      
      setScramble(offlineScramble);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate offline scramble';
      setError(errorMessage);
    }
  }, [puzzleType]);

  const validateScramble = useCallback(async (scrambleText: string): Promise<boolean> => {
    try {
      const result = await ScrambleService.validateScramble({
        scrambleText,
        puzzleType
      });
      return result.valid;
    } catch (err) {
      console.error('Scramble validation failed:', err);
      return false;
    }
  }, [puzzleType]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-generate scramble on mount or puzzle type change
  useEffect(() => {
    if (autoGenerate) {
      generateScramble();
    }
  }, [autoGenerate, generateScramble]);

  return {
    scramble,
    isGenerating,
    error,
    generateScramble,
    generateOfflineScramble,
    validateScramble,
    clearError
  };
};

// Hook for managing recent scrambles
export const useRecentScrambles = (puzzleType: PuzzleType = PuzzleType.CUBE_3X3, limit: number = 10) => {
  const [scrambles, setScrambles] = useState<ScrambleDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecentScrambles = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const recentScrambles = await ScrambleService.getRecentScrambles(puzzleType, limit);
      setScrambles(recentScrambles);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch recent scrambles';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [puzzleType, limit]);

  useEffect(() => {
    fetchRecentScrambles();
  }, [fetchRecentScrambles]);

  return {
    scrambles,
    isLoading,
    error,
    refetch: fetchRecentScrambles
  };
};

// Hook for offline scramble cache
export const useOfflineScrambleCache = (puzzleType: PuzzleType = PuzzleType.CUBE_3X3) => {
  const [cachedScrambles, setCachedScrambles] = useState<ScrambleDto[]>([]);

  const generateAndCacheScrambles = useCallback((count: number = 10) => {
    const newScrambles: ScrambleDto[] = [];
    
    for (let i = 0; i < count; i++) {
      try {
        const scrambleText = ClientScrambleGenerator.generateOfflineScramble(puzzleType);
        const scramble: ScrambleDto = {
          id: `offline-cache-${Date.now()}-${i}`,
          scrambleText,
          puzzleType,
          algorithmMoves: scrambleText.split(' ').length,
          moveCount: scrambleText.split(' ').length,
          generatedAt: new Date().toISOString(),
          isCustom: false
        };
        newScrambles.push(scramble);
      } catch (err) {
        console.error('Failed to generate cached scramble:', err);
      }
    }
    
    setCachedScrambles(prev => [...newScrambles, ...prev].slice(0, 50)); // Keep max 50 cached
  }, [puzzleType]);

  const getNextCachedScramble = useCallback((): ScrambleDto | null => {
    if (cachedScrambles.length === 0) return null;
    
    const [nextScramble, ...remaining] = cachedScrambles;
    setCachedScrambles(remaining);
    
    // Generate more if running low
    if (remaining.length < 3) {
      generateAndCacheScrambles(10);
    }
    
    return nextScramble;
  }, [cachedScrambles, generateAndCacheScrambles]);

  // Initialize cache
  useEffect(() => {
    if (cachedScrambles.length === 0) {
      generateAndCacheScrambles(10);
    }
  }, [generateAndCacheScrambles, cachedScrambles.length]);

  return {
    cachedCount: cachedScrambles.length,
    getNextCachedScramble,
    generateAndCacheScrambles
  };
};

export default useScramble;
