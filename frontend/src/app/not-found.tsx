import React from 'react';
import Link from 'next/link';
import { Button } from '../components/ui/button';
import { Compass, Home, BookOpen } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-white">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="relative mx-auto w-20 h-20 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-sm">
          <Compass className="w-10 h-10" />
          <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded text-xs font-mono font-bold bg-indigo-600 text-white shadow-sm">
            404
          </span>
        </div>

        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Page Not Found
          </h1>
          <p className="text-sm text-slate-600">
            The curriculum module or destination you are searching for does not exist or has been
            relocated.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href="/" className="w-full sm:w-auto">
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium gap-2 rounded-lg">
              <Home className="w-4 h-4" />
              Return Home
            </Button>
          </Link>
          <Link href="/courses" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full gap-2 font-medium border-slate-300 text-slate-700 rounded-lg">
              <BookOpen className="w-4 h-4" />
              Explore Courses
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
