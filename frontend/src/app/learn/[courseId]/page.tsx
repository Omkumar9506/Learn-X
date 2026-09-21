'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { courseService } from '../../../services/course.service';
import { courseContentService } from '../../../services/course-content.service';
import { progressService } from '../../../services/progress.service';
import { quizService, Quiz, QuizResult } from '../../../services/quiz.service';
import { reviewService } from '../../../services/review.service';
import { certificateService } from '../../../services/certificate.service';
import { Course, Section, Lecture } from '../../../types';
import { Button } from '../../../components/ui/button';
import { Skeleton } from '../../../components/ui/skeleton';
import { Modal } from '../../../components/ui/modal';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Maximize2,
  Volume2,
  VolumeX,
  CheckCircle,
  Circle,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Award,
  Download,
  FileText,
  Sparkles,
  Check,
  ChevronDown,
  ChevronUp,
  Star,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export default function LearnPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.courseId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [activeLecture, setActiveLecture] = useState<Lecture | null>(null);
  const [completedLectures, setCompletedLectures] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<'overview' | 'resources' | 'qa'>('overview');
  const [loading, setLoading] = useState(true);

  // Quiz State
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);

  // Review State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewHoverRating, setReviewHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Certificate State
  const [isGeneratingCert, setIsGeneratingCert] = useState(false);

  // Custom Video Player Controls State
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [autoPlayNext, setAutoPlayNext] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        try {
          const foundCourse = await courseService.getCourseBySlug(courseId);
          setCourse(foundCourse);
        } catch {
          // If course not found
          setCourse(null);
        }

        const content = await courseContentService.getCourseContent(courseId);
        setSections(content);

        // Load quiz
        const courseQuiz = await quizService.getQuiz(courseId);
        setQuiz(courseQuiz);

        // Set initial active lecture
        if (content.length > 0 && content[0].lectures && content[0].lectures.length > 0) {
          setActiveLecture(content[0].lectures[0]);
          setExpandedSections({ [content[0].id]: true });
        }

        // Load progress
        const completed = progressService.getCompletedLectures(courseId);
        setCompletedLectures(completed);
      } catch (err) {
        console.error('Failed to load learning page', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [courseId]);

  // Video Event Handlers
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
    }
  };

  const handleSeek = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
    }
  };

  const handlePlaybackSpeed = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
    }
  };

  const handleToggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current && videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  // Progress Handlers
  const toggleLectureCompletion = async (lectureId: string) => {
    if (completedLectures.includes(lectureId)) {
      await progressService.unmarkLectureComplete(courseId, lectureId);
      setCompletedLectures(completedLectures.filter((id) => id !== lectureId));
    } else {
      await progressService.markLectureComplete(courseId, lectureId);
      setCompletedLectures([...completedLectures, lectureId]);
    }
  };

  // Switch lecture
  const selectLecture = (lecture: Lecture, sectionId: string) => {
    setActiveLecture(lecture);
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
    setExpandedSections((prev) => ({ ...prev, [sectionId]: true }));
  };

  // Flattened lecture list for Prev / Next
  const allLectures = sections.flatMap((s) => s.lectures || []);
  const currentIndex = activeLecture ? allLectures.findIndex((l) => l.id === activeLecture.id) : -1;
  const prevLecture = currentIndex > 0 ? allLectures[currentIndex - 1] : null;
  const nextLecture = currentIndex < allLectures.length - 1 ? allLectures[currentIndex + 1] : null;

  const handleVideoEnded = async () => {
    if (activeLecture) {
      await toggleLectureCompletion(activeLecture.id);
    }
    if (autoPlayNext && nextLecture) {
      const parentSec = sections.find((s) => s.lectures.some((l) => l.id === nextLecture.id));
      selectLecture(nextLecture, parentSec?.id || '');
    }
  };

  // Quiz Handlers
  const handleSelectQuizOption = (questionId: string, optionId: string) => {
    setQuizAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmitQuiz = async () => {
    if (!quiz) return;
    setIsSubmittingQuiz(true);
    try {
      const result = await quizService.submitQuiz(quiz.id, quizAnswers);
      setQuizResult(result);
    } catch (err) {
      console.error('Failed to submit quiz', err);
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  const handleResetQuiz = () => {
    setQuizAnswers({});
    setQuizResult(null);
  };

  // Review Handlers
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    setIsSubmittingReview(true);
    try {
      await reviewService.createReview({
        courseId,
        rating: reviewRating,
        comment: reviewComment,
      });
      setReviewSubmitted(true);
    } catch (err) {
      console.error('Failed to submit review', err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Certificate Handler
  const handleClaimCertificate = async () => {
    setIsGeneratingCert(true);
    try {
      const cert = await certificateService.generateCertificate(courseId);
      router.push(`/certificates/${cert.id}`);
    } catch (err) {
      console.error('Failed to generate certificate', err);
      router.push(`/certificates/${courseId}`);
    } finally {
      setIsGeneratingCert(false);
    }
  };

  const totalLectureCount = allLectures.length || 1;
  const progressPercent = Math.min(100, Math.round((completedLectures.length / totalLectureCount) * 100));

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 space-y-6">
        <Skeleton className="h-12 w-full rounded-lg bg-slate-200" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Skeleton className="lg:col-span-8 h-[500px] rounded-xl bg-slate-200" />
          <Skeleton className="lg:col-span-4 h-[500px] rounded-xl bg-slate-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      {/* Top Header Bar */}
      <header className="h-14 border-b border-slate-200 bg-white px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0 z-30">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => router.push('/dashboard/learning')}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Back to My Learning"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-bold text-slate-900 truncate max-w-sm sm:max-w-md">
              {course?.title}
            </h1>
            <p className="text-[11px] text-slate-500 truncate">
              {activeLecture?.title || 'Lesson Overview'}
            </p>
          </div>
        </div>

        {/* Progress & Milestone */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-600">{progressPercent}% complete</span>
            <div className="w-24 h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {progressPercent === 100 && (
            <button
              onClick={handleClaimCertificate}
              disabled={isGeneratingCert}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors shadow-sm"
              title="Click to view and download your verified certificate"
            >
              <Award className="w-3.5 h-3.5 text-amber-600" />
              {isGeneratingCert ? 'Generating...' : 'Certificate Earned!'}
            </button>
          )}

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Toggle Curriculum Sidebar"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Main Body Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* LEFT / CENTER: Video Player & Lecture Notes */}
        <main className="flex-1 flex flex-col overflow-y-auto bg-white">
          {/* Video Container */}
          <div className="relative aspect-video w-full max-h-[68vh] bg-slate-950 group flex items-center justify-center">
            <video
              ref={videoRef}
              src={
                activeLecture?.videoUrl ||
                'https://www.w3schools.com/html/mov_bbb.mp4'
              }
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleVideoEnded}
              className="w-full h-full object-contain cursor-pointer"
              onClick={togglePlay}
            />

            {/* Big Center Play Button when paused */}
            {!isPlaying && (
              <button
                onClick={togglePlay}
                className="absolute w-16 h-16 rounded-full bg-indigo-600/90 text-white flex items-center justify-center shadow-xl hover:scale-105 transition-transform"
              >
                <Play className="w-7 h-7 ml-1 fill-white" />
              </button>
            )}

            {/* Video Controls Bar Overlay */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2">
              {/* Progress seeker */}
              <div className="relative w-full h-1.5 bg-white/30 rounded-full cursor-pointer">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-white">
                <div className="flex items-center gap-3">
                  <button onClick={togglePlay} className="hover:text-indigo-300 transition-colors">
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button onClick={() => handleSeek(-10)} title="Rewind 10s">
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleSeek(10)} title="Forward 10s">
                    <RotateCw className="w-4 h-4" />
                  </button>
                  <button onClick={handleToggleMute}>
                    {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <span className="text-[11px] font-mono text-slate-200">
                    {Math.floor(currentTime / 60)}:
                    {Math.floor(currentTime % 60) < 10 ? '0' : ''}
                    {Math.floor(currentTime % 60)} / {Math.floor(duration / 60)}:
                    {Math.floor(duration % 60) < 10 ? '0' : ''}
                    {Math.floor(duration % 60)}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-[11px]">
                    {[1, 1.25, 1.5, 2].map((rate) => (
                      <button
                        key={rate}
                        onClick={() => handlePlaybackSpeed(rate)}
                        className={`px-1.5 py-0.5 rounded ${
                          playbackRate === rate ? 'bg-indigo-600 font-bold' : 'hover:bg-white/20'
                        }`}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>

                  <button onClick={handleFullscreen} title="Fullscreen">
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Lecture Navigation Bar */}
          <div className="p-4 sm:p-5 bg-white border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {activeLecture?.title || 'Lesson Title'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Lesson {currentIndex + 1} of {allLectures.length} • Duration:{' '}
                {Math.floor((activeLecture?.duration || 600) / 60)} min
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setQuizModalOpen(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 flex items-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Take Quiz
              </button>

              <button
                type="button"
                onClick={() => setReviewModalOpen(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 flex items-center gap-1.5 transition-colors"
              >
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                Rate Course
              </button>

              {activeLecture && (
                <Button
                  onClick={() => toggleLectureCompletion(activeLecture.id)}
                  variant="outline"
                  size="sm"
                  className={`text-xs font-semibold gap-1.5 ${
                    completedLectures.includes(activeLecture.id)
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  {completedLectures.includes(activeLecture.id) ? 'Completed' : 'Mark Complete'}
                </Button>
              )}

              {prevLecture && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const sec = sections.find((s) => s.lectures.some((l) => l.id === prevLecture.id));
                    selectLecture(prevLecture, sec?.id || '');
                  }}
                  className="border-slate-300 text-slate-700 hover:bg-slate-50 text-xs"
                >
                  <ChevronLeft className="w-4 h-4 mr-0.5" /> Prev
                </Button>
              )}

              {nextLecture && (
                <Button
                  size="sm"
                  onClick={() => {
                    const sec = sections.find((s) => s.lectures.some((l) => l.id === nextLecture.id));
                    selectLecture(nextLecture, sec?.id || '');
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs"
                >
                  Next <ChevronRight className="w-4 h-4 ml-0.5" />
                </Button>
              )}
            </div>
          </div>

          {/* Below Video Detail Tabs */}
          <div className="p-6 space-y-6">
            <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold">
              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-3 border-b-2 transition-colors ${
                  activeTab === 'overview'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Overview & Notes
              </button>
              <button
                onClick={() => setActiveTab('resources')}
                className={`pb-3 border-b-2 transition-colors ${
                  activeTab === 'resources'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Resources ({activeLecture?.resources?.length || 1})
              </button>
              <button
                onClick={() => setActiveTab('qa')}
                className={`pb-3 border-b-2 transition-colors ${
                  activeTab === 'qa'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Q&A Discussion
              </button>
            </div>

            {activeTab === 'overview' && (
              <div className="space-y-4 text-sm text-slate-700 leading-relaxed max-w-3xl">
                <p>
                  {activeLecture?.description ||
                    'In this lesson, we break down core design considerations, setup patterns, and code implementations. Make sure to download starter files from the resources tab to code along with the instructor.'}
                </p>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
                  <p className="font-bold text-slate-900 mb-1.5">Key Takeaways:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs text-slate-600">
                    <li>Understand architectural separation of concerns and data boundaries.</li>
                    <li>Avoid common anti-patterns in high-load production environments.</li>
                    <li>Verify implementation using automated test assertions.</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'resources' && (
              <div className="space-y-3 max-w-md">
                {(activeLecture?.resources || [{ name: 'Starter Repo & Docker Setup.zip', url: '#' }]).map(
                  (res, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-indigo-600" />
                        <span className="font-semibold text-slate-800">{res.name}</span>
                      </div>
                      <a
                        href={res.url}
                        className="text-indigo-600 hover:underline font-semibold flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" /> Download
                      </a>
                    </div>
                  ),
                )}
              </div>
            )}

            {activeTab === 'qa' && (
              <div className="space-y-4 max-w-2xl text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <p className="font-bold text-slate-900">Ask an instructor or community question:</p>
                  <textarea
                    rows={3}
                    placeholder="Describe your question or issue in detail..."
                    className="w-full rounded-lg bg-white border border-slate-300 p-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                  <Button size="sm" className="bg-indigo-600 text-white font-bold">
                    Post Question
                  </Button>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* RIGHT: Light Collapsible Curriculum Accordion Sidebar */}
        {sidebarOpen && (
          <aside className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-slate-200 bg-slate-50 flex flex-col shrink-0">
            <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-700">
                Course Content
              </span>
              <span className="text-xs text-indigo-600 font-bold">
                {completedLectures.length}/{allLectures.length} Completed
              </span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-200">
              {sections.map((section) => {
                const isExpanded = !!expandedSections[section.id];
                const sectionCompletedCount =
                  section.lectures?.filter((l) => completedLectures.includes(l.id)).length || 0;

                return (
                  <div key={section.id}>
                    {/* Section Header */}
                    <button
                      onClick={() =>
                        setExpandedSections((prev) => ({ ...prev, [section.id]: !prev[section.id] }))
                      }
                      className="w-full p-3.5 flex items-center justify-between bg-slate-100 hover:bg-slate-200/70 transition-colors text-left"
                    >
                      <div>
                        <h3 className="font-bold text-xs text-slate-900 line-clamp-1">{section.title}</h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {sectionCompletedCount}/{section.lectures?.length || 0} completed
                        </p>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-500" />
                      )}
                    </button>

                    {/* Section Lectures */}
                    {isExpanded && (
                      <div className="divide-y divide-slate-100 bg-white">
                        {section.lectures?.map((lecture) => {
                          const isCurrent = activeLecture?.id === lecture.id;
                          const isDone = completedLectures.includes(lecture.id);
                          const mins = Math.floor(lecture.duration / 60);

                          return (
                            <button
                              key={lecture.id}
                              onClick={() => selectLecture(lecture, section.id)}
                              className={`w-full p-3.5 flex items-start gap-3 text-left transition-colors ${
                                isCurrent
                                  ? 'bg-indigo-50/80 text-indigo-900 font-semibold border-l-2 border-indigo-600'
                                  : 'hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleLectureCompletion(lecture.id);
                                }}
                                className="mt-0.5"
                              >
                                {isDone ? (
                                  <CheckCircle className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                                ) : (
                                  <Circle className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="text-xs line-clamp-2 leading-snug">
                                  {lecture.title}
                                </p>
                                <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1">
                                  <span>{mins}m</span>
                                  {lecture.isPreview && (
                                    <span className="text-indigo-600 font-semibold">Free</span>
                                  )}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </aside>
        )}
      </div>

      {/* QUIZ MODAL - Strictly Light */}
      <Modal
        isOpen={quizModalOpen}
        onClose={() => setQuizModalOpen(false)}
        title={quiz?.title || 'Knowledge Assessment'}
        description={quiz?.description || 'Test your understanding before claiming your completion certificate.'}
        maxWidth="2xl"
      >
        <div className="space-y-6 pt-2">
          {!quizResult ? (
            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-1">
              {quiz?.questions.map((q, idx) => (
                <div key={q.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-indigo-100 text-indigo-700 shrink-0">
                      Q{idx + 1}
                    </span>
                    <p className="text-sm font-semibold text-slate-900">{q.question}</p>
                  </div>

                  <div className="space-y-2 pt-1 pl-7">
                    {q.options.map((opt) => {
                      const isSelected = quizAnswers[q.id] === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleSelectQuizOption(q.id, opt.id)}
                          className={`w-full text-left p-3 rounded-lg text-xs transition-all border ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-semibold shadow-sm'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          {opt.text}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between pt-4 border-t border-slate-200 sticky bottom-0 bg-white py-2">
                <span className="text-xs text-slate-500">
                  {Object.keys(quizAnswers).length} of {quiz?.questions.length || 0} answered
                </span>
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuizModalOpen(false)}
                    className="text-slate-600 hover:text-slate-900"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSubmitQuiz}
                    disabled={
                      isSubmittingQuiz ||
                      Object.keys(quizAnswers).length < (quiz?.questions.length || 1)
                    }
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                  >
                    {isSubmittingQuiz ? 'Evaluating...' : 'Submit Answers'}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div
                className={`p-5 rounded-xl border text-center space-y-2 ${
                  quizResult.passed
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                    : 'border-rose-200 bg-rose-50 text-rose-900'
                }`}
              >
                <div className="inline-flex p-2.5 rounded-full bg-white mb-1 shadow-sm">
                  {quizResult.passed ? (
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-8 h-8 text-rose-600" />
                  )}
                </div>
                <h3 className="text-2xl font-black text-slate-900">
                  {quizResult.score}% Score
                </h3>
                <p className="text-sm font-medium">
                  {quizResult.passed
                    ? 'Congratulations! You demonstrated mastery of the core concepts.'
                    : `Passing score is ${quiz?.passingScore || 70}%. Review the explanations below and give it another shot.`}
                </p>
                <p className="text-xs text-slate-500">
                  Correct answers: {quizResult.correctAnswers} / {quizResult.totalQuestions}
                </p>
              </div>

              <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-1">
                {quiz?.questions.map((q, idx) => {
                  const fb = quizResult.feedback.find((f) => f.questionId === q.id);
                  const isCorrect = fb?.isCorrect ?? false;
                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-xl border text-xs space-y-2 ${
                        isCorrect
                          ? 'border-emerald-200 bg-emerald-50/50'
                          : 'border-rose-200 bg-rose-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isCorrect ? (
                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Correct
                          </span>
                        ) : (
                          <span className="text-rose-700 font-bold flex items-center gap-1">
                            <X className="w-3.5 h-3.5" /> Needs Review
                          </span>
                        )}
                        <span className="text-slate-500">• Q{idx + 1}</span>
                      </div>
                      <p className="font-semibold text-slate-900">{q.question}</p>
                      {fb?.explanation && (
                        <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-600 flex items-start gap-2 text-[11px]">
                          <HelpCircle className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                          <span>{fb.explanation}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetQuiz}
                  className="border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Retake Quiz
                </Button>
                {quizResult.passed && progressPercent === 100 ? (
                  <Button
                    size="sm"
                    onClick={() => {
                      setQuizModalOpen(false);
                      handleClaimCertificate();
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                  >
                    Claim Certificate
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => setQuizModalOpen(false)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                  >
                    Done
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* REVIEW MODAL - Strictly Light */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => {
          setReviewModalOpen(false);
          setReviewSubmitted(false);
        }}
        title="Rate & Review Course"
        description="Share your honest feedback to help future students and recognize the instructor."
        maxWidth="md"
      >
        {reviewSubmitted ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Review Submitted!</h3>
              <p className="text-xs text-slate-500 mt-1">
                Your rating and comments have been added to the course review roll.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => {
                setReviewModalOpen(false);
                setReviewSubmitted(false);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
            >
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmitReview} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Your Rating</label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setReviewHoverRating(star)}
                    onMouseLeave={() => setReviewHoverRating(0)}
                    onClick={() => setReviewRating(star)}
                    className="p-1 text-slate-300 hover:scale-105 transition-transform focus:outline-none"
                  >
                    <Star
                      className={`w-6 h-6 transition-colors ${
                        (reviewHoverRating || reviewRating) >= star
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-xs text-slate-500 font-medium">
                  {reviewRating === 5 && '5 - Exceptional'}
                  {reviewRating === 4 && '4 - Very good'}
                  {reviewRating === 3 && '3 - Good'}
                  {reviewRating === 2 && '2 - Below expectations'}
                  {reviewRating === 1 && '1 - Not recommended'}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Detailed Feedback
              </label>
              <textarea
                required
                rows={4}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="What did you like about this course? How did it help your engineering skills?"
                className="w-full rounded-lg bg-white border border-slate-300 p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setReviewModalOpen(false)}
                className="text-slate-600 hover:text-slate-900"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmittingReview || !reviewComment.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
              >
                {isSubmittingReview ? 'Submitting...' : 'Post Review'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
