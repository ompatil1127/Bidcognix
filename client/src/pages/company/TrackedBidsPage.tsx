import React, { useState, useEffect } from 'react';
import { Tender, BidWorkspace, BidTask, BidChecklistItem, BidStage } from '../../types';
import { ApiService } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import confetti from 'canvas-confetti';
import { 
  Bookmark, 
  Trash2, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  FileText, 
  ChevronRight, 
  AlertCircle,
  Plus,
  CheckSquare,
  Square,
  Send,
  Calendar,
  ExternalLink,
  ShieldCheck,
  Building2,
  X,
  FileCheck2,
  FolderKanban
} from 'lucide-react';

interface TrackedBidsPageProps {
  onSelectTender: (tender: Tender) => void;
  onNavigate: (page: string) => void;
  onOpenWorkflow?: (tender: Tender) => void;
}

const STAGES: { id: string; label: string; badge: string; color: string }[] = [
  { id: 'ALL', label: 'All Opportunities', badge: 'All', color: 'bg-slate-800 text-slate-300' },
  { id: 'SAVED', label: 'Saved', badge: 'Saved', color: 'bg-slate-700 text-slate-200' },
  { id: 'UNDER_REVIEW', label: 'Under Review', badge: 'Reviewing', color: 'bg-blue-900/60 text-blue-300 border border-blue-700/50' },
  { id: 'PREPARING_DOCUMENTS', label: 'Preparing Documents', badge: 'Prep Docs', color: 'bg-amber-900/60 text-amber-300 border border-amber-700/50' },
  { id: 'READY_FOR_REVIEW', label: 'Ready for Review', badge: 'Internal Review', color: 'bg-purple-900/60 text-purple-300 border border-purple-700/50' },
  { id: 'READY_FOR_SUBMISSION', label: 'Ready for Submission', badge: 'Ready to Bid', color: 'bg-teal-900/60 text-teal-300 border border-teal-700/50' },
  { id: 'SUBMITTED', label: 'Submitted', badge: 'Submitted', color: 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50' },
  { id: 'AWARDED', label: 'Awarded 🏆', badge: 'Won', color: 'bg-amber-500/20 text-amber-300 border border-amber-500/40' },
  { id: 'REJECTED', label: 'Rejected / Lost', badge: 'Lost', color: 'bg-rose-950/60 text-rose-300 border border-rose-800/50' },
  { id: 'WITHDRAWN', label: 'Withdrawn', badge: 'Withdrawn', color: 'bg-slate-800 text-slate-400' }
];

export const TrackedBidsPage: React.FC<TrackedBidsPageProps> = ({
  onSelectTender,
  onNavigate,
  onOpenWorkflow
}) => {
  const [workspaces, setWorkspaces] = useState<BidWorkspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStage, setSelectedStage] = useState('ALL');
  const [activeWorkspace, setActiveWorkspace] = useState<BidWorkspace | null>(null);

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('MEDIUM');

  // Record submission modal
  const [submissionModalOpen, setSubmissionModalOpen] = useState(false);
  const [submissionRef, setSubmissionRef] = useState('');
  const [submissionPortal, setSubmissionPortal] = useState('Government e-Marketplace (GeM)');
  const [submissionAmount, setSubmissionAmount] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [submittingRecord, setSubmittingRecord] = useState(false);

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const loadWorkspaces = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getWorkspaces();
      setWorkspaces(data);
      if (activeWorkspace) {
        const refreshed = data.find((w: any) => w.id === activeWorkspace.id);
        if (refreshed) setActiveWorkspace(refreshed);
      }
    } catch (err) {
      console.error('Failed to load workspaces:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStage = async (workspaceId: string, stage: string) => {
    try {
      await ApiService.updateWorkspaceStage(workspaceId, stage);
      await loadWorkspaces();
    } catch (err) {
      console.error('Failed to update stage:', err);
    }
  };

  const handleToggleChecklist = async (workspaceId: string, chkId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'VERIFIED' ? 'PENDING' : 'VERIFIED';
    try {
      await ApiService.updateWorkspaceChecklist(workspaceId, chkId, { status: nextStatus });
      await loadWorkspaces();
    } catch (err) {
      console.error('Checklist update error:', err);
    }
  };

  const handleToggleTask = async (workspaceId: string, taskId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'DONE' ? 'TODO' : 'DONE';
    try {
      await ApiService.updateWorkspaceTask(workspaceId, taskId, { status: nextStatus });
      await loadWorkspaces();
    } catch (err) {
      console.error('Task update error:', err);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace || !newTaskTitle.trim()) return;
    try {
      await ApiService.createWorkspaceTask(activeWorkspace.id, {
        title: newTaskTitle.trim(),
        assigned_to: newTaskAssignee.trim() || 'Bid Team',
        priority: newTaskPriority
      });
      setNewTaskTitle('');
      setNewTaskAssignee('');
      await loadWorkspaces();
    } catch (err) {
      console.error('Task create error:', err);
    }
  };

  const handleOpenSubmissionModal = (ws: BidWorkspace) => {
    setActiveWorkspace(ws);
    setSubmissionRef(`GEM-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`);
    setSubmissionAmount(ws.tender ? (ws.tender.budget / 10000000).toFixed(2) : '10.00');
    setSubmissionPortal(ws.tender?.source || 'Government e-Marketplace (GeM)');
    setSubmissionModalOpen(true);
  };

  const handleSubmitRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace || !submissionRef) return;
    try {
      setSubmittingRecord(true);
      await ApiService.recordWorkspaceSubmission(activeWorkspace.id, {
        submission_reference: submissionRef,
        submission_portal: submissionPortal,
        bid_value: parseFloat(submissionAmount) * 10000000,
        notes: submissionNotes,
        submitted_at: new Date().toISOString()
      });
      setSubmissionModalOpen(false);
      confetti({ particleCount: 90, spread: 65, origin: { y: 0.5 } });
      await loadWorkspaces();
    } catch (err) {
      console.error('Record submission error:', err);
    } finally {
      setSubmittingRecord(false);
    }
  };

  const filtered = selectedStage === 'ALL'
    ? workspaces
    : workspaces.filter(w => w.stage === selectedStage);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-teal-500/10 border border-teal-500/30 px-3 py-0.5 text-xs font-bold text-teal-600 dark:text-teal-300 mb-2">
            <FolderKanban className="h-3.5 w-3.5 text-teal-500" />
            <span>11-Step Bid Preparation Workspace & Pipeline</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Bid Workspaces & Opportunity Pipeline
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track preparation from initial discovery to document preparation, internal review, and portal submission confirmation.
          </p>
        </div>

        <button
          onClick={() => onNavigate('find-tenders')}
          className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-teal-700/20 transition-all"
        >
          <span>Discover New Tenders</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Stage Filter Chips */}
      <div className="flex flex-wrap gap-2">
        {STAGES.map((stage) => {
          const isSelected = selectedStage === stage.id;
          const count = stage.id === 'ALL' ? workspaces.length : workspaces.filter(w => w.stage === stage.id).length;
          return (
            <button
              key={stage.id}
              onClick={() => setSelectedStage(stage.id)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                isSelected
                  ? 'bg-teal-700 border-teal-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <span>{stage.label}</span>
              <span className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent mb-3" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Loading your bid workspaces...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center space-y-3 shadow-sm">
          <Bookmark className="h-10 w-10 text-slate-400 dark:text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Tenders in this Preparation Stage</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Discover active tenders from GeM or CPPP, save them to your workspace, and track checklist tasks here.
          </p>
          <button
            onClick={() => onNavigate('find-tenders')}
            className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-teal-700 px-4 py-2 text-xs font-bold text-white hover:bg-teal-800"
          >
            Find Tenders Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((ws) => {
            const tender = ws.tender;
            if (!tender) return null;

            const stageInfo = STAGES.find(s => s.id === ws.stage) || STAGES[1];
            const isSelected = activeWorkspace?.id === ws.id;

            return (
              <div
                key={ws.id}
                className={`rounded-2xl border transition-all p-5 shadow-sm ${
                  isSelected
                    ? 'border-teal-500/80 bg-teal-500/5 ring-1 ring-teal-500/30'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  
                  {/* Left Info */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${stageInfo.color}`}>
                        {stageInfo.badge}
                      </span>
                      <span className="text-xs font-mono text-slate-500">{tender.reference_no}</span>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span className="text-xs text-slate-500">{tender.organization_name}</span>
                    </div>

                    <h3
                      onClick={() => setActiveWorkspace(isSelected ? null : ws)}
                      className="text-base font-bold text-slate-900 dark:text-white hover:text-teal-600 dark:hover:text-teal-400 cursor-pointer transition-colors"
                    >
                      {tender.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
                      <span>Value: <strong className="text-slate-900 dark:text-white font-bold">{tender.budget_formatted}</strong></span>
                      <span>Turnover: <strong>{tender.min_turnover_formatted}</strong></span>
                      <span>Deadline: <strong className="text-amber-600 dark:text-amber-400">{tender.deadline_formatted}</strong></span>
                      <span>Readiness: <strong className="text-teal-600 dark:text-teal-400">{ws.readiness_score || 45}%</strong></span>
                    </div>

                    {ws.submission_reference && (
                      <div className="inline-flex items-center gap-2 mt-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-mono">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        <span>Submitted on {ws.submission_portal || 'Portal'}: <strong>{ws.submission_reference}</strong></span>
                      </div>
                    )}
                  </div>

                  {/* Actions & Stage Dropdown */}
                  <div className="flex flex-wrap items-center gap-2.5 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Preparation Stage</span>
                      <select
                        value={ws.stage}
                        onChange={(e) => handleUpdateStage(ws.id, e.target.value)}
                        className="mt-0.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs font-bold text-teal-700 dark:text-teal-300 focus:outline-none"
                      >
                        <option value="SAVED">Saved</option>
                        <option value="UNDER_REVIEW">Under Review</option>
                        <option value="PREPARING_DOCUMENTS">Preparing Documents</option>
                        <option value="READY_FOR_REVIEW">Ready for Review</option>
                        <option value="READY_FOR_SUBMISSION">Ready for Submission</option>
                        <option value="SUBMITTED">Submitted</option>
                        <option value="AWARDED">Awarded 🏆</option>
                        <option value="REJECTED">Rejected / Lost</option>
                        <option value="WITHDRAWN">Withdrawn</option>
                      </select>
                    </div>

                    <button
                      onClick={() => setActiveWorkspace(isSelected ? null : ws)}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-slate-900 text-white dark:bg-slate-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      <span>{isSelected ? 'Close Workspace' : 'Open Workspace'}</span>
                    </button>

                    {ws.stage !== 'SUBMITTED' ? (
                      <button
                        onClick={() => handleOpenSubmissionModal(ws)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-all"
                        title="Record official submission details after uploading to GeM/CPPP"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>Record Submission</span>
                      </button>
                    ) : (
                      <span className="px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
                        ✓ Submitted
                      </span>
                    )}

                    <button
                      onClick={() => onSelectTender(tender)}
                      className="rounded-xl border border-slate-200 dark:border-slate-800 p-2 text-slate-400 hover:text-teal-600 dark:hover:text-teal-400"
                      title="View Full Tender Details"
                    >
                      <ArrowUpRight className="h-4 w-4" />
                    </button>
                  </div>

                </div>

                {/* Expanded 11-Step Bid Workspace Drawer */}
                {isSelected && (
                  <div className="mt-5 pt-5 border-t border-slate-200 dark:border-slate-800 space-y-6 animate-in fade-in">
                    
                    {/* Workspace Top Metrics & Workflow Stepper */}
                    <div className="rounded-xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                          <CheckCircle2 className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                          <span>Bid Readiness Progress: {ws.readiness_score || 50}%</span>
                        </span>
                        
                        {onOpenWorkflow && (
                          <button
                            onClick={() => onOpenWorkflow(tender)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 dark:text-teal-400 hover:underline"
                          >
                            <span>Launch Deep AI Document Verification Modal</span>
                            <ArrowUpRight className="h-3 w-3" />
                          </button>
                        )}
                      </div>

                      <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-teal-600 to-teal-400 h-2 rounded-full transition-all"
                          style={{ width: `${Math.max(10, ws.readiness_score || 50)}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Document Checklist Section */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <FileCheck2 className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                            <span>Document Checklist ({(ws.checklists || []).filter(c => c.status === 'VERIFIED').length}/{(ws.checklists || []).length})</span>
                          </h4>
                        </div>

                        <div className="space-y-2">
                          {(ws.checklists || []).map((chk) => {
                            const isDone = chk.status === 'VERIFIED';
                            return (
                              <div
                                key={chk.id}
                                onClick={() => handleToggleChecklist(ws.id, chk.id, chk.status)}
                                className={`rounded-xl border p-3 cursor-pointer transition-all flex items-center justify-between text-xs ${
                                  isDone
                                    ? 'border-emerald-500/40 bg-emerald-500/5 text-slate-800 dark:text-slate-200'
                                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400'
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  {isDone ? (
                                    <CheckSquare className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                                  ) : (
                                    <Square className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                  )}
                                  <span className={isDone ? 'font-semibold line-through text-slate-500' : 'font-medium'}>
                                    {chk.document_title}
                                  </span>
                                </div>
                                <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                                  isDone ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                }`}>
                                  {isDone ? 'Verified' : 'Pending'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Preparation Tasks Section */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <Clock className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                            <span>Actionable Tasks ({(ws.tasks || []).filter(t => t.status === 'DONE').length}/{(ws.tasks || []).length})</span>
                          </h4>
                        </div>

                        <div className="space-y-2">
                          {(ws.tasks || []).map((task) => {
                            const isDone = task.status === 'DONE';
                            return (
                              <div
                                key={task.id}
                                onClick={() => handleToggleTask(ws.id, task.id, task.status)}
                                className={`rounded-xl border p-3 cursor-pointer transition-all flex items-center justify-between text-xs ${
                                  isDone
                                    ? 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-500'
                                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200'
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  {isDone ? (
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                                  ) : (
                                    <Clock className="h-4 w-4 text-amber-500 flex-shrink-0" />
                                  )}
                                  <span className={isDone ? 'line-through' : 'font-medium'}>
                                    {task.title}
                                  </span>
                                </div>
                                <span className="text-[10px] text-slate-400">{task.assigned_to || 'Assigned'}</span>
                              </div>
                            );
                          })}

                          {/* Quick Add Task Form */}
                          <form onSubmit={handleCreateTask} className="pt-2 flex gap-2">
                            <input
                              type="text"
                              value={newTaskTitle}
                              onChange={(e) => setNewTaskTitle(e.target.value)}
                              placeholder="Add preparation task..."
                              className="flex-1 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                            />
                            <button
                              type="submit"
                              className="rounded-xl bg-teal-700 hover:bg-teal-600 px-3 py-1.5 text-xs font-bold text-white transition-colors"
                            >
                              Add
                            </button>
                          </form>
                        </div>
                      </div>

                    </div>

                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* Record Submission Modal */}
      {submissionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Send className="h-5 w-5 text-emerald-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Record Portal Submission Details</h3>
              </div>
              <button 
                onClick={() => setSubmissionModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Record acknowledgement details after completing your authorized submission on the government portal. BidCognix persists this reference for compliance audit.
            </p>

            <form onSubmit={handleSubmitRecord} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Procurement Portal Name</label>
                <input
                  type="text"
                  value={submissionPortal}
                  onChange={(e) => setSubmissionPortal(e.target.value)}
                  className="mt-1 w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-teal-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Portal Acknowledgment / Bid Reference ID</label>
                <input
                  type="text"
                  value={submissionRef}
                  onChange={(e) => setSubmissionRef(e.target.value)}
                  placeholder="e.g. GEM/2026/B/8941203/SUB/01"
                  className="mt-1 w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:border-teal-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Submitted Bid Value (₹ Cr)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={submissionAmount}
                    onChange={(e) => setSubmissionAmount(e.target.value)}
                    className="mt-1 w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-teal-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Submission Date</label>
                  <input
                    type="date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="mt-1 w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-teal-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Internal Audit & Verification Notes</label>
                <textarea
                  rows={2}
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  placeholder="e.g. Technical packet and financial bid submitted. DSC token verified."
                  className="mt-1 w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setSubmissionModalOpen(false)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRecord}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white transition-colors"
                >
                  {submittingRecord ? 'Saving...' : 'Confirm Submission Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
