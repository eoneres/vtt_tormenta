import React, { HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export type BadgeVariant =
  | 'default'
  | 'arcane'
  | 'nature'
  | 'fire'
  | 'ice'
  | 'divine'
  | 'shadow'
  | 'danger'
  | 'success'
  | 'warning';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-slate-700 text-slate-200 border-slate-600',
  arcane: 'bg-violet-900/60 text-violet-200 border-violet-700',
  nature: 'bg-emerald-900/60 text-emerald-200 border-emerald-700',
  fire: 'bg-red-900/60 text-red-200 border-red-700',
  ice: 'bg-sky-900/60 text-sky-200 border-sky-700',
  divine: 'bg-amber-900/60 text-amber-200 border-amber-700',
  shadow: 'bg-purple-900/60 text-purple-200 border-purple-700',
  danger: 'bg-red-950 text-red-300 border-red-800',
  success: 'bg-emerald-950 text-emerald-300 border-emerald-800',
  warning: 'bg-amber-950 text-amber-300 border-amber-800',
};

export function Badge({ variant = 'default', size = 'md', dot, children, className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border font-medium tracking-wide',
        size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs',
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {dot && (
        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      )}
      {children}
    </span>
  );
}
