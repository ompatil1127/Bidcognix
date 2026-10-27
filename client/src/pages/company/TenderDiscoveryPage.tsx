import React, { useState, useEffect } from 'react';
import { Tender, Company, BookmarkItem } from '../../types';
import { ApiService } from '../../services/api';
import { TenderCard } from '../../components/tenders/TenderCard';
import { TenderFilters } from '../../components/tenders/TenderFilters';
import { StatCard } from '../../components/common/StatCard';
import { 
  Briefcase, 
  Sparkles, 
  TrendingUp, 
  Search, 
  Layers, 
  Building2, 
  Flame, 
  CheckCircle2 
} from 'lucide-react';

interface TenderDiscoveryPageProps {
  currentCompany: Company | null;
  onSelectTender: (tender: Tender) => void;
  onNavigate: (page: string) => void;
}

export const TenderDiscoveryPage: React.FC<TenderDiscoveryPageProps> = ({
  currentCompany,
  onSelectTender,
  onNavigate
}) => {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [minBudget, setMinBudget] = useState(0);
  const [minScore, setMinScore] = useState(0);

  useEffect(() => {
    fetchData();
  }, [selectedCategory, searchQuery, minBudget]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tenderList, bookmarkList] = await Promise.all([
        ApiService.getTenders({
          category: selectedCategory,
          q: searchQuery,
          minBudget: minBudget > 0 ? minBudget : undefined
        }),
        ApiService.getBookmarks()
      ]);
      setTenders(tenderList);
      setBookmarks(bookmarkList);
    } catch (err) {
      console.error('Failed to load tenders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBookmark = async (tenderId: string) => {
    try {
      const res = await ApiService.toggleBookmark(tenderId);
      const updatedBookmarks = await ApiService.getBookmarks();
      setBookmarks(updatedBookmarks);
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
    }
  };

  const isBookmarked = (tenderId: string) => {
    return bookmarks.some(b => b.tender_id === tenderId);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setMinBudget(0);
    setMinScore(0);
  };

  return (
    <div className="space-y-6">
      
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-navy-900 via-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-brand-500/15 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-500/10 border border-brand-500/25 px-3 py-1 text-xs font-bold text-brand-300 mb-3">
              <Sparkles className="h-3.5 w-3.5 text-brand-400" />
              <span>Multi-Source Intelligent Procurement Discovery</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Tender Discovery & Decision Hub
            </h1>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              Evaluating opportunities for <strong className="text-white">{currentCompany?.company_name || 'Your Company'}</strong>. AI automatically cross-references tender eligibility criteria, turnover, experience, and certifications to guide your bid decision.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onNavigate('profile')}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-700 hover:border-slate-600 transition-all"
            >
              <Building2 className="h-4 w-4 text-brand-400" />
              <span>Update Company Qualifications</span>
            </button>
            <button
              onClick={() => onNavigate('tracker')}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-brand-600/30 hover:bg-brand-500 transition-all"
            >
              <span>View Bid Pipeline</span>
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px]">{bookmarks.length}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top Stat KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Opportunities"
          value={tenders.length}
          subtitle="Cross-indexed live tenders"
          icon={<Layers className="h-5 w-5" />}
          accentColor="brand"
        />
        <StatCard
          title="High Fit (Score ≥ 80%)"
          value={tenders.filter(t => t.category === 'IT' || t.category === 'Education').length}
          subtitle="Strong compatibility with profile"
          icon={<Flame className="h-5 w-5" />}
          accentColor="green"
        />
        <StatCard
          title="Total Pipeline Volume"
          value="₹1,679.5 Cr"
          subtitle="Cumulated estimated budget"
          icon={<TrendingUp className="h-5 w-5" />}
          accentColor="purple"
        />
        <StatCard
          title="Tracked in Pipeline"
          value={bookmarks.length}
          subtitle="Under evaluation / approved"
          icon={<Briefcase className="h-5 w-5" />}
          accentColor="amber"
        />
      </div>

      {/* Discovery Layout: Left Filters + Right Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Left: Filters Sidebar */}
        <div className="lg:col-span-1 sticky top-20">
          <TenderFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            minBudget={minBudget}
            onMinBudgetChange={setMinBudget}
            minScore={minScore}
            onMinScoreChange={setMinScore}
            onReset={resetFilters}
          />
        </div>

        {/* Right: Tender Cards Grid */}
        <div className="lg:col-span-3 space-y-4">
          
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Matching Opportunities</span>
              <span className="rounded-full bg-slate-800 border border-slate-700 px-2 py-0.5 text-xs text-slate-300">
                {tenders.length} Found
              </span>
            </h2>

            <span className="text-xs text-slate-400">
              Sorted by: <strong className="text-white">AI Compatibility & Recency</strong>
            </span>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent mb-3" />
              <p className="text-sm font-semibold text-slate-300">Scanning tenders and evaluating AI criteria...</p>
            </div>
          ) : tenders.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center">
              <Search className="h-8 w-8 text-slate-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">No Tenders Found</h3>
              <p className="text-xs text-slate-400 mt-1">Try resetting your filters or search query.</p>
              <button
                onClick={resetFilters}
                className="mt-4 rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white hover:bg-brand-500"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tenders.map((tender) => (
                <TenderCard
                  key={tender.id}
                  tender={tender}
                  company={currentCompany}
                  isBookmarked={isBookmarked(tender.id)}
                  onSelect={onSelectTender}
                  onToggleBookmark={handleToggleBookmark}
                />
              ))}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
