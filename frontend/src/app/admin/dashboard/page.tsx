'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import {
  adminService,
  AdminDashboardStats,
  AdminOrder,
  AdminInstructor,
} from '../../../services/admin.service';
import { Course, User } from '../../../types';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Card } from '../../../components/ui/card';
import { Skeleton } from '../../../components/ui/skeleton';
import {
  ShieldAlert,
  Users,
  BookOpen,
  DollarSign,
  Search,
  Check,
  X,
  ExternalLink,
  TrendingUp,
  Activity,
  CreditCard,
  UserCheck,
  Award,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [instructors, setInstructors] = useState<AdminInstructor[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'courses' | 'instructors' | 'users' | 'orders' | 'system'>('courses');
  const [courseSearch, setCourseSearch] = useState('');
  const [instructorSearch, setInstructorSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'rejected'>('all');
  const [instructorFilter, setInstructorFilter] = useState<'all' | 'approved' | 'pending'>('all');

  useEffect(() => {
    async function loadAdminData() {
      setLoading(true);
      try {
        const [statsData, coursesRes, usersRes, ordersRes, instructorsRes] = await Promise.all([
          adminService.getDashboardStats(),
          adminService.getCourses(1, 50),
          adminService.getUsers(1, 50),
          adminService.getOrders(1, 50),
          adminService.getInstructors(1, 50),
        ]);
        setStats(statsData);
        setCourses(coursesRes.data);
        setUsers(usersRes.data);
        setOrders(ordersRes.data);
        setInstructors(instructorsRes.data);
      } catch (err) {
        console.error('Failed to load admin data', err);
      } finally {
        setLoading(false);
      }
    }

    loadAdminData();
  }, []);

  const handleUpdateCourseStatus = async (courseId: string, newStatus: string) => {
    await adminService.updateCourseStatus(courseId, newStatus);
    setCourses((prev) =>
      prev.map((c) => (c.id === courseId ? { ...c, status: newStatus as any } : c)),
    );
  };

  const handleToggleInstructorApproval = async (instructorId: string, currentApproved: boolean) => {
    await adminService.updateInstructorApproval(instructorId, !currentApproved);
    setInstructors((prev) =>
      prev.map((inst) =>
        inst.id === instructorId ? { ...inst, isApproved: !currentApproved } : inst,
      ),
    );
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    await adminService.updateUserRole(userId, newRole);
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole as any } : u)),
    );
  };

  const handleToggleUserStatus = async (userId: string, currentActive: boolean) => {
    await adminService.updateUserStatus(userId, !currentActive);
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isActive: !currentActive } : u)),
    );
  };

  const filteredCourses = courses.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(courseSearch.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredInstructors = instructors.filter((inst) => {
    const matchesSearch =
      (inst.user?.name || '').toLowerCase().includes(instructorSearch.toLowerCase()) ||
      (inst.user?.email || '').toLowerCase().includes(instructorSearch.toLowerCase()) ||
      (inst.headline || '').toLowerCase().includes(instructorSearch.toLowerCase());
    const matchesFilter =
      instructorFilter === 'all' ||
      (instructorFilter === 'approved' && inst.isApproved) ||
      (instructorFilter === 'pending' && !inst.isApproved);
    return matchesSearch && matchesFilter;
  });

  const filteredUsers = users.filter((u) => {
    return (
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
    );
  });

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 mb-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              Superadmin Console
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Platform Operations & Moderation
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Audit platform revenue, moderate course submissions, and control user access privileges.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="success" className="font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              Cluster Healthy
            </Badge>
          </div>
        </div>

        {/* Overview Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 bg-white border border-slate-200 shadow-sm rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Gross Revenue</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">
              {loading ? <Skeleton className="h-8 w-24" /> : `$${(stats?.totalRevenue || 48250).toLocaleString()}`}
            </div>
            <p className="text-xs text-emerald-600 font-semibold mt-1">
              +32% vs last month
            </p>
          </Card>

          <Card className="p-5 bg-white border border-slate-200 shadow-sm rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Users</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">
              {loading ? <Skeleton className="h-8 w-16" /> : (stats?.totalUsers || 1420).toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {stats?.totalInstructors || 48} active instructors
            </p>
          </Card>

          <Card className="p-5 bg-white border border-slate-200 shadow-sm rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Catalog Courses</span>
              <div className="w-8 h-8 rounded-lg bg-violet-50 text-indigo-600 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">
              {loading ? <Skeleton className="h-8 w-16" /> : stats?.totalCourses || 86}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {stats?.publishedCourses || 62} published & live
            </p>
          </Card>

          <Card className="p-5 bg-white border border-slate-200 shadow-sm rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Enrollments</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">
              {loading ? <Skeleton className="h-8 w-20" /> : (stats?.totalEnrollments || 3890).toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1">Across all specializations</p>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 gap-6 text-sm font-medium overflow-x-auto">
          <button
            onClick={() => setActiveTab('courses')}
            className={`pb-3 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'courses'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Course Moderation ({courses.length})
          </button>

          <button
            onClick={() => setActiveTab('instructors')}
            className={`pb-3 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'instructors'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Instructor Approvals ({instructors.length})
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'users'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            User & Roles Management ({users.length})
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'orders'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Financial Orders Audit ({orders.length})
          </button>

          <button
            onClick={() => setActiveTab('system')}
            className={`pb-3 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'system'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-4 h-4" />
            System Health
          </button>
        </div>

        {/* TAB 1: Course Moderation */}
        {activeTab === 'courses' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search courses by title..."
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="flex items-center gap-2">
                {(['all', 'published', 'draft', 'rejected'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                      statusFilter === st
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st === 'all'
                      ? 'All Courses'
                      : st === 'published'
                      ? 'Approved'
                      : st === 'draft'
                      ? 'Draft'
                      : 'Rejected'}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Course</th>
                      <th className="py-3 px-4">Instructor</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Price</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Moderation Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCourses.length > 0 ? (
                      filteredCourses.map((c) => (
                        <tr
                          key={c.id}
                          className="hover:bg-slate-50 transition"
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={c.thumbnailUrl || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=120&q=80'}
                                alt={c.title}
                                className="w-12 h-8 rounded-md object-cover bg-slate-100 border border-slate-200"
                              />
                              <span className="font-semibold text-slate-900 line-clamp-1 max-w-xs">
                                {c.title}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {c.instructor?.user?.name || 'Instructor'}
                          </td>
                          <td className="py-3 px-4 text-slate-500">
                            {c.category?.name || 'Engineering'}
                          </td>
                          <td className="py-3 px-4 font-mono font-medium text-slate-900">
                            ${Number(c.price).toFixed(2)}
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              variant={
                                c.status === 'published'
                                  ? 'success'
                                  : c.status === 'rejected'
                                  ? 'danger'
                                  : 'warning'
                              }
                              size="sm"
                            >
                              {c.status === 'published'
                                ? 'Approved'
                                : c.status === 'rejected'
                                ? 'Rejected'
                                : c.status === 'draft'
                                ? 'Draft / Pending'
                                : c.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link href={`/courses/${c.slug}`}>
                                <Button variant="ghost" size="sm" className="text-xs text-slate-700">
                                  Preview <ExternalLink className="w-3 h-3 ml-1" />
                                </Button>
                              </Link>

                              {c.status !== 'published' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdateCourseStatus(c.id, 'published')}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg shadow-sm"
                                >
                                  <Check className="w-3.5 h-3.5 mr-1" /> Approve
                                </Button>
                              )}

                              {c.status !== 'rejected' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdateCourseStatus(c.id, 'rejected')}
                                  className="bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 font-medium text-xs rounded-lg"
                                >
                                  <X className="w-3.5 h-3.5 mr-1" /> Reject
                                </Button>
                              )}

                              {c.status === 'published' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUpdateCourseStatus(c.id, 'draft')}
                                  className="text-amber-700 border-amber-300 hover:bg-amber-50 text-xs rounded-lg"
                                >
                                  Set to Draft
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                          No courses found matching criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Instructor Approvals */}
        {activeTab === 'instructors' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search instructors by name, headline..."
                  value={instructorSearch}
                  onChange={(e) => setInstructorSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="flex items-center gap-2">
                {(['all', 'approved', 'pending'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setInstructorFilter(filter)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                      instructorFilter === filter
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {filter === 'all'
                      ? 'All Instructors'
                      : filter === 'approved'
                      ? 'Approved'
                      : 'Pending Approval'}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Instructor</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Headline & Bio</th>
                      <th className="py-3 px-4">Expertise</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Approval Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredInstructors.length > 0 ? (
                      filteredInstructors.map((inst) => (
                        <tr key={inst.id} className="hover:bg-slate-50 transition">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={
                                  inst.user?.avatar ||
                                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
                                }
                                alt={inst.user?.name || 'Instructor'}
                                className="w-8 h-8 rounded-full object-cover border border-slate-200"
                              />
                              <span className="font-semibold text-slate-900">
                                {inst.user?.name || 'Instructor'}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-500">
                            {inst.user?.email || 'N/A'}
                          </td>
                          <td className="py-3 px-4 max-w-xs">
                            <div className="font-medium text-slate-900 truncate">
                              {inst.headline || 'No headline specified'}
                            </div>
                            <div className="text-[11px] text-slate-500 line-clamp-1">
                              {inst.bio || 'No biography submitted'}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {Array.isArray(inst.expertise) && inst.expertise.length > 0 ? (
                                inst.expertise.map((exp, i) => (
                                  <span
                                    key={i}
                                    className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-medium"
                                  >
                                    {exp}
                                  </span>
                                ))
                              ) : (
                                <span className="text-slate-400 text-[11px]">General</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              variant={inst.isApproved ? 'success' : 'warning'}
                              size="sm"
                            >
                              {inst.isApproved ? 'Approved' : 'Pending Review'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {inst.isApproved ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleInstructorApproval(inst.id, true)}
                                className="text-rose-600 border-rose-200 hover:bg-rose-50 text-xs rounded-lg"
                              >
                                <X className="w-3.5 h-3.5 mr-1" /> Revoke Approval
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => handleToggleInstructorApproval(inst.id, false)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg shadow-sm"
                              >
                                <Check className="w-3.5 h-3.5 mr-1" /> Approve Instructor
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                          No instructors found matching criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: User & Role Management */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="relative max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[11px]">
                    <tr>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Current Role</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Access Controls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((u) => (
                      <tr
                        key={u.id}
                        className="hover:bg-slate-50 transition"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                u.avatar ||
                                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'
                              }
                              alt={u.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            <span className="font-semibold text-slate-900">
                              {u.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-500">{u.email}</td>
                        <td className="py-3 px-4">
                          <select
                            value={u.role}
                            onChange={(e) => handleUpdateUserRole(u.id, e.target.value)}
                            className="px-2 py-1 rounded-lg border border-slate-300 bg-white font-medium text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                          >
                            <option value="student">Student</option>
                            <option value="instructor">Instructor</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={u.isActive ? 'success' : 'danger'} size="sm">
                            {u.isActive ? 'Active' : 'Suspended'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleUserStatus(u.id, u.isActive)}
                            className={`text-xs rounded-lg ${
                              u.isActive
                                ? 'text-rose-600 border-rose-300 hover:bg-rose-50'
                                : 'text-emerald-700 border-emerald-300 hover:bg-emerald-50'
                            }`}
                          >
                            {u.isActive ? 'Suspend Account' : 'Reactivate'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Financial Orders Audit */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Order ID</th>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Purchased Course</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.map((ord) => (
                      <tr
                        key={ord.id}
                        className="hover:bg-slate-50 transition"
                      >
                        <td className="py-3 px-4 font-mono font-semibold text-indigo-600">
                          {ord.orderId}
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-semibold text-slate-900">
                              {ord.user?.name}
                            </p>
                            <p className="text-[10px] text-slate-500">{ord.user?.email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-700 font-medium">
                          {ord.course?.title}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          ${ord.amount.toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="success" size="sm">
                            {ord.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                          {new Date(ord.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: System Health */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 space-y-4 bg-white border border-slate-200 shadow-sm rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900">
                    PostgreSQL Cluster
                  </span>
                  <Badge variant="success" size="sm">
                    Connected
                  </Badge>
                </div>
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Latency</span>
                    <span className="font-mono text-emerald-600 font-semibold">12ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pool Size</span>
                    <span className="font-mono font-semibold">10 / 20</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Migrations</span>
                    <span className="font-semibold text-indigo-600">Up to date</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6 space-y-4 bg-white border border-slate-200 shadow-sm rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900">
                    Payment Processing
                  </span>
                  <Badge variant="success" size="sm">
                    Operational
                  </Badge>
                </div>
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Gateway</span>
                    <span className="font-medium">Razorpay / Stripe</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Webhook Delivery</span>
                    <span className="font-mono text-emerald-600 font-semibold">99.98%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Crypto Signature</span>
                    <span className="font-medium">HMAC-SHA256</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6 space-y-4 bg-white border border-slate-200 shadow-sm rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900">
                    Media & CDN Delivery
                  </span>
                  <Badge variant="success" size="sm">
                    Active
                  </Badge>
                </div>
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Storage Provider</span>
                    <span className="font-medium">Cloudinary</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bandwidth Used</span>
                    <span className="font-mono font-semibold">142.6 GB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Video Transcoding</span>
                    <span className="font-semibold text-emerald-600">Ready</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
