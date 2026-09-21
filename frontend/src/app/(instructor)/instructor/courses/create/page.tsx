'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { instructorService } from '../../../../../services/instructor.service';
import { courseService } from '../../../../../services/course.service';
import { Category } from '../../../../../types';
import { Button } from '../../../../../components/ui/button';
import { Input } from '../../../../../components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../../../components/ui/card';
import { Badge } from '../../../../../components/ui/badge';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Upload,
  Plus,
  Trash2,
} from 'lucide-react';

export default function CreateCoursePage() {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Categories from API
  const [categories, setCategories] = useState<Category[]>([]);

  // Form State
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [level, setLevel] = useState('intermediate');
  const [language, setLanguage] = useState('English');

  useEffect(() => {
    async function loadCategories() {
      try {
        const cats = await courseService.getCategories();
        setCategories(cats);
        if (cats.length > 0) {
          setCategoryId(cats[0].id);
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    }
    loadCategories();
  }, []);

  const [description, setDescription] = useState('');
  const [learningOutcomes, setLearningOutcomes] = useState<string[]>([
    'Design and deploy modular enterprise microservice architectures',
    'Write clean, typed code adhering to clean architecture principles',
  ]);
  const [requirements, setRequirements] = useState<string[]>([
    'Basic familiarity with programming fundamentals',
  ]);

  const [price, setPrice] = useState(79.99);
  const [discountPrice, setDiscountPrice] = useState(49.99);
  const [thumbnailUrl, setThumbnailUrl] = useState(
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
  );
  const [promoVideoUrl, setPromoVideoUrl] = useState('https://www.w3schools.com/html/mov_bbb.mp4');

  // Outcome management
  const addOutcome = () => setLearningOutcomes([...learningOutcomes, '']);
  const updateOutcome = (index: number, val: string) => {
    const next = [...learningOutcomes];
    next[index] = val;
    setLearningOutcomes(next);
  };
  const removeOutcome = (index: number) => {
    setLearningOutcomes(learningOutcomes.filter((_, i) => i !== index));
  };

  // Requirement management
  const addRequirement = () => setRequirements([...requirements, '']);
  const updateRequirement = (index: number, val: string) => {
    const next = [...requirements];
    next[index] = val;
    setRequirements(next);
  };
  const removeRequirement = (index: number) => {
    setRequirements(requirements.filter((_, i) => i !== index));
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setThumbnailUrl(url);
    }
  };

  const handleFinish = async (shouldPublish: boolean) => {
    if (!title.trim() || !description.trim()) {
      setError('Please complete all required fields (title and description).');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const created = await instructorService.createCourse({
        title,
        subtitle,
        description,
        categoryId,
        level,
        language,
        price,
        discountPrice,
        thumbnailUrl,
        promoVideoUrl,
        requirements: requirements.filter(Boolean),
        learningOutcomes: learningOutcomes.filter(Boolean),
      });

      if (shouldPublish) {
        await instructorService.publishCourse(created.id);
      }

      router.push('/instructor/dashboard');
    } catch {
      setError('Failed to create course. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategoryObj = categories.find((c) => c.id === categoryId);

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Wizard Header */}
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            Course Authoring Wizard
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Create a New Course
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Follow the 3 steps below to author and publish your course.
          </p>
        </div>

        {/* Step Stepper Header */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {[
            { step: 1, title: 'Basic Info', desc: 'Title, category & level' },
            { step: 2, title: 'Details & Outcomes', desc: 'Outcomes & prerequisites' },
            { step: 3, title: 'Media & Pricing', desc: 'Thumbnail, video & price' },
          ].map((item) => (
            <div
              key={item.step}
              className={`p-3.5 rounded-xl border transition-all ${
                currentStep === item.step
                  ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 shadow-sm'
                  : currentStep > item.step
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                  : 'border-slate-200 bg-white text-slate-400'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    currentStep === item.step
                      ? 'bg-indigo-600 text-white'
                      : currentStep > item.step
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {currentStep > item.step ? '✓' : item.step}
                </span>
                <span className="font-semibold text-xs sm:text-sm truncate">{item.title}</span>
              </div>
              <p className="hidden sm:block text-[11px] text-slate-500 mt-1 truncate">{item.desc}</p>
            </div>
          ))}
        </div>

        {error && (
          <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-600 font-medium">
            {error}
          </div>
        )}

        {/* STEP 1: Basic Information */}
        {currentStep === 1 && (
          <Card className="bg-white border border-slate-200 shadow-sm rounded-xl">
            <CardHeader>
              <CardTitle>Step 1: Basic Course Information</CardTitle>
              <CardDescription>
                Set the foundational parameters that learners will see first in search results.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pt-2">
              <Input
                label="Course Title *"
                placeholder="e.g. Full Stack Next.js 15 & NestJS: Production SaaS Architecture"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                helperText="Make it compelling and clearly state the primary technologies taught."
              />

              <Input
                label="Course Subtitle / Tagline"
                placeholder="e.g. Build and deploy enterprise-grade SaaS platforms with TypeScript and PostgreSQL"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Category *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-600"
                  >
                    <option value="" disabled>
                      Select a category...
                    </option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Difficulty Level *
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-600"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="all_levels">All Levels</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-600"
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <Button
                  onClick={() => {
                    if (!title.trim()) {
                      setError('Course title is required');
                      return;
                    }
                    setError(null);
                    setCurrentStep(2);
                  }}
                  className="font-medium gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                >
                  Proceed to Details
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 2: Description & Curriculum Outcomes */}
        {currentStep === 2 && (
          <Card className="bg-white border border-slate-200 shadow-sm rounded-xl">
            <CardHeader>
              <CardTitle>Step 2: Course Description & Outcomes</CardTitle>
              <CardDescription>
                Detail what students will achieve and what prerequisites are required.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5 pt-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Detailed Course Description *
                </label>
                <textarea
                  rows={5}
                  required
                  placeholder="Describe your curriculum structure, projects students will build, and how this prepares them for senior software engineering roles..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              {/* Learning Outcomes */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    What will students learn? (Outcomes)
                  </label>
                  <button
                    type="button"
                    onClick={addOutcome}
                    className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Outcome
                  </button>
                </div>
                <div className="space-y-2">
                  {learningOutcomes.map((outcome, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="e.g. Master clean microservices in NestJS"
                        value={outcome}
                        onChange={(e) => updateOutcome(idx, e.target.value)}
                        className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                      />
                      {learningOutcomes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeOutcome(idx)}
                          className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Prerequisites */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Prerequisites & Requirements
                  </label>
                  <button
                    type="button"
                    onClick={addRequirement}
                    className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Requirement
                  </button>
                </div>
                <div className="space-y-2">
                  {requirements.map((req, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="e.g. Basic familiarity with TypeScript syntax"
                        value={req}
                        onChange={(e) => updateRequirement(idx, e.target.value)}
                        className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                      />
                      {requirements.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRequirement(idx)}
                          className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  className="gap-1.5 border-slate-300 text-slate-700 rounded-lg"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </Button>
                <Button
                  onClick={() => {
                    if (!description.trim()) {
                      setError('Course description is required');
                      return;
                    }
                    setError(null);
                    setCurrentStep(3);
                  }}
                  className="font-medium gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                >
                  Proceed to Media & Pricing
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 3: Media, Pricing & Publish */}
        {currentStep === 3 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Form: Pricing & Media (Col 7) */}
            <div className="lg:col-span-7 space-y-6">
              <Card className="bg-white border border-slate-200 shadow-sm rounded-xl">
                <CardHeader>
                  <CardTitle>Step 3: Media & Pricing</CardTitle>
                  <CardDescription>
                    Upload your high-definition cover image and set course enrollment pricing.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-5 pt-2">
                  {/* Thumbnail upload */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                      Course Thumbnail Image
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="w-36 aspect-video rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                        <img
                          src={thumbnailUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-700 transition">
                          <Upload className="w-3.5 h-3.5" />
                          Choose File
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageFileChange}
                            className="hidden"
                          />
                        </label>
                        <p className="text-[11px] text-slate-400">
                          1280x720 (16:9 ratio). PNG or JPG up to 5MB.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Promo Video */}
                  <Input
                    label="Promotional Video URL"
                    placeholder="https://... or sample video URL"
                    value={promoVideoUrl}
                    onChange={(e) => setPromoVideoUrl(e.target.value)}
                    helperText="A 1-2 minute video trailer giving learners a tour of the curriculum."
                  />

                  {/* Pricing Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Standard Price ($ USD)"
                      type="number"
                      step="0.01"
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                    />

                    <Input
                      label="Discounted Price ($ USD)"
                      type="number"
                      step="0.01"
                      min="0"
                      value={discountPrice}
                      onChange={(e) => setDiscountPrice(parseFloat(e.target.value) || 0)}
                      helperText="Leave empty if no promotion."
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep(2)}
                      className="gap-1.5 border-slate-300 text-slate-700 rounded-lg"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back
                    </Button>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        isLoading={isSubmitting}
                        onClick={() => handleFinish(false)}
                        className="font-medium border-slate-300 text-slate-700 rounded-lg"
                      >
                        Save as Draft
                      </Button>
                      <Button
                        isLoading={isSubmitting}
                        onClick={() => handleFinish(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg"
                      >
                        Publish Course Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Live Preview Card (Col 5) */}
            <div className="lg:col-span-5 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Live Catalog Preview
              </h3>

              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <div className="aspect-video w-full bg-slate-100 relative overflow-hidden">
                  <img
                    src={thumbnailUrl}
                    alt={title || 'Course Preview'}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white/90 text-slate-900 border border-slate-200 shadow-sm">
                      {selectedCategoryObj?.name || 'Development'}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <Badge variant="primary" size="sm">
                    {level}
                  </Badge>
                  <h4 className="font-semibold text-base text-slate-900 line-clamp-2">
                    {title || 'Untitled Course'}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {subtitle || description || 'Course description preview will appear here.'}
                  </p>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-slate-900">
                        ${discountPrice || price}
                      </span>
                      {discountPrice && discountPrice < price && (
                        <span className="text-xs text-slate-400 line-through">${price}</span>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-indigo-600">Draft Preview</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
