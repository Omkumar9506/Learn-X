'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { courseContentService } from '../../../../../../services/course-content.service';
import { courseService } from '../../../../../../services/course.service';
import { instructorService } from '../../../../../../services/instructor.service';
import { Course, Section, Lecture } from '../../../../../../types';
import { Button } from '../../../../../../components/ui/button';
import { Input } from '../../../../../../components/ui/input';
import { Badge } from '../../../../../../components/ui/badge';
import { Modal } from '../../../../../../components/ui/modal';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../../../components/ui/card';
import { Skeleton } from '../../../../../../components/ui/skeleton';
import {
  Plus,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  PlayCircle,
  CheckCircle2,
  Eye,
  Check,
  ArrowLeft,
  Settings,
  BookOpen,
} from 'lucide-react';

export default function CourseContentEditorPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'curriculum' | 'settings'>('curriculum');
  const [savingStatus, setSavingStatus] = useState<string>('Saved');

  // New Section State
  const [newSectionModalOpen, setNewSectionModalOpen] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');

  // Edit / Add Lecture State
  const [lectureModalOpen, setLectureModalOpen] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [editingLecture, setEditingLecture] = useState<Partial<Lecture> | null>(null);
  const [isEditingLecture, setIsEditingLecture] = useState(false);

  // Settings State
  const [settingsTitle, setSettingsTitle] = useState('');
  const [settingsPrice, setSettingsPrice] = useState(79.99);
  const [settingsDiscountPrice, setSettingsDiscountPrice] = useState(49.99);
  const [settingsThumbnail, setSettingsThumbnail] = useState('');

  useEffect(() => {
    async function loadData() {
      if (!courseId) return;
      setLoading(true);
      try {
        const courses = await instructorService.getMyCourses();
        let found = courses.find((c) => c.id === courseId);
        if (!found) {
          try {
            found = await courseService.getCourseBySlug(courseId);
          } catch {
            // Not found
          }
        }
        if (found) {
          setCourse(found);
          setSettingsTitle(found.title || '');
          setSettingsPrice(Number(found.price) || 0);
          setSettingsDiscountPrice(found.discountPrice ? Number(found.discountPrice) : 0);
          setSettingsThumbnail(found.thumbnailUrl || '');
        }

        const content = await courseContentService.getCourseContent(courseId);
        setSections(content);
      } catch (err) {
        console.error('Failed to load course content', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [courseId]);

  const updateStateAndPersist = (updatedSections: Section[]) => {
    setSections(updatedSections);
    setSavingStatus('Saving...');
    courseContentService.saveCourseContentToStorage(courseId, updatedSections);
    setTimeout(() => setSavingStatus('All changes saved'), 800);
  };

  // Section Handlers
  const handleAddSection = async () => {
    if (!newSectionTitle.trim()) return;
    const newSection = await courseContentService.createSection(courseId, newSectionTitle.trim());
    const updated = [...sections, { ...newSection, lectures: [] }];
    updateStateAndPersist(updated);
    setNewSectionTitle('');
    setNewSectionModalOpen(false);
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm('Are you sure you want to delete this entire section and all its lectures?')) return;
    await courseContentService.deleteSection(courseId, sectionId);
    const updated = sections.filter((s) => s.id !== sectionId);
    updateStateAndPersist(updated);
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const next = [...sections];
    const [moved] = next.splice(index, 1);
    next.splice(targetIndex, 0, moved);

    const reordered = next.map((s, idx) => ({ ...s, order: idx + 1 }));
    updateStateAndPersist(reordered);
    courseContentService.reorderSections(courseId, reordered.map((s) => s.id));
  };

  // Lecture Handlers
  const handleOpenAddLecture = (sectionId: string) => {
    setActiveSectionId(sectionId);
    setEditingLecture({
      title: '',
      description: '',
      duration: 600,
      isPreview: false,
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      resources: [],
    });
    setIsEditingLecture(false);
    setLectureModalOpen(true);
  };

  const handleOpenEditLecture = (sectionId: string, lecture: Lecture) => {
    setActiveSectionId(sectionId);
    setEditingLecture({ ...lecture });
    setIsEditingLecture(true);
    setLectureModalOpen(true);
  };

  const handleSaveLecture = async () => {
    if (!editingLecture || !editingLecture.title?.trim() || !activeSectionId) return;

    if (isEditingLecture && editingLecture.id) {
      await courseContentService.updateLecture(courseId, editingLecture.id, editingLecture);
      const updated = sections.map((sec) => {
        if (sec.id !== activeSectionId) return sec;
        return {
          ...sec,
          lectures: sec.lectures.map((lec) =>
            lec.id === editingLecture.id ? ({ ...lec, ...editingLecture } as Lecture) : lec,
          ),
        };
      });
      updateStateAndPersist(updated);
    } else {
      const created = await courseContentService.createLecture(
        courseId,
        activeSectionId,
        editingLecture,
      );
      const updated = sections.map((sec) => {
        if (sec.id !== activeSectionId) return sec;
        return {
          ...sec,
          lectures: [...sec.lectures, created],
        };
      });
      updateStateAndPersist(updated);
    }

    setLectureModalOpen(false);
  };

  const handleDeleteLecture = async (sectionId: string, lectureId: string) => {
    if (!confirm('Are you sure you want to delete this lecture?')) return;
    await courseContentService.deleteLecture(courseId, lectureId);
    const updated = sections.map((sec) => {
      if (sec.id !== sectionId) return sec;
      return {
        ...sec,
        lectures: sec.lectures.filter((l) => l.id !== lectureId),
      };
    });
    updateStateAndPersist(updated);
  };

  const handleMoveLecture = (sectionId: string, index: number, direction: 'up' | 'down') => {
    const sec = sections.find((s) => s.id === sectionId);
    if (!sec) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sec.lectures.length) return;

    const nextLectures = [...sec.lectures];
    const [moved] = nextLectures.splice(index, 1);
    nextLectures.splice(targetIndex, 0, moved);

    const reorderedSec = {
      ...sec,
      lectures: nextLectures.map((l, idx) => ({ ...l, order: idx + 1 })),
    };

    const updated = sections.map((s) => (s.id === sectionId ? reorderedSec : s));
    updateStateAndPersist(updated);
    courseContentService.reorderLectures(
      courseId,
      sectionId,
      reorderedSec.lectures.map((l) => l.id),
    );
  };

  const handlePublishCourse = async () => {
    await instructorService.publishCourse(courseId);
    if (course) {
      setCourse({ ...course, status: 'published' });
    }
    alert('Course published successfully! It is now live in the course catalog.');
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-6">
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  const totalLectures = sections.reduce((acc, s) => acc + (s.lectures?.length || 0), 0);
  const totalDurationSec = sections.reduce(
    (acc, s) => acc + (s.lectures?.reduce((a, l) => a + l.duration, 0) || 0),
    0,
  );
  const totalHours = (totalDurationSec / 3600).toFixed(1);

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="space-y-1">
            <button
              onClick={() => router.push('/instructor/dashboard')}
              className="text-xs font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-1 mb-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </button>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 truncate max-w-xl">
                {course?.title || 'Course Curriculum Editor'}
              </h1>
              <Badge variant={course?.status === 'published' ? 'success' : 'warning'} size="sm">
                {course?.status || 'draft'}
              </Badge>
            </div>
            <p className="text-xs text-slate-500">
              {sections.length} sections • {totalLectures} lectures • {totalHours}h video length •{' '}
              <span className="text-emerald-600 font-semibold">{savingStatus}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            {course && (
              <a href={`/courses/${course.slug}`} target="_blank" rel="noreferrer">
                <Button variant="outline" size="sm" className="gap-1 text-xs border-slate-300 text-slate-700 bg-white rounded-lg">
                  <Eye className="w-3.5 h-3.5" /> Student Preview
                </Button>
              </a>
            )}

            {course?.status === 'draft' ? (
              <Button
                size="sm"
                onClick={handlePublishCourse}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium gap-1 text-xs rounded-lg"
              >
                <CheckCircle2 className="w-4 h-4" /> Publish Course
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="border-emerald-500 text-emerald-700 text-xs font-semibold pointer-events-none rounded-lg"
              >
                <Check className="w-4 h-4 mr-1" /> Live in Catalog
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 gap-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab('curriculum')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition ${
              activeTab === 'curriculum'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Curriculum & Lectures ({totalLectures})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition ${
              activeTab === 'settings'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Settings className="w-4 h-4" />
            Course Settings & Pricing
          </button>
        </div>

        {/* TAB 1: CURRICULUM EDITOR */}
        {activeTab === 'curriculum' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Course Sections</h2>
              <Button
                onClick={() => setNewSectionModalOpen(true)}
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium gap-1.5 rounded-lg"
              >
                <Plus className="w-4 h-4" /> Add Section
              </Button>
            </div>

            {sections.length === 0 ? (
              <Card className="p-12 text-center space-y-4 bg-white border border-slate-200 rounded-xl">
                <BookOpen className="w-10 h-10 text-indigo-600 mx-auto" />
                <h3 className="text-base font-semibold text-slate-900">No sections created yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Sections group your lectures into coherent topics or modules.
                </p>
                <Button onClick={() => setNewSectionModalOpen(true)} className="bg-indigo-600 text-white rounded-lg">
                  Add First Section
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {sections.map((section, sIndex) => {
                  const secMinutes = Math.round(
                    (section.lectures?.reduce((acc, l) => acc + l.duration, 0) || 0) / 60,
                  );

                  return (
                    <div
                      key={section.id}
                      className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden"
                    >
                      {/* Section Header */}
                      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-md bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {sIndex + 1}
                          </span>
                          <div>
                            <h3 className="font-semibold text-sm text-slate-900">
                              {section.title}
                            </h3>
                            <p className="text-xs text-slate-500">
                              {section.lectures?.length || 0} lectures • {secMinutes} minutes
                            </p>
                          </div>
                        </div>

                        {/* Section Controls */}
                        <div className="flex items-center gap-1 self-end sm:self-center">
                          <button
                            disabled={sIndex === 0}
                            onClick={() => handleMoveSection(sIndex, 'up')}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Move section up"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            disabled={sIndex === sections.length - 1}
                            onClick={() => handleMoveSection(sIndex, 'down')}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Move section down"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSection(section.id)}
                            className="p-1 rounded text-rose-600 hover:bg-rose-50 ml-2"
                            title="Delete section"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Section Lectures List */}
                      <div className="p-4 space-y-2">
                        {section.lectures && section.lectures.length > 0 ? (
                          section.lectures.map((lecture, lIndex) => {
                            const mins = Math.floor(lecture.duration / 60);
                            const secs = lecture.duration % 60;
                            const durationFormatted = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

                            return (
                              <div
                                key={lecture.id}
                                className="p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100 transition flex items-center justify-between gap-3 text-xs"
                              >
                                {/* Left Info */}
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <PlayCircle className="w-4 h-4 text-indigo-600 shrink-0" />
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold text-slate-800 truncate">
                                        {lecture.title}
                                      </span>
                                      {lecture.isPreview && (
                                        <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                          Preview
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                                      <span className="font-mono">{durationFormatted}</span>
                                      {lecture.resources && lecture.resources.length > 0 && (
                                        <span>• {lecture.resources.length} resource(s)</span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Right Controls */}
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    disabled={lIndex === 0}
                                    onClick={() => handleMoveLecture(section.id, lIndex, 'up')}
                                    className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                                    title="Move lecture up"
                                  >
                                    <ArrowUp className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    disabled={lIndex === section.lectures.length - 1}
                                    onClick={() => handleMoveLecture(section.id, lIndex, 'down')}
                                    className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                                    title="Move lecture down"
                                  >
                                    <ArrowDown className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleOpenEditLecture(section.id, lecture)}
                                    className="p-1 rounded text-indigo-600 hover:bg-indigo-50 ml-1"
                                    title="Edit lecture"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteLecture(section.id, lecture.id)}
                                    className="p-1 rounded text-rose-600 hover:bg-rose-50 ml-1"
                                    title="Delete lecture"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="p-4 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg">
                            No lectures added in this section yet.
                          </div>
                        )}

                        {/* Add Lecture inside Section */}
                        <button
                          onClick={() => handleOpenAddLecture(section.id)}
                          className="w-full py-2.5 rounded-lg border border-dashed border-slate-300 hover:border-indigo-500 text-xs font-medium text-slate-600 hover:text-indigo-600 transition flex items-center justify-center gap-1.5 mt-2 bg-white"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Lecture to Section {sIndex + 1}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: COURSE SETTINGS */}
        {activeTab === 'settings' && (
          <Card className="bg-white border border-slate-200 shadow-sm rounded-xl">
            <CardHeader>
              <CardTitle>Course Metadata & Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-2 max-w-2xl">
              <Input
                label="Course Title"
                value={settingsTitle}
                onChange={(e) => setSettingsTitle(e.target.value)}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Base Price ($)"
                  type="number"
                  value={settingsPrice}
                  onChange={(e) => setSettingsPrice(parseFloat(e.target.value) || 0)}
                />
                <Input
                  label="Promotional Price ($)"
                  type="number"
                  value={settingsDiscountPrice}
                  onChange={(e) => setSettingsDiscountPrice(parseFloat(e.target.value) || 0)}
                />
              </div>

              <Input
                label="Thumbnail Image URL"
                value={settingsThumbnail}
                onChange={(e) => setSettingsThumbnail(e.target.value)}
              />

              <Button
                onClick={() => {
                  if (course) {
                    setCourse({
                      ...course,
                      title: settingsTitle,
                      price: settingsPrice,
                      discountPrice: settingsDiscountPrice,
                      thumbnailUrl: settingsThumbnail,
                    });
                  }
                  setSavingStatus('Saved');
                  alert('Course settings updated!');
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg"
              >
                Save Course Settings
              </Button>
            </CardContent>
          </Card>
        )}

        {/* MODAL: New Section */}
        <Modal
          isOpen={newSectionModalOpen}
          onClose={() => setNewSectionModalOpen(false)}
          title="Add New Section"
          description="Sections represent main topics or milestone modules in your course."
        >
          <div className="space-y-4 pt-2">
            <Input
              label="Section Title"
              placeholder="e.g. Section 2: PostgreSQL Schema Modeling & Migrations"
              value={newSectionTitle}
              onChange={(e) => setNewSectionTitle(e.target.value)}
              autoFocus
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setNewSectionModalOpen(false)} className="rounded-lg">
                Cancel
              </Button>
              <Button onClick={handleAddSection} className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg">
                Create Section
              </Button>
            </div>
          </div>
        </Modal>

        {/* MODAL: Add / Edit Lecture */}
        <Modal
          isOpen={lectureModalOpen}
          onClose={() => setLectureModalOpen(false)}
          title={isEditingLecture ? 'Edit Lecture' : 'Add New Lecture'}
          description="Specify lecture title, video URL, duration, and whether learners can preview for free."
          maxWidth="lg"
        >
          {editingLecture && (
            <div className="space-y-4 pt-2">
              <Input
                label="Lecture Title *"
                placeholder="e.g. Entity Relational Mapping & Cascading Rules"
                value={editingLecture.title || ''}
                onChange={(e) => setEditingLecture({ ...editingLecture, title: e.target.value })}
              />

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Lecture Notes / Short Summary
                </label>
                <textarea
                  rows={2}
                  placeholder="Key concepts discussed in this lesson..."
                  value={editingLecture.description || ''}
                  onChange={(e) =>
                    setEditingLecture({ ...editingLecture, description: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <Input
                label="Video URL / Media Stream"
                placeholder="https://...mp4 or HLS stream URL"
                value={editingLecture.videoUrl || ''}
                onChange={(e) => setEditingLecture({ ...editingLecture, videoUrl: e.target.value })}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Duration (Seconds)"
                  type="number"
                  value={editingLecture.duration || 600}
                  onChange={(e) =>
                    setEditingLecture({
                      ...editingLecture,
                      duration: parseInt(e.target.value, 10) || 0,
                    })
                  }
                  helperText={`${Math.floor((editingLecture.duration || 600) / 60)} minutes`}
                />

                <div className="flex flex-col justify-center">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 mt-2">
                    <input
                      type="checkbox"
                      checked={!!editingLecture.isPreview}
                      onChange={(e) =>
                        setEditingLecture({ ...editingLecture, isPreview: e.target.checked })
                      }
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <span>Allow Free Preview</span>
                  </label>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Learners can watch this lesson before purchasing the course.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <Button variant="outline" onClick={() => setLectureModalOpen(false)} className="rounded-lg">
                  Cancel
                </Button>
                <Button onClick={handleSaveLecture} className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg">
                  {isEditingLecture ? 'Update Lecture' : 'Add Lecture'}
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
