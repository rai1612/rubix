import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, X, SlidersHorizontal, Clock, TrendingUp } from 'lucide-react';
import { AlgorithmSet } from '../../services/algorithmService';
import { useSearchSuggestions } from '../../hooks/useAlgorithms';
import { getGroupOptionsForAlgorithmSet } from '../../utils/algorithmGroups';

interface SearchFilters {
  query: string;
  algorithmSet: AlgorithmSet | '';
  difficulty: number | '';
  favoriteOnly: boolean;
  sortBy: 'name' | 'difficulty' | 'moveCount' | 'usageCount' | 'createdAt';
  sortOrder: 'asc' | 'desc';
  minMoveCount: number | '';
  maxMoveCount: number | '';
  tags: string;
  algorithmGroup: string | '';
}

interface AlgorithmSearchProps {
  onSearch: (filters: SearchFilters) => void;
  loading?: boolean;
  placeholder?: string;
  showAdvancedFilters?: boolean;
}

const AlgorithmSearch: React.FC<AlgorithmSearchProps> = ({
  onSearch,
  loading = false,
  placeholder = "Search algorithms...",
  showAdvancedFilters = true
}) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    algorithmSet: '',
    difficulty: '',
    favoriteOnly: false,
    sortBy: 'name',
    sortOrder: 'asc',
    minMoveCount: '',
    maxMoveCount: '',
    tags: '',
    algorithmGroup: ''
  });

  const [showFilters, setShowFilters] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem('algorithmSearchHistory');
    return saved ? JSON.parse(saved) : [];
  });

  const searchInputRef = useRef<HTMLInputElement>(null);
  const shouldMaintainFocus = useRef(false);
  const { suggestions, getSuggestions } = useSearchSuggestions();

  // Maintain focus after re-renders when user is actively typing
  useEffect(() => {
    if (shouldMaintainFocus.current && searchInputRef.current && document.activeElement !== searchInputRef.current) {
      searchInputRef.current.focus();
      shouldMaintainFocus.current = false;
    }
  });

  // Debounce the query with longer delay to prevent aggressive searching
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(filters.query);
    }, 500); // Increased from 300ms to 500ms

    return () => clearTimeout(timer);
  }, [filters.query]);

  // Clear algorithm group when algorithm set changes
  useEffect(() => {
    if (filters.algorithmGroup) {
      setFilters(prev => ({ ...prev, algorithmGroup: '' }));
    }
  }, [filters.algorithmSet]);

  // Trigger search when debounced query or other filters change
  // Add a flag to prevent unnecessary searches on mount
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  
  useEffect(() => {
    // Only trigger search if user has interacted or there are active filters
    const hasActiveFilters = debouncedQuery || filters.algorithmSet || filters.difficulty || 
                            filters.favoriteOnly || filters.minMoveCount || filters.maxMoveCount || filters.tags || filters.algorithmGroup;
    
    if (hasUserInteracted || hasActiveFilters) {
      onSearch({ ...filters, query: debouncedQuery });
    }
  }, [debouncedQuery, filters.algorithmSet, filters.difficulty, filters.favoriteOnly, filters.sortBy, filters.sortOrder, filters.minMoveCount, filters.maxMoveCount, filters.tags, filters.algorithmGroup, onSearch, hasUserInteracted]);

  const handleFilterChange = useCallback((key: keyof SearchFilters, value: any) => {
    setHasUserInteracted(true); // Mark that user has interacted
    
    // Mark that we want to maintain focus if user is typing in the search query
    if (key === 'query') {
      shouldMaintainFocus.current = true;
    }
    
    setFilters(prev => ({ ...prev, [key]: value }));
    
    // Get suggestions when query changes
    if (key === 'query' && value.length >= 2) {
      getSuggestions(value, 8);
      setShowSuggestions(true);
    } else if (key === 'query' && value.length < 2) {
      setShowSuggestions(false);
    }
  }, [getSuggestions]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setFilters(prev => ({ ...prev, query: suggestion }));
    setShowSuggestions(false);
    
    // Add to search history
    const newHistory = [suggestion, ...searchHistory.filter(item => item !== suggestion)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('algorithmSearchHistory', JSON.stringify(newHistory));
    
    // Maintain focus on input after selection
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 0);
  }, [searchHistory]);

  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (filters.query.trim()) {
      const newHistory = [filters.query, ...searchHistory.filter(item => item !== filters.query)].slice(0, 10);
      setSearchHistory(newHistory);
      localStorage.setItem('algorithmSearchHistory', JSON.stringify(newHistory));
    }
    setShowSuggestions(false);
  }, [filters.query, searchHistory]);

  const handleInputFocus = useCallback(() => {
    if (filters.query.length >= 2 || searchHistory.length > 0) {
      setShowSuggestions(true);
    }
  }, [filters.query, searchHistory]);

  const handleInputBlur = useCallback((e: React.FocusEvent) => {
    // Only hide suggestions if focus is moving outside the suggestions container
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (relatedTarget && relatedTarget.closest('[data-suggestions-container]')) {
      return; // Don't hide suggestions if clicking within them
    }
    
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => setShowSuggestions(false), 200);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      query: '',
      algorithmSet: '',
      difficulty: '',
      favoriteOnly: false,
      sortBy: 'name',
      sortOrder: 'asc',
      minMoveCount: '',
      maxMoveCount: '',
      tags: '',
      algorithmGroup: ''
    });
  }, []);

  const hasActiveFilters = filters.algorithmSet || filters.difficulty || filters.favoriteOnly || 
                        filters.minMoveCount || filters.maxMoveCount || filters.tags || filters.algorithmGroup;

  const algorithmSets = [
    { value: '', label: 'All Sets' },
    { value: AlgorithmSet.OLL, label: 'OLL - Orientation of Last Layer' },
    { value: AlgorithmSet.PLL, label: 'PLL - Permutation of Last Layer' },
    { value: AlgorithmSet.F2L, label: 'F2L - First Two Layers' },
    { value: AlgorithmSet.CROSS, label: 'Cross' },
    { value: AlgorithmSet.CMLL, label: 'CMLL - Corners Minus Last Layer' },
    { value: AlgorithmSet.LSE, label: 'LSE - Last Six Edges' },
    { value: AlgorithmSet.COLL, label: 'COLL - Corners of Last Layer' },
    { value: AlgorithmSet.ZBLL, label: 'ZBLL - Zborowski-Bruchem Last Layer' },
    { value: AlgorithmSet.VLS, label: 'VLS - Valk Last Slot' },
    { value: AlgorithmSet.WV, label: 'WV - Winter Variation' },
    { value: AlgorithmSet.SV, label: 'SV - Summer Variation' },
    { value: AlgorithmSet.ELS, label: 'ELS - Edge Last Slot' },
    { value: AlgorithmSet.CLS, label: 'CLS - Corner Last Slot' },
    { value: AlgorithmSet.OH, label: '1H - One-Handed' },
    { value: AlgorithmSet.BLD, label: 'BLD - Blindfolded' },
    { value: AlgorithmSet.CUSTOM, label: 'Custom' }
  ];

  const difficulties = [
    { value: '', label: 'All Difficulties' },
    { value: 1, label: 'Beginner' },
    { value: 2, label: 'Easy' },
    { value: 3, label: 'Intermediate' },
    { value: 4, label: 'Advanced' },
    { value: 5, label: 'Expert' }
  ];

  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'difficulty', label: 'Difficulty' },
    { value: 'moveCount', label: 'Move Count' },
    { value: 'usageCount', label: 'Usage Count' },
    { value: 'createdAt', label: 'Date Created' }
  ];

  // Get algorithm groups based on selected algorithm set
  const algorithmGroups = [
    { value: '', label: 'All Groups' },
    ...getGroupOptionsForAlgorithmSet(filters.algorithmSet as AlgorithmSet || null)
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Main Search Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <form onSubmit={handleSearchSubmit}>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-adaptive-tertiary w-5 h-5" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder={placeholder}
                value={filters.query}
                onChange={(e) => handleFilterChange('query', e.target.value)}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                className="form-input pl-10"
                disabled={loading}
              />
            </form>

            {/* Search Suggestions */}
            {showSuggestions && (
              <div 
                data-suggestions-container
                className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 mt-1 max-h-80 overflow-y-auto"
              >
                {/* Search History */}
                {searchHistory.length > 0 && filters.query.length < 2 && (
                  <div className="p-3 border-b border-gray-100">
                    <div className="flex items-center text-sm text-adaptive-secondary mb-2">
                      <Clock className="w-4 h-4 mr-2" />
                      Recent Searches
                    </div>
                    {searchHistory.slice(0, 5).map((item, index) => (
                      <button
                        key={index}
                        onMouseDown={(e) => e.preventDefault()} // Prevent losing input focus
                        onClick={() => handleSuggestionClick(item)}
                        className="block w-full text-left px-3 py-2 text-sm text-adaptive-primary hover:bg-adaptive-tertiary rounded"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                )}

                {/* Live Suggestions */}
                {suggestions.length > 0 && filters.query.length >= 2 && (
                  <div className="p-3">
                    <div className="flex items-center text-sm text-adaptive-secondary mb-2">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Suggestions
                    </div>
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onMouseDown={(e) => e.preventDefault()} // Prevent losing input focus
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="block w-full text-left px-3 py-2 text-sm text-adaptive-primary hover:bg-adaptive-tertiary rounded"
                      >
                        <span className="font-medium">{suggestion}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* No suggestions */}
                {filters.query.length >= 2 && suggestions.length === 0 && searchHistory.length === 0 && (
                  <div className="p-4 text-sm text-adaptive-tertiary text-center">
                    No suggestions found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          {/* Quick Set Filter */}
          <select
            value={filters.algorithmSet}
            onChange={(e) => handleFilterChange('algorithmSet', e.target.value as AlgorithmSet | '')}
            className="form-input"
            disabled={loading}
          >
            <option value="">All Sets</option>
            <option value={AlgorithmSet.OLL}>OLL</option>
            <option value={AlgorithmSet.PLL}>PLL</option>
            <option value={AlgorithmSet.F2L}>F2L</option>
            <option value={AlgorithmSet.CMLL}>CMLL</option>
          </select>
          
          {showAdvancedFilters && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                showFilters || hasActiveFilters
                  ? 'bg-primary-600 text-on-primary'
                  : 'bg-adaptive-tertiary text-adaptive-primary hover:bg-adaptive-secondary'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="bg-white text-primary-600 px-2 py-0.5 rounded-full text-xs font-medium">
                  Active
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && showFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Algorithm Set */}
            <div>
              <label className="block text-sm font-medium text-adaptive-primary mb-2">
                Algorithm Set
              </label>
              <select
                value={filters.algorithmSet}
                onChange={(e) => handleFilterChange('algorithmSet', e.target.value as AlgorithmSet | '')}
                className="form-input text-sm"
              >
                {algorithmSets.map(set => (
                  <option key={set.value} value={set.value}>
                    {set.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium text-adaptive-primary mb-2">
                Difficulty
              </label>
              <select
                value={filters.difficulty}
                onChange={(e) => handleFilterChange('difficulty', e.target.value ? Number(e.target.value) : '')}
                className="form-input text-sm"
              >
                {difficulties.map(diff => (
                  <option key={diff.value} value={diff.value}>
                    {diff.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Algorithm Group */}
            <div>
              <label className="block text-sm font-medium text-adaptive-primary mb-2">
                Algorithm Group
                {!filters.algorithmSet && (
                  <span className="text-xs text-adaptive-tertiary ml-1">(Select algorithm set first)</span>
                )}
              </label>
              <select
                value={filters.algorithmGroup}
                onChange={(e) => handleFilterChange('algorithmGroup', e.target.value)}
                className="form-input text-sm"
                disabled={!filters.algorithmSet}
              >
                {algorithmGroups.map(group => (
                  <option key={group.value} value={group.value} title={group.description}>
                    {group.label}
                  </option>
                ))}
              </select>
              {filters.algorithmSet && (
                <p className="text-xs text-adaptive-tertiary mt-1">
                  Showing {filters.algorithmSet} specific groups
                </p>
              )}
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-adaptive-primary mb-2">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value as any)}
                className="form-input text-sm"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-adaptive-primary mb-2">
                Sort Order
              </label>
              <select
                value={filters.sortOrder}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value as 'asc' | 'desc')}
                className="form-input text-sm"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>

          {/* Second row of filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {/* Move Count Range */}
            <div>
              <label className="block text-sm font-medium text-adaptive-primary mb-2">
                Move Count Range
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minMoveCount}
                  onChange={(e) => handleFilterChange('minMoveCount', e.target.value ? Number(e.target.value) : '')}
                  className="form-input text-sm"
                  min="1"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxMoveCount}
                  onChange={(e) => handleFilterChange('maxMoveCount', e.target.value ? Number(e.target.value) : '')}
                  className="form-input text-sm"
                  min="1"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-adaptive-primary mb-2">
                Tags
              </label>
              <input
                type="text"
                placeholder="Enter tags..."
                value={filters.tags}
                onChange={(e) => handleFilterChange('tags', e.target.value)}
                className="form-input text-sm"
              />
              <p className="text-xs text-adaptive-tertiary mt-1">Separate multiple tags with commas</p>
            </div>

            {/* Search Stats Info */}
            <div>
              <label className="block text-sm font-medium text-adaptive-primary mb-2">
                Quick Actions
              </label>
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => handleFilterChange('favoriteOnly', !filters.favoriteOnly)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filters.favoriteOnly
                      ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                      : 'bg-adaptive-tertiary text-adaptive-primary border border-adaptive-primary hover:bg-adaptive-secondary'
                  }`}
                >
                  {filters.favoriteOnly ? '★ Favorites Only' : '☆ Show All'}
                </button>
              </div>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-adaptive-secondary">
              {hasActiveFilters ? 'Filters are active' : 'No filters applied'}
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center space-x-1 text-sm text-adaptive-secondary hover:text-adaptive-primary transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Clear all filters</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AlgorithmSearch;
