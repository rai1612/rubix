import React, { useState, useEffect } from 'react';
import { Search, Filter, Grid, List } from 'lucide-react';
import { Algorithm, AlgorithmSet, algorithmService } from '../../services/algorithmService';
import AlgorithmCaseVisualizer from './AlgorithmCaseVisualizer';
import { cn, getAdaptiveClasses } from '../../utils/appearanceUtils';

interface AlgorithmCaseGalleryProps {
  algorithmSet?: AlgorithmSet;
  title?: string;
  showSearch?: boolean;
  maxItems?: number;
}

const AlgorithmCaseGallery: React.FC<AlgorithmCaseGalleryProps> = ({
  algorithmSet,
  title = 'Algorithm Cases',
  showSearch = true,
  maxItems = 20
}) => {
  const [algorithms, setAlgorithms] = useState<Algorithm[]>([]);
  const [filteredAlgorithms, setFilteredAlgorithms] = useState<Algorithm[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedDifficulty, setSelectedDifficulty] = useState<number | null>(null);

  // Fetch algorithms
  useEffect(() => {
    const fetchAlgorithms = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let data: Algorithm[];
        if (algorithmSet) {
          data = await algorithmService.getAlgorithmsBySet(algorithmSet);
        } else {
          data = await algorithmService.getAllAlgorithms();
        }
        
        // Filter to only algorithms with setup moves
        const algorithmsWithSetup = data.filter(alg => alg.setupMoves && alg.setupMoves.trim());
        setAlgorithms(algorithmsWithSetup.slice(0, maxItems));
        setFilteredAlgorithms(algorithmsWithSetup.slice(0, maxItems));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch algorithms');
      } finally {
        setLoading(false);
      }
    };

    fetchAlgorithms();
  }, [algorithmSet, maxItems]);

  // Filter algorithms based on search and difficulty
  useEffect(() => {
    let filtered = algorithms;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(alg => 
        alg.name.toLowerCase().includes(query) ||
        alg.caseDescription?.toLowerCase().includes(query) ||
        alg.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    if (selectedDifficulty) {
      filtered = filtered.filter(alg => alg.difficulty === selectedDifficulty);
    }

    setFilteredAlgorithms(filtered);
  }, [algorithms, searchQuery, selectedDifficulty]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-adaptive-secondary">Loading algorithm cases...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-adaptive-error text-lg mb-2">Error Loading Cases</div>
        <p className="text-adaptive-secondary">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-adaptive-primary">{title}</h2>
          <p className="text-adaptive-secondary mt-1">
            {filteredAlgorithms.length} case{filteredAlgorithms.length !== 1 ? 's' : ''} available
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'p-2 rounded-lg transition-colors',
              viewMode === 'grid' 
                ? cn(getAdaptiveClasses.semantic.success, 'bg-adaptive-tertiary')
                : cn(getAdaptiveClasses.text.tertiary, 'hover:bg-adaptive-tertiary')
            )}
            title="Grid view"
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'p-2 rounded-lg transition-colors',
              viewMode === 'list' 
                ? cn(getAdaptiveClasses.semantic.success, 'bg-adaptive-tertiary')
                : cn(getAdaptiveClasses.text.tertiary, 'hover:bg-adaptive-tertiary')
            )}
            title="List view"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      {showSearch && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-adaptive-tertiary" />
            <input
              type="text"
              placeholder="Search cases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                'w-full pl-10 pr-4 py-2 rounded-lg border',
                getAdaptiveClasses.background.secondary,
                getAdaptiveClasses.border.primary,
                getAdaptiveClasses.text.primary,
                'focus:outline-none focus:ring-2 focus:ring-primary-500'
              )}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-adaptive-tertiary" />
            <select
              value={selectedDifficulty || ''}
              onChange={(e) => setSelectedDifficulty(e.target.value ? parseInt(e.target.value) : null)}
              className={cn(
                'px-3 py-2 rounded-lg border',
                getAdaptiveClasses.background.secondary,
                getAdaptiveClasses.border.primary,
                getAdaptiveClasses.text.primary,
                'focus:outline-none focus:ring-2 focus:ring-primary-500'
              )}
            >
              <option value="">All Difficulties</option>
              <option value="1">Beginner</option>
              <option value="2">Easy</option>
              <option value="3">Intermediate</option>
              <option value="4">Advanced</option>
              <option value="5">Expert</option>
            </select>
          </div>
        </div>
      )}

      {/* Cases Grid/List */}
      {filteredAlgorithms.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-adaptive-tertiary text-lg mb-2">No cases found</div>
          <p className="text-adaptive-secondary">
            {searchQuery ? 'Try adjusting your search criteria' : 'No algorithms with case visualization available'}
          </p>
        </div>
      ) : (
        <div className={cn(
          viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'
            : 'space-y-4'
        )}>
          {filteredAlgorithms.map((algorithm) => (
            <div
              key={algorithm.id}
              className={cn(
                'rounded-lg border p-4',
                getAdaptiveClasses.background.secondary,
                getAdaptiveClasses.border.primary,
                viewMode === 'list' ? 'flex items-center space-x-4' : 'text-center'
              )}
            >
              {/* Case Visualizer */}
              <div className={viewMode === 'list' ? 'flex-shrink-0' : ''}>
                <AlgorithmCaseVisualizer
                  algorithm={algorithm}
                  size={viewMode === 'list' ? 'small' : 'medium'}
                  showControls={viewMode === 'grid'}
                  autoSetupCase={true}
                />
              </div>
              
              {/* Algorithm Info */}
              <div className={cn(
                viewMode === 'list' ? 'flex-1 text-left' : 'mt-3'
              )}>
                <div className="flex items-center justify-between mb-1">
                  <span className={cn('text-xs font-medium', getAdaptiveClasses.text.secondary)}>
                    {algorithm.algorithmSet}
                    {algorithm.caseNumber && ` ${algorithm.caseNumber}`}
                  </span>
                  {algorithm.difficulty && (
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: algorithm.difficulty }, (_, i) => (
                        <div
                          key={i}
                          className={cn('w-2 h-2 rounded-full', getAdaptiveClasses.semantic.warning)}
                        />
                      ))}
                    </div>
                  )}
                </div>
                
                <h3 className={cn('font-semibold text-sm mb-1', getAdaptiveClasses.text.primary)}>
                  {algorithm.name}
                </h3>
                
                {algorithm.caseDescription && (
                  <p className={cn('text-xs', getAdaptiveClasses.text.secondary)}>
                    {algorithm.caseDescription}
                  </p>
                )}
                
                <div className={cn('text-xs font-mono mt-2', getAdaptiveClasses.text.tertiary)}>
                  {algorithm.notationString}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlgorithmCaseGallery;
