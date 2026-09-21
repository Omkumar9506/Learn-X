'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import { enrollmentService } from '../../../services/enrollment.service';
import { Course } from '../../../types';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Skeleton } from '../../../components/ui/skeleton';
import {
  BookOpen,
  PlayCircle,
  Award,
  CheckCircle2,
  Clock,
  Flame,
  Heart,
  Sparkles,
  Compass,
  Check,
  BarChart3,
  ExternalLink,
} from 'lucide-react';

export default function StudentDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [enrollments, setEnrollments] = useState<
    { course: Course; progressPercent: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'in_progress' | 'completed'>('all');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await enrollmentService.getMyEnrollments();
        setEnrollments(data);
      } catch (err) {
        console.error('Failed to load dashboard enrollments', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const totalEnrolled = enrollments.length;
  const completedCount = enrollments.filter((e) => e.progressPercent === 100).length;
  const inProgressCount = enrollments.filter(
    (e) => e.progressPercent > 0 && e.progressPercent < 100,
  ).length;

  const activeCourseData =
    enrollments.find((e) => e.progressPercent > 0 && e.progressPercent < 100) ||
    enrollments[0];

  const filteredEnrollments = enrollments.filter((e) => {
    if (activeFilter === 'in_progress') return e.progressPercent < 100;
    if (activeFilter === 'completed') return e.progressPercent === 100;
    return true;
  });

  const weeklyActivity = [
    { day: 'Mon', hours: 2.2, height: '55%' },
    { day: 'Tue', hours: 1.8, height: '45%' },
    { day: 'Wed', hours: 3.5, height: '88%' },
    { day: 'Thu', hours: 2.0, height: '50%' },
    { day: 'Fri', hours: 4.2, height: '100%' },
    { day: 'Sat', hours: 3.8, height: '90%' },
    { day: 'Sun', hours: 2.6, height: '65%' },
  ];

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Greeting & Streak */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Student Workspace
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Welcome back, {user?.name?.split(' ')[0] || 'Learner'}! 👋
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Keep up the momentum. You have completed{' '}
              <span className="font-semibold text-slate-900">12 lessons</span> this week.
            </p>
          </div>

          {/* Learning Streak Pill */}
          <div className="flex items-center gap-3.5 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
              <Flame className="w-5 h-5 fill-amber-500" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold text-slate-900">5-Day</span>
                <span className="text-xs uppercase font-semibold text-amber-700">
                  Streak!
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Study today to protect your streak
              </p>
            </div>
          </div>
        </div>

        {/* KPI Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 bg-white border border-slate-200 shadow-sm rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Enrolled Courses</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">
              {loading ? <Skeleton className="h-8 w-12" /> : totalEnrolled}
            </div>
            <p className="text-xs text-slate-500 mt-1">{inProgressCount} currently active</p>
          </Card>

          <Card className="p-5 bg-white border border-slate-200 shadow-sm rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Hours Learned</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">
              {loading ? <Skeleton className="h-8 w-12" /> : '28.4h'}
            </div>
            <p className="text-xs text-emerald-600 font-semibold mt-1">
              +4.2h this week
            </p>
          </Card>

          <Card className="p-5 bg-white border border-slate-200 shadow-sm rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Completed</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">
              {loading ? <Skeleton className="h-8 w-12" /> : completedCount}
            </div>
            <p className="text-xs text-slate-500 mt-1">Mastery verified</p>
          </Card>

          <Card className="p-5 bg-white border border-slate-200 shadow-sm rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Certificates</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">
              {loading ? <Skeleton className="h-8 w-12" /> : completedCount > 0 ? completedCount : 1}
            </div>
            <Link
              href={completedCount > 0 && activeCourseData ? `/certificates/${activeCourseData.course.id}` : '/certificates/demo'}
              className="text-xs text-indigo-600 font-semibold mt-1 inline-flex items-center gap-1 hover:underline"
            >
              View credentials <ExternalLink className="w-3 h-3" />
            </Link>
          </Card>
        </div>

        {/* Main Grid: Jump Back In Hero + Weekly Study Activity Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Jump Back In Hero (8 cols) */}
          <div className="lg:col-span-8 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <PlayCircle className="w-5 h-5 text-indigo-600" />
                Continue Learning
              </h2>
              <Link
                href="/dashboard/learning"
                className="text-xs font-semibold text-indigo-600 hover:underline"
              >
                View All Enrolled ({enrollments.length})
              </Link>
            </div>

            {activeCourseData ? (
              <div className="flex-1 rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm flex flex-col sm:flex-row">
                <div className="sm:w-2/5 relative aspect-video sm:aspect-auto bg-slate-100 shrink-0">
                  <img
                    src={
                      activeCourseData.course.thumbnailUrl ||
                      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80'
                    }
                    alt={activeCourseData.course.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-slate-900/30 flex items-center justify-center">
                    <Link
                      href={`/learn/${activeCourseData.course.id}`}
                      className="w-11 h-11 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md hover:bg-indigo-700 transition"
                    >
                      <PlayCircle className="w-6 h-6 fill-white" />
                    </Link>
                  </div>
                </div>

                <div className="p-6 flex flex-col justify-between flex-1 space-y-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5">
                      <span className="font-semibold text-indigo-600">
                        {activeCourseData.course.level}
                      </span>
                      <span>•</span>
                      <span>Instructor: {activeCourseData.course.instructor?.user.name || 'Lead Instructor'}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 line-clamp-2">
                      {activeCourseData.course.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {activeCourseData.course.subtitle ||
                        activeCourseData.course.description ||
                        'Continue through high-impact modules, code walkthroughs, and milestone quiz assessments.'}
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700">
                        Course Progress
                      </span>
                      <span className="font-mono font-bold text-indigo-600">
                        {activeCourseData.progressPercent}% Complete
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                        style={{ width: `${Math.max(5, activeCourseData.progressPercent)}%` }}
                      />
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <Link href={`/learn/${activeCourseData.course.id}`} className="flex-1">
                        <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium gap-1.5 rounded-lg">
                          <PlayCircle className="w-4 h-4" />
                          Resume Learning
                        </Button>
                      </Link>
                      <Link href={`/courses/${activeCourseData.course.slug}`}>
                        <Button variant="outline" className="border-slate-300 text-slate-700 rounded-lg">
                          Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center flex flex-col items-center justify-center space-y-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    No courses in progress yet
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Explore our curated software engineering catalog to get started.
                  </p>
                </div>
                <Link href="/courses">
                  <Button size="sm" className="bg-indigo-600 text-white font-medium rounded-lg">
                    Browse Catalog
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Weekly Study Activity Card (4 cols) */}
          <div className="lg:col-span-4 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                Study Analytics
              </h2>
              <span className="text-xs font-semibold text-emerald-700">
                Active Week
              </span>
            </div>

            <Card className="flex-1 p-5 bg-white border border-slate-200 shadow-sm rounded-xl flex flex-col justify-between space-y-5">
              <div>
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl font-bold text-slate-900">
                      20.1 hrs
                    </span>
                    <p className="text-xs text-slate-500 mt-0.5">Studied in the last 7 days</p>
                  </div>
                  <Badge variant="success" className="font-semibold">
                    +18% vs last week
                  </Badge>
                </div>

                {/* Bar Chart Visualization */}
                <div className="h-32 pt-4 flex items-end justify-between gap-2 border-b border-slate-100 pb-3">
                  {weeklyActivity.map((day) => (
                    <div key={day.day} className="flex-1 flex flex-col items-center gap-1.5">
                      <span className="text-[10px] font-mono text-slate-400">{day.hours}h</span>
                      <div className="w-full bg-slate-100 rounded-t h-20 flex items-end overflow-hidden">
                        <div
                          className="w-full bg-indigo-600 rounded-t"
                          style={{ height: day.height }}
                        />
                      </div>
                      <span className="text-[10px] font-medium text-slate-600">
                        {day.day}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions Shortcuts */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Quick Links
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/wishlist"
                    className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 flex items-center gap-2 transition"
                  >
                    <Heart className="w-4 h-4 text-rose-500" />
                    Wishlist
                  </Link>
                  <Link
                    href="/courses"
                    className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 flex items-center gap-2 transition"
                  >
                    <Compass className="w-4 h-4 text-indigo-600" />
                    Explore
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Enrolled Courses Section with Tabs */}
        <div className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                My Courses ({enrollments.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Access your enrolled learning content and resume at any time.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {(['all', 'in_progress', 'completed'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                    activeFilter === filter
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {filter.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

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
          ) : filteredEnrollments.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEnrollments.map(({ course, progressPercent }) => (
                <div
                  key={course.id}
                  className="group flex flex-col rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:border-slate-300 transition"
                >
                  <div className="relative aspect-video w-full bg-slate-100 overflow-hidden">
                    <img
                      src={
                        course.thumbnailUrl ||
                        'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80'
                      }
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    {progressPercent === 100 && (
                      <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-600 text-white shadow flex items-center gap-1">
                        <Check className="w-3 h-3" /> Completed
                      </div>
                    )}
                  </div>

                  <div className="p-5 flex flex-col flex-1 justify-between space-y-4">
                    <div>
                      <h3 className="font-semibold text-sm text-slate-900 line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        By {course.instructor?.user.name || 'Instructor'}
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Progress</span>
                        <span className="font-semibold font-mono text-indigo-600">
                          {progressPercent}%
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
                      <Link
                        href={`/learn/${course.id}`}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                      >
                        <PlayCircle className="w-4 h-4" />
                        {progressPercent === 100 ? 'Review Lectures' : 'Continue Learning'}
                      </Link>

                      {progressPercent === 100 && (
                        <Link
                          href={`/certificates/${course.id}`}
                          className="text-xs font-semibold text-amber-600 hover:underline flex items-center gap-1"
                        >
                          <Award className="w-3.5 h-3.5" /> Certificate
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center rounded-xl border border-dashed border-slate-300 bg-white space-y-3">
              <BookOpen className="w-7 h-7 text-slate-400 mx-auto" />
              <p className="text-sm font-medium text-slate-700">
                No courses matching &quot;{activeFilter}&quot;
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveFilter('all')}
                className="text-xs"
              >
                Reset Filter
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
