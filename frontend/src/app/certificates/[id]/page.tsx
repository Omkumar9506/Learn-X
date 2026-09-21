'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { certificateService, CertificateData } from '../../../services/certificate.service';
import { Button } from '../../../components/ui/button';
import { Skeleton } from '../../../components/ui/skeleton';
import {
  Award,
  CheckCircle2,
  Printer,
  Copy,
  Check,
  ShieldCheck,
  GraduationCap,
  ArrowLeft,
} from 'lucide-react';

export default function CertificatePage() {
  const params = useParams();
  const router = useRouter();
  const certId = params?.id as string;

  const [cert, setCert] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadCert() {
      if (!certId) return;
      setLoading(true);
      try {
        const data = await certificateService.getCertificate(certId);
        setCert(data);
      } catch (err) {
        console.error('Failed to load certificate', err);
      } finally {
        setLoading(false);
      }
    }

    loadCert();
  }, [certId]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 space-y-6 bg-slate-50 min-h-screen">
        <Skeleton className="h-10 w-48 mx-auto rounded-lg" />
        <Skeleton className="h-[550px] w-full rounded-xl" />
      </div>
    );
  }

  if (!cert) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4 bg-white">
        <h2 className="text-xl font-bold text-slate-900">Certificate Not Found</h2>
        <p className="text-xs text-slate-500">The verification ID does not match any issued record.</p>
        <Button onClick={() => router.push('/courses')}>Back to Catalog</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
          <button
            onClick={() => router.push('/dashboard/learning')}
            className="text-xs font-semibold text-slate-600 hover:text-indigo-600 flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to My Learning
          </button>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCopyLink} className="text-xs font-medium gap-1.5 border-slate-300 text-slate-700 bg-white rounded-lg">
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Link Copied!' : 'Copy Verification Link'}
            </Button>

            <Button variant="outline" size="sm" onClick={handlePrint} className="text-xs font-medium gap-1.5 border-slate-300 text-slate-700 bg-white rounded-lg">
              <Printer className="w-3.5 h-3.5" /> Print / Save PDF
            </Button>
          </div>
        </div>

        {/* Verification Success Pill */}
        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg print:hidden text-center">
          <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>Officially Verified Digital Credential • Certificate ID: <strong>{cert.certificateNumber}</strong></span>
        </div>

        {/* CERTIFICATE DOCUMENT CONTAINER */}
        <div className="relative rounded-xl bg-white border-4 border-slate-300 p-8 sm:p-14 shadow-sm overflow-hidden print:border-4 print:shadow-none print:m-0">
          {/* Subtle background watermark */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none text-slate-900">
            <GraduationCap className="w-[450px] h-[450px]" />
          </div>

          <div className="relative z-10 text-center space-y-6">
            {/* Header Brand */}
            <div className="flex items-center justify-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="font-bold text-2xl tracking-tight text-slate-900">
                Learn<span className="text-indigo-600">X</span>
              </span>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-indigo-600">
                Certificate of Completion
              </h2>
              <p className="text-xs text-slate-500">
                This credential is electronically verified and awarded to
              </p>
            </div>

            {/* Student Name */}
            <div className="py-2">
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight border-b-2 border-indigo-600/30 pb-3 inline-block px-8">
                {cert.studentName}
              </h1>
            </div>

            {/* Achievement text */}
            <div className="space-y-1.5 max-w-xl mx-auto">
              <p className="text-xs sm:text-sm text-slate-600">
                for successfully completing the curriculum and demonstrating production-level proficiency in
              </p>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                {cert.courseTitle}
              </h3>
            </div>

            {/* Signatures & Seal */}
            <div className="pt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 items-end border-t border-slate-100">
              {/* Left: Instructor signature */}
              <div className="text-center sm:text-left space-y-1">
                <div className="font-serif italic text-lg text-slate-800 border-b border-slate-300 pb-1">
                  {cert.instructorName}
                </div>
                <p className="text-xs font-semibold text-slate-900">
                  {cert.instructorName}
                </p>
                <p className="text-[10px] text-slate-500">{cert.instructorHeadline}</p>
              </div>

              {/* Center: Gold verification seal */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full border-2 border-amber-400 bg-amber-50 text-amber-600 flex flex-col items-center justify-center shadow-sm">
                  <Award className="w-7 h-7" />
                  <span className="text-[8px] font-bold uppercase tracking-wider mt-0.5">Verified</span>
                </div>
              </div>

              {/* Right: Date & verification code */}
              <div className="text-center sm:text-right space-y-1">
                <div className="text-xs font-medium text-slate-800 border-b border-slate-300 pb-1">
                  {cert.issuedAt}
                </div>
                <p className="text-xs font-semibold text-slate-900">
                  Date of Conferral
                </p>
                <p className="text-[10px] font-mono text-slate-500 uppercase">
                  {cert.certificateNumber}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Link Info Card */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm print:hidden">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Anyone with this verification link can confirm the legitimacy and conferral date of this certificate.</span>
          </div>
          <span className="font-mono text-[11px] text-indigo-600 font-semibold shrink-0">
            {cert.verificationUrl}
          </span>
        </div>
      </div>
    </div>
  );
}
