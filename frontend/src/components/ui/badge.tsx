import * as React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'purple' | 'outline';
  size?: 'sm' | 'md';
}

export function Badge({
  className,
  variant = 'default',
  size = 'md',
  children,
  ...props
}: BadgeProps) {
  const baseStyles = 'inline-flex items-center font-medium rounded-full select-none';

  const variants = {
    default:
      'bg-slate-100 text-slate-700 border border-slate-200',
    primary:
      'bg-indigo-50 text-indigo-700 border border-indigo-200',
    success:
      'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning:
      'bg-amber-50 text-amber-700 border border-amber-200',
    danger:
      'bg-rose-50 text-rose-700 border border-rose-200',
    purple:
      'bg-purple-50 text-purple-700 border border-purple-200',
    outline:
      'bg-white text-slate-700 border border-slate-300',
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-0.5 gap-1.5',
  };

  return (
    <span className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  );
}
