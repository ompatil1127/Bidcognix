import React, { useState, useEffect } from 'react';
import { 
  Tender, 
  Company, 
  DocumentationWorkflow, 
  ValidationReport,
  RequiredDocItem,
  VerificationItem 
} from '../../types';
import { ApiService } from '../../services/api';
import confetti from 'canvas-confetti';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileText,
  Upload,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  ShieldCheck,
  FileCheck,
  RefreshCw,
  Trash2,
  Download,
  AlertCircle,
  Building2,
  FileWarning,
  Check,
  Zap,
  Layers,
  Lock,
  Edit2,
  Save,
  Plus
} from 'lucide-react';

interface MultiStageDocumentationModalProps {
  tender: Tender;
  company: Company | null;
  onClose: () => void;
  onBidSubmitted?: () => void;
}

const STAGES = [
  { id: 1, title: 'Tender Docs', subtitle: 'Upload Notice & RFP', icon: Upload },
  { id: 2, title: 'AI Analysis', subtitle: 'Extract Criteria & Scope', icon: Sparkles },
  { id: 3, title: 'Verification', subtitle: 'Review & Verify Criteria', icon: FileCheck },
  { id: 4, title: 'Company Docs', subtitle: 'Attach Required Proofs', icon: Building2 },
  { id: 5, title: 'Validation', subtitle: 'AI Compliance Match', icon: ShieldCheck },
  { id: 6, title: 'Readiness', subtitle: 'Final Checklist & Sign-off', icon: CheckCircle2 }
];

