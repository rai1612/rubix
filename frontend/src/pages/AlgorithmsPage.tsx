import React, { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import AlgorithmCard from '../components/algorithms/AlgorithmCard';
import AlgorithmSetCard from '../components/algorithms/AlgorithmSetCard';
import AlgorithmSearch from '../components/algorithms/AlgorithmSearch';
import SearchAnalytics from '../components/algorithms/SearchAnalytics';
import AlgorithmPracticeMode from '../components/algorithms/AlgorithmPracticeMode';
import AlgorithmTrainer from '../components/algorithms/AlgorithmTrainer';
import Pagination from '../components/common/Pagination';
import { 
  useAlgorithmSetSummaries, 
  usePopularAlgorithms, 
  useAlgorithmSearch,
  useAlgorithmMutations 
} from '../hooks/useAlgorithms';
import { Algorithm, AlgorithmSetSummary, AlgorithmSet } from '../services/algorithmService';
import { cn, getAdaptiveClasses } from '../utils/appearanceUtils';

const AlgorithmsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedSet, setSelectedSet] = useState<AlgorithmSet | null>(null);
  const [viewMode, setViewMode] = useState<'sets' | 'search' | 'favorites' | 'practice' | 'trainer'>('sets');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [currentFilters, setCurrentFilters] = useState<any>(null);
  const [selectedPracticeAlgorithm, setSelectedPracticeAlgorithm] = useState<Algorithm | null>(null);
  const [trainerAlgorithms, setTrainerAlgorithms] = useState<Algorithm[]>([]);

  // Hooks
  const { summaries, loading: summariesLoading, error: summariesError } = useAlgorithmSetSummaries();
  const { algorithms: popularAlgorithms, loading: popularLoading, error: popularError, refetch: refetchPopularAlgorithms } = usePopularAlgorithms(6);
  const { results: searchResults, loading: searchLoading, searchAdvanced, clear: clearSearch } = useAlgorithmSearch();
  const { toggleFavorite, practiceAlgorithm } = useAlgorithmMutations();

  // Handle URL parameters (from search results and back navigation)
  useEffect(() => {
    const setParam = searchParams.get('set');
    
    if (setParam && setParam !== selectedSet) {
      // Navigate to the specified set
      setSelectedSet(setParam as AlgorithmSet);
      const filters = {
        query: '',
        algorithmSet: setParam as AlgorithmSet,
        difficulty: undefined,
        favoriteOnly: false,
        sortBy: 'name',
        sortOrder: 'asc',
        minMoveCount: undefined,
        maxMoveCount: undefined,
        tags: undefined
      };
      setCurrentFilters(filters);
      setCurrentPage(0);
      searchAdvanced({
        ...filters,
        page: 0,
        size: pageSize
      });
      setViewMode('search');
      
      // Clear the URL parameter after handling it
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('set');
      setSearchParams(newSearchParams, { replace: true });
    }
  }, [searchParams, searchAdvanced, pageSize, setSearchParams, selectedSet]);

  // Handlers
  const handleSearch = useCallback((filters: any) => {
    const hasActiveFilters = filters.query || filters.algorithmSet || filters.difficulty || 
                           filters.favoriteOnly || filters.minMoveCount || filters.maxMoveCount || filters.tags || filters.algorithmGroup;
    
    setCurrentFilters(filters);
    setCurrentPage(0); // Reset to first page on new search
    
    if (hasActiveFilters) {
      searchAdvanced({
        query: filters.query || '',
        algorithmSet: filters.algorithmSet || undefined,
        difficulty: filters.difficulty || undefined,
        favoriteOnly: filters.favoriteOnly || false,
        sortBy: filters.sortBy || 'name',
        sortOrder: filters.sortOrder || 'asc',
        minMoveCount: filters.minMoveCount || undefined,
        maxMoveCount: filters.maxMoveCount || undefined,
        tags: filters.tags || undefined,
        algorithmGroup: filters.algorithmGroup || undefined,
        page: 0,
        size: pageSize
      });
      setViewMode('search');
    } else {
      clearSearch();
      setViewMode('sets');
      setCurrentFilters(null);
    }
  }, [searchAdvanced, clearSearch, pageSize]);

  const handleSetClick = useCallback((summary: AlgorithmSetSummary) => {
    setSelectedSet(summary.algorithmSet);
    const filters = {
      query: '',
      algorithmSet: summary.algorithmSet,
      difficulty: undefined,
      favoriteOnly: false,
      sortBy: 'name',
      sortOrder: 'asc',
      minMoveCount: undefined,
      maxMoveCount: undefined,
      tags: undefined
    };
    setCurrentFilters(filters);
    setCurrentPage(0);
    searchAdvanced({
      ...filters,
      page: 0,
      size: pageSize
    });
    setViewMode('search');
  }, [searchAdvanced, pageSize]);

  const handleAlgorithmFavorite = useCallback(async (algorithm: Algorithm) => {
    console.log('handleAlgorithmFavorite called for:', algorithm.id, 'Current favorite:', algorithm.isFavorite);
    try {
      const updatedAlgorithm = await toggleFavorite(algorithm.id);
      console.log('toggleFavorite returned:', updatedAlgorithm);
      if (updatedAlgorithm) {
        // Refresh current view to show updated favorite status
        if (viewMode === 'search' && currentFilters) {
          console.log('Refetching search results...');
          // Refetch search results to show updated favorite status
          searchAdvanced({
            ...currentFilters,
            page: currentPage,
            size: pageSize
          });
        } else {
          console.log('Refetching popular algorithms...');
          // Refetch popular algorithms to show updated favorite status
          refetchPopularAlgorithms();
        }
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  }, [toggleFavorite, viewMode, currentFilters, searchAdvanced, currentPage, pageSize, refetchPopularAlgorithms]);



  const handleExitPracticeMode = useCallback(() => {
    setSelectedPracticeAlgorithm(null);
    setViewMode('sets');
  }, []);

  const handleStartTrainer = useCallback((algorithms: Algorithm[]) => {
    setTrainerAlgorithms(algorithms);
    setViewMode('trainer');
  }, []);

  const handleExitTrainer = useCallback(() => {
    setTrainerAlgorithms([]);
    // If we have a selected set, return to that set's view, otherwise go to main sets
    if (selectedSet) {
      // Ensure we have the correct search results for this category
      if (!searchResults || searchResults.content.length === 0) {
        const filters = {
          query: '',
          algorithmSet: selectedSet,
          difficulty: undefined,
          favoriteOnly: false,
          sortBy: 'name',
          sortOrder: 'asc',
          minMoveCount: undefined,
          maxMoveCount: undefined,
          tags: undefined
        };
        setCurrentFilters(filters);
        setCurrentPage(0);
        searchAdvanced({
          ...filters,
          page: 0,
          size: pageSize
        });
      }
      setViewMode('search');
    } else {
      setViewMode('sets');
    }
  }, [selectedSet, searchResults, searchAdvanced, pageSize]);

  const handlePracticeComplete = useCallback(async (algorithm: Algorithm, practiceTime: number) => {
    // Mark algorithm as practiced and record the time
    await practiceAlgorithm(algorithm.id);
    // Could also save practice session data in the future
    console.log(`Practice completed for ${algorithm.name} in ${practiceTime}ms`);
  }, [practiceAlgorithm]);

  const handleBackToSets = useCallback(() => {
    setSelectedSet(null);
    setViewMode('sets');
    setCurrentPage(0);
    setCurrentFilters(null);
    clearSearch();
  }, [clearSearch]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    
    if (currentFilters) {
      searchAdvanced({
        query: currentFilters.query || '',
        algorithmSet: currentFilters.algorithmSet || undefined,
        difficulty: currentFilters.difficulty || undefined,
        favoriteOnly: currentFilters.favoriteOnly || false,
        sortBy: currentFilters.sortBy || 'name',
        sortOrder: currentFilters.sortOrder || 'asc',
        minMoveCount: currentFilters.minMoveCount || undefined,
        maxMoveCount: currentFilters.maxMoveCount || undefined,
        tags: currentFilters.tags || undefined,
        algorithmGroup: currentFilters.algorithmGroup || undefined,
        page: page,
        size: pageSize
      });
    }
  }, [currentFilters, searchAdvanced, pageSize]);

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(0); // Reset to first page when changing page size
    
    if (currentFilters) {
      searchAdvanced({
        query: currentFilters.query || '',
        algorithmSet: currentFilters.algorithmSet || undefined,
        difficulty: currentFilters.difficulty || undefined,
        favoriteOnly: currentFilters.favoriteOnly || false,
        sortBy: currentFilters.sortBy || 'name',
        sortOrder: currentFilters.sortOrder || 'asc',
        minMoveCount: currentFilters.minMoveCount || undefined,
        maxMoveCount: currentFilters.maxMoveCount || undefined,
        tags: currentFilters.tags || undefined,
        algorithmGroup: currentFilters.algorithmGroup || undefined,
        page: 0,
        size: size
      });
    }
  }, [currentFilters, searchAdvanced]);

  // Error rendering
  const renderError = (error: string) => (
    <div className="bg-error border border-error rounded-lg p-4 flex items-center space-x-3">
      <AlertCircle className={cn('w-5 h-5 flex-shrink-0', getAdaptiveClasses.semantic.error)} />
      <div>
        <h3 className={cn('text-sm font-medium', getAdaptiveClasses.semantic.error)}>Error loading data</h3>
        <p className={cn('text-sm', getAdaptiveClasses.semantic.error)}>{error}</p>
      </div>
    </div>
  );

  // If in practice mode, show only the practice component
  if (viewMode === 'practice' && selectedPracticeAlgorithm) {
    return (
      <AlgorithmPracticeMode
        algorithm={selectedPracticeAlgorithm}
        onExit={handleExitPracticeMode}
        onPracticeComplete={handlePracticeComplete}
      />
    );
  }

  // If in trainer mode, show only the trainer component
  if (viewMode === 'trainer' && trainerAlgorithms.length > 0) {
    return (
      <AlgorithmTrainer
        algorithms={trainerAlgorithms}
        onExit={handleExitTrainer}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-adaptive-primary mb-2">
            {selectedSet ? `${selectedSet} Algorithms` : 'Algorithms'}
          </h1>
          <p className="text-adaptive-secondary">
            {selectedSet 
              ? `Learn and practice ${selectedSet} algorithms`
              : 'Learn and practice essential speedcubing algorithms'
            }
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {selectedSet && (
            <button
              onClick={handleBackToSets}
              className="px-4 py-2 text-adaptive-secondary hover:text-adaptive-primary border border-adaptive-primary rounded-lg hover:bg-adaptive-tertiary transition-colors"
            >
              ← Back to Sets
            </button>
          )}
          
          {/* Trainer Mode Button */}
          {searchResults && searchResults.content.length > 0 && (
            <button
              onClick={() => handleStartTrainer(searchResults.content)}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-on-primary rounded-lg transition-colors"
            >
              🎯 Category Trainer
            </button>
          )}
          
          {/* Quick Practice with popular algorithms */}
          {viewMode === 'sets' && popularAlgorithms.length > 0 && (
            <button
              onClick={() => handleStartTrainer(popularAlgorithms)}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-on-primary rounded-lg transition-colors"
            >
              🚀 Quick Practice
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <AlgorithmSearch 
        onSearch={handleSearch}
        loading={searchLoading}
        showAdvancedFilters={true}
      />

      {/* Content based on view mode */}
      {viewMode === 'sets' && (
        <>
          {/* Navigation Breadcrumb */}
          <div className="flex items-center space-x-2 mb-6 text-sm">
            <span className="text-adaptive-primary font-medium">Home</span>
            <span className="text-adaptive-tertiary">›</span>
            <span className="text-adaptive-secondary">Algorithm Sets & Popular</span>
          </div>

          {/* Algorithm Sets */}
          <div>
            <h2 className="text-xl font-semibold text-adaptive-primary mb-6">Algorithm Sets</h2>
            
            {summariesError && renderError(summariesError)}
            
            {summariesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-adaptive-tertiary rounded-lg h-48 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {summaries.map((summary) => (
                  <AlgorithmSetCard
                    key={summary.algorithmSet}
                    summary={summary}
                    onClick={handleSetClick}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Popular Algorithms */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-adaptive-primary">Popular Algorithms</h2>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => {
                    const filters = {
                      query: '',
                      algorithmSet: undefined,
                      difficulty: undefined,
                      favoriteOnly: false,
                      sortBy: 'name',
                      sortOrder: 'asc',
                      minMoveCount: undefined,
                      maxMoveCount: undefined,
                      tags: undefined
                    };
                    setCurrentFilters(filters);
                    setCurrentPage(0);
                    searchAdvanced({
                      ...filters,
                      page: 0,
                      size: pageSize
                    });
                    setViewMode('search');
                  }}
                  className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                >
                  View all algorithms
                </button>
              </div>
            </div>
            
            {popularError && renderError(popularError)}
            
            {popularLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-adaptive-tertiary rounded-lg h-32 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {popularAlgorithms.map((algorithm) => (
                  <AlgorithmCard
                    key={algorithm.id}
                    algorithm={algorithm}
                    onFavoriteToggle={handleAlgorithmFavorite}
                    compact={true}
                    clickable={true}
                    currentSet={selectedSet || undefined}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {viewMode === 'search' && (
        <div>
          {/* Navigation Breadcrumb */}
          <div className="flex items-center space-x-2 mb-4 text-sm">
            <button 
              onClick={handleBackToSets}
              className="text-adaptive-primary hover:text-adaptive-secondary font-medium"
            >
              Home
            </button>
            <span className="text-adaptive-tertiary">›</span>
            {selectedSet ? (
              <>
                <button 
                  onClick={handleBackToSets}
                  className="text-adaptive-secondary hover:text-adaptive-primary"
                >
                  Algorithm Sets
                </button>
                <span className="text-adaptive-tertiary">›</span>
                <span className="text-adaptive-primary font-medium">{selectedSet}</span>
              </>
            ) : (
              <span className="text-adaptive-primary font-medium">All Algorithms</span>
            )}
          </div>

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-adaptive-primary">
              {searchResults 
                ? `${selectedSet ? `${selectedSet} Algorithms` : 'All Algorithms'} (${searchResults.totalElements} found)`
                : selectedSet ? `${selectedSet} Algorithms` : 'All Algorithms'
              }
            </h2>
          </div>

          {/* Search Analytics */}
          {searchResults && (
            <SearchAnalytics
              searchResults={searchResults}
              searchQuery={currentFilters?.query}
              appliedFilters={currentFilters}
              className="mb-6"
            />
          )}
          
          {searchLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-lg h-48 animate-pulse" />
              ))}
            </div>
          ) : searchResults ? (
            <>
              {searchResults.content.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {searchResults.content.map((algorithm) => (
                      <AlgorithmCard
                        key={algorithm.id}
                        algorithm={algorithm}
                        onFavoriteToggle={handleAlgorithmFavorite}
                        clickable={true}
                        currentSet={selectedSet || undefined}
                      />
                    ))}
                  </div>
                  
                  {/* Pagination */}
                  {searchResults.totalPages > 1 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={searchResults.totalPages}
                      totalItems={searchResults.totalElements}
                      itemsPerPage={pageSize}
                      onPageChange={handlePageChange}
                      onPageSizeChange={handlePageSizeChange}
                      loading={searchLoading}
                    />
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="text-adaptive-tertiary text-lg mb-2">No algorithms found</div>
                  <p className="text-adaptive-secondary">Try adjusting your search criteria</p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-adaptive-tertiary text-lg mb-2">Start searching</div>
              <p className="text-adaptive-secondary">Enter a search term to find algorithms</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AlgorithmsPage;
