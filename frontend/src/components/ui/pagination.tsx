import * as React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './button';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | string)[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push('dots-1');

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) pages.push('dots-2');
    pages.push(totalPages);
  }

  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={cn('flex items-center justify-center gap-1.5', className)}
    >
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="px-2.5 h-9"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline ml-1 text-xs">Prev</span>
      </Button>

      <div className="flex items-center gap-1">
        {pages.map((page, index) => {
          if (typeof page === 'string') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="w-9 h-9 flex items-center justify-center text-slate-400 text-xs"
              >
                <MoreHorizontal className="w-4 h-4" />
              </span>
            );
          }

          const isActive = page === currentPage;
          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={cn(
                'w-9 h-9 rounded-lg text-xs font-semibold transition-all duration-150',
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              {page}
            </button>
          );
        })}
      </div>

      <Button
        variant="outline"
        size="sm"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="px-2.5 h-9"
        aria-label="Next page"
      >
        <span className="hidden sm:inline mr-1 text-xs">Next</span>
        <ChevronRight className="w-4 h-4" />
      </Button>
    </nav>
  );
}