export const MultiStageDocumentationModal: React.FC<MultiStageDocumentationModalProps> = ({
  tender,
  company,
  onClose,
  onBidSubmitted
}) => {
  const [activeStage, setActiveStage] = useState<number>(1);
  const [workflow, setWorkflow] = useState<DocumentationWorkflow | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Stage 1 Tender upload state
  const [tenderDragActive, setTenderDragActive] = useState<boolean>(false);

  // Stage 2 analysis prompt/custom text
  const [customAnalysisText, setCustomAnalysisText] = useState<string>('');

  // Stage 3 verification editing state
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [tempItemValue, setTempItemValue] = useState<string>('');
  const [userNotes, setUserNotes] = useState<string>('');

  // Stage 4 upload target
  const [targetReqDoc, setTargetReqDoc] = useState<RequiredDocItem | null>(null);
  const [companyDragActive, setCompanyDragActive] = useState<boolean>(false);

  // Final submission state
  const [finalSubmitted, setFinalSubmitted] = useState<boolean>(false);

  useEffect(() => {
    loadWorkflow();
  }, [tender.id]);

  const loadWorkflow = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const data = await ApiService.getWorkflow(tender.id);
      setWorkflow(data);
      if (data.current_stage) {
        setActiveStage(Math.min(6, data.current_stage));
      }
      if (data.stage_3_verification?.user_notes) {
        setUserNotes(data.stage_3_verification.user_notes);
      }
      if (data.stage_6_readiness?.finalized) {
        setFinalSubmitted(true);
      }
    } catch (err: any) {
      console.error('Failed to load workflow:', err);
      setErrorMessage(err.message || 'Failed to initialize documentation workflow');
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // STAGE 1: TENDER DOCUMENT COLLECTION HANDLERS
  // -------------------------------------------------------------
  const handleTenderFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    try {
      setActionLoading(true);
      setErrorMessage(null);
      const file = files[0];
      const res = await ApiService.uploadTenderDoc(tender.id, file);
      setWorkflow(res.workflow);
      setSuccessMessage(`Document "${file.name}" uploaded successfully!`);
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to upload tender document');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTenderDoc = async (docId: string) => {
    try {
      setActionLoading(true);
      const updated = await ApiService.deleteTenderDoc(tender.id, docId);
      setWorkflow(updated);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to delete document');
    } finally {
      setActionLoading(false);
    }
  };

  // -------------------------------------------------------------
  // STAGE 2: DOCUMENT ANALYSIS HANDLERS
  // -------------------------------------------------------------
  const handleRunAnalysis = async () => {
    try {
      setActionLoading(true);
      setErrorMessage(null);
      const updated = await ApiService.runWorkflowAnalysis(tender.id, customAnalysisText || undefined);
      setWorkflow(updated);
      setSuccessMessage('AI analysis completed! Extracted financial thresholds, scope, and documents.');
      setTimeout(() => setSuccessMessage(null), 3500);
      setActiveStage(3);
    } catch (err: any) {
      setErrorMessage(err.message || 'Analysis failed');
    } finally {
      setActionLoading(false);
    }
  };

  // -------------------------------------------------------------
  // STAGE 3: REQUIREMENT VERIFICATION HANDLERS
  // -------------------------------------------------------------
  const handleToggleVerificationStatus = (itemId: string) => {
    if (!workflow?.stage_3_verification?.items) return;
    const nextStatus: Record<string, 'verified' | 'pending' | 'requires_attention'> = {
      pending: 'verified',
      verified: 'requires_attention',
      requires_attention: 'pending'
    };

    const updatedItems = workflow.stage_3_verification.items.map(item => {
      if (item.id === itemId) {
        return { ...item, status: nextStatus[item.status] || 'verified' };
      }
      return item;
    });

    setWorkflow({
      ...workflow,
      stage_3_verification: {
        ...workflow.stage_3_verification,
        items: updatedItems
      }
    });
  };

  const handleSaveItemEdit = (itemId: string) => {
    if (!workflow?.stage_3_verification?.items) return;
    const updatedItems = workflow.stage_3_verification.items.map(item => {
      if (item.id === itemId) {
        return { ...item, value: tempItemValue || item.value };
      }
      return item;
    });

    setWorkflow({
      ...workflow,
      stage_3_verification: {
        ...workflow.stage_3_verification,
        items: updatedItems
      }
    });
    setEditingItemId(null);
  };

  const handleSaveAllVerifications = async () => {
    if (!workflow?.stage_3_verification?.items) return;
    try {
      setActionLoading(true);
      setErrorMessage(null);
      const updated = await ApiService.saveWorkflowVerification(tender.id, {
        items: workflow.stage_3_verification.items,
        user_notes: userNotes,
        modified_documents: workflow.stage_2_analysis?.required_documents
      });
      setWorkflow(updated);
      setSuccessMessage('Verified requirements saved! Proceeding to company document collection.');
      setTimeout(() => setSuccessMessage(null), 3500);
      setActiveStage(4);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save verification');
    } finally {
      setActionLoading(false);
    }
  };

  // -------------------------------------------------------------
  // STAGE 4: COMPANY DOCUMENT COLLECTION HANDLERS
  // -------------------------------------------------------------
  const handleCompanyFileUpload = async (files: FileList | null, reqDoc?: RequiredDocItem) => {
    if (!files || files.length === 0) return;
    try {
      setActionLoading(true);
      setErrorMessage(null);
      const file = files[0];
      const target = reqDoc || targetReqDoc;
      const res = await ApiService.uploadCompanyDoc(
        tender.id, 
        file, 
        target?.id, 
        target?.category || 'General'
      );
      setWorkflow(res.workflow);
      setTargetReqDoc(null);
      setSuccessMessage(`Attached "${file.name}" to requirement!`);
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Company document upload failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleQuickFillVault = async () => {
    try {
      setActionLoading(true);
      setErrorMessage(null);
      const updated = await ApiService.quickFillCompanyDocs(tender.id);
      setWorkflow(updated);
      setSuccessMessage('Auto-attached verified credentials from company document vault!');
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.5 } });
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to auto-fill documents');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCompanyDoc = async (docId: string) => {
    try {
      setActionLoading(true);
      const updated = await ApiService.deleteCompanyDoc(tender.id, docId);
      setWorkflow(updated);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to remove document');
    } finally {
      setActionLoading(false);
    }
  };

  // -------------------------------------------------------------
  // STAGE 5: DOCUMENT VALIDATION HANDLERS
  // -------------------------------------------------------------
  const handleRunValidation = async () => {
    try {
      setActionLoading(true);
      setErrorMessage(null);
      const res = await ApiService.runWorkflowValidation(tender.id);
      setWorkflow(res.workflow);
      setSuccessMessage(`Compliance validation completed! Overall readiness score: ${res.report.readiness_score}%`);
      setTimeout(() => setSuccessMessage(null), 3500);
      setActiveStage(5);
    } catch (err: any) {
      setErrorMessage(err.message || 'Validation failed');
    } finally {
      setActionLoading(false);
    }
  };

  // -------------------------------------------------------------
  // STAGE 6: FINAL READINESS & SUBMISSION HANDLERS
  // -------------------------------------------------------------
  const handleFinalizeSubmission = async () => {
    try {
      setActionLoading(true);
      setErrorMessage(null);
      const res = await ApiService.finalizeWorkflow(tender.id);
      setWorkflow(res.workflow);
      setFinalSubmitted(true);
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.5 } });
      if (onBidSubmitted) onBidSubmitted();
    } catch (err: any) {
      setErrorMessage(err.message || 'Finalization failed');
    } finally {
      setActionLoading(false);
    }
  };

  // Progress percentage calculation
  const progressPercent = Math.round(((activeStage - 1) / (STAGES.length - 1)) * 100);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0f172a]/75 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
          <RefreshCw className="w-10 h-10 text-[#006970] animate-spin mx-auto" />
          <h3 className="font-bold text-slate-800 text-lg">Initializing Documentation Workflow</h3>
          <p className="text-xs text-slate-500">Loading tender criteria, uploaded documents and compliance state...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#0f172a]/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-[#f8fafc] w-full max-w-6xl max-h-[94vh] overflow-y-auto rounded-3xl border border-slate-200 shadow-2xl flex flex-col relative text-[#151d1e] font-sans antialiased">
        
        {/* ========================================================================= */}
        {/* HEADER & STAGE PROGRESS BAR */}
        {/* ========================================================================= */}
        <div className="bg-white px-6 py-4 border-b border-slate-200 sticky top-0 z-30 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#006970]/10 text-[#006970] border border-[#006970]/20 flex items-center gap-1">
                  <Layers className="w-3 h-3" />
                  MULTI-STAGE DOCUMENTATION WORKFLOW
                </span>
                <span className="text-slate-400 text-xs">•</span>
                <span className="text-xs font-mono font-semibold text-slate-600">Ref #{tender.reference_no}</span>
              </div>
              <h2 className="text-lg md:text-xl font-extrabold text-slate-900 mt-1 line-clamp-1">
                {tender.title}
              </h2>
              <p className="text-xs text-slate-500">
                Authority: <strong className="text-slate-700">{tender.organization_name}</strong> • Budget: <strong className="text-[#006970]">{tender.budget_formatted}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <div className="text-right hidden sm:block">
                <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">Documentation Readiness</span>
                <span className={`text-xs font-mono font-bold ${
                  (workflow?.stage_6_readiness?.readiness_score || 0) >= 80 ? 'text-emerald-600' : 'text-[#006970]'
                }`}>
                  {workflow?.stage_6_readiness?.readiness_score || 0}% Complete
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
                title="Close Workflow"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Stepper Timeline */}
          <div className="pt-3">
            <div className="grid grid-cols-6 gap-1 md:gap-2">
              {STAGES.map((s) => {
                const IconComponent = s.icon;
                const isCurrent = activeStage === s.id;
                const isCompleted = (workflow?.current_stage || 1) >= s.id;
                const canNavigate = isCompleted || s.id <= activeStage;

                return (
                  <button
                    key={s.id}
                    onClick={() => canNavigate && setActiveStage(s.id)}
                    disabled={!canNavigate}
                    className={`flex flex-col items-center text-center p-2 rounded-xl transition-all relative group ${
                      isCurrent
                        ? 'bg-[#006970]/10 border-2 border-[#006970] text-[#006970] shadow-sm'
                        : isCompleted
                        ? 'bg-emerald-50/70 border border-emerald-200 text-emerald-800 hover:bg-emerald-100/70'
                        : 'bg-slate-100/60 border border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold font-mono ${
                        isCurrent
                          ? 'bg-[#006970] text-white'
                          : isCompleted
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-300 text-slate-600'
                      }`}>
                        {isCompleted && !isCurrent ? '✓' : s.id}
                      </div>
                      <IconComponent className="w-3.5 h-3.5 hidden sm:inline" />
                    </div>
                    <span className="text-[11px] font-bold truncate max-w-full leading-tight">
                      {s.title}
                    </span>
                    <span className="text-[9px] text-slate-500 hidden md:block truncate max-w-full mt-0.5">
                      {s.subtitle}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Progress bar line */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-[#006970] to-[#00a3ad] h-full transition-all duration-500 rounded-full"
                style={{ width: `${Math.max(16, progressPercent)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Global Notifications */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage(null)} className="text-rose-500 hover:text-rose-800">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {successMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage(null)} className="text-emerald-500 hover:text-emerald-800">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* WORKFLOW STAGE CONTENT VIEWPORTS */}
        {/* ========================================================================= */}
        <div className="p-6 flex-1 space-y-6">

          {/* ------------------------------------------------------------- */}
          {/* STAGE 1: TENDER DOCUMENT COLLECTION */}
          {/* ------------------------------------------------------------- */}
          {activeStage === 1 && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Upload className="w-4 h-4 text-[#006970]" />
                    Stage 1 – Tender Document Collection
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Upload official procurement notices, detailed RFP specifications, bill of quantities (BoQ), and addendums.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-slate-100 text-slate-700">
                    {workflow?.stage_1_tender_docs?.length || 0} Documents Uploaded
                  </span>
                </div>
              </div>

              {/* Upload Dropzone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setTenderDragActive(true); }}
                onDragLeave={() => setTenderDragActive(false)}
                onDrop={(e) => { e.preventDefault(); setTenderDragActive(false); handleTenderFileUpload(e.dataTransfer.files); }}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all bg-white ${
                  tenderDragActive
                    ? 'border-[#006970] bg-[#006970]/5 scale-[0.99]'
                    : 'border-slate-300 hover:border-[#006970]/50'
                }`}
              >
                <div className="max-w-md mx-auto space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#006970]/10 flex items-center justify-center mx-auto text-[#006970]">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">
                      Drag & Drop Tender Notice, RFP, or Technical Schedules
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Supports PDF, DOCX, TXT, JSON (up to 25 MB per document)
                    </p>
                  </div>
                  <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#006970] text-white text-xs font-bold hover:bg-[#004f54] transition-colors cursor-pointer shadow-sm">
                    <FileText className="w-4 h-4" />
                    <span>Browse & Select Tender Document</span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => handleTenderFileUpload(e.target.files)}
                      accept=".pdf,.docx,.txt,.json,.doc"
                    />
                  </label>
                </div>
              </div>

              {/* Uploaded Documents List */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-sm">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 font-mono">
                  Document Repository ({workflow?.stage_1_tender_docs?.length || 0})
                </h4>

                {(!workflow?.stage_1_tender_docs || workflow.stage_1_tender_docs.length === 0) ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    No documents uploaded yet. Upload an RFP or proceed with the default tender specification.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {workflow.stage_1_tender_docs.map((doc) => (
                      <div key={doc.id} className="py-3 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 text-[#006970] flex items-center justify-center flex-shrink-0 font-mono text-xs font-bold">
                            PDF
                          </div>
                          <div>
                            <span className="font-bold text-xs text-slate-800 block truncate max-w-sm sm:max-w-md">
                              {doc.original_name}
                            </span>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                              <span>{(doc.size / (1024 * 1024)).toFixed(2)} MB</span>
                              <span>•</span>
                              <span>Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}</span>
                              <span>•</span>
                              <span className="text-emerald-600 font-bold">✓ Stored & Ready</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-[#006970] hover:bg-slate-50 transition-colors"
                            title="Preview / Download"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                          <button
                            onClick={() => handleDeleteTenderDoc(doc.id)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Remove document"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Navigation Footer */}
              <div className="flex justify-end pt-3 border-t border-slate-200">
                <button
                  onClick={() => setActiveStage(2)}
                  className="bg-[#006970] text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-[#004f54] transition-colors flex items-center gap-2 shadow-sm"
                >
                  <span>Proceed to Document Analysis</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* STAGE 2: DOCUMENT ANALYSIS */}
          {/* ------------------------------------------------------------- */}
          {activeStage === 2 && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    Stage 2 – Document Analysis & Information Extraction
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Harness Machine Learning and NLP heuristics to extract budgets, eligibility criteria, required certifications, and submission deadlines.
                  </p>
                </div>
                <button
                  onClick={handleRunAnalysis}
                  disabled={actionLoading}
                  className="bg-[#006970] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#004f54] transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${actionLoading ? 'animate-spin' : ''}`} />
                  <span>{actionLoading ? 'Analyzing...' : 'Re-Run AI Document Extraction'}</span>
                </button>
              </div>

              {/* Extracted Parameters Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1 shadow-sm">
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Predicted Category</span>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-sm">{workflow?.stage_2_analysis?.category}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">
                      {workflow?.stage_2_analysis?.ai_confidence}% Confidence
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 block">Classified via TF-IDF + Multinomial Naive Bayes</span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1 shadow-sm">
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Estimated Ceiling Budget</span>
                  <div className="font-extrabold text-[#006970] text-base">{workflow?.stage_2_analysis?.budget_formatted}</div>
                  <span className="text-[11px] text-slate-500 block">Contract ceiling value identified</span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1 shadow-sm">
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Min Annual Turnover Req</span>
                  <div className="font-extrabold text-slate-800 text-base">{workflow?.stage_2_analysis?.min_turnover_formatted}</div>
                  <span className="text-[11px] text-slate-500 block">Financial solvency baseline</span>
                </div>
              </div>

              {/* Eligibility & Technical Specifications */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 shadow-sm">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#006970]" />
                    Mandatory Certifications Required
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {(workflow?.stage_2_analysis?.required_certifications || []).map((c, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 text-teal-900 text-xs font-semibold">
                        ✓ {c}
                      </span>
                    ))}
                  </div>
                  <div className="pt-2 text-xs text-slate-500">
                    Minimum Experience: <strong className="text-slate-800">{workflow?.stage_2_analysis?.min_experience_years} Years</strong>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 shadow-sm">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-[#006970]" />
                    Technical Scope & Deliverables
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {(workflow?.stage_2_analysis?.technical_requirements || []).map((t, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 text-xs font-medium">
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="pt-2 text-xs text-slate-500">
                    Submission Cutoff: <strong className="text-emerald-700">{tender.deadline_formatted || workflow?.stage_2_analysis?.deadline}</strong>
                  </div>
                </div>
              </div>

              {/* Identified Required Documents */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-sm">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                  Identified Submission Documents ({workflow?.stage_2_analysis?.required_documents?.length || 0})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                  {(workflow?.stage_2_analysis?.required_documents || []).map((doc) => (
                    <div key={doc.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <span className="font-semibold text-slate-800 truncate pr-2">{doc.title}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-bold bg-[#006970]/10 text-[#006970]">
                        {doc.category}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <button
                  onClick={() => setActiveStage(1)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to Tender Docs</span>
                </button>
                <button
                  onClick={() => setActiveStage(3)}
                  className="bg-[#006970] text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-[#004f54] transition-colors flex items-center gap-2 shadow-sm"
                >
                  <span>Verify Requirements in Stage 3</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* STAGE 3: REQUIREMENT VERIFICATION */}
          {/* ------------------------------------------------------------- */}
          {activeStage === 3 && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    Stage 3 – Requirement Verification & Review
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Review and verify AI-extracted parameters. You can edit values, adjust requirements, and sign off before attaching company records.
                  </p>
                </div>
                <button
                  onClick={handleSaveAllVerifications}
                  disabled={actionLoading}
                  className="bg-emerald-700 text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-emerald-800 transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save & Sign Off Verifications</span>
                </button>
              </div>

              {/* Interactive Criteria Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs font-bold text-slate-600 uppercase font-mono">
                  <span>Extracted Requirement Parameter</span>
                  <span>Verification Status (Click to Toggle)</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {(workflow?.stage_3_verification?.items || []).map((item) => (
                    <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">{item.label}</span>
                          <span className="text-[10px] font-mono text-slate-400">({item.key})</span>
                        </div>

                        {editingItemId === item.id ? (
                          <div className="flex items-center gap-2 pt-1">
                            <input
                              type="text"
                              value={tempItemValue}
                              onChange={(e) => setTempItemValue(e.target.value)}
                              className="text-xs p-1.5 border border-[#006970] rounded-lg w-64 focus:outline-none"
                            />
                            <button
                              onClick={() => handleSaveItemEdit(item.id)}
                              className="px-2.5 py-1.5 bg-[#006970] text-white text-xs font-bold rounded-lg"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingItemId(null)}
                              className="px-2.5 py-1.5 bg-slate-200 text-slate-700 text-xs rounded-lg"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-xs font-extrabold text-[#006970]">{item.value}</span>
                            <button
                              onClick={() => { setEditingItemId(item.id); setTempItemValue(item.value); }}
                              className="text-slate-400 hover:text-[#006970] p-1"
                              title="Edit value"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                        <span className="text-[11px] text-slate-500 block">{item.notes}</span>
                      </div>

                      {/* Status Toggle Button */}
                      <div>
                        <button
                          onClick={() => handleToggleVerificationStatus(item.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                            item.status === 'verified'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                              : item.status === 'requires_attention'
                              ? 'bg-rose-100 text-rose-800 border border-rose-300 hover:bg-rose-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200'
                          }`}
                        >
                          {item.status === 'verified' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                          {item.status === 'requires_attention' && <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />}
                          {item.status === 'pending' && <Clock className="w-3.5 h-3.5 text-amber-600" />}
                          <span className="uppercase">{item.status.replace('_', ' ')}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Compliance Officer Sign-off Notes */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2 shadow-sm">
                <label className="block text-xs font-bold text-slate-700 uppercase font-mono">
                  Verification Auditor Notes / Clause Remarks
                </label>
                <textarea
                  rows={2}
                  value={userNotes}
                  onChange={(e) => setUserNotes(e.target.value)}
                  placeholder="Record internal verification notes, tender clause exemptions, or consortium remarks..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#006970]"
                />
              </div>

              {/* Navigation Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <button
                  onClick={() => setActiveStage(2)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to Analysis</span>
                </button>
                <button
                  onClick={handleSaveAllVerifications}
                  className="bg-[#006970] text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-[#004f54] transition-colors flex items-center gap-2 shadow-sm"
                >
                  <span>Save & Continue to Company Docs</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* STAGE 4: COMPANY DOCUMENT COLLECTION */}
          {/* ------------------------------------------------------------- */}
          {activeStage === 4 && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#006970]" />
                    Stage 4 – Company Document Collection
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Attach required statutory, financial, and technical documents for tender submission.
                  </p>
                </div>

                <button
                  onClick={handleQuickFillVault}
                  disabled={actionLoading}
                  className="bg-emerald-50 border border-emerald-300 text-emerald-800 hover:bg-emerald-100 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                  title="Auto-attaches verified company credentials"
                >
                  <Zap className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Auto-Attach from Company Vault</span>
                </button>
              </div>

              {/* Document Mapping Checklist */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                    Mandatory Submission Documents Checklist
                  </h4>
                  <span className="text-xs font-mono font-bold text-[#006970]">
                    {workflow?.stage_4_company_docs?.length || 0} of {workflow?.stage_2_analysis?.required_documents?.length || 0} Attached
                  </span>
                </div>

                <div className="space-y-3">
                  {(workflow?.stage_2_analysis?.required_documents || []).map((reqDoc) => {
                    const attached = workflow?.stage_4_company_docs?.find(d => 
                      d.req_doc_id === reqDoc.id || 
                      (d.category && d.category.toLowerCase() === reqDoc.category.toLowerCase()) ||
                      (d.original_name && reqDoc.title.toLowerCase().split(' ').some(w => w.length > 3 && d.original_name.toLowerCase().includes(w)))
                    );

                    return (
                      <div 
                        key={reqDoc.id} 
                        className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                          attached ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-800">{reqDoc.title}</span>
                            <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-semibold">
                              {reqDoc.category}
                            </span>
                            {reqDoc.mandatory && (
                              <span className="text-[9px] font-mono px-1 rounded bg-rose-100 text-rose-700 font-bold">
                                MANDATORY
                              </span>
                            )}
                          </div>

                          {attached ? (
                            <div className="flex items-center gap-2 text-[11px] text-emerald-700 font-mono">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Attached: <strong className="underline">{attached.original_name}</strong></span>
                              <span className="text-slate-400">({(attached.size / 1024).toFixed(0)} KB)</span>
                            </div>
                          ) : (
                            <div className="text-[11px] text-rose-600 font-medium flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>Document missing – required for tender qualification.</span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {attached ? (
                            <button
                              onClick={() => handleDeleteCompanyDoc(attached.id)}
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-white text-xs font-semibold flex items-center gap-1"
                              title="Detach file"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove</span>
                            </button>
                          ) : (
                            <label className="px-3 py-1.5 bg-[#006970] hover:bg-[#004f54] text-white rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 shadow-sm">
                              <Upload className="w-3 h-3" />
                              <span>Upload Document</span>
                              <input
                                type="file"
                                className="hidden"
                                onChange={(e) => handleCompanyFileUpload(e.target.files, reqDoc)}
                                accept=".pdf,.docx,.txt,.jpg,.png"
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Navigation Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <button
                  onClick={() => setActiveStage(3)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to Verification</span>
                </button>
                <button
                  onClick={handleRunValidation}
                  className="bg-[#006970] text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-[#004f54] transition-colors flex items-center gap-2 shadow-sm"
                >
                  <span>Run Document Validation</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* STAGE 5: DOCUMENT VALIDATION */}
          {/* ------------------------------------------------------------- */}
          {activeStage === 5 && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Stage 5 – Document Validation & Compliance Verification
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Automated criteria audit comparing company uploaded documents against required procurement clauses.
                  </p>
                </div>
                <button
                  onClick={handleRunValidation}
                  disabled={actionLoading}
                  className="bg-[#006970] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#004f54] transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${actionLoading ? 'animate-spin' : ''}`} />
                  <span>Re-Evaluate Compliance</span>
                </button>
              </div>

              {/* Status Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1 shadow-sm">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Readiness Score</span>
                  <div className={`text-xl font-extrabold ${
                    (workflow?.stage_5_validation?.readiness_score || 0) >= 80 ? 'text-emerald-600' : 'text-[#006970]'
                  }`}>
                    {workflow?.stage_5_validation?.readiness_score || 0}%
                  </div>
                  <span className="text-[10px] text-slate-500 block">Overall completeness</span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1 shadow-sm">
                  <span className="text-[10px] font-mono uppercase text-emerald-600 font-bold">Valid & Verified</span>
                  <div className="text-xl font-extrabold text-emerald-600">
                    {workflow?.stage_5_validation?.summary?.valid || 0}
                  </div>
                  <span className="text-[10px] text-slate-500 block">Documents ready</span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1 shadow-sm">
                  <span className="text-[10px] font-mono uppercase text-rose-600 font-bold">Missing Documents</span>
                  <div className="text-xl font-extrabold text-rose-600">
                    {workflow?.stage_5_validation?.summary?.missing || 0}
                  </div>
                  <span className="text-[10px] text-slate-500 block">Mandatory items absent</span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1 shadow-sm">
                  <span className="text-[10px] font-mono uppercase text-amber-600 font-bold">Incomplete / Deficits</span>
                  <div className="text-xl font-extrabold text-amber-600">
                    {(workflow?.stage_5_validation?.summary?.incomplete || 0) + (workflow?.stage_5_validation?.summary?.mismatched || 0)}
                  </div>
                  <span className="text-[10px] text-slate-500 block">Requires attention</span>
                </div>
              </div>

              {/* Validation Items Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase font-mono flex justify-between">
                  <span>Requirement & Uploaded Document</span>
                  <span>Validation Audit Status</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {(workflow?.stage_5_validation?.items || []).map((item, idx) => (
                    <div key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">{item.title}</span>
                          <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                            {item.category}
                          </span>
                        </div>

                        {item.uploaded_file ? (
                          <div className="text-xs text-slate-600 font-mono">
                            File: <strong className="text-slate-800">{item.uploaded_file.original_name}</strong>
                          </div>
                        ) : (
                          <div className="text-xs text-rose-500 font-mono italic">
                            No document uploaded
                          </div>
                        )}

                        <p className={`text-xs ${
                          item.status === 'VALID' ? 'text-emerald-700' : (item.status === 'MISSING' ? 'text-rose-700' : 'text-amber-700')
                        }`}>
                          {item.notes}
                        </p>
                      </div>

                      <div>
                        <span className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold uppercase inline-flex items-center gap-1 ${
                          item.status === 'VALID'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : item.status === 'MISSING'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}>
                          {item.status === 'VALID' ? '✓ VALID' : item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <button
                  onClick={() => setActiveStage(4)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to Upload Docs</span>
                </button>
                <button
                  onClick={() => setActiveStage(6)}
                  className="bg-[#006970] text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-[#004f54] transition-colors flex items-center gap-2 shadow-sm"
                >
                  <span>Proceed to Final Readiness</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* STAGE 6: FINAL DOCUMENTATION READINESS */}
          {/* ------------------------------------------------------------- */}
          {activeStage === 6 && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center space-y-3">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto shadow-inner ${
                  workflow?.stage_6_readiness?.can_submit
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {workflow?.stage_6_readiness?.can_submit ? (
                    <CheckCircle2 className="w-8 h-8" />
                  ) : (
                    <AlertTriangle className="w-8 h-8" />
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">
                    {finalSubmitted 
                      ? 'Bid Documentation Finalized & Submitted' 
                      : (workflow?.stage_6_readiness?.can_submit ? 'Documentation Package 100% Ready' : 'Documentation Incomplete – Action Required')}
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                    {workflow?.stage_6_readiness?.can_submit
                      ? 'All mandatory statutory, financial, and technical documents have been verified against procurement clauses.'
                      : 'You cannot submit this bid application because required documents are missing or fail criteria.'}
                  </p>
                </div>

                {workflow?.stage_6_readiness?.audit_ref && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 font-mono text-xs text-slate-700 border border-slate-200">
                    <span>Audit Reference:</span>
                    <strong>{workflow.stage_6_readiness.audit_ref}</strong>
                  </div>
                )}
              </div>

              {/* Pre-Submission Readiness Checklist */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-sm">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                  Final Submission Checklist
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                    <span>1. Official Tender Notice & Scope Parsed</span>
                    <span className="font-bold text-emerald-600 font-mono">✓ PASS</span>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                    <span>2. AI Eligibility & Category Classification</span>
                    <span className="font-bold text-emerald-600 font-mono">✓ PASS</span>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                    <span>3. Financial & Technical Verification Review</span>
                    <span className="font-bold text-emerald-600 font-mono">✓ PASS</span>
                  </div>
                  <div className={`p-3 rounded-xl border flex items-center justify-between ${
                    workflow?.stage_6_readiness?.can_submit
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                      : 'border-rose-200 bg-rose-50 text-rose-900'
                  }`}>
                    <span>4. Mandatory Company Credentials Attached</span>
                    <span className="font-bold font-mono">
                      {workflow?.stage_6_readiness?.can_submit ? '✓ COMPLETE' : '✗ INCOMPLETE'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200">
                <button
                  onClick={() => setActiveStage(5)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Review Validation</span>
                </button>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => alert(`Downloading consolidated submission dossier for tender ${tender.reference_no}...`)}
                    className="px-4 py-2.5 rounded-xl border border-[#006970] text-[#006970] hover:bg-teal-50 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Complete Dossier</span>
                  </button>

                  <button
                    onClick={handleFinalizeSubmission}
                    disabled={!workflow?.stage_6_readiness?.can_submit || actionLoading || finalSubmitted}
                    className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 ${
                      !workflow?.stage_6_readiness?.can_submit || finalSubmitted
                        ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                        : 'bg-emerald-700 text-white hover:bg-emerald-800'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{finalSubmitted ? 'Bid Submitted Successfully' : (actionLoading ? 'Finalizing...' : 'Finalize & Submit Official Bid')}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
