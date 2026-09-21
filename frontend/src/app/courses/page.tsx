'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CourseCard } from '../../components/courses/course-card';
import { courseService } from '../../services/course.service';
import { Course, Category } from '../../types';
import { Button } from '../../components/ui/button';
import { EmptyState } from '../../components/ui/empty-state';
import { Pagination } from '../../components/ui/pagination';
import { Skeleton } from '../../components/ui/skeleton';
import {
  Search,
  SlidersHorizontal,
  X,
  Filter,
} from 'lucide-react';

function CoursesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State derived from URL query parameters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [level, setLevel] = useState(searchParams.get('level') || 'all');
  const [sort, setSort] = useState(searchParams.get('sort') || 'popular');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Sync state with URL params
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    const urlCategory = searchParams.get('category') || 'all';
    const urlLevel = searchParams.get('level') || 'all';
    const urlSort = searchParams.get('sort') || 'popular';
    const urlPage = Number(searchParams.get('page')) || 1;

    setSearch(urlSearch);
    setCategory(urlCategory);
    setLevel(urlLevel);
    setSort(urlSort);
    setPage(urlPage);
  }, [searchParams]);

  // Load categories from API for sidebar filter
  useEffect(() => {
    async function loadCategories() {
      try {
        const cats = await courseService.getCategories();
        setCategories(cats);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    }
    loadCategories();
  }, []);

  // Fetch courses whenever filters change
  useEffect(() => {
    let isCancelled = false;
    async function loadCourses() {
      setIsLoading(true);
      try {
        const res = await courseService.getCourses({
          search: search || undefined,
          category: category !== 'all' ? category : undefined,
          level: level !== 'all' ? level : undefined,
          sort,
          page,
          limit: 9,
        });

        if (!isCancelled) {
          setCourses(res.data);
          setTotal(res.meta.total);
          setTotalPages(res.meta.totalPages);
        }
      } catch (err) {
        console.error('Failed to load courses', err);
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }

    loadCourses();
    return () => {
      isCancelled = true;
    };
  }, [search, category, level, sort, page]);

  // Update URL on filter update
  const applyFilter = (newFilters: {
    search?: string;
    category?: string;
    level?: string;
    sort?: string;
    page?: number;
  }) => {
    const params = new URLSearchParams(searchParams.toString());

    if (newFilters.search !== undefined) {
      if (newFilters.search) params.set('search', newFilters.search);
      else params.delete('search');
    }
    if (newFilters.category !== undefined) {
      if (newFilters.category !== 'all') params.set('category', newFilters.category);
      else params.delete('category');
    }
    if (newFilters.level !== undefined) {
      if (newFilters.level !== 'all') params.set('level', newFilters.level);
      else params.delete('level');
    }
    if (newFilters.sort !== undefined) {
      params.set('sort', newFilters.sort);
    }
    if (newFilters.page !== undefined) {
      params.set('page', String(newFilters.page));
    } else {
      params.set('page', '1');
    }

    router.push(`/courses?${params.toString()}`);
  };

  const handleResetFilters = () => {
    router.push('/courses');
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header Banner */}
        <div className="mb-8 space-y-1.5">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Explore Online Courses
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl">
            Discover comprehensive courses designed and taught by senior industry engineers. Level up your stack today.
          </p>
        </div>

        {/* Top Search & Filter Toggle Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-200">
          {/* Search Bar */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search course title, keyword, tech..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                applyFilter({ search: e.target.value });
              }}
              className="w-full pl-10 pr-8 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch('');
                  applyFilter({ search: '' });
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Right Sort & Mobile Filter Toggle */}
          <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-3">
            {/* Mobile Filter Toggle Button */}
            <button
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="md:hidden flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters {category !== 'all' || level !== 'all' ? '(Active)' : ''}
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <span className="hidden sm:inline">Sort by:</span>
              <select
                value={sort}
                onChange={(e) => applyFilter({ sort: e.target.value })}
                className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 font-medium focus:outline-none focus:border-indigo-600"
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Grid: Sidebar Filters + Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-8">
          {/* Desktop Sidebar Filter (Col 3) */}
          <aside
            className={`md:col-span-3 space-y-6 ${
              mobileFiltersOpen ? 'block' : 'hidden md:block'
            }`}
          >
            <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-6 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                  <Filter className="w-4 h-4 text-indigo-600" />
                  Refine Results
                </span>
                {(category !== 'all' || level !== 'all' || search) && (
                  <button
                    onClick={handleResetFilters}
                    className="text-xs font-medium text-indigo-600 hover:underline"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Categories
                </label>
                <div className="space-y-1 text-xs">
                  <button
                    onClick={() => applyFilter({ category: 'all' })}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition ${
                      category === 'all'
                        ? 'bg-indigo-50 text-indigo-700 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>All Categories</span>
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => applyFilter({ category: cat.slug })}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition ${
                        category === cat.slug
                          ? 'bg-indigo-50 text-indigo-700 font-semibold'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="truncate">{cat.name}</span>
                      {cat.courseCount !== undefined && (
                        <span className="text-[10px] text-slate-400 ml-1">({cat.courseCount})</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Level Filter */}
              <div className="space-y-2 pt-4 border-t border-slate-100">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Difficulty Level
                </label>
                <div className="space-y-1 text-xs">
                  {[
                    { id: 'all', label: 'All Levels' },
                    { id: 'beginner', label: 'Beginner' },
                    { id: 'intermediate', label: 'Intermediate' },
                    { id: 'advanced', label: 'Advanced' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => applyFilter({ level: item.id })}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition ${
                        level === item.id
                          ? 'bg-indigo-50 text-indigo-700 font-semibold'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Courses Listing Area (Col 9) */}
          <main className="md:col-span-9 space-y-6">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>
                Showing <strong className="text-slate-900">{courses.length}</strong>{' '}
                of <strong className="text-slate-900">{total}</strong> courses
                {category !== 'all' && ` in ${category}`}
              </span>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                    <Skeleton className="h-44 w-full rounded-lg" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                ))}
              </div>
            ) : courses.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>

                {/* Pagination */}
                <div className="pt-8 flex justify-center">
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={(newPage) => applyFilter({ page: newPage })}
                  />
                </div>
              </>
            ) : (
              <EmptyState
                title="No courses found"
                description="Try changing your search or filters."
                actionLabel="Browse Courses"
                onAction={handleResetFilters}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function CoursesPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto" />
        </div>
      }
    >
      <CoursesContent />
    </Suspense>
  );
}
