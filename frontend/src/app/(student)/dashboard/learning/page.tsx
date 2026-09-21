'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { enrollmentService } from '../../../../services/enrollment.service';
import { Course } from '../../../../types';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { Skeleton } from '../../../../components/ui/skeleton';
import { BookOpen, PlayCircle, ArrowRight } from 'lucide-react';

export default function MyLearningPage() {
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<
    { course: Course; progressPercent: number }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEnrollments() {
      setLoading(true);
      try {
        const data = await enrollmentService.getMyEnrollments();
        setEnrollments(data);
      } catch (err) {
        console.error('Failed to load my learning', err);
      } finally {
        setLoading(false);
      }
    }

    loadEnrollments();
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-1">
              <BookOpen className="w-3.5 h-3.5" />
              Student Workspace
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              My Learning
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Pick up right where you left off across all your enrolled courses.
            </p>
          </div>

          <a href="/courses">
            <Button variant="outline" size="sm" className="font-medium text-slate-700 border-slate-300 gap-1.5 rounded-lg">
              Browse More Courses
              <ArrowRight className="w-4 h-4" />
            </Button>
          </a>
        </div>

        {/* Enrolled Courses Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                <Skeleton className="h-40 w-full rounded-lg" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        ) : enrollments.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments
              .filter((e) => Boolean(e && e.course && e.course.id))
              .map(({ course, progressPercent }) => (
              <div
                key={course.id}
                className="group flex flex-col rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:border-slate-300 transition"
              >
                {/* Thumbnail with overlay */}
                <a
                  href={`/learn/${course.id}`}
                  className="relative aspect-video w-full overflow-hidden bg-slate-100 block"
                >
                  <img
                    src={
                      course.thumbnailUrl ||
                      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80'
                    }
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/10 transition flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-white text-indigo-600 shadow flex items-center justify-center group-hover:scale-105 transition-transform">
                      <PlayCircle className="w-6 h-6 fill-indigo-50" />
                    </div>
                  </div>
                </a>

                {/* Card Body */}
                <div className="p-5 flex flex-col flex-1 justify-between space-y-4">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-indigo-600">
                      {course.category?.name || 'Full Stack'}
                    </span>
                    <a href={`/learn/${course.id}`}>
                      <h3 className="font-semibold text-sm text-slate-900 line-clamp-2 hover:text-indigo-600 transition-colors">
                        {course.title}
                      </h3>
                    </a>
                    <p className="text-xs text-slate-500">
                      Instructor: {course.instructor?.user.name || 'LearnX Expert'}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-slate-500">Course Progress</span>
                      <span
                        className={
                          progressPercent === 100 ? 'text-emerald-600 font-semibold' : 'text-slate-900 font-semibold'
                        }
                      >
                        {progressPercent}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          progressPercent === 100 ? 'bg-emerald-600' : 'bg-indigo-600'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Action CTA */}
                  <div className="pt-2.5 border-t border-slate-100">
                    <a href={`/learn/${course.id}`} className="block">
                      <Button
                        size="sm"
                        className="w-full font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                      >
                        {progressPercent === 100 ? 'Review Course' : 'Continue Learning'}
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Card className="p-16 text-center space-y-4 bg-white border border-slate-200 rounded-xl">
            <BookOpen className="w-10 h-10 text-indigo-600 mx-auto" />
            <h3 className="text-base font-semibold text-slate-900">No enrolled courses yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Discover thousands of production-ready software engineering courses taught by elite industry leaders.
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
