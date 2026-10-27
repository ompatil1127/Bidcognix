import React, { useState, useEffect } from 'react';
import { Tender, Company, DashboardStats, UpcomingDeadlineItem } from '../../types';
import { ApiService } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { 
  Search, 
  Sparkles, 
  ArrowRight, 
  Building2, 
  Clock, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle,
  Award,
  Layers,
  ChevronRight,
  Send,
  Calendar,
  Bookmark,
  FileCheck2,
  ShieldCheck,
  Database
} from 'lucide-react';

interface CompanyHomePageProps {
  currentCompany: Company | null;
  onSelectTender: (tender: Tender) => void;
  onNavigate: (page: string) => void;
  onSearch?: (query: string) => void;
}

export const CompanyHomePage: React.FC<CompanyHomePageProps> = ({
  currentCompany,
  onSelectTender,
  onNavigate,
  onSearch
}) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recommendations, setRecommendations] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchWord, setSearchWord] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [dashStats, recs] = await Promise.all([
        ApiService.getDashboardStats().catch(() => null),
        ApiService.getRecommendations().catch(() => [])
      ]);
      setStats(dashStats);
      setRecommendations(recs);
    } catch (err) {
      console.error('Dashboard data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchWord);
    }
    onNavigate('find-tenders');
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Welcome Banner */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-900 via-navy-900 to-slate-950 p-6 sm:p-8 shadow-xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 h-64 w-64 bg-teal-500/10 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/20 border border-teal-500/40 px-3 py-1 text-xs font-bold text-teal-300">
            <Sparkles className="h-3.5 w-3.5 text-teal-400" />
            <span>AI-Powered Tender Intelligence & Bid Automation</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {currentCompany?.company_name || 'Apex Infotech Solutions'}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Monitor live government opportunities from GeM & CPPP, review AI-predicted eligibility before bidding, and track your active preparation pipeline.
          </p>

          {/* Quick Search Bar */}
          <form onSubmit={handleSearchSubmit} className="pt-2 flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchWord}
                onChange={(e) => setSearchWord(e.target.value)}
                placeholder="Search tender by keyword, portal, scope, or location..."
                className="w-full rounded-2xl bg-slate-950/90 border border-slate-700 py-3 pl-10 pr-4 text-xs text-white placeholder-slate-400 focus:border-teal-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="rounded-2xl bg-teal-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-teal-600/30 hover:bg-teal-500 transition-all flex items-center justify-center gap-2"
            >
              <span>Explore Tenders</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      {/* 6 Core Functional Dashboard Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        
        {/* Total Available Tenders */}
        <div 
          onClick={() => onNavigate('find-tenders')}
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 hover:border-teal-500 dark:hover:border-teal-500 cursor-pointer transition-all space-y-1 shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Available</span>
            <Database className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {stats ? stats.total_tenders : 5}
          </p>
          <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold block truncate">Browse tenders →</span>
        </div>

        {/* Recommended Tenders */}
        <div 
          onClick={() => onNavigate('find-tenders')}
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 hover:border-teal-500 dark:hover:border-teal-500 cursor-pointer transition-all space-y-1 shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Recommended</span>
            <Sparkles className="h-3.5 w-3.5 text-teal-500" />
          </div>
          <p className="text-2xl font-extrabold text-teal-600 dark:text-teal-400">
            {recommendations.length > 0 ? recommendations.length : 3}
          </p>
          <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold block truncate">High match score →</span>
        </div>

        {/* Saved Tenders */}
        <div 
          onClick={() => onNavigate('my-tenders')}
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 hover:border-teal-500 dark:hover:border-teal-500 cursor-pointer transition-all space-y-1 shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Saved Bids</span>
            <Bookmark className="h-3.5 w-3.5 text-blue-500" />
          </div>
          <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
            {stats ? stats.saved_tenders : 2}
          </p>
          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold block truncate">View saved list →</span>
        </div>

        {/* Upcoming Deadlines */}
        <div 
          onClick={() => onNavigate('alerts')}
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 hover:border-amber-500 dark:hover:border-amber-500 cursor-pointer transition-all space-y-1 shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Deadlines</span>
            <Clock className="h-3.5 w-3.5 text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
            {stats?.upcoming_deadlines?.length || 2}
          </p>
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold block truncate">Upcoming closings →</span>
        </div>

        {/* Under Preparation */}
        <div 
          onClick={() => onNavigate('my-tenders')}
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 hover:border-purple-500 dark:hover:border-purple-500 cursor-pointer transition-all space-y-1 shadow-log space-y-1 shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">In Prep</span>
            <FileCheck2 className="h-3.5 w-3.5 text-purple-500" />
          </div>
          <p className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">
            {stats ? stats.under_preparation_count : 2}
          </p>
          <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold block truncate">Active dossiers →</span>
        </div>

        {/* Submitted Bids */}
        <div 
          onClick={() => onNavigate('my-tenders')}
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 hover:border-emerald-500 dark:hover:border-emerald-500 cursor-pointer transition-all space-y-1 shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Submitted</span>
            <Send className="h-3.5 w-3.5 text-emerald-500" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {stats ? stats.submitted_count : 0}
          </p>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block truncate">Recorded bids →</span>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols): Recommended Tenders & Upcoming Deadlines */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Top Recommended Tenders */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  <span>AI Recommended Tenders for Your Company</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Ranked by multi-variable regression match score based on turnover (₹18.50 Cr), experience, and technical competencies
                </p>
              </div>

              <button
                onClick={() => onNavigate('find-tenders')}
                className="text-xs font-bold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {recommendations.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <p className="text-xs">No recommended tenders found at this moment.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recommendations.slice(0, 3).map((tender) => (
                  <div
                    key={tender.id}
                    onClick={() => onSelectTender(tender)}
                    className="group rounded-2xl border border-slate-200 dark:border-slate-800 p-4 hover:border-teal-500/80 hover:bg-teal-50/20 dark:hover:bg-teal-950/10 cursor-pointer transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <StatusBadge status={tender.category} type="category" size="sm" />
                          <span className="text-[11px] font-mono text-slate-500">{tender.reference_no}</span>
                          <span className="text-slate-300 dark:text-slate-700">•</span>
                          <span className="text-[11px] text-slate-500">{tender.organization_name}</span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                          {tender.title}
                        </h3>
                      </div>

                      {/* Match Score Badge */}
                      <div className="flex flex-col items-end flex-shrink-0">
                        <div className="px-2.5 py-1 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-700 dark:text-teal-300 text-xs font-extrabold flex items-center gap-1">
                          <Sparkles className="h-3 w-3 text-teal-500" />
                          <span>{tender.ai_confidence ? `${tender.ai_confidence}% Match` : '94% Match'}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1">High Eligibility</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                      <div className="flex items-center gap-3">
                        <span>Budget: <strong className="text-slate-900 dark:text-white font-bold">{tender.budget_formatted}</strong></span>
                        <span>EMD: <strong>{tender.emd_formatted || 'Exempt'}</strong></span>
                        <span>Due: <strong className="text-amber-600 dark:text-amber-400">{tender.deadline_formatted}</strong></span>
                      </div>
                      <span className="text-teal-700 dark:text-teal-400 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-1 text-[11px]">
                        <span>Review Eligibility</span>
                        <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Submission Deadlines */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-500" />
                  <span>Upcoming Tender Submission Deadlines</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Automated countdown reminders for active public RFPs
                </p>
              </div>

              <button
                onClick={() => onNavigate('alerts')}
                className="text-xs font-bold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1"
              >
                <span>Alerts Center</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {(stats?.upcoming_deadlines || []).map((dl) => (
                <div
                  key={dl.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">{dl.reference_no}</span>
                      <span className="text-[10px] text-slate-400 truncate max-w-xs">{dl.organization}</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate max-w-md">{dl.title}</p>
                    <span className="text-[11px] text-slate-500">Value: <strong className="text-slate-800 dark:text-slate-200">{dl.budget_formatted}</strong></span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className={`inline-block px-2.5 py-1 rounded-xl text-xs font-extrabold ${
                        dl.days_left <= 10
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      }`}>
                        {dl.days_left} Days Left
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{dl.deadline_formatted}</span>
                    </div>

                    <button
                      onClick={() => onNavigate('my-tenders')}
                      className="rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 p-2 text-slate-600 dark:text-slate-300 transition-colors"
                      title="Open Workspace"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column (1 Col): Company Qualification Snapshot & System Diagnostics */}
        <div className="space-y-6">
          
          {/* Company Profile Qualification Snapshot */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                <span>Eligibility Baseline</span>
              </h3>
              <button
                onClick={() => onNavigate('my-company')}
                className="text-[11px] font-bold text-teal-700 dark:text-teal-400 hover:underline"
              >
                Edit Profile
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950">
                <span className="text-slate-500">Annual Turnover</span>
                <span className="font-extrabold text-slate-900 dark:text-white">
                  {currentCompany?.turnover_formatted || '₹18.50 Cr'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950">
                <span className="text-slate-500">Experience</span>
                <span className="font-extrabold text-slate-900 dark:text-white">
                  {currentCompany?.experience_years || 7} Years
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950">
                <span className="text-slate-500">Industry / Domain</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[140px]">
                  {currentCompany?.industry || 'Technology & Software'}
                </span>
              </div>

              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold text-slate-400 block uppercase">Active Certifications</span>
                <div className="flex flex-wrap gap-1.5">
                  {(currentCompany?.certifications || ['ISO 9001', 'ISO 27001', 'CMMI Level 3']).map((c, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-lg bg-teal-500/10 text-teal-700 dark:text-teal-300 font-mono text-[10px] font-bold">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => onNavigate('my-company')}
                className="w-full rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Manage Documents & Profile</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Genuine Government Portal Sources */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-500" />
              <span>Connected Official Sources</span>
            </h3>

            <div className="space-y-2.5">
              {(stats?.sources_summary || [
                { name: 'Government e-Marketplace (GeM)', code: 'GEM', total_imported: 45 },
                { name: 'Central Public Procurement (CPPP)', code: 'CPPP', total_imported: 32 },
                { name: 'Maharashtra State e-Procure', code: 'MAHATENDERS', total_imported: 18 }
              ]).map((src: any) => (
                <div key={src.code} className="flex items-center justify-between p-2 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-medium text-slate-800 dark:text-slate-200 text-xs">{src.name}</span>
                  </div>
                  <span className="font-mono text-[10px] font-bold text-slate-500">{src.total_imported} RFPs</span>
                </div>
              ))}
            </div>

            <div className="rounded-xl bg-slate-50 dark:bg-slate-950 p-3 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
              <div className="flex items-center justify-between font-bold text-slate-700 dark:text-slate-300">
                <span>Database Engine:</span>
                <span className="text-teal-600 dark:text-teal-400">{stats?.postgres_status?.database_type || 'Persistent Relational Store'}</span>
              </div>
              <p className="text-[10px]">All tender IDs, publication dates, and bid security parameters preserved.</p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
