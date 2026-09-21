'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { wishlistService } from '../../../services/wishlist.service';
import { Course } from '../../../types';
import { Button } from '../../../components/ui/button';
import { RatingStars } from '../../../components/ui/rating-stars';
import { Card } from '../../../components/ui/card';
import { Skeleton } from '../../../components/ui/skeleton';
import { Heart, Trash2, ArrowRight } from 'lucide-react';

export default function WishlistPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWishlist() {
      setLoading(true);
      try {
        const data = await wishlistService.getWishlist();
        setCourses(data);
      } catch (err) {
        console.error('Failed to load wishlist', err);
      } finally {
        setLoading(false);
      }
    }

    loadWishlist();
  }, []);

  const handleRemove = async (courseId: string) => {
    await wishlistService.removeFromWishlist(courseId);
    setCourses(courses.filter((c) => c.id !== courseId));
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-rose-600 mb-1">
              <Heart className="w-3.5 h-3.5 fill-rose-600" />
              Saved for Later
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              My Wishlist ({courses.length})
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Keep track of courses you want to enroll in and watch for promotional price drops.
            </p>
          </div>

          <a href="/courses">
            <Button variant="outline" size="sm" className="font-medium text-slate-700 border-slate-300 gap-1.5 rounded-lg">
              Browse More Courses
              <ArrowRight className="w-4 h-4" />
            </Button>
          </a>
        </div>

        {/* Wishlist Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                <Skeleton className="h-44 w-full rounded-lg" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const effectivePrice = course.discountPrice !== undefined ? course.discountPrice : course.price;
              const hasDiscount = course.discountPrice !== undefined && course.discountPrice < course.price;

              return (
                <div
                  key={course.id}
                  className="group flex flex-col rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:border-slate-300 transition"
                >
                  {/* Thumbnail */}
                  <a
                    href={`/courses/${course.slug}`}
                    className="relative aspect-video w-full overflow-hidden bg-slate-100 block"
                  >
                    <img
                      src={
                        course.thumbnailUrl ||
                        'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80'
                      }
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute top-2.5 right-2.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          handleRemove(course.id);
                        }}
                        className="p-1.5 rounded-full bg-white/90 text-rose-600 hover:bg-rose-50 border border-slate-200 transition shadow-sm"
                        title="Remove from wishlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </a>

                  {/* Content */}
                  <div className="p-5 flex flex-col flex-1 justify-between space-y-3">
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-indigo-600">
                        {course.category?.name || 'Development'}
                      </span>
                      <a href={`/courses/${course.slug}`}>
                        <h3 className="font-semibold text-sm text-slate-900 line-clamp-2 hover:text-indigo-600 transition-colors">
                          {course.title}
                        </h3>
                      </a>
                      <p className="text-xs text-slate-500 truncate">
                        {course.instructor?.user.name || 'LearnX Expert'}
                      </p>
                    </div>

                    {/* Rating */}
                    <RatingStars rating={course.averageRating} totalReviews={course.totalRatings} size="sm" />

                    {/* Price & CTA */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-slate-900">
                          ${effectivePrice.toFixed(2)}
                        </span>
                        {hasDiscount && (
                          <span className="text-xs text-slate-400 line-through">
                            ${course.price.toFixed(2)}
                          </span>
                        )}
                      </div>

                      <a href={`/checkout/${course.id}`}>
                        <Button size="sm" className="font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">
                          Enroll Now
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <Card className="p-16 text-center space-y-4 bg-white border border-slate-200 rounded-xl">
            <Heart className="w-10 h-10 text-rose-500 mx-auto" />
            <h3 className="text-base font-semibold text-slate-900">Your wishlist is currently empty</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Explore our curated catalog and save courses you find interesting for later.
            </p>
            <a href="/courses">
              <Button className="bg-indigo-600 text-white rounded-lg">Explore Courses</Button>
            </a>
          </Card>
        )}
      </div>
    </div>
  );
}
