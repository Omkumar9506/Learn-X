'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '../components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled runtime error in LearnX:', error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-white">
      <div className="max-w-lg w-full text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-sm">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Something went wrong
          </h1>
          <p className="text-sm text-slate-600">
            An unexpected error occurred while rendering this view.
          </p>
          {error.digest && (
            <p className="text-xs font-mono text-slate-500 bg-slate-100 py-1 px-2.5 rounded-lg inline-block mt-2">
              Digest: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            onClick={() => reset()}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-medium gap-2 rounded-lg"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full gap-2 font-medium border-slate-300 text-slate-700 rounded-lg">
              <Home className="w-4 h-4" />
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
