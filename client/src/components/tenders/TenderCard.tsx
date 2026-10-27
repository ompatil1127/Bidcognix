import React from 'react';
import { Tender, Company } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { 
  Building2, 
  Calendar, 
  MapPin, 
  TrendingUp, 
  Sparkles, 
  ArrowUpRight, 
  Bookmark, 
  CheckCircle2, 
  Clock, 
  Briefcase,
  AlertTriangle
} from 'lucide-react';

interface TenderCardProps {
  tender: Tender;
  company: Company | null;
  isBookmarked: boolean;
  onSelect: (tender: Tender) => void;
  onToggleBookmark: (tenderId: string) => void;
}

export const TenderCard: React.FC<TenderCardProps> = ({
  tender,
  company,
  isBookmarked,
  onSelect,
  onToggleBookmark
}) => {
  // Quick pre-computation of match score for card preview
  const tenderTurnover = tender.min_turnover || 50000000;
  const companyTurnover = company?.annual_turnover || 150000000;
  const tenderExp = tender.min_experience_years || 5;
  const companyExp = company?.experience_years || 7;
  
  const matchedCerts = (tender.required_certifications || []).filter(tc =>
    (company?.certifications || []).some(cc => cc.toLowerCase().includes(tc.toLowerCase()))
  );
  const certRatio = matchedCerts.length / Math.max(1, (tender.required_certifications || []).length);
  
  const rawScore = Math.round(
    (Math.min(1.0, companyTurnover / tenderTurnover) * 30) +
    (Math.min(1.0, companyExp / tenderExp) * 25) +
    (certRatio * 25) +
    15
  );
  const matchScore = Math.min(96, Math.max(45, rawScore));

  let previewEligibility = 'Eligible';
  if (matchScore < 60) previewEligibility = 'Not Eligible';
  else if (matchScore < 85 || certRatio < 1.0) previewEligibility = 'Partially Eligible';

  // Calculate days remaining to deadline
  const deadlineDate = new Date(tender.deadline);
  const now = new Date();
  const diffDays = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const isUrgent = diffDays > 0 && diffDays <= 7;

  return (
    <div className="group relative rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl transition-all duration-300 hover:border-slate-700 hover:bg-slate-900 hover:shadow-2xl flex flex-col justify-between">
      
      <div>
        {/* Top Badges Row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={tender.category} type="category" size="sm" />
            
            <div className="inline-flex items-center gap-1 rounded-md bg-brand-500/10 border border-brand-500/25 px-2 py-0.5 text-[11px] font-bold text-brand-300">
              <Sparkles className="h-3 w-3 text-brand-400" />
              <span>AI {tender.ai_confidence}%</span>
            </div>

            <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-400">
              {tender.source_badge || 'Gov Verified'}
            </span>
          </div>

          {/* Bookmark toggle button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark(tender.id);
            }}
            className={`rounded-xl border p-2 transition-all focus:outline-none ${
              isBookmarked 
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'
            }`}
            title={isBookmarked ? 'Remove Bookmark' : 'Save / Bookmark Tender'}
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-amber-400' : ''}`} />
          </button>
        </div>

        {/* Tender Title */}
        <h3 
          onClick={() => onSelect(tender)}
          className="mt-3 text-base font-bold text-white group-hover:text-brand-300 transition-colors cursor-pointer line-clamp-2 leading-snug"
        >
          {tender.title}
        </h3>

        {/* Organization and Reference */}
        <div className="mt-2 flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-400">
          <div className="flex items-center gap-1">
            <Building2 className="h-3.5 w-3.5 text-slate-500" />
            <span className="truncate max-w-[200px]">{tender.organization_name}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-slate-500" />
            <span>{tender.location}</span>
          </div>
        </div>

        {/* Tender Metrics Grid */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2 rounded-xl bg-slate-950/60 border border-slate-800/80 p-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Estimated Budget</p>
            <p className="text-sm font-bold text-emerald-400 mt-0.5">{tender.budget_formatted}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Min Turnover</p>
            <p className="text-sm font-semibold text-slate-200 mt-0.5">{tender.min_turnover_formatted}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Min Experience</p>
            <p className="text-sm font-semibold text-slate-200 mt-0.5">{tender.min_experience_years} Years</p>
          </div>
        </div>

        {/* AI Eligibility & Match Strip */}
        <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-800/40 border border-slate-700/60 px-3 py-2">
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-400">AI Match Score</span>
              <span className="text-sm font-black text-white">{matchScore}%</span>
            </div>
          </div>
          <StatusBadge status={previewEligibility} type="eligibility" size="sm" />
        </div>
      </div>

      {/* Footer & Action */}
      <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Clock className={`h-3.5 w-3.5 ${isUrgent ? 'text-amber-400' : 'text-slate-500'}`} />
          <span>Due: <strong className="text-slate-300 font-semibold">{tender.deadline_formatted}</strong></span>
        </div>

        <button
          onClick={() => onSelect(tender)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-brand-600/30 hover:bg-brand-500 transition-all focus:outline-none"
        >
          <span>Deep AI Analysis</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </button>
      </div>

    </div>
  );
};
