'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';
import {
  GraduationCap,
  Search,
  BookOpen,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
  Heart,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => pathname === path || (path !== '/' && pathname?.startsWith(path));

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header
      className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white"
      style={{ backgroundColor: '#ffffff' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-bold text-xl text-slate-900"
          >
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900">
              Learn<span className="text-indigo-600">X</span>
            </span>
          </Link>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link
              href="/courses"
              className={`transition-colors ${
                isActive('/courses')
                  ? 'text-indigo-600 font-semibold'
                  : 'text-slate-600 hover:text-indigo-600'
              }`}
            >
              Courses
            </Link>
            <Link
              href="/about"
              className={`transition-colors ${
                isActive('/about')
                  ? 'text-indigo-600 font-semibold'
                  : 'text-slate-600 hover:text-indigo-600'
              }`}
            >
              About
            </Link>
            {(!isAuthenticated || user?.role === 'student') && (
              <Link
                href="/teach"
                className={`transition-colors ${
                  isActive('/teach')
                    ? 'text-indigo-600 font-semibold'
                    : 'text-slate-600 hover:text-indigo-600'
                }`}
              >
                Teach
              </Link>
            )}
          </nav>
        </div>

        {/* Search Bar (Desktop) */}
        <div className="hidden lg:flex flex-1 max-w-md mx-4">
          <form onSubmit={handleSearch} className="w-full relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search for courses, skills, instructors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 transition-colors outline-none text-slate-900 placeholder:text-slate-400"
              style={{ backgroundColor: '#ffffff' }}
            />
          </form>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              {/* Wishlist quick link */}
              <Link
                href="/wishlist"
                className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                title="Wishlist"
              >
                <Heart className="w-5 h-5" />
              </Link>

              {/* My Learning quick link */}
              <Link
                href="/dashboard/learning"
                className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors px-2 py-1"
              >
                <BookOpen className="w-4 h-4 text-indigo-600" />
                My Learning
              </Link>

              {/* User Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1 pl-2 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs overflow-hidden">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      getInitials(user.name)
                    )}
                  </div>
                  <span className="text-xs font-semibold text-slate-800 max-w-[100px] truncate hidden md:inline">
                    {user.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 mr-1" />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-lg border border-slate-200 py-1.5 z-50"
                    style={{ backgroundColor: '#ffffff' }}
                  >
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {user.email}
                      </p>
                      <div className="mt-1.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {user.role}
                        </span>
                      </div>
                    </div>

                    <div className="py-1">
                      {user.role === 'instructor' && (
                        <Link
                          href="/instructor/dashboard"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <LayoutDashboard className="w-4 h-4 text-indigo-600" />
                          Instructor Studio
                        </Link>
                      )}

                      {user.role === 'admin' && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <LayoutDashboard className="w-4 h-4 text-rose-600" />
                          Admin Console
                        </Link>
                      )}

                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <LayoutDashboard className="w-4 h-4 text-slate-500" />
                        Dashboard
                      </Link>

                      <Link
                        href="/profile"
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <UserIcon className="w-4 h-4 text-slate-500" />
                        Profile Settings
                      </Link>
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors text-left font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="font-semibold text-slate-700">
                  Log In
                </Button>
              </Link>
              <Link href="/signup">
                <Button
                  size="sm"
                  className="font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                >
                  Sign Up
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-4"
          style={{ backgroundColor: '#ffffff' }}
        >
          <form onSubmit={handleSearch} className="w-full relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-300 bg-white outline-none text-slate-900 placeholder:text-slate-400"
              style={{ backgroundColor: '#ffffff' }}
            />
          </form>

          <nav className="flex flex-col space-y-2 text-sm font-medium">
            <Link
              href="/courses"
              className="px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              Courses
            </Link>
            <Link
              href="/about"
              className="px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link
              href="/teach"
              className="px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              Teach on LearnX
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  href="/dashboard"
                  className="px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/learning"
                  className="px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Learning
                </Link>
                <Link
                  href="/profile"
                  className="px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile Settings
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
