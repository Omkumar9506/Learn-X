import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Privacy Policy</h1>
            <p className="text-xs text-slate-500 mt-1">Last Updated: March 20, 2026</p>
          </div>

          <div className="space-y-5 text-sm text-slate-600 leading-relaxed">
            <section className="space-y-1.5">
              <h2 className="text-base font-bold text-slate-900">1. Information We Collect</h2>
              <p>
                We collect personal information you provide when creating an account, including your name,
                email address, profile picture, and payment details processed securely by third-party processors.
              </p>
            </section>

            <section className="space-y-1.5">
              <h2 className="text-base font-bold text-slate-900">2. How We Use Your Data</h2>
              <p>
                Your information is used strictly to deliver course streaming, issue verifiable digital completion
                certificates, process enrollments, and calculate instructor earnings.
              </p>
            </section>

            <section id="cookies" className="space-y-1.5">
              <h2 className="text-base font-bold text-slate-900">3. Cookies and Tracking</h2>
              <p>
                We utilize essential authentication cookies and local storage to keep you logged in and persist
                your video playback timestamps.
              </p>
            </section>

            <section id="security" className="space-y-1.5">
              <h2 className="text-base font-bold text-slate-900">4. Data Security</h2>
              <p>
                We employ industry-standard encryption protocols (TLS/HTTPS), salted password hashing
                via bcrypt, and strict role-based access control to safeguard your sensitive information.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
