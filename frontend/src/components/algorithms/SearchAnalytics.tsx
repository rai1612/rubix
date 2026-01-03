import React from 'react';
import { BarChart3, TrendingUp, Clock, Database, Star, Filter } from 'lucide-react';
import { useSearchStats } from '../../hooks/useAlgorithms';
import { SearchResponse } from '../../services/algorithmService';
import { cn, getAdaptiveClasses } from '../../utils/appearanceUtils';

interface SearchAnalyticsProps {
  searchResults?: SearchResponse | null;
  searchQuery?: string;
  appliedFilters?: any;
  searchTime?: number;
  className?: string;
}

const SearchAnalytics: React.FC<SearchAnalyticsProps> = ({
  searchResults,
  searchQuery,
  appliedFilters,
  searchTime,
  className = ''
}) => {
  const { stats, loading: statsLoading } = useSearchStats();

  const getFilterSummary = () => {
    if (!appliedFilters) return null;
    
    const activeFilters = [];
    if (appliedFilters.algorithmSet) activeFilters.push(`Set: ${appliedFilters.algorithmSet}`);
    if (appliedFilters.difficulty) activeFilters.push(`Difficulty: ${appliedFilters.difficulty}`);
    if (appliedFilters.favoriteOnly) activeFilters.push('Favorites only');
    if (appliedFilters.minMoveCount || appliedFilters.maxMoveCount) {
      const min = appliedFilters.minMoveCount || 'any';
      const max = appliedFilters.maxMoveCount || 'any';
      activeFilters.push(`Moves: ${min}-${max}`);
    }
    if (appliedFilters.tags) activeFilters.push(`Tags: ${appliedFilters.tags}`);
    
    return activeFilters;
  };

  const getSearchEfficiency = () => {
    if (!searchResults || !stats) return null;
    
    const totalAlgorithms = stats.totalAlgorithms;
    const resultsFound = searchResults.totalElements;
    const efficiency = totalAlgorithms > 0 ? (resultsFound / totalAlgorithms) * 100 : 0;
    
    return {
      efficiency: efficiency.toFixed(1),
      resultsRatio: `${resultsFound}/${totalAlgorithms}`,
      precision: efficiency > 50 ? 'broad' : efficiency > 10 ? 'focused' : 'specific'
    };
  };

  const activeFilters = getFilterSummary();
  const efficiency = getSearchEfficiency();

  return (
    <div className={cn('bg-adaptive-tertiary rounded-lg p-4 border border-adaptive-primary', className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <BarChart3 className={cn('w-5 h-5', getAdaptiveClasses.semantic.info)} />
          <h3 className="text-lg font-semibold text-adaptive-primary">Search Analytics</h3>
        </div>
        {searchTime && (
          <div className="flex items-center text-sm text-adaptive-secondary">
            <Clock className="w-4 h-4 mr-1" />
            {searchTime}ms
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search Results */}
        {searchResults && (
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-adaptive-secondary">Results Found</p>
                <p className={cn('text-2xl font-bold', getAdaptiveClasses.semantic.info)}>{searchResults.totalElements}</p>
                <p className="text-xs text-adaptive-tertiary">
                  {searchResults.totalPages} page{searchResults.totalPages !== 1 ? 's' : ''}
                </p>
              </div>
              <Database className={cn('w-8 h-8 opacity-70', getAdaptiveClasses.semantic.info)} />
            </div>
          </div>
        )}

        {/* Search Efficiency */}
        {efficiency && (
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-adaptive-secondary">Search Efficiency</p>
                <p className={cn('text-2xl font-bold', getAdaptiveClasses.semantic.success)}>{efficiency.efficiency}%</p>
                <p className="text-xs text-adaptive-tertiary capitalize">{efficiency.precision} search</p>
              </div>
              <TrendingUp className={cn('w-8 h-8 opacity-70', getAdaptiveClasses.semantic.success)} />
            </div>
          </div>
        )}

        {/* Database Stats */}
        {stats && !statsLoading && (
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-adaptive-secondary">Total Algorithms</p>
                <p className={cn('text-2xl font-bold', getAdaptiveClasses.text.secondary)}>{stats.totalAlgorithms}</p>
                <p className="text-xs text-adaptive-tertiary">{stats.totalSets} sets available</p>
              </div>
              <Database className={cn('w-8 h-8 opacity-70', getAdaptiveClasses.text.secondary)} />
            </div>
          </div>
        )}

        {/* Popular Content */}
        {stats && !statsLoading && (
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-adaptive-secondary">Popular Set</p>
                <p className="text-lg font-bold text-orange-600">{stats.mostPopularSet}</p>
                <p className="text-xs text-adaptive-tertiary">Most algorithms</p>
              </div>
              <Star className="w-8 h-8 text-orange-500 opacity-70" />
            </div>
          </div>
        )}
      </div>

      {/* Active Filters */}
      {activeFilters && activeFilters.length > 0 && (
        <div className="mt-4 pt-4 border-t border-adaptive-primary">
          <div className="flex items-center space-x-2 mb-2">
            <Filter className={cn('w-4 h-4', getAdaptiveClasses.semantic.info)} />
            <span className="text-sm font-medium text-adaptive-primary">Active Filters</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((filter, index) => (
              <span
                key={index}
                className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getAdaptiveClasses.backgroundSemantic.info, 'text-on-primary')}
              >
                {filter}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Search Query Info */}
      {searchQuery && (
        <div className="mt-4 pt-4 border-t border-adaptive-primary">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-adaptive-primary">Search Query:</span>
            <code className="px-2 py-1 bg-gray-100 rounded text-sm text-adaptive-primary">
              "{searchQuery}"
            </code>
          </div>
        </div>
      )}

      {/* Search Tips */}
      {searchResults && searchResults.totalElements === 0 && (
        <div className="mt-4 pt-4 border-t border-adaptive-primary">
          <div className="border rounded-md p-3 bg-yellow-100 text-yellow-800 border border-yellow-200">
            <h4 className="text-sm font-medium mb-2 text-yellow-800">Search Tips:</h4>
            <ul className="text-sm space-y-1 text-yellow-800">
              <li>• Try using broader search terms</li>
              <li>• Remove some filters to expand results</li>
              <li>• Check spelling and try synonyms</li>
              <li>• Use tags or algorithm names</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchAnalytics;

