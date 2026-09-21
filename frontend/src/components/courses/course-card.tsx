'use client';

import React from 'react';
import Link from 'next/link';
import { Course } from '../../types';
import { RatingStars } from '../ui/rating-stars';
import { Badge } from '../ui/badge';
import { Clock, Heart } from 'lucide-react';

export function CourseCard({ course }: { course: Course }) {
  const priceNum = Number(course.price) || 0;
  const discountNum =
    course.discountPrice !== undefined && course.discountPrice !== null
      ? Number(course.discountPrice)
      : undefined;
  const effectivePrice = discountNum !== undefined ? discountNum : priceNum;
  const hasDiscount = discountNum !== undefined && discountNum < priceNum;
  const durationHours = Math.round((Number(course.totalDuration) || 7200) / 3600);
  const ratingNum = Number(course.averageRating) || 0;
  const totalReviewsNum = Number(course.totalRatings) || 0;

  const levelColorMap: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'purple'> = {
    beginner: 'success',
    intermediate: 'primary',
    advanced: 'purple',
    all_levels: 'default',
  };

  const instructorName = course.instructor?.user?.name || 'LearnX Instructor';
  const instructorAvatar =
    course.instructor?.user?.avatar || (course.instructor as any)?.avatar || '';

  return (
    <div className="group relative flex flex-col rounded-xl border border-slate-200 bg-white overflow-hidden hover:border-slate-300 hover:shadow-sm transition-all">
      {/* Thumbnail */}
      <Link href={`/courses/${course.slug}`} className="relative aspect-video w-full overflow-hidden bg-slate-100 block">
        <img
          src={
            course.thumbnailUrl ||
            (course as any).thumbnail ||
            'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80'
          }
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Category Badge */}
        {course.category && (
          <div className="absolute top-2.5 left-2.5">
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-white/95 text-slate-800 shadow-sm border border-slate-200">
              {course.category.name}
            </span>
          </div>
        )}

        {/* Discount tag */}
        {hasDiscount && priceNum > 0 && (
          <div className="absolute bottom-2.5 left-2.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-600 text-white shadow-sm">
              {Math.round(((priceNum - effectivePrice) / priceNum) * 100)}% OFF
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <Badge variant={levelColorMap[course.level] || 'default'} size="sm">
            {(course.level || 'all_levels').replace('_', ' ')}
          </Badge>
          <div className="flex items-center gap-1 text-slate-500">
            <Clock className="w-3.5 h-3.5" />
            <span>{durationHours}h total</span>
          </div>
        </div>

        <Link href={`/courses/${course.slug}`}>
          <h3 className="font-bold text-sm text-slate-900 line-clamp-2 hover:text-indigo-600 transition-colors leading-snug">
            {course.title}
          </h3>
        </Link>

        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
          {course.subtitle || (course as any).shortDescription || course.description}
        </p>

        {/* Instructor */}
        <div className="flex items-center gap-2 pt-0.5">
          <div className="w-5 h-5 rounded-full overflow-hidden bg-slate-100 shrink-0">
            {instructorAvatar ? (
              <img
                src={instructorAvatar}
                alt={instructorName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-indigo-600">
                {instructorName[0] || 'I'}
              </div>
            )}
          </div>
          <span className="text-xs text-slate-600 font-medium truncate">
            {instructorName}
          </span>
        </div>

        {/* Ratings & Meta */}
        <div className="flex items-center justify-between pt-0.5">
          <RatingStars
            rating={ratingNum}
            totalReviews={totalReviewsNum}
            size="sm"
          />
        </div>

        {/* Pricing */}
        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between mt-auto">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-slate-900">
              ${effectivePrice.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-slate-400 line-through font-medium">
                ${priceNum.toFixed(2)}
              </span>
            )}
          </div>

          <span className="text-xs font-semibold text-indigo-600 group-hover:underline">
            View Details →
          </span>
        </div>
      </div>
    </div>
  );
}
