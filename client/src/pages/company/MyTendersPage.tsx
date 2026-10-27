import React, { useState, useEffect } from 'react';
import { BookmarkItem, Tender } from '../../types';
import { ApiService } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { 
  ClipboardList, 
  Trash2, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  Search,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface MyTendersPageProps {
  onSelectTender: (tender: Tender) => void;
  onNavigate: (page: string) => void;
}

const TABS = [
  { id: 'ALL', label: 'All My Tenders' },
  { id: 'SAVED', label: 'Saved' },
  { id: 'APPROVED_TO_BID', label: 'Preparing Bid' },
  { id: 'BID_SUBMITTED', label: 'Submitted' }
];

export const MyTendersPage: React.FC<MyTendersPageProps> = ({
  onSelectTender,
  onNavigate
}) => {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getBookmarks();
      setBookmarks(data);
    } catch (err) {
      console.error('Bookmarks load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStageChange = async (tenderId: string, newStage: string) => {
    try {
      await ApiService.updateTrackingStage(tenderId, newStage);
      await loadBookmarks();
    } catch (err) {
      console.error('Update stage error:', err);
    }
  };

  const handleRemove = async (tenderId: string) => {
    try {
      await ApiService.toggleBookmark(tenderId);
      await loadBookmarks();
    } catch (err) {
      console.error('Remove error:', err);
    }
  };

  const filtered = activeTab === 'ALL'
    ? bookmarks
    : bookmarks.filter(b => b.stage === activeTab);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            My Tenders
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Track tenders you have saved, are preparing bids for, or have submitted.
          </p>
        </div>

        <button
          onClick={() => onNavigate('find-tenders')}
          className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-brand-600/30 hover:bg-brand-500 transition-all"
        >
          <span>Find More Tenders</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => {
          const isSelected = activeTab === tab.id;
          const count = tab.id === 'ALL' ? bookmarks.length : bookmarks.filter(b => b.stage === tab.id).length;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all flex items-center gap-2 border ${
                isSelected
                  ? 'bg-brand-600 border-brand-500 text-white shadow-md shadow-brand-600/30'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                isSelected ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* List */}
      {loading ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent mb-3" />
          <p className="text-sm font-semibold text-slate-300">Loading your saved tenders...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-12 text-center space-y-3">
          <ClipboardList className="h-10 w-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Tenders in this List</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Browse tenders and click "Save to My Tenders" or "I Want to Bid" to keep track of them here.
          </p>
          <button
            onClick={() => onNavigate('find-tenders')}
            className="mt-2 rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white hover:bg-brand-500"
          >
            Find Tenders
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const tender = item.tender;
            if (!tender) return null;

            return (
              <div
                key={item.id}
                className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={tender.category} type="category" size="sm" />
                    <span className="text-xs font-mono text-slate-400 font-bold">{tender.reference_no}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-xs text-slate-400">{tender.organization_name}</span>
                  </div>

                  <h3
                    onClick={() => onSelectTender(tender)}
                    className="text-base font-bold text-white hover:text-brand-300 cursor-pointer transition-colors"
                  >
                    {tender.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                    <span>Budget: <strong className="text-emerald-400 font-bold">{tender.budget_formatted}</strong></span>
                    <span>Deadline: <strong className="text-amber-400">{tender.deadline_formatted}</strong></span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Status</span>
                    <select
                      value={item.stage}
                      onChange={(e) => handleStageChange(tender.id, e.target.value)}
                      className="mt-0.5 rounded-xl bg-slate-950 border border-slate-700 px-3 py-1.5 text-xs font-bold text-brand-300 focus:outline-none"
                    >
                      <option value="SAVED">Saved</option>
                      <option value="APPROVED_TO_BID">Preparing Bid</option>
                      <option value="BID_SUBMITTED">Submitted</option>
                      <option value="WON">Contract Won 🏆</option>
                    </select>
                  </div>

                  <button
                    onClick={() => onSelectTender(tender)}
                    className="rounded-xl bg-brand-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-brand-500 shadow-md shadow-brand-600/30 transition-all flex items-center gap-1 mt-3 sm:mt-0"
                  >
                    <span>View AI Analysis</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>

                  <button
                    onClick={() => handleRemove(tender.id)}
                    className="rounded-xl border border-slate-800 bg-slate-950 p-2 text-slate-500 hover:text-rose-400 mt-3 sm:mt-0"
                    title="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
