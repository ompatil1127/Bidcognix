import React, { useState, useEffect } from 'react';
import { Tender, User } from '../../types';
import { ApiService } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { 
  FileText, 
  Trash2, 
  Edit3, 
  Eye, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  Search, 
  ArrowUpRight,
  PlusCircle
} from 'lucide-react';

interface ManageTendersPageProps {
  currentUser: User | null;
  onNavigate: (page: string) => void;
  onSelectTender: (tender: Tender) => void;
}

export const ManageTendersPage: React.FC<ManageTendersPageProps> = ({
  currentUser,
  onNavigate,
  onSelectTender
}) => {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadTenders();
  }, []);

  const loadTenders = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getTenders();
      setTenders(data);
    } catch (err) {
      console.error('Failed to load tenders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (tender: Tender) => {
    try {
      const nextStatus = tender.status === 'ACTIVE' ? 'CLOSED' : 'ACTIVE';
      await ApiService.updateTender(tender.id, { status: nextStatus });
      await loadTenders();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleDelete = async (tenderId: string) => {
    if (confirm('Are you sure you want to delete / archive this tender?')) {
      try {
        await ApiService.deleteTender(tenderId);
        await loadTenders();
      } catch (err) {
        console.error('Delete failed:', err);
      }
    }
  };

  const filtered = tenders.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.reference_no.toLowerCase().includes(search.toLowerCase()) ||
    t.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-500/10 border border-brand-500/30 px-3 py-0.5 text-xs font-bold text-brand-300 mb-2">
            <FileText className="h-3.5 w-3.5 text-brand-400" />
            <span>Tender Governance Console</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Manage Published Tenders & Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review live tender status, manage extensions, inspect bidder evaluations, or close bidding windows.
          </p>
        </div>

        <button
          onClick={() => onNavigate('create-tender')}
          className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-brand-600/30 hover:bg-brand-500 transition-all"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Publish New Tender</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by title, reference no, or category..."
          className="w-full rounded-2xl bg-slate-900 border border-slate-800 py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none"
        />
      </div>

      {/* Tenders List */}
      {loading ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent mb-3" />
          <p className="text-sm font-semibold text-slate-300">Loading tenders...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((tender) => (
            <div
              key={tender.id}
              className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 shadow-xl transition-all hover:border-slate-700 space-y-4"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={tender.category} type="category" size="sm" />
                    <StatusBadge status={tender.status} type="tender_status" size="sm" />
                    <span className="text-xs font-mono text-slate-400 font-bold">{tender.reference_no}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-xs text-brand-400 font-semibold">AI Confidence: {tender.ai_confidence}%</span>
                  </div>

                  <h3
                    onClick={() => onSelectTender(tender)}
                    className="text-base font-bold text-white hover:text-brand-300 cursor-pointer transition-colors"
                  >
                    {tender.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                    <span>Budget: <strong className="text-emerald-400 font-bold">{tender.budget_formatted}</strong></span>
                    <span>Min Turnover: <strong className="text-slate-300">{tender.min_turnover_formatted}</strong></span>
                    <span>Min Exp: <strong className="text-slate-300">{tender.min_experience_years} Yrs</strong></span>
                    <span>Deadline: <strong className="text-amber-400">{tender.deadline_formatted}</strong></span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2.5 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                  <button
                    onClick={() => onSelectTender(tender)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-brand-600/30 hover:bg-brand-500 transition-all"
                  >
                    <span>Inspect AI Evaluation</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>

                  <button
                    onClick={() => handleToggleStatus(tender)}
                    className={`rounded-xl border px-3.5 py-2 text-xs font-bold transition-all ${
                      tender.status === 'ACTIVE'
                        ? 'border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
                        : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                    }`}
                  >
                    {tender.status === 'ACTIVE' ? 'Close Bidding' : 'Reactivate Tender'}
                  </button>

                  <button
                    onClick={() => handleDelete(tender.id)}
                    className="rounded-xl border border-slate-800 bg-slate-950 p-2 text-slate-500 hover:text-rose-400 hover:border-slate-700 transition-colors"
                    title="Delete Tender"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

              </div>

              {/* Bidder Activity Telemetry Strip */}
              <div className="rounded-2xl bg-slate-950/60 border border-slate-800/80 p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-4">
                  <span className="text-slate-400">Bidder Impressions: <strong className="text-white font-bold">{tender.views_count || 120}</strong></span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400">Companies Evaluated Fit: <strong className="text-brand-400 font-bold">{tender.evaluation_count || 14}</strong></span>
                </div>
                <span className="text-emerald-400 font-medium">● 94% Avg Qualification Match</span>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
