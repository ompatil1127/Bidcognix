import React, { useState, useEffect } from 'react';
import { Tender, Company, BookmarkItem } from '../../types';
import { ApiService } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import confetti from 'canvas-confetti';
import { 
  Search, 
  Sparkles, 
  Bookmark, 
  Building2, 
  Clock, 
  ArrowUpRight, 
  RotateCcw,
  SlidersHorizontal,
  MapPin,
  CheckCircle2,
  Upload,
  Download,
  Filter,
  Layers,
  Database,
  ExternalLink,
  X,
  FileSpreadsheet
} from 'lucide-react';

interface FindTendersPageProps {
  currentCompany: Company | null;
  onSelectTender: (tender: Tender) => void;
  onNavigate: (page: string) => void;
}

const CATEGORIES = [
  'All',
  'Technology',
  'Infrastructure',
  'Healthcare',
  'Renewable Energy',
  'Manufacturing',
  'Education',
  'Defense',
  'Logistics'
];

const SOURCES = [
  'All Sources',
  'Government e-Marketplace (GeM)',
  'Central Public Procurement Portal (CPPP)',
  'Maharashtra State e-Procurement Portal',
  'Karnataka Public Procurement Portal'
];

export const FindTendersPage: React.FC<FindTendersPageProps> = ({
  currentCompany,
  onSelectTender,
  onNavigate
}) => {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSource, setSelectedSource] = useState('All Sources');
  const [sortBy, setSortBy] = useState('deadline');
  const [minBudget, setMinBudget] = useState(0);

  // Import Modal state
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importSource, setImportSource] = useState('Government e-Marketplace (GeM)');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);

  useEffect(() => {
    loadTenders();
  }, [selectedCategory, selectedSource, search, minBudget, sortBy]);

  const loadTenders = async () => {
    try {
      setLoading(true);
      const [tList, bList] = await Promise.all([
        ApiService.getTenders({
          category: selectedCategory === 'All' ? undefined : selectedCategory,
          source: selectedSource === 'All Sources' ? undefined : selectedSource,
          q: search,
          minBudget: minBudget > 0 ? minBudget : undefined,
          sortBy
        }),
        ApiService.getBookmarks().catch(() => [])
      ]);
      setTenders(tList);
      setBookmarks(bList);
    } catch (err) {
      console.error('Find tenders load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBookmark = async (e: React.MouseEvent, tenderId: string) => {
    e.stopPropagation();
    try {
      await ApiService.toggleBookmark(tenderId);
      const updated = await ApiService.getBookmarks();
      setBookmarks(updated);
    } catch (err) {
      console.error('Bookmark toggle error:', err);
    }
  };

  const isBookmarked = (id: string) => bookmarks.some(b => b.tender_id === id);

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSelectedSource('All Sources');
    setMinBudget(0);
    setSortBy('deadline');
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setImporting(true);
      setImportResult(null);

      let parsed: any[];
      try {
        parsed = JSON.parse(importJsonText);
        if (!Array.isArray(parsed)) parsed = [parsed];
      } catch (err) {
        throw new Error('Invalid JSON format. Please paste a valid array of tender records.');
      }

      const res = await ApiService.importTenders(parsed, importSource);
      setImportResult(res);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.5 } });
      await loadTenders();
      setTimeout(() => {
        setImportModalOpen(false);
        setImportJsonText('');
        setImportResult(null);
      }, 2000);
    } catch (err: any) {
      alert(err.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header & Source Sync Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-teal-500/10 border border-teal-500/30 px-3 py-0.5 text-xs font-bold text-teal-700 dark:text-teal-300 mb-2">
            <Database className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
            <span>Genuine Government Procurement Database</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Discover Government & Enterprise Tenders
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Browse genuine RFPs from GeM, CPPP, and State Portals. Evaluated against your company parameters.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setImportModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Upload className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
            <span>Import Tender Data (CSV/JSON)</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3.5 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by keywords, reference, or authority..."
              className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 py-2 pl-9 pr-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 py-2 px-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-teal-500"
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c === 'All' ? 'All Industry Categories' : c}</option>
              ))}
            </select>
          </div>

          {/* Source Portal Dropdown */}
          <div>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 py-2 px-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-teal-500"
            >
              {SOURCES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 py-2 px-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-teal-500"
            >
              <option value="deadline">Sort by: Submission Deadline</option>
              <option value="budget">Sort by: Budget / Value</option>
              <option value="created_at">Sort by: Recently Published</option>
            </select>
          </div>

        </div>

        {/* Filter Stats & Reset */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span>Found <strong className="text-slate-900 dark:text-white font-bold">{tenders.length}</strong> verified government opportunities</span>
          <button
            onClick={resetFilters}
            className="inline-flex items-center gap-1 text-teal-700 dark:text-teal-400 hover:underline font-semibold"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      {/* Tenders Grid */}
      {loading ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent mb-3" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Filtering genuine tender records...</p>
        </div>
      ) : tenders.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center space-y-3">
          <Search className="h-10 w-10 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Tenders Match Your Criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search keywords, broadening category filters, or importing an official government dataset.
          </p>
          <button
            onClick={resetFilters}
            className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-teal-700 px-4 py-2 text-xs font-bold text-white hover:bg-teal-800"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {tenders.map((tender) => {
            const saved = isBookmarked(tender.id);

            return (
              <div
                key={tender.id}
                onClick={() => onSelectTender(tender)}
                className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:border-teal-500/80 hover:bg-teal-50/10 dark:hover:bg-teal-950/10 cursor-pointer transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  
                  {/* Left Info */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={tender.category} type="category" size="sm" />
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20">
                        {tender.source_badge || 'GeM Verified'}
                      </span>
                      <span className="text-xs font-mono text-slate-500">{tender.reference_no}</span>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span className="text-xs text-slate-500">{tender.organization_name}</span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                      {tender.title}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {tender.description}
                    </p>
                  </div>

                  {/* Actions & Bookmark button */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 flex-shrink-0">
                    <button
                      onClick={(e) => handleToggleBookmark(e, tender.id)}
                      className={`rounded-xl border p-2 transition-colors ${
                        saved
                          ? 'bg-teal-500/20 text-teal-600 border-teal-500/40'
                          : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-teal-600 dark:hover:text-white'
                      }`}
                      title={saved ? 'Remove from Saved Bids' : 'Save to Bid Workspace'}
                    >
                      <Bookmark className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />
                    </button>

                    <div className="text-right">
                      <span className="text-base font-extrabold text-slate-900 dark:text-white block">
                        {tender.budget_formatted}
                      </span>
                      <span className="text-[10px] text-slate-400">Estimated Budget</span>
                    </div>
                  </div>

                </div>

                {/* Bottom Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-amber-500" />
                      <span>Due: <strong className="text-slate-800 dark:text-slate-200">{tender.deadline_formatted}</strong></span>
                    </span>

                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      <span>{tender.location}</span>
                    </span>

                    <span>Min Turnover: <strong>{tender.min_turnover_formatted}</strong></span>
                    <span>EMD: <strong>{tender.emd_formatted || 'Exempt'}</strong></span>
                  </div>

                  <span className="text-teal-700 dark:text-teal-400 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-1 text-xs">
                    <span>Analyze Fit & Documents</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Tender Data Import Modal */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 max-w-xl w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Import Government Tender Dataset</h3>
              </div>
              <button 
                onClick={() => setImportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Paste structured JSON records exported from GeM, CPPP, or State Portals. BidCognix normalizes parameters and eliminates duplicates.
            </p>

            <form onSubmit={handleImportSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Data Source</label>
                <select
                  value={importSource}
                  onChange={(e) => setImportSource(e.target.value)}
                  className="mt-1 w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="Government e-Marketplace (GeM)">Government e-Marketplace (GeM)</option>
                  <option value="Central Public Procurement Portal (CPPP)">Central Public Procurement Portal (CPPP)</option>
                  <option value="State Procurement Portal">State Procurement Portal</option>
                  <option value="Authorized Open Procurement Data">Authorized Open Procurement Data</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">JSON Payload</label>
                  <button
                    type="button"
                    onClick={() => {
                      setImportJsonText(JSON.stringify([
                        {
                          reference_no: `GEM/2026/B/${Math.floor(1000000 + Math.random() * 9000000)}`,
                          title: "Turnkey Implementation of City-Wide Intelligent Traffic Management & CCTV Telemetry",
                          organization_name: "Smart City Development Corporation",
                          category: "Technology",
                          budget: 85000000,
                          budget_formatted: "₹8.50 Cr",
                          min_turnover: 40000000,
                          min_turnover_formatted: "₹4.00 Cr",
                          min_experience_years: 4,
                          location: "Bhopal, Madhya Pradesh",
                          deadline: new Date(Date.now() + 25 * 86400000).toISOString(),
                          deadline_formatted: "25 Days Remaining, 17:00 IST",
                          required_certifications: ["ISO 9001", "ISO 27001"],
                          technical_requirements: ["ANPR Cameras", "Control Command Center Software", "PostgreSQL", "Cloud Operations"],
                          required_documents: ["GST Registration", "PAN Card", "3-Year Balance Sheets", "Bank Solvency (₹3 Cr)"],
                          description: "Design, procurement, deployment and 5-year SLA operations of city-wide traffic management and automated incident detection.",
                          emd_amount: 1700000,
                          emd_formatted: "₹17.00 Lakh"
                        }
                      ], null, 2));
                    }}
                    className="text-[11px] text-teal-600 dark:text-teal-400 hover:underline font-bold"
                  >
                    Load Sample Record
                  </button>
                </div>

                <textarea
                  rows={7}
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  placeholder="Paste JSON array of tender records..."
                  className="mt-1 w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 p-3 text-xs font-mono text-slate-900 dark:text-white focus:border-teal-500 focus:outline-none"
                  required
                />
              </div>

              {importResult && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs">
                  ✓ Successfully imported {importResult.imported} new records ({importResult.duplicates} duplicates skipped).
                </div>
              )}

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setImportModalOpen(false)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={importing || !importJsonText.trim()}
                  className="rounded-xl bg-teal-700 hover:bg-teal-600 px-4 py-2 text-xs font-bold text-white transition-colors"
                >
                  {importing ? 'Importing...' : 'Import Dataset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
