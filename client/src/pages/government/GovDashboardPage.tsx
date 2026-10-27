import React, { useState, useEffect } from 'react';
import { Tender, User } from '../../types';
import { ApiService } from '../../services/api';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { 
  Building2, 
  PlusCircle, 
  Layers, 
  CheckCircle2, 
  Clock, 
  FileText, 
  TrendingUp, 
  Eye, 
  Users, 
  Sparkles,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

interface GovDashboardPageProps {
  currentUser: User | null;
  onNavigate: (page: string) => void;
  onSelectTender: (tender: Tender) => void;
}

export const GovDashboardPage: React.FC<GovDashboardPageProps> = ({
  currentUser,
  onNavigate,
  onSelectTender
}) => {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGovTenders();
  }, []);

  const loadGovTenders = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getTenders();
      setTenders(data);
    } catch (err) {
      console.error('Failed to load gov tenders:', err);
    } finally {
      setLoading(false);
    }
  };

  const activeCount = tenders.filter(t => t.status === 'ACTIVE').length;
  const draftCount = tenders.filter(t => t.status === 'DRAFT').length;
  const closedCount = tenders.filter(t => t.status === 'CLOSED').length;
  const totalViews = tenders.reduce((acc, t) => acc + (t.views_count || 0), 0);
  const totalEvals = tenders.reduce((acc, t) => acc + (t.evaluation_count || 0), 0);

  // Activity chart data
  const chartData = tenders.slice(0, 5).map(t => ({
    name: t.title.length > 20 ? t.title.substring(0, 20) + '...' : t.title,
    views: t.views_count || 120,
    evaluations: t.evaluation_count || 15
  }));

  return (
    <div className="space-y-6 pb-12">
      
      {/* Gov Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-navy-900 to-slate-950 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 h-64 w-64 bg-emerald-500/10 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-0.5 text-xs font-bold text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Government Procurement Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {currentUser?.organization_name || 'National Highways Authority (NHAI)'}
            </h1>
            <p className="text-xs text-slate-300">
              Officer Console: Publish tenders with automated AI PDF parameter extraction, track bidder interest distribution, and manage procurement lifecycle.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => onNavigate('create-tender')}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 px-5 py-3 text-xs font-bold text-white shadow-xl shadow-brand-600/30 hover:from-brand-500 hover:to-brand-400 transition-all"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Publish New Tender (AI Wizard)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Published"
          value={tenders.length}
          subtitle="All created tenders"
          icon={<Layers className="h-5 w-5" />}
          accentColor="brand"
        />
        <StatCard
          title="Active Tenders"
          value={activeCount}
          subtitle="Open for bidder evaluation"
          icon={<CheckCircle2 className="h-5 w-5" />}
          accentColor="green"
        />
        <StatCard
          title="Total Bidder Views"
          value={totalViews}
          subtitle="Enterprise bidder impressions"
          icon={<Eye className="h-5 w-5" />}
          accentColor="purple"
        />
        <StatCard
          title="AI Evaluation Runs"
          value={totalEvals}
          subtitle="Companies checked eligibility"
          icon={<Users className="h-5 w-5" />}
          accentColor="amber"
        />
      </div>

      {/* Analytics & Bidder Activity Chart */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-brand-400" />
              <span>Bidder Interest & AI Evaluation Analytics</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Impressions vs In-depth Eligibility Evaluations per Tender</p>
          </div>
          <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            Live Telemetry
          </span>
        </div>

        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }}
              />
              <Bar dataKey="views" fill="#0e8ce9" radius={[6, 6, 0, 0]} name="Bidder Views" />
              <Bar dataKey="evaluations" fill="#10b981" radius={[6, 6, 0, 0]} name="AI Evaluations" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Tenders Table */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="h-4 w-4 text-brand-400" />
            <span>Recent Published Tenders</span>
          </h2>

          <button
            onClick={() => onNavigate('manage-tenders')}
            className="text-xs font-bold text-brand-400 hover:text-brand-300"
          >
            Manage All Tenders →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 bg-slate-950/40">
              <tr>
                <th className="py-3 px-4">Tender Title & Ref</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Budget</th>
                <th className="py-3 px-4">Deadline</th>
                <th className="py-3 px-4">Bidder Views</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {tenders.map((tender) => (
                <tr key={tender.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-white max-w-xs">
                    <span 
                      onClick={() => onSelectTender(tender)}
                      className="hover:text-brand-400 cursor-pointer font-bold block truncate"
                    >
                      {tender.title}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{tender.reference_no}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={tender.category} type="category" size="sm" />
                  </td>
                  <td className="py-3.5 px-4 text-emerald-400 font-bold">
                    {tender.budget_formatted}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">
                    {tender.deadline_formatted}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 font-semibold">
                    {tender.views_count || 0} views • {tender.evaluation_count || 0} evals
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={tender.status} type="tender_status" size="sm" />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => onSelectTender(tender)}
                      className="inline-flex items-center gap-1 rounded-lg bg-slate-800 hover:bg-slate-700 px-2.5 py-1 text-slate-300 hover:text-white font-semibold"
                    >
                      <span>Preview AI</span>
                      <ArrowUpRight className="h-3 w-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
