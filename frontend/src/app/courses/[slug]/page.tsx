'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { courseService } from '../../../services/course.service';
import { Course } from '../../../types';
import { RatingStars } from '../../../components/ui/rating-stars';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Modal } from '../../../components/ui/modal';
import { Skeleton } from '../../../components/ui/skeleton';
import {
  PlayCircle,
  Clock,
  BookOpen,
  Award,
  Globe,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Heart,
  ShieldCheck,
  Smartphone,
  FileText,
} from 'lucide-react';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [activePreviewVideo, setActivePreviewVideo] = useState<string | null>(null);

  useEffect(() => {
    async function loadCourse() {
      if (!slug) return;
      setLoading(true);
      try {
        const data = await courseService.getCourseBySlug(slug);
        setCourse(data);

        // Expand first section by default
        if (data.sections && data.sections.length > 0) {
          setExpandedSections({ [data.sections[0].id]: true });
        }
      } catch (err) {
        console.error('Failed to load course details', err);
      } finally {
        setLoading(false);
      }
    }

    loadCourse();
  }, [slug]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const openVideoPreview = (videoUrl?: string) => {
    setActivePreviewVideo(videoUrl || course?.promoVideoUrl || 'https://www.w3schools.com/html/mov_bbb.mp4');
    setPreviewModalOpen(true);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-8 bg-white">
        <Skeleton className="h-64 w-full rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-60 w-full" />
          </div>
          <div className="lg:col-span-4">
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4 bg-white">
        <h2 className="text-2xl font-bold text-slate-900">Course Not Found</h2>
        <p className="text-slate-500">The requested course could not be located.</p>
        <Button onClick={() => router.push('/courses')}>Back to Catalog</Button>
      </div>
    );
  }

  const durationHours = Math.round((Number(course.totalDuration) || 7200) / 3600);
  const priceNum = Number(course.price) || 0;
  const discountNum =
    course.discountPrice !== undefined && course.discountPrice !== null
      ? Number(course.discountPrice)
      : undefined;
  const effectivePrice = discountNum !== undefined ? discountNum : priceNum;
  const hasDiscount = discountNum !== undefined && discountNum < priceNum;
  const ratingNum = Number(course.averageRating) || 0;
  const totalReviewsNum = Number(course.totalRatings) || 0;
  const totalEnrollmentsNum = Number(course.totalEnrollments) || 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Top Hero Light Banner */}
      <section className="bg-slate-50 text-slate-900 border-b border-slate-200 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-3.5">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-xs text-indigo-600 font-semibold">
                <a href="/courses" className="hover:underline">
                  Courses
                </a>
                <span>›</span>
                <span className="text-slate-500">{course.category?.name || 'Development'}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
                {course.title}
              </h1>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
                {course.subtitle || course.description}
              </p>

              {/* Rating & Stats */}
              <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
                <Badge variant="primary" size="sm">
                  {(course.level || 'all_levels').replace('_', ' ')}
                </Badge>
                <div className="flex items-center gap-1.5">
                  <RatingStars
                    rating={ratingNum}
                    totalReviews={totalReviewsNum}
                    size="sm"
                  />
                </div>
                <span className="text-slate-500">
                  {totalEnrollmentsNum.toLocaleString()} students enrolled
                </span>
              </div>

              {/* Instructor Credit */}
              <div className="flex items-center gap-3 pt-3 border-t border-slate-200 text-xs">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 ring-1 ring-slate-200">
                  {course.instructor?.user.avatar ? (
                    <img
                      src={course.instructor.user.avatar}
                      alt={course.instructor.user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-indigo-600">
                      {course.instructor?.user.name?.[0] || 'I'}
                    </div>
                  )}
                </div>
                <div>
                  <span className="text-slate-500">Created by </span>
                  <span className="font-semibold text-slate-900 hover:underline cursor-pointer">
                    {course.instructor?.user.name || 'LearnX Expert'}
                  </span>
                </div>
                <span className="text-slate-300">•</span>
                <div className="flex items-center gap-1 text-slate-500">
                  <Globe className="w-3.5 h-3.5" />
                  <span>{course.language || 'English'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area: Left Details + Right Sticky Card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Curriculum, Outcomes, Description, Reviews (Col 8) */}
          <div className="lg:col-span-8 space-y-8">
            {/* What you'll learn card */}
            <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-3.5">
                What you will learn
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
                {(course.learningOutcomes || [
                  'Design modular, production-ready backend architectures with clean layers',
                  'Build lightning-fast Next.js applications with Server Components',
                  'Implement robust JWT authentication with role-based authorization guards',
                  'Architect relational database schemas with TypeORM and PostgreSQL',
                  'Deploy containerized full-stack apps with automated CI/CD workflows',
                ]).map((outcome, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{outcome}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Course Content / Sections Accordion */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Course Curriculum
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {course.sections?.length || 3} sections • {course.lectureCount || 12} lectures • {durationHours}h total length
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const allExpanded = Object.keys(expandedSections).length === (course.sections?.length || 0);
                    if (allExpanded) {
                      setExpandedSections({});
                    } else {
                      const all: Record<string, boolean> = {};
                      course.sections?.forEach((s) => (all[s.id] = true));
                      setExpandedSections(all);
                    }
                  }}
                  className="text-xs font-semibold text-indigo-600 hover:underline"
                >
                  Toggle all sections
                </button>
              </div>

              {/* Sections list */}
              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden divide-y divide-slate-100">
                {course.sections?.map((section) => {
                  const isExpanded = !!expandedSections[section.id];
                  const sectionLecturesCount = section.lectures?.length || 0;
                  const sectionDurationSec = section.lectures?.reduce((acc, l) => acc + l.duration, 0) || 0;
                  const sectionMinutes = Math.round(sectionDurationSec / 60);

                  return (
                    <div key={section.id} className="transition-colors">
                      {/* Section Header */}
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="w-full px-5 py-3.5 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-slate-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-500" />
                          )}
                          <span className="text-sm font-semibold text-slate-900">
                            {section.title}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500">
                          {sectionLecturesCount} lectures • {sectionMinutes} min
                        </span>
                      </button>

                      {/* Section Lectures */}
                      {isExpanded && (
                        <div className="divide-y divide-slate-100 bg-white">
                          {section.lectures?.map((lecture) => {
                            const minutes = Math.floor(lecture.duration / 60);
                            const seconds = lecture.duration % 60;
                            const timeStr = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

                            return (
                              <div
                                key={lecture.id}
                                className="px-6 py-3 flex items-center justify-between hover:bg-slate-50 text-xs transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <PlayCircle className="w-4 h-4 text-slate-400 shrink-0" />
                                  <span className="text-slate-700 font-medium">
                                    {lecture.title}
                                  </span>
                                </div>

                                <div className="flex items-center gap-3">
                                  {lecture.isPreview && (
                                    <button
                                      type="button"
                                      onClick={() => openVideoPreview(lecture.videoUrl)}
                                      className="font-semibold text-indigo-600 hover:underline px-2 py-0.5 rounded bg-indigo-50"
                                    >
                                      Preview
                                    </button>
                                  )}
                                  <span className="text-slate-400 font-mono">{timeStr}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Requirements */}
            <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-sm space-y-3">
              <h2 className="text-lg font-bold text-slate-900">Requirements</h2>
              <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-600">
                {(course.requirements || [
                  'Basic familiarity with JavaScript or related programming languages',
                  'A computer running Windows, macOS, or Linux with internet connection',
                  'Passion for building production-grade software',
                ]).map((req, i) => (
                  <li key={i} className="leading-relaxed">
                    {req}
                  </li>
                ))}
              </ul>
            </div>

            {/* Course Description */}
            <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-sm space-y-3">
              <h2 className="text-lg font-bold text-slate-900">Description</h2>
              <div className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-2.5">
                <p>{course.description}</p>
                <p>
                  Every lecture includes practical examples, downloadable code repositories, and
                  architectural explanations behind every technology decision. You will not only learn
                  how to write code, but also understand how to design scalable and maintainable
                  systems.
                </p>
              </div>
            </div>

            {/* Instructor Bio Card */}
            <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-sm space-y-3">
              <h2 className="text-lg font-bold text-slate-900">Instructor</h2>
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-100 shrink-0 ring-1 ring-slate-200">
                  {course.instructor?.user.avatar ? (
                    <img
                      src={course.instructor.user.avatar}
                      alt={course.instructor.user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-base text-indigo-600">
                      {course.instructor?.user.name?.[0] || 'I'}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-base text-slate-900">
                    {course.instructor?.user.name}
                  </h3>
                  <p className="text-xs text-indigo-600 font-medium">
                    {course.instructor?.headline || 'Senior Software Engineer'}
                  </p>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    {course.instructor?.biography ||
                      'Marcus is a senior software architect with over a decade of hands-on experience building distributed cloud platforms.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Sticky Checkout Card (Col 4) */}
          <div className="lg:col-span-4 lg:sticky lg:top-20">
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              {/* Media Preview Box */}
              <div
                onClick={() => openVideoPreview(course.promoVideoUrl)}
                className="relative aspect-video w-full cursor-pointer group bg-slate-100"
              >
                <img
                  src={course.thumbnailUrl || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80'}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-slate-950/30 group-hover:bg-slate-950/20 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-white/90 text-indigo-600 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                    <PlayCircle className="w-7 h-7 text-indigo-600 fill-indigo-50" />
                  </div>
                  <span className="text-xs font-semibold mt-2 drop-shadow text-white">Preview course</span>
                </div>
              </div>

              {/* Price & Actions */}
              <div className="p-5 space-y-5">
                <div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-slate-900">
                      ${effectivePrice.toFixed(2)}
                    </span>
                    {hasDiscount && (
                      <span className="text-sm text-slate-400 line-through font-normal">
                        ${priceNum.toFixed(2)}
                      </span>
                    )}
                    {hasDiscount && priceNum > 0 && (
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200">
                        {Math.round(((priceNum - effectivePrice) / priceNum) * 100)}% OFF
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-rose-600 font-medium mt-1">
                    Special promotional pricing available for limited time
                  </p>
                </div>

                {/* Primary CTA Buttons */}
                <div className="space-y-2">
                  <Button
                    onClick={() => router.push(`/checkout/${course.id}`)}
                    size="lg"
                    className="w-full font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm"
                  >
                    Enroll Now
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full font-medium border-slate-300 bg-white text-slate-700 rounded-lg flex items-center justify-center gap-2"
                  >
                    <Heart className="w-4 h-4 text-rose-500" />
                    Save to Wishlist
                  </Button>
                </div>

                <div className="text-center">
                  <span className="text-xs text-slate-500 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    30-Day Money-Back Guarantee
                  </span>
                </div>

                {/* Course Inclusions Checklist */}
                <div className="pt-4 border-t border-slate-100 space-y-2.5 text-xs text-slate-600">
                  <p className="font-semibold text-slate-900">This course includes:</p>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>{durationHours} hours on-demand video</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-slate-400" />
                    <span>{course.lectureCount || 12} modular coding lessons</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span>Full project source code repositories</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-slate-400" />
                    <span>Access on mobile, tablet and desktop</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-slate-400" />
                    <span>Certificate of completion</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Preview Modal */}
      <Modal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        title="Course Video Preview"
        maxWidth="2xl"
      >
        <div className="aspect-video w-full rounded-lg overflow-hidden bg-slate-900 mt-2">
          {activePreviewVideo && (
            <video
              src={activePreviewVideo}
              controls
              autoPlay
              className="w-full h-full object-contain"
            />
          )}
        </div>
      </Modal>
    </div>
  );
}
