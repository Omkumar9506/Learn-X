import React from 'react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Terms of Service</h1>
            <p className="text-xs text-slate-500 mt-1">Last Updated: March 20, 2026</p>
          </div>

          <div className="space-y-5 text-sm text-slate-600 leading-relaxed">
            <section className="space-y-1.5">
              <h2 className="text-base font-bold text-slate-900">1. Acceptance of Terms</h2>
              <p>
                By accessing and using LearnX (&quot;the Platform&quot;), you agree to comply with and be bound by
                these Terms of Service. If you do not agree, please do not use our services.
              </p>
            </section>

            <section className="space-y-1.5">
              <h2 className="text-base font-bold text-slate-900">2. Course Enrollment and Lifetime Access</h2>
              <p>
                When you enroll in a course on LearnX, you receive a limited, personal, non-transferable
                license to view the course content for educational purposes. You may not distribute, copy,
                resell, or publicly broadcast course media.
              </p>
            </section>

            <section id="refund" className="space-y-1.5">
              <h2 className="text-base font-bold text-slate-900">3. 30-Day Refund Policy</h2>
              <p>
                If you are not satisfied with a purchased course, you may request a refund within 30 days
                of purchase, provided you have not consumed more than 30% of the course content.
              </p>
            </section>

            <section className="space-y-1.5">
              <h2 className="text-base font-bold text-slate-900">4. Instructor Responsibilities</h2>
              <p>
                Instructors warrant that their published content is original, accurate, and does not infringe
                on intellectual property rights or software licensing boundaries.
              </p>
            </section>

            <section className="space-y-1.5">
              <h2 className="text-base font-bold text-slate-900">5. Account Security</h2>
              <p>
                You are responsible for maintaining the confidentiality of your login credentials and for all
                activities that occur under your account.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
