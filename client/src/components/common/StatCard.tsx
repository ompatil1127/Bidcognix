import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  accentColor?: 'brand' | 'green' | 'amber' | 'purple' | 'rose';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  accentColor = 'brand'
}) => {
  const colorMap = {
    brand: 'from-brand-500/20 to-transparent border-brand-500/30 text-brand-400',
    green: 'from-emerald-500/20 to-transparent border-emerald-500/30 text-emerald-400',
    amber: 'from-amber-500/20 to-transparent border-amber-500/30 text-amber-400',
    purple: 'from-purple-500/20 to-transparent border-purple-500/30 text-purple-400',
    rose: 'from-rose-500/20 to-transparent border-rose-500/30 text-rose-400'
  };

  const iconBgMap = {
    brand: 'bg-brand-500/10 text-brand-400 border-brand-500/20',
    green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl transition-all duration-300 hover:border-slate-700 hover:shadow-2xl`}>
      <div className={`absolute top-0 right-0 h-28 w-28 bg-gradient-to-br ${colorMap[accentColor]} blur-2xl opacity-40 pointer-events-none`} />
      
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <h3 className="mt-2 text-2xl font-bold tracking-tight text-white">{value}</h3>
          {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
        </div>
        <div className={`rounded-xl border p-3 ${iconBgMap[accentColor]}`}>
          {icon}
        </div>
      </div>

      {trend && (
        <div className="mt-4 flex items-center gap-1.5 text-xs">
          <span className={trend.isPositive ? 'font-semibold text-emerald-400' : 'font-semibold text-rose-400'}>
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </span>
          <span className="text-slate-500">vs last month</span>
        </div>
      )}
    </div>
  );
};
