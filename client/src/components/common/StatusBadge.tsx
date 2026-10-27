import React from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'eligibility' | 'tender_status' | 'category' | 'compliance' | 'source';
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  type = 'tender_status',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3.5 py-1.5 text-sm font-semibold'
  };

  if (type === 'eligibility') {
    const s = (status || '').toLowerCase();
    if (s.includes('eligible') && !s.includes('partially') && !s.includes('not')) {
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-medium ${sizeClasses[size]}`}>
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          Eligible
        </span>
      );
    }
    if (s.includes('partially')) {
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-medium ${sizeClasses[size]}`}>
          <span className="h-2 w-2 rounded-full bg-amber-400" />
          Partially Eligible
        </span>
      );
    }
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 font-medium ${sizeClasses[size]}`}>
        <span className="h-2 w-2 rounded-full bg-rose-400" />
        Not Eligible
      </span>
    );
  }

  if (type === 'tender_status') {
    const s = (status || '').toUpperCase();
    if (s === 'ACTIVE') {
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 ${sizeClasses[size]}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Active
        </span>
      );
    }
    if (s === 'CLOSED') {
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-md bg-slate-800 border border-slate-700 text-slate-400 ${sizeClasses[size]}`}>
          Closed
        </span>
      );
    }
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 ${sizeClasses[size]}`}>
        Draft
      </span>
    );
  }

  if (type === 'category') {
    return (
      <span className={`inline-flex items-center gap-1 rounded-md bg-brand-500/10 border border-brand-500/20 text-brand-400 font-medium ${sizeClasses[size]}`}>
        {status}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center rounded-md bg-slate-800 border border-slate-700 text-slate-300 ${sizeClasses[size]}`}>
      {status}
    </span>
  );
};
