'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { instructorService } from '../../services/instructor.service';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import {
  Sparkles,
  Users,
  DollarSign,
  Video,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

const EXPERTISE_TAGS = [
  'Full Stack Development',
  'Next.js & React',
  'NestJS & Node.js',
  'AI & LLM Engineering',
  'Cloud Architecture (AWS/GCP)',
  'DevOps & Kubernetes',
  'Cybersecurity & Ethical Hacking',
  'UI/UX & Design Systems',
  'Data Engineering & SQL',
];

export default function TeachPage() {
  const router = useRouter();
  const { isAuthenticated, updateUser } = useAuth();

  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [experience, setExperience] = useState('3-5');
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>(['Full Stack Development']);
  const [website, setWebsite] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [github, setGithub] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleExpertise = (tag: string) => {
    if (selectedExpertise.includes(tag)) {
      setSelectedExpertise(selectedExpertise.filter((t) => t !== tag));
    } else {
      setSelectedExpertise([...selectedExpertise, tag]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      router.push('/login?redirect=/teach');
      return;
    }

    if (!headline.trim() || !bio.trim()) {
      setError('Please provide your professional headline and biography.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await instructorService.onboard({
        headline,
        bio,
        expertise: selectedExpertise,
        experience,
        website,
        linkedin,
        github,
      });

      updateUser({ role: 'instructor' });
      router.push('/instructor/dashboard');
    } catch {
      setError('Failed to complete instructor onboarding. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Hero Section */}
      <section className="bg-white border-b border-slate-200 py-16 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Instructor Partnership Program
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
            Teach on LearnX and shape the next generation of engineers
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Reach 250,000+ ambitious software developers worldwide, earn recurring revenue, and
            establish yourself as a respected domain authority.
          </p>
        </div>
      </section>

      {/* 3 Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2.5">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Industry-Leading Revenue Share</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Keep up to 85% of earnings when students enroll through your instructor coupons and
              organic marketplace traffic.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2.5">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">High-Intent Global Audience</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Connect with motivated engineering students and working professionals eager to master
              real production stacks.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2.5">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <Video className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">State of the Art Studio Tools</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Intuitive curriculum builder, video hosting, interactive quiz maker, and real-time
              revenue analytics.
            </p>
          </div>
        </div>
      </section>

      {/* Onboarding Application Form */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <Card className="border border-slate-200 shadow-sm bg-white rounded-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-900">Apply to Become an Instructor</CardTitle>
            <CardDescription>
              Complete your instructor profile to unlock course authoring privileges.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5 pt-2">
            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Professional Headline"
                placeholder="e.g. Senior Software Architect @ CloudScale | Ex-Google"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                required
                helperText="Your headline appears on your course landing pages and instructor card."
              />

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Instructor Biography & Teaching Experience
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Summarize your professional software engineering background, tools you've mastered, and why you love teaching..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none"
                />
              </div>

              {/* Area of Expertise */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                  Areas of Expertise (Select all that apply)
                </label>
                <div className="flex flex-wrap gap-2">
                  {EXPERTISE_TAGS.map((tag) => {
                    const isSelected = selectedExpertise.includes(tag);
                    return (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => toggleExpertise(tag)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Years of Experience */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Years of Professional Experience
                </label>
                <select
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-600"
                >
                  <option value="1-2">1 - 2 Years</option>
                  <option value="3-5">3 - 5 Years</option>
                  <option value="5-10">5 - 10 Years</option>
                  <option value="10+">10+ Years (Senior / Staff / Principal)</option>
                </select>
              </div>

              {/* Social links */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="LinkedIn Profile"
                  placeholder="https://linkedin.com/in/username"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                />
                <Input
                  label="GitHub Profile"
                  placeholder="https://github.com/username"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                />
              </div>

              <Input
                label="Personal Website or Portfolio (Optional)"
                placeholder="https://yourportfolio.dev"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Instant review & sandbox access
                </span>

                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  size="lg"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-2.5 rounded-lg shadow-sm"
                >
                  Submit Application
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
