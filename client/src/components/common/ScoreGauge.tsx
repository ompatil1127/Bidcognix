import React from 'react';

interface ScoreGaugeProps {
  score: number;
  label: string;
  maxScore?: number;
  type?: 'match' | 'competitiveness';
  size?: 'sm' | 'md' | 'lg';
  showSubtext?: boolean;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  label,
  maxScore = 100,
  type = 'match',
  size = 'md',
  showSubtext = true
}) => {
  const percentage = Math.min(100, Math.max(0, (score / maxScore) * 100));

  // Color logic
  let colorClass = 'text-brand-400 stroke-brand-500';
  let bgGlow = 'rgba(14, 140, 233, 0.2)';
  let verdict = 'Strong Candidate';

  if (score >= 85) {
    colorClass = 'text-emerald-400 stroke-emerald-500';
    bgGlow = 'rgba(34, 197, 94, 0.2)';
    verdict = 'High Win Probability';
  } else if (score >= 65) {
    colorClass = 'text-amber-400 stroke-amber-500';
    bgGlow = 'rgba(245, 158, 11, 0.2)';
    verdict = 'Moderate / Action Required';
  } else {
    colorClass = 'text-rose-400 stroke-rose-500';
    bgGlow = 'rgba(244, 63, 94, 0.2)';
    verdict = 'High Gap / Unfavorable';
  }

  const radius = size === 'lg' ? 44 : size === 'md' ? 36 : 28;
  const strokeWidth = size === 'lg' ? 8 : size === 'md' ? 6 : 5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const dim = (radius + strokeWidth) * 2;

  return (
    <div className="flex items-center gap-4 rounded-2xl bg-slate-900/80 border border-slate-800 p-4">
      <div className="relative flex items-center justify-center" style={{ width: dim, height: dim }}>
        <svg className="transform -rotate-90" width={dim} height={dim}>
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            className="stroke-slate-800"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            className={`${colorClass} transition-all duration-1000 ease-out`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className={`font-bold tracking-tight text-white ${size === 'lg' ? 'text-2xl' : size === 'md' ? 'text-lg' : 'text-sm'}`}>
            {type === 'match' ? `${score}%` : `${score}`}
          </span>
          {type === 'competitiveness' && (
            <span className="text-[10px] text-slate-400">/100</span>
          )}
        </div>
      </div>

      <div className="flex-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
        <h4 className="text-base font-bold text-white mt-0.5">
          {type === 'match' ? `${score}% Profile Match` : `${score}/100 Competitiveness`}
        </h4>
        {showSubtext && (
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
            <span className={`inline-block h-1.5 w-1.5 rounded-full ${score >= 80 ? 'bg-emerald-400' : score >= 60 ? 'bg-amber-400' : 'bg-rose-400'}`} />
            {verdict}
          </p>
        )}
      </div>
    </div>
  );
};
