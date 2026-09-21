import * as React from 'react';
import { Star } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface RatingStarsProps {
  rating: number; // e.g. 4.8
  totalReviews?: number;
  showScore?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function RatingStars({
  rating,
  totalReviews,
  showScore = true,
  size = 'md',
  className,
}: RatingStarsProps) {
  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base font-bold',
  };

  const normalizedRating = Math.max(0, Math.min(5, Number(rating) || 0));

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      {showScore && (
        <span className={cn('font-bold text-amber-600', textSizes[size])}>
          {normalizedRating.toFixed(1)}
        </span>
      )}
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = normalizedRating >= star;
          const isHalf = !isFilled && normalizedRating >= star - 0.5;

          return (
            <Star
              key={star}
              className={cn(
                iconSizes[size],
                isFilled
                  ? 'fill-amber-400 text-amber-400'
                  : isHalf
                  ? 'fill-amber-400/50 text-amber-400'
                  : 'text-slate-200',
              )}
            />
          );
        })}
      </div>
      {totalReviews !== undefined && (
        <span className="text-xs text-slate-500">
          ({totalReviews.toLocaleString()})
        </span>
      )}
    </div>
  );
}
