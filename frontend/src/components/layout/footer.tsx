'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Globe,
  Mail,
  Check,
  ShieldCheck,
} from 'lucide-react';

export function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="bg-slate-50 text-slate-600 border-t border-slate-200 text-sm">
      {/* Top Newsletter & Banner */}
      <div className="border-b border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center justify-between">
            <div className="lg:col-span-6 space-y-2">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                Stay updated with engineering roadmaps & courses
              </h3>
              <p className="text-slate-600 text-sm max-w-lg">
                Join over 180,000+ developers receiving curated tutorials, career transition stories, and exclusive course drops.
              </p>
            </div>

            <div className="lg:col-span-6">
              {subscribed ? (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium">
                  <Check className="w-5 h-5 text-emerald-600" />
                  <span>Thank you for subscribing! Check your inbox soon.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md lg:ml-auto">
                  <div className="relative flex-1">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors shrink-0 shadow-sm"
                  >
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Links Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Col */}
          <div className="col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-slate-900">
              <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900">
                Learn<span className="text-indigo-600">X</span>
              </span>
            </Link>
            <p className="text-slate-600 text-sm max-w-sm leading-relaxed">
              Production-level education platform engineered for software developers, architects, and technical leaders.
            </p>
            <div className="pt-1 flex items-center gap-3 text-slate-500">
              {/* GitHub */}
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center hover:text-slate-900 hover:border-slate-300 transition-colors"
                title="GitHub"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </a>
              {/* Twitter */}
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center hover:text-slate-900 hover:border-slate-300 transition-colors"
                title="Twitter"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              {/* LinkedIn */}
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center hover:text-slate-900 hover:border-slate-300 transition-colors"
                title="LinkedIn"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Col 1: Explore */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/courses" className="hover:text-slate-900 transition-colors">
                  All Courses
                </Link>
              </li>
              <li>
                <Link href="/courses?category=web-development" className="hover:text-slate-900 transition-colors">
                  Web Development
                </Link>
              </li>
              <li>
                <Link href="/courses?category=backend-systems" className="hover:text-slate-900 transition-colors">
                  Backend Systems
                </Link>
              </li>
              <li>
                <Link href="/courses?category=devops-cloud" className="hover:text-slate-900 transition-colors">
                  DevOps & Cloud
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Platform */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/about" className="hover:text-slate-900 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/teach" className="hover:text-slate-900 transition-colors">
                  Teach on LearnX
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-slate-900 transition-colors">
                  Engineering Blog
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-slate-900 transition-colors">
                  Student Hub
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal & Trust */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Legal & Trust
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/privacy" className="hover:text-slate-900 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-slate-900 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li className="pt-2 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                <ShieldCheck className="w-4 h-4" />
                <span>SSL Encrypted Checkout</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Legal & Copyright Bar */}
      <div className="border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} LearnX Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-slate-900 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-slate-900 transition-colors">
              Terms
            </Link>
            <span className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" />
              English (US)
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
