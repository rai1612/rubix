import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  showPageSizeSelector?: boolean;
  loading?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onPageSizeChange,
  showPageSizeSelector = true,
  loading = false
}) => {
  // Generate page numbers to show
  const getPageNumbers = (): (number | string)[] => {
    const delta = 2; // Number of pages to show on each side of current page
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];
    
    // Convert 0-based currentPage to 1-based for calculations
    const currentPageDisplay = currentPage + 1;

    // Calculate range of page numbers around current page
    for (let i = Math.max(2, currentPageDisplay - delta); i <= Math.min(totalPages - 1, currentPageDisplay + delta); i++) {
      range.push(i);
    }

    // Add first page and dots if needed
    if (currentPageDisplay - delta > 2) {
      rangeWithDots.push(1, 'dots1');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    // Add last page and dots if needed
    if (currentPageDisplay + delta < totalPages - 1) {
      rangeWithDots.push('dots2', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    // Remove duplicates (e.g., if totalPages is already in range)
    const uniquePages = rangeWithDots.filter((item, index) => {
      if (typeof item === 'string') return true; // Keep dots
      return rangeWithDots.indexOf(item) === index; // Remove duplicate numbers
    });

    return uniquePages;
  };

  const pageNumbers = getPageNumbers();
  const startItem = currentPage * itemsPerPage + 1;
  const endItem = Math.min((currentPage + 1) * itemsPerPage, totalItems);

  if (totalPages <= 1) {
    return null; // Don't show pagination if there's only one page
  }

  return (
    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-4 bg-adaptive-secondary border-t border-adaptive-primary">
      {/* Results info */}
      <div className="text-sm text-adaptive-primary order-2 lg:order-1">
        Showing <span className="font-medium">{startItem}</span> to{' '}
        <span className="font-medium">{endItem}</span> of{' '}
        <span className="font-medium">{totalItems}</span> results
      </div>

      {/* Pagination controls */}
      <div className="flex flex-col sm:flex-row items-center gap-4 order-1 lg:order-2 w-full lg:w-auto">
        <div className="flex items-center gap-2">
          {/* Previous button */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 0 || loading}
            className="px-3 py-2 text-sm text-adaptive-tertiary bg-adaptive-secondary border border-adaptive-primary rounded-md hover:bg-adaptive-tertiary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          {/* Page numbers */}
          <div className="flex items-center gap-1">
            {pageNumbers.map((pageNum) => {
              if (pageNum === 'dots1' || pageNum === 'dots2') {
                return (
                  <span key={pageNum} className="px-3 py-2 text-adaptive-tertiary">
                    <MoreHorizontal className="w-4 h-4" />
                  </span>
                );
              }

              const page = pageNum as number;
              const isActive = page === currentPage + 1; // Convert 0-based to 1-based

              return (
                <button
                  key={page}
                  onClick={() => onPageChange(page - 1)} // Convert 1-based to 0-based
                  disabled={loading}
                  className={`px-3 py-2 text-sm rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary-600 text-on-primary'
                      : 'text-adaptive-primary bg-adaptive-secondary border border-adaptive-primary hover:bg-adaptive-tertiary'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          {/* Next button */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages - 1 || loading}
            className="px-3 py-2 text-sm text-adaptive-tertiary bg-adaptive-secondary border border-adaptive-primary rounded-md hover:bg-adaptive-tertiary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Page size selector */}
        {showPageSizeSelector && onPageSizeChange && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-2">
            <label htmlFor="pageSize" className="text-sm text-adaptive-primary whitespace-nowrap">
              Show:
            </label>
            <select
              id="pageSize"
              value={itemsPerPage}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              disabled={loading}
              className="text-sm bg-adaptive-secondary border border-adaptive-primary text-adaptive-primary rounded-md px-2 py-1 min-w-[4rem] focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 hover:bg-adaptive-tertiary transition-colors"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-adaptive-primary whitespace-nowrap">per page</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pagination;

