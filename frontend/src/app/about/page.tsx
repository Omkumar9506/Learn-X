import React from 'react';
import {
  Target,
  Award,
  Globe2,
  Sparkles,
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Hero */}
      <section className="py-16 bg-white border-b border-slate-200 text-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Our Mission & Story
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
            Democratizing world-class software engineering education
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            LearnX was founded with a singular purpose: bridge the gap between academic programming
            theories and the real-world architectures built by elite engineering teams.
          </p>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-xl bg-slate-50 border border-slate-200 shadow-sm text-center">
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900">
              250,000+
            </div>
            <div className="text-xs text-slate-500 mt-0.5">Students Enrolled</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900">
              450+
            </div>
            <div className="text-xs text-slate-500 mt-0.5">Production Courses</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900">
              120+
            </div>
            <div className="text-xs text-slate-500 mt-0.5">Countries Represented</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900">
              96%
            </div>
            <div className="text-xs text-slate-500 mt-0.5">Career Transition Rate</div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Our Core Principles</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            We don’t create passive videos. We build intensive, project-driven learning systems.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Outcome-Driven Projects</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every course ends with an architecture you can showcase in your GitHub profile and
              discuss deeply in senior engineering interviews.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Real-World Instructors Only</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every instructor is vetted based on their demonstrated real-world engineering track
              record and teaching clarity.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <Globe2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Global Accessibility</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Accessible pricing, purchasing power parity, and high-quality captions so talent
              everywhere can participate.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
