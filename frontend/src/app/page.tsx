'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import { CourseCard } from '../components/courses/course-card';
import { courseService } from '../services/course.service';
import { Course, Category } from '../types';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import {
  Sparkles,
  ArrowRight,
  Search,
  Users,
  Code2,
  Cpu,
  Cloud,
  Palette,
  Shield,
  Database,
  TrendingUp,
  Server,
  Globe,
} from 'lucide-react';

const categoryIcons: Record<string, React.ReactNode> = {
  Code2: <Code2 className="w-6 h-6 text-indigo-600" />,
  Cpu: <Cpu className="w-6 h-6 text-indigo-600" />,
  Cloud: <Cloud className="w-6 h-6 text-indigo-600" />,
  Palette: <Palette className="w-6 h-6 text-indigo-600" />,
  Shield: <Shield className="w-6 h-6 text-indigo-600" />,
  Database: <Database className="w-6 h-6 text-indigo-600" />,
  Server: <Server className="w-6 h-6 text-indigo-600" />,
  Globe: <Globe className="w-6 h-6 text-indigo-600" />,
};

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [heroSearch, setHeroSearch] = useState('');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState('all');

  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      setLoading(true);
      try {
        const [courseRes, catRes] = await Promise.all([
          courseService.getCourses({ limit: 12 }),
          courseService.getCategories(),
        ]);
        setCourses(courseRes.data);
        setCategories(catRes);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  const instructors = courseService.getFeaturedInstructors();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      router.push(`/courses?search=${encodeURIComponent(heroSearch.trim())}`);
    }
  };

  const filteredCourses =
    selectedCategoryTab === 'all'
      ? courses
      : courses.filter(
          (c) => c.categoryId === selectedCategoryTab || c.category?.slug === selectedCategoryTab,
        );

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900">
      {/* 1. HERO SECTION */}
      <section className="bg-white border-b border-slate-200 py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Empowering 250,000+ Software Engineers & Tech Leaders
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Master modern tech skills from{' '}
            <span className="text-indigo-600">proven industry practitioners</span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            Hands-on code repositories, production-grade architectures, real-time quizzes, and
            verifiable digital credentials built for modern engineering careers.
          </p>

          {/* Hero Search Box */}
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-xl mx-auto flex items-center gap-2 p-1.5 rounded-xl bg-white border border-slate-300 shadow-sm"
          >
            <div className="relative flex-1 flex items-center">
              <Search className="w-5 h-5 text-slate-400 ml-3.5 absolute pointer-events-none" />
              <input
                type="text"
                placeholder="What skill or technology do you want to learn today?"
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
            <Button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-lg shrink-0"
            >
              Explore
            </Button>
          </form>

          {/* Key Metric Counters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t border-slate-200">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-slate-900">450+</div>
              <div className="text-xs sm:text-sm text-slate-500 mt-0.5">Verified Courses</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-slate-900">250,000+</div>
              <div className="text-xs sm:text-sm text-slate-500 mt-0.5">Active Students</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-slate-900">4.92 / 5</div>
              <div className="text-xs sm:text-sm text-slate-500 mt-0.5">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-slate-900">96%</div>
              <div className="text-xs sm:text-sm text-slate-500 mt-0.5">Career Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. POPULAR CATEGORIES */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                Specialized Domains
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Explore In-Demand Categories
              </h2>
            </div>
            <a
              href="/courses"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:underline inline-flex items-center gap-1"
            >
              Browse all categories <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-44 rounded-xl" />
              ))
            ) : categories.length > 0 ? (
              categories.map((cat) => (
                <a
                  key={cat.id}
                  href={`/courses?category=${cat.slug}`}
                  className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow transition flex flex-col justify-between"
                >
                  <div>
                    <div className="w-11 h-11 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-4">
                      {categoryIcons[cat.icon || 'Code2'] || <Code2 className="w-6 h-6 text-indigo-600" />}
                    </div>
                    <h3 className="font-semibold text-base text-slate-900 hover:text-indigo-600 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>
                  <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-500">
                    <span>{cat.courseCount ?? 0} Courses</span>
                    <span className="text-indigo-600 font-semibold inline-flex items-center">
                      Explore →
                    </span>
                  </div>
                </a>
              ))
            ) : (
              <div className="col-span-3 text-center py-12 text-slate-400 text-sm">
                No categories found.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. FEATURED COURSES WITH TABS */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Featured Curriculum
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Top-Rated Courses by Learners
              </h2>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategoryTab('all')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition ${
                  selectedCategoryTab === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Courses
              </button>
              {categories.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategoryTab(tab.slug)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition ${
                    selectedCategoryTab === tab.slug
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </div>
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-80 rounded-xl" />
              ))
            ) : filteredCourses.length > 0 ? (
              filteredCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))
            ) : (
              <div className="col-span-3 text-center py-12 text-slate-500 text-sm">
                No courses currently available in this category.
              </div>
            )}
          </div>

          <div className="mt-10 text-center">
            <a href="/courses">
              <Button
                variant="outline"
                size="lg"
                className="font-medium px-6 border-slate-300 text-slate-700"
              >
                View Full Course Catalog ({courses.length} Courses)
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* 4. PLATFORM VALUE PILLARS */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Why LearnX is built different
            </h2>
            <p className="text-slate-600 text-sm mt-2">
              We eliminate fluff and tutorial hell. Everything is oriented around building production
              software that you can deploy and talk about in technical interviews.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-base border border-indigo-100">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900">Real-World Code Repositories</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Build full architectures with unit tests, Docker Compose configurations, and CI/CD pipelines — not toy projects.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-base border border-indigo-100">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900">Scored Knowledge Check Quizzes</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Test your understanding after every milestone with rigorous technical questions and instant automated grading.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-base border border-indigo-100">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900">Cryptographically Signed Certs</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Generate shareable, unique verification IDs that hiring managers can verify with one click on LinkedIn.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TOP INSTRUCTORS */}
      {instructors.length > 0 && (
        <section className="py-16 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-1.5">
                <Users className="w-3.5 h-3.5" />
                Elite Educators
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Learn from Engineers at Leading Companies
              </h2>
              <p className="text-slate-600 text-sm mt-1.5">
                Our instructors are active practitioners writing production code daily.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {instructors.map((inst, index) => (
                <div
                  key={index}
                  className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm text-center flex flex-col items-center"
                >
                  <img
                    src={inst.avatar}
                    alt={inst.name}
                    className="w-16 h-16 rounded-full object-cover mb-3 ring-2 ring-slate-100"
                  />
                  <h3 className="font-semibold text-sm text-slate-900">{inst.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 min-h-[32px]">
                    {inst.headline}
                  </p>

                  <div className="w-full mt-4 pt-3 border-t border-slate-100 flex items-center justify-around text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{inst.rating} ★</div>
                      <div className="text-[10px] text-slate-400">Rating</div>
                    </div>
                    <div className="border-r border-slate-200 h-5" />
                    <div>
                      <div className="font-bold text-slate-900">{inst.students}</div>
                      <div className="text-[10px] text-slate-400">Students</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. TEACH ON LEARNX CTA */}
      <section className="py-14 bg-indigo-50 border-t border-indigo-100 text-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white text-indigo-700 border border-indigo-200">
                Instructor Community
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Are you an expert? Share your knowledge on LearnX.
              </h2>
              <p className="text-slate-600 text-sm max-w-xl">
                Create courses, reach thousands of ambitious students worldwide, and earn revenue with our instructor revenue share model.
              </p>
            </div>

            <a href="/teach" className="shrink-0">
              <Button
                size="lg"
                className="bg-indigo-600 text-white hover:bg-indigo-700 font-medium px-6 py-2.5 rounded-lg shadow-sm"
              >
                Apply as Instructor
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
