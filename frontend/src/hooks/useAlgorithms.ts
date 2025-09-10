import { useState, useEffect, useCallback } from 'react';
import { 
  algorithmService, 
  Algorithm, 
  AlgorithmSetSummary, 
  AlgorithmSet, 
  SearchResponse,
  SearchStats,
  CreateAlgorithm 
} from '../services/algorithmService';
import { algorithmBelongsToGroup } from '../utils/algorithmGroups';

// Hook for managing all algorithms
export const useAlgorithms = () => {
  const [algorithms, setAlgorithms] = useState<Algorithm[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAlgorithms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await algorithmService.getAllAlgorithms();
      setAlgorithms(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch algorithms');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlgorithms();
  }, [fetchAlgorithms]);

  return { algorithms, loading, error, refetch: fetchAlgorithms };
};

// Hook for managing algorithms by set
export const useAlgorithmsBySet = (algorithmSet?: AlgorithmSet) => {
  const [algorithms, setAlgorithms] = useState<Algorithm[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAlgorithmsBySet = useCallback(async (set: AlgorithmSet) => {
    setLoading(true);
    setError(null);
    try {
      const data = await algorithmService.getAlgorithmsBySet(set);
      setAlgorithms(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch algorithms');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (algorithmSet) {
      fetchAlgorithmsBySet(algorithmSet);
    }
  }, [algorithmSet, fetchAlgorithmsBySet]);

  return { 
    algorithms, 
    loading, 
    error, 
    refetch: algorithmSet ? () => fetchAlgorithmsBySet(algorithmSet) : () => {}
  };
};

// Hook for searching algorithms
export const useAlgorithmSearch = () => {
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (
    query: string = '',
    algorithmSet?: AlgorithmSet,
    page: number = 0,
    size: number = 20
  ) => {
    setLoading(true);
    setError(null);
    try {
      const data = await algorithmService.searchAlgorithms(query, algorithmSet, page, size);
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search algorithms');
    } finally {
      setLoading(false);
    }
  }, []);

  const searchAdvanced = useCallback(async (params: {
    query?: string;
    algorithmSet?: AlgorithmSet;
    difficulty?: number;
    favoriteOnly?: boolean;
    sortBy?: string;
    sortOrder?: string;
    minMoveCount?: number;
    maxMoveCount?: number;
    tags?: string;
    algorithmGroup?: string;
    page?: number;
    size?: number;
  }) => {
    setLoading(true);
    setError(null);
    try {
      // Extract algorithmGroup from params for frontend filtering
      const { algorithmGroup, ...backendParams } = params;
      
      // If group filtering is requested, we need to get ALL algorithms for that set first
      if (algorithmGroup && algorithmGroup !== '' && backendParams.algorithmSet) {
        console.log('=== GROUP FILTERING DEBUG ===');
        console.log('Selected group:', algorithmGroup);
        console.log('Algorithm set:', backendParams.algorithmSet);
        
        // Get ALL algorithms for this set (no pagination limit)
        const allAlgorithmsData = await algorithmService.searchAlgorithmsAdvanced({
          ...backendParams,
          page: 0,
          size: 1000 // Get a large number to ensure we get all algorithms
        });
        
        console.log('Total algorithms fetched for filtering:', allAlgorithmsData.content.length);
        console.log('Sample algorithm:', allAlgorithmsData.content[0]);
        
        const filteredContent = allAlgorithmsData.content.filter(algorithm => {
          const belongs = algorithmBelongsToGroup(algorithm, algorithmGroup, backendParams.algorithmSet || null);
          if (algorithm.caseNumber) {
            console.log(`Algorithm "${algorithm.name}" (case ${algorithm.caseNumber}) belongs to group "${algorithmGroup}":`, belongs);
          }
          return belongs;
        });
        
        console.log('Filtered algorithms count:', filteredContent.length);
        console.log('Filtered algorithms:', filteredContent.map(a => ({ name: a.name, caseNumber: a.caseNumber })));
        
        // Apply pagination to the filtered results
        const startIndex = (params.page || 0) * (params.size || 20);
        const endIndex = startIndex + (params.size || 20);
        const paginatedContent = filteredContent.slice(startIndex, endIndex);
        
        // Update the response with filtered and paginated results
        const filteredData: SearchResponse = {
          ...allAlgorithmsData,
          content: paginatedContent,
          totalElements: filteredContent.length,
          totalPages: Math.ceil(filteredContent.length / (params.size || 20)),
          number: params.page || 0,
          size: params.size || 20,
          first: (params.page || 0) === 0,
          last: endIndex >= filteredContent.length
        };
        
        setResults(filteredData);
      } else {
        // No group filtering, use normal backend search
        const data = await algorithmService.searchAlgorithmsAdvanced(backendParams);
        setResults(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search algorithms');
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setResults(null);
    setError(null);
  }, []);

  return { results, loading, error, search, searchAdvanced, clear };
};

// Hook for popular algorithms
export const usePopularAlgorithms = (limit: number = 10) => {
  const [algorithms, setAlgorithms] = useState<Algorithm[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPopularAlgorithms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await algorithmService.getPopularAlgorithms(limit);
      setAlgorithms(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch popular algorithms');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchPopularAlgorithms();
  }, [fetchPopularAlgorithms]);

  return { algorithms, loading, error, refetch: fetchPopularAlgorithms };
};

// Hook for single algorithm
export const useAlgorithm = (id?: string) => {
  const [algorithm, setAlgorithm] = useState<Algorithm | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAlgorithm = useCallback(async (algorithmId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await algorithmService.getAlgorithmById(algorithmId);
      setAlgorithm(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch algorithm');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id) {
      fetchAlgorithm(id);
    }
  }, [id, fetchAlgorithm]);

  return { algorithm, loading, error, refetch: id ? () => fetchAlgorithm(id) : () => {} };
};

// Hook for managing favorite algorithms
export const useFavoriteAlgorithms = () => {
  const [algorithms, setAlgorithms] = useState<Algorithm[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFavorites = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await algorithmService.getFavoriteAlgorithms();
      setAlgorithms(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch favorite algorithms');
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleFavorite = useCallback(async (id: string) => {
    try {
      await algorithmService.toggleFavorite(id);
      fetchFavorites(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle favorite');
    }
  }, [fetchFavorites]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  return { algorithms, loading, error, toggleFavorite, refetch: fetchFavorites };
};

// Hook for algorithm set summaries
export const useAlgorithmSetSummaries = () => {
  const [summaries, setSummaries] = useState<AlgorithmSetSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummaries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await algorithmService.getAlgorithmSetSummaries();
      setSummaries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch algorithm summaries');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummaries();
  }, [fetchSummaries]);

  return { summaries, loading, error, refetch: fetchSummaries };
};

// Hook for managing algorithm CRUD operations
export const useAlgorithmMutations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createAlgorithm = useCallback(async (algorithm: CreateAlgorithm): Promise<Algorithm | null> => {
    setLoading(true);
    setError(null);
    try {
      const created = await algorithmService.createAlgorithm(algorithm);
      return created;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create algorithm');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAlgorithm = useCallback(async (id: string, algorithm: CreateAlgorithm): Promise<Algorithm | null> => {
    setLoading(true);
    setError(null);
    try {
      const updated = await algorithmService.updateAlgorithm(id, algorithm);
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update algorithm');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteAlgorithm = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await algorithmService.deleteAlgorithm(id);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete algorithm');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleFavorite = useCallback(async (id: string): Promise<Algorithm | null> => {
    setLoading(true);
    setError(null);
    try {
      const updated = await algorithmService.toggleFavorite(id);
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle favorite');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const practiceAlgorithm = useCallback(async (id: string, practiceData?: {
    executionTimeMs: number;
    isPersonalBest: boolean;
    practiceDate: string;
  }): Promise<Algorithm | null> => {
    setLoading(true);
    setError(null);
    try {
      const updated = await algorithmService.practiceAlgorithm(id, practiceData);
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to practice algorithm');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    createAlgorithm,
    updateAlgorithm,
    deleteAlgorithm,
    toggleFavorite,
    practiceAlgorithm,
    clearError
  };
};

// Hook for filtering and sorting algorithms
export const useAlgorithmFilters = (algorithms: Algorithm[]) => {
  const [filteredAlgorithms, setFilteredAlgorithms] = useState<Algorithm[]>([]);
  const [filters, setFilters] = useState({
    query: '',
    algorithmSet: null as AlgorithmSet | null,
    difficulty: null as number | null,
    favoriteOnly: false,
    sortBy: 'name' as 'name' | 'difficulty' | 'moveCount' | 'usageCount' | 'createdAt',
    sortOrder: 'asc' as 'asc' | 'desc'
  });

  useEffect(() => {
    let filtered = [...algorithms];

    // Apply text search
    if (filters.query) {
      const query = filters.query.toLowerCase();
      filtered = filtered.filter(alg => 
        alg.name.toLowerCase().includes(query) ||
        alg.notationString.toLowerCase().includes(query) ||
        alg.caseDescription?.toLowerCase().includes(query) ||
        alg.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply algorithm set filter
    if (filters.algorithmSet) {
      filtered = filtered.filter(alg => alg.algorithmSet === filters.algorithmSet);
    }

    // Apply difficulty filter
    if (filters.difficulty !== null) {
      filtered = filtered.filter(alg => alg.difficulty === filters.difficulty);
    }

    // Apply favorite filter
    if (filters.favoriteOnly) {
      filtered = filtered.filter(alg => alg.isFavorite);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[filters.sortBy];
      let bValue: any = b[filters.sortBy];

      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      // Handle string comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredAlgorithms(filtered);
  }, [algorithms, filters]);

  const updateFilters = useCallback((newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      query: '',
      algorithmSet: null,
      difficulty: null,
      favoriteOnly: false,
      sortBy: 'name',
      sortOrder: 'asc'
    });
  }, []);

  return {
    filteredAlgorithms,
    filters,
    updateFilters,
    clearFilters
  };
};

// Hook for search suggestions
export const useSearchSuggestions = () => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSuggestions = useCallback(async (query: string, limit: number = 10) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await algorithmService.getSearchSuggestions(query, limit);
      setSuggestions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get suggestions');
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setSuggestions([]);
    setError(null);
  }, []);

  return { suggestions, loading, error, getSuggestions, clear };
};

// Hook for search statistics
export const useSearchStats = () => {
  const [stats, setStats] = useState<SearchStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await algorithmService.getSearchStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch search stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
};

// Hook for most used tags
export const useMostUsedTags = (limit: number = 20) => {
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTags = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await algorithmService.getMostUsedTags(limit);
      setTags(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tags');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  return { tags, loading, error, refetch: fetchTags };
};

// Hook for similar algorithms
export const useSimilarAlgorithms = (algorithmId?: string, limit: number = 5) => {
  const [algorithms, setAlgorithms] = useState<Algorithm[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSimilar = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await algorithmService.getSimilarAlgorithms(id, limit);
      setAlgorithms(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch similar algorithms');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    if (algorithmId) {
      fetchSimilar(algorithmId);
    }
  }, [algorithmId, fetchSimilar]);

  return { 
    algorithms, 
    loading, 
    error, 
    refetch: algorithmId ? () => fetchSimilar(algorithmId) : () => {} 
  };
};
