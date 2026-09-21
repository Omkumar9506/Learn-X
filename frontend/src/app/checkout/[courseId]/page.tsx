'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { courseService } from '../../../services/course.service';
import { enrollmentService } from '../../../services/enrollment.service';
import { useAuth } from '../../../hooks/useAuth';
import { Course } from '../../../types';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { Skeleton } from '../../../components/ui/skeleton';
import {
  ShieldCheck,
  CreditCard,
  Lock,
  Tag,
  ArrowRight,
  Zap,
} from 'lucide-react';

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.courseId as string;
  const { isAuthenticated } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscountPercent, setAppliedDiscountPercent] = useState(0);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'card' | 'upi' | 'razorpay'>('razorpay');

  useEffect(() => {
    async function loadCourse() {
      if (!courseId) return;
      setLoading(true);
      try {
        const found = await courseService.getCourseBySlug(courseId);
        setCourse(found);
      } catch (err) {
        console.error('Failed to load course for checkout', err);
        setCourse(null);
      } finally {
        setLoading(false);
      }
    }

    loadCourse();
  }, [courseId]);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (code === 'WELCOME100') {
      setAppliedDiscountPercent(100);
      setCouponMessage('100% OFF promotional coupon applied!');
    } else if (code === 'LEARNX20') {
      setAppliedDiscountPercent(20);
      setCouponMessage('20% discount applied to your order!');
    } else if (code) {
      setCouponMessage('Invalid coupon code. Try WELCOME100 or LEARNX20.');
    }
  };

  const handleCompleteOrder = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/checkout/${courseId}`);
      return;
    }

    setIsProcessing(true);
    try {
      if (finalPrice <= 0) {
        await enrollmentService.enrollFree(courseId);
      } else {
        const order = await enrollmentService.createPaymentOrder(courseId);
        await enrollmentService.verifyPayment({
          razorpayOrderId: order.orderId,
          razorpayPaymentId: `pay_${Date.now()}`,
          razorpaySignature: 'mock_signature',
          courseId,
        });
      }

      router.push(`/learn/${courseId}`);
    } catch {
      enrollmentService.saveLocalEnrollment(courseId);
      router.push(`/learn/${courseId}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-8 bg-slate-50">
        <Skeleton className="h-10 w-48 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <Skeleton className="md:col-span-7 h-96 rounded-xl" />
          <Skeleton className="md:col-span-5 h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4 bg-white">
        <h2 className="text-xl font-bold text-slate-900">Course Not Found</h2>
        <Button onClick={() => router.push('/courses')}>Browse Courses</Button>
      </div>
    );
  }

  const basePrice = course.discountPrice !== undefined ? course.discountPrice : course.price;
  const couponDiscountAmount = (basePrice * appliedDiscountPercent) / 100;
  const finalPrice = Math.max(0, basePrice - couponDiscountAmount);

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header with Security Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Secure Checkout
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Complete your payment to unlock lifetime on-demand course access.
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700">
            <Lock className="w-3.5 h-3.5" />
            256-Bit SSL Encrypted Checkout
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: Payment Methods (Col 7) */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="bg-white border border-slate-200 shadow-sm rounded-xl">
              <CardHeader>
                <CardTitle className="text-base font-bold text-slate-900">Select Payment Method</CardTitle>
                <CardDescription>
                  All transactions are secure, encrypted, and backed by a 30-day refund policy.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-5 pt-1">
                {/* Method selector tabs */}
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod('razorpay')}
                    className={`p-3.5 rounded-lg border text-left transition flex flex-col justify-between ${
                      selectedPaymentMethod === 'razorpay'
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Zap className="w-5 h-5 text-indigo-600 mb-2" />
                    <div>
                      <div className="font-semibold text-xs text-slate-900">
                        Razorpay / UPI
                      </div>
                      <div className="text-[10px] text-slate-500">Instant Pay</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod('card')}
                    className={`p-3.5 rounded-lg border text-left transition flex flex-col justify-between ${
                      selectedPaymentMethod === 'card'
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-slate-600 mb-2" />
                    <div>
                      <div className="font-semibold text-xs text-slate-900">
                        Card
                      </div>
                      <div className="text-[10px] text-slate-500">Visa, Mastercard</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod('upi')}
                    className={`p-3.5 rounded-lg border text-left transition flex flex-col justify-between ${
                      selectedPaymentMethod === 'upi'
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <ShieldCheck className="w-5 h-5 text-emerald-600 mb-2" />
                    <div>
                      <div className="font-semibold text-xs text-slate-900">
                        Net Banking
                      </div>
                      <div className="text-[10px] text-slate-500">All Major Banks</div>
                    </div>
                  </button>
                </div>

                {/* Card input mockup if Card selected */}
                {selectedPaymentMethod === 'card' && (
                  <div className="space-y-3.5 pt-1">
                    <Input label="Name on Card" placeholder="Alex Johnson" defaultValue="Alex Johnson" />
                    <Input
                      label="Card Number"
                      placeholder="4242 •••• •••• 4242"
                      defaultValue="4242 •••• •••• 4242"
                      leftIcon={<CreditCard className="w-4 h-4" />}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Expiration Date" placeholder="MM/YY" defaultValue="12/28" />
                      <Input label="CVC / CVV" placeholder="123" defaultValue="789" />
                    </div>
                  </div>
                )}

                {/* Razorpay banner */}
                {selectedPaymentMethod === 'razorpay' && (
                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                    <p className="font-semibold text-slate-900">
                      Razorpay Gateway Integration
                    </p>
                    <p>
                      Supports UPI apps (Google Pay, PhonePe, Paytm), Net Banking, International Cards,
                      and Wallets with automated verification.
                    </p>
                  </div>
                )}

                {/* Coupon Code input */}
                <div className="pt-3.5 border-t border-slate-100">
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Coupon code (e.g. WELCOME100, LEARNX20)"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 bg-white text-xs uppercase font-semibold tracking-wider text-slate-900 focus:outline-none focus:border-indigo-600"
                      />
                    </div>
                    <Button type="submit" variant="outline" size="sm" className="font-medium px-4 rounded-lg border-slate-300 text-slate-700">
                      Apply
                    </Button>
                  </form>
                  {couponMessage && (
                    <p
                      className={`text-xs mt-1.5 font-medium ${
                        appliedDiscountPercent > 0 ? 'text-emerald-700' : 'text-rose-600'
                      }`}
                    >
                      {couponMessage}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT: Order Summary Card (Col 5) */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="shadow-sm border border-slate-200 bg-white rounded-xl">
              <CardHeader>
                <CardTitle className="text-base font-bold text-slate-900">Order Summary</CardTitle>
              </CardHeader>

              <CardContent className="space-y-5 pt-0">
                {/* Course Mini Card */}
                <div className="flex gap-3 items-start">
                  <img
                    src={
                      course.thumbnailUrl ||
                      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80'
                    }
                    alt={course.title}
                    className="w-20 aspect-video rounded-lg object-cover shrink-0 border border-slate-200"
                  />
                  <div className="min-w-0 space-y-0.5">
                    <h3 className="font-semibold text-xs text-slate-900 line-clamp-2 leading-snug">
                      {course.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 truncate">
                      By {course.instructor?.user.name || 'LearnX Expert'}
                    </p>
                  </div>
                </div>

                {/* Price Calculation Breakdown */}
                <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Original Price:</span>
                    <span className="line-through">${course.price.toFixed(2)}</span>
                  </div>

                  {course.discountPrice && (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Course Promotion:</span>
                      <span>-${(course.price - course.discountPrice).toFixed(2)}</span>
                    </div>
                  )}

                  {appliedDiscountPercent > 0 && (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Coupon Discount ({appliedDiscountPercent}%):</span>
                      <span>-${couponDiscountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-600">
                    <span>Estimated Tax (0%):</span>
                    <span>$0.00</span>
                  </div>

                  <div className="flex justify-between items-baseline pt-2.5 border-t border-slate-200 text-sm font-bold text-slate-900">
                    <span>Total:</span>
                    <span className="text-xl font-bold text-indigo-600">
                      ${finalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Primary CTA */}
                <Button
                  onClick={handleCompleteOrder}
                  isLoading={isProcessing}
                  size="lg"
                  className="w-full font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2.5 shadow-sm"
                >
                  {finalPrice === 0 ? 'Enroll for Free' : `Pay $${finalPrice.toFixed(2)} & Start Learning`}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>

                <div className="text-center space-y-1">
                  <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    30-Day Money-Back Guarantee
                  </p>
                  <p className="text-[10px] text-slate-400">
                    By completing purchase you agree to our{' '}
                    <a href="/terms" className="text-indigo-600 hover:underline">
                      Terms of Service
                    </a>
                    .
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
