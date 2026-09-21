'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../../hooks/useAuth';
import { instructorService } from '../../../../services/instructor.service';
import { reviewService } from '../../../../services/review.service';
import { Course, Review } from '../../../../types';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Card } from '../../../../components/ui/card';
import { Skeleton } from '../../../../components/ui/skeleton';
import { Modal } from '../../../../components/ui/modal';
import {
  BookOpen,
  Users,
  DollarSign,
  Star,
  Plus,
  Edit,
  Eye,
  CheckCircle,
  Sparkles,
  TrendingUp,
  Search,
  CheckCircle2,
  CreditCard,
  Building2,
  MessageSquare,
} from 'lucide-react';

export default function InstructorDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'courses' | 'analytics' | 'reviews' | 'payouts'>('courses');
  const [courses, setCourses] = useState<Course[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
    averageRating: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Payout Modal State
  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('3420');
  const [payoutRequested, setPayoutRequested] = useState(false);
  const [isProcessingPayout, setIsProcessingPayout] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [statsData, coursesData, reviewsData] = await Promise.all([
          instructorService.getDashboardStats(),
          instructorService.getMyCourses(),
          reviewService.getCourseReviews('course-1'),
        ]);
        setStats(statsData);
        setCourses(coursesData);
        setReviews(reviewsData);
      } catch (err) {
        console.error('Failed to load instructor data', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handlePublishToggle = async (courseId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'published' ? 'draft' : 'published';
    if (nextStatus === 'published') {
      await instructorService.publishCourse(courseId);
    }
    setCourses((prev) =>
      prev.map((c) => (c.id === courseId ? { ...c, status: nextStatus as any } : c)),
    );
  };

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingPayout(true);
    setTimeout(() => {
      setIsProcessingPayout(false);
      setPayoutRequested(true);
    }, 1000);
  };

  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Simulated 6-Month Revenue Data
  const revenueHistory = [
    { month: 'Oct', revenue: 2850, enrollments: 42, height: '45%' },
    { month: 'Nov', revenue: 3920, enrollments: 64, height: '62%' },
    { month: 'Dec', revenue: 4700, enrollments: 78, height: '75%' },
    { month: 'Jan', revenue: 5200, enrollments: 89, height: '82%' },
    { month: 'Feb', revenue: 5800, enrollments: 96, height: '90%' },
    { month: 'Mar', revenue: 6420, enrollments: 114, height: '100%' },
  ];

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              Instructor Studio
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Welcome, {user?.name || 'Instructor'}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Monitor course enrollment metrics, author new curriculum, and review student progress.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setPayoutModalOpen(true)}
              className="text-xs font-medium gap-1.5 border-slate-300 text-slate-700 bg-white rounded-lg"
            >
              <DollarSign className="w-4 h-4 text-emerald-600" />
              Payouts ($3,420)
            </Button>
            <Link href="/instructor/courses/create">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium gap-1.5 text-xs rounded-lg shadow-sm">
                <Plus className="w-4 h-4" />
                Create Course
              </Button>
            </Link>
          </div>
        </div>

        {/* KPI Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 bg-white border border-slate-200 shadow-sm rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Authored Courses</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">
              {loading ? <Skeleton className="h-8 w-16" /> : courses.length || stats.totalCourses}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>Active in catalog</span>
            </div>
          </Card>

          <Card className="p-5 bg-white border border-slate-200 shadow-sm rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Enrolled Students</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">
              {loading ? <Skeleton className="h-8 w-20" /> : (stats.totalStudents || 1240).toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>+14% this month</span>
            </div>
          </Card>

          <Card className="p-5 bg-white border border-slate-200 shadow-sm rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Gross Revenue</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">
              {loading ? <Skeleton className="h-8 w-24" /> : `$${(stats.totalRevenue || 28950).toLocaleString()}`}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>Payout ready</span>
            </div>
          </Card>

          <Card className="p-5 bg-white border border-slate-200 shadow-sm rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Average Rating</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Star className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">
              {loading ? <Skeleton className="h-8 w-16" /> : `${stats.averageRating || 4.9} ★`}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Across 180+ reviews</div>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 gap-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab('courses')}
            className={`pb-3 border-b-2 transition flex items-center gap-2 ${
              activeTab === 'courses'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Courses & Content ({courses.length})
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`pb-3 border-b-2 transition flex items-center gap-2 ${
              activeTab === 'analytics'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Revenue & Analytics
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 border-b-2 transition flex items-center gap-2 ${
              activeTab === 'reviews'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Student Reviews ({reviews.length})
          </button>

          <button
            onClick={() => setActiveTab('payouts')}
            className={`pb-3 border-b-2 transition flex items-center gap-2 ${
              activeTab === 'payouts'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Payouts & Banking
          </button>
        </div>

        {/* TAB 1: Courses Management */}
        {activeTab === 'courses' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search authored courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <Link href="/instructor/courses/create">
                <Button size="sm" className="bg-indigo-600 text-white font-medium text-xs gap-1.5 rounded-lg">
                  <Plus className="w-4 h-4" /> Create Another Course
                </Button>
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-xl" />
                ))}
              </div>
            ) : filteredCourses.length > 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden divide-y divide-slate-100 shadow-sm">
                {filteredCourses.map((course) => (
                  <div
                    key={course.id}
                    className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-16 rounded-lg overflow-hidden bg-slate-100 shrink-0 relative aspect-video">
                        <img
                          src={
                            course.thumbnailUrl ||
                            'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80'
                          }
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm text-slate-900 line-clamp-1">
                            {course.title}
                          </h3>
                          <Badge
                            variant={course.status === 'published' ? 'success' : 'warning'}
                            size="sm"
                          >
                            {course.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2.5 text-xs text-slate-500">
                          <span>{course.category?.name || 'Development'}</span>
                          <span>•</span>
                          <span className="font-medium text-slate-900">
                            ${course.price}
                          </span>
                          <span>•</span>
                          <span>{course.totalEnrollments || 120} students</span>
                          <span>•</span>
                          <span>{course.averageRating || 4.9} ★</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center">
                      <Link href={`/courses/${course.slug}`}>
                        <Button variant="ghost" size="sm" title="View Public Landing Page" className="text-slate-700">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </Link>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePublishToggle(course.id, course.status)}
                        className={`text-xs rounded-lg ${
                          course.status === 'published'
                            ? 'text-amber-700 border-amber-300 hover:bg-amber-50'
                            : 'text-emerald-700 border-emerald-300 hover:bg-emerald-50'
                        }`}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        {course.status === 'published' ? 'Unpublish' : 'Publish'}
                      </Button>

                      <Link href={`/instructor/courses/${course.id}/edit`}>
                        <Button variant="outline" size="sm" className="text-xs border-slate-300 text-slate-700 rounded-lg">
                          <Edit className="w-4 h-4 mr-1" />
                          Curriculum
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center space-y-4 bg-white border border-slate-200 rounded-xl">
                <BookOpen className="w-10 h-10 text-indigo-600 mx-auto" />
                <h3 className="text-base font-semibold text-slate-900">No courses found matching &quot;{searchQuery}&quot;</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try adjusting your search query or author a new course from scratch.
                </p>
              </Card>
            )}
          </div>
        )}

        {/* TAB 2: Revenue & Analytics */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Revenue Trend Chart */}
              <Card className="lg:col-span-8 p-6 space-y-6 bg-white border border-slate-200 shadow-sm rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      6-Month Revenue Trend
                    </h3>
                    <p className="text-xs text-slate-500">Gross student transactions over time</p>
                  </div>
                  <Badge variant="success" className="font-semibold">
                    +24.8% MoM Growth
                  </Badge>
                </div>

                {/* Bar Chart Visualization */}
                <div className="h-56 flex items-end justify-between gap-4 pt-4 border-b border-slate-100 pb-3">
                  {revenueHistory.map((item) => (
                    <div key={item.month} className="flex-1 flex flex-col items-center gap-1.5">
                      <span className="text-xs font-mono font-semibold text-slate-900">
                        ${item.revenue}
                      </span>
                      <div className="w-full bg-slate-100 rounded-t h-36 flex items-end overflow-hidden">
                        <div
                          className="w-full bg-indigo-600 rounded-t transition-all"
                          style={{ height: item.height }}
                        />
                      </div>
                      <span className="text-xs font-medium text-slate-600">
                        {item.month}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {item.enrollments} enr.
                      </span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[11px] font-medium text-slate-500">Total Orders</span>
                    <p className="text-lg font-bold text-slate-900">483</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[11px] font-medium text-slate-500">Avg Order Value</span>
                    <p className="text-lg font-bold text-slate-900">$78.40</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[11px] font-medium text-slate-500">Refund Rate</span>
                    <p className="text-lg font-bold text-emerald-600">0.8%</p>
                  </div>
                </div>
              </Card>

              {/* Performance Demographics */}
              <Card className="lg:col-span-4 p-6 flex flex-col justify-between space-y-6 bg-white border border-slate-200 shadow-sm rounded-xl">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Learner Breakdown
                  </h3>
                  <p className="text-xs text-slate-500">Engagement & completion metrics</p>

                  <div className="space-y-4 pt-5">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-slate-600">
                          Course Completion Rate
                        </span>
                        <span className="font-semibold text-indigo-600">76%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full bg-indigo-600 rounded-full" style={{ width: '76%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-slate-600">
                          Quiz Pass Rate (First Try)
                        </span>
                        <span className="font-semibold text-emerald-600">84%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full bg-emerald-600 rounded-full" style={{ width: '84%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-slate-600">
                          Positive Reviews (4-5 Stars)
                        </span>
                        <span className="font-semibold text-amber-600">96%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: '96%' }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-indigo-50 border border-indigo-100 text-xs text-indigo-900">
                  <p className="font-semibold flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    Top Performing Instructor
                  </p>
                  Your curriculum pacing ranks in the top 5% of all engineering authors on LearnX.
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 3: Student Reviews Feed */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Student Reviews ({reviews.length})
              </h3>
              <span className="text-xs text-slate-500">Updated in real-time</span>
            </div>

            <div className="space-y-3">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-5 rounded-xl border border-slate-200 bg-white space-y-3 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          rev.user?.avatar ||
                          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
                        }
                        alt={rev.user?.name}
                        className="w-9 h-9 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="font-semibold text-xs text-slate-900">
                          {rev.user?.name}
                        </h4>
                        <p className="text-[10px] text-slate-400">
                          {new Date(rev.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center text-amber-500 text-xs font-semibold gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                          }`}
                        />
                      ))}
                      <span className="ml-1 text-slate-700 font-mono">
                        {rev.rating}.0
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {rev.comment}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: Payouts & Banking */}
        {activeTab === 'payouts' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-5 space-y-2.5 bg-white border border-slate-200 shadow-sm rounded-xl">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Available Payout</span>
                <p className="text-3xl font-bold text-slate-900">$3,420.00</p>
                <p className="text-xs text-slate-500">Ready for direct bank transfer</p>
                <Button
                  onClick={() => setPayoutModalOpen(true)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs mt-2 rounded-lg"
                >
                  Withdraw Funds
                </Button>
              </Card>

              <Card className="p-5 space-y-2.5 bg-white border border-slate-200 shadow-sm rounded-xl">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Lifetime Payouts</span>
                <p className="text-3xl font-bold text-slate-900">$25,530.00</p>
                <p className="text-xs text-emerald-600 font-semibold">12 scheduled cycles paid</p>
              </Card>

              <Card className="p-5 space-y-2.5 bg-white border border-slate-200 shadow-sm rounded-xl">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Linked Payout Account</span>
                <div className="flex items-center gap-2 pt-1">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                  <span className="text-sm font-semibold text-slate-900">
                    JPMorgan Chase •••• 4912
                  </span>
                </div>
                <Badge variant="success" size="sm">
                  Verified & Active
                </Badge>
              </Card>
            </div>

            <Card className="p-6 space-y-4 bg-white border border-slate-200 shadow-sm rounded-xl">
              <h3 className="text-base font-bold text-slate-900">Recent Payout History</h3>
              <div className="divide-y divide-slate-100 text-xs">
                {[
                  { id: 'PAY-904', date: 'March 1, 2026', amount: '$4,280.00', status: 'Completed' },
                  { id: 'PAY-812', date: 'February 1, 2026', amount: '$3,950.00', status: 'Completed' },
                  { id: 'PAY-745', date: 'January 1, 2026', amount: '$4,810.00', status: 'Completed' },
                ].map((row) => (
                  <div key={row.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-semibold text-indigo-600">
                        {row.id}
                      </span>
                      <span className="text-slate-500">{row.date}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold font-mono text-slate-900">
                        {row.amount}
                      </span>
                      <Badge variant="success" size="sm">
                        {row.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Payout Request Modal */}
        <Modal
          isOpen={payoutModalOpen}
          onClose={() => {
            setPayoutModalOpen(false);
            setPayoutRequested(false);
          }}
          title="Request Earnings Payout"
          description="Transfer your course earnings directly to your verified bank account."
          maxWidth="md"
        >
          {payoutRequested ? (
            <div className="text-center py-6 space-y-4 bg-white">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Payout Initiated!</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Your transfer of ${payoutAmount} to Chase •••• 4912 has been processed. Funds will
                  arrive within 1-2 business days.
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  setPayoutModalOpen(false);
                  setPayoutRequested(false);
                }}
                className="bg-indigo-600 text-white font-medium rounded-lg"
              >
                Done
              </Button>
            </div>
          ) : (
            <form onSubmit={handleRequestPayout} className="space-y-4 pt-2 bg-white">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="text-xs text-slate-500">Available Balance</span>
                <p className="text-2xl font-bold text-slate-900">$3,420.00</p>
                <p className="text-xs text-slate-500">Destination: Chase Bank •••• 4912</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Withdrawal Amount ($)</label>
                <input
                  type="number"
                  max={3420}
                  min={50}
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  className="w-full rounded-lg bg-white border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setPayoutModalOpen(false)}
                  className="text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isProcessingPayout || !payoutAmount}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg"
                >
                  {isProcessingPayout ? 'Processing...' : 'Confirm Transfer'}
                </Button>
              </div>
            </form>
          )}
        </Modal>
      </div>
    </div>
  );
}
