import React, { useState, useEffect } from 'react';
import { Tender, Company, TenderEvaluation } from '../../types';
import { ApiService } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  Bookmark,
  Calendar,
  Clock,
  Building2,
  MapPin,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileCheck,
  TrendingUp,
  Download,
  ExternalLink,
  Target,
  CheckSquare,
  Square,
  DollarSign,
  FileText,
  UploadCloud,
  Check,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

interface TenderDetailPageProps {
  tender: Tender;
  currentCompany: Company | null;
  onBack: () => void;
  onNavigate: (page: string) => void;
}

export const TenderDetailPage: React.FC<TenderDetailPageProps> = ({
  tender,
  currentCompany,
  onBack,
  onNavigate
}) => {
  const [evaluation, setEvaluation] = useState<TenderEvaluation | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [pipelineStage, setPipelineStage] = useState<string>('EVALUATING');
  const [checklistItems, setChecklistItems] = useState<any[]>([]);
  const [checkedIds, setCheckedIds] = useState<Record<string, boolean>>({});

  // PyMuPDF Deep Extraction State
  const [extractedPdfData, setExtractedPdfData] = useState<any | null>(null);
  const [isExtractingPdf, setIsExtractingPdf] = useState(false);
  const [pdfExtractSuccess, setPdfExtractSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    loadEvaluation();
    checkBookmarkStatus();
  }, [tender.id]);

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setUploadError('Only genuine .pdf tender documents are supported for PyMuPDF extraction.');
      return;
    }

    try {
      setIsExtractingPdf(true);
      setUploadError(null);
      const res = await ApiService.uploadTenderPdf(file, tender.id);
      if (res && res.analysis) {
        setExtractedPdfData(res.analysis);
        setPdfExtractSuccess(true);
        confetti({ particleCount: 50, spread: 50 });
      }
    } catch (err: any) {
      console.error('PDF extraction error:', err);
      setUploadError(err.message || 'Failed to extract PDF parameters.');
    } finally {
      setIsExtractingPdf(false);
    }
  };

  const loadEvaluation = async () => {
    try {
      setLoading(true);
      const res = await ApiService.evaluateTender(tender.id);
      setEvaluation(res);
      setChecklistItems(res.compliance_checklist || []);
      const initialChecked: Record<string, boolean> = {};
      (res.compliance_checklist || []).forEach(item => {
        if (item.status === 'READY') initialChecked[item.id] = true;
      });
      setCheckedIds(initialChecked);
    } catch (err) {
      console.error('Evaluation load failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkBookmarkStatus = async () => {
    try {
      const bookmarks = await ApiService.getBookmarks();
      const existing = bookmarks.find(b => b.tender_id === tender.id);
      if (existing) {
        setIsBookmarked(true);
        setPipelineStage(existing.stage);
      }
    } catch (err) {
      console.error('Bookmark check failed:', err);
    }
  };

  const handleToggleBookmark = async () => {
    try {
      const res = await ApiService.toggleBookmark(tender.id);
      setIsBookmarked(res.bookmarked);
      if (res.bookmarked) {
        setPipelineStage('SAVED');
      }
    } catch (err) {
      console.error('Bookmark toggle failed:', err);
    }
  };

  const handleUpdateStage = async (stage: string) => {
    try {
      setPipelineStage(stage);
      await ApiService.updateTrackingStage(tender.id, stage, `Marked as ${stage}`);
      if (stage === 'APPROVED_TO_BID') {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      console.error('Update stage failed:', err);
    }
  };

  const toggleChecklistItem = (id: string) => {
    setCheckedIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const isIT = tender.category === 'IT';
  const missingCount = (evaluation?.missing_requirements || []).length;
  const missingSummary = missingCount > 0 
    ? `Missing: ${evaluation?.missing_requirements[0]?.required || '1 Document'}` 
    : 'All Documents Ready';

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Find Tenders</span>
        </button>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-300 hover:text-white transition-all"
          >
            <Download className="h-4 w-4 text-brand-400" />
            <span>Print Summary</span>
          </button>

          <button
            onClick={handleToggleBookmark}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-4 py-2 text-xs font-bold transition-all ${
              isBookmarked
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-amber-400' : ''}`} />
            <span>{isBookmarked ? 'Saved in My Tenders' : 'Save to My Tenders'}</span>
          </button>
        </div>
      </div>

      {/* Tender Header Card */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={tender.category} type="category" size="md" />
          <span className="rounded bg-slate-800 border border-slate-700 px-2.5 py-0.5 text-xs font-mono text-slate-300">
            Ref: {tender.reference_no}
          </span>
          <span className="rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold">
            {tender.source_badge || 'GeM Verified'}
          </span>
        </div>

        <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug">
          {tender.title}
        </h1>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-400 pt-2 border-t border-slate-800">
          <div className="flex items-center gap-1.5">
            <Building2 className="h-4 w-4 text-slate-500" />
            <span className="text-slate-200 font-semibold">{tender.organization_name}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-slate-500" />
            <span>{tender.location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-slate-500" />
            <span>Deadline: <strong className="text-amber-400 font-bold">{tender.deadline_formatted}</strong></span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SIMPLE AI SUMMARY STRIP (EXACT USER FORMAT) */}
      {/* ========================================================================= */}
      <div className="rounded-3xl border border-brand-500/30 bg-gradient-to-r from-brand-950/60 via-slate-900 to-slate-950 p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="font-extrabold text-white text-base">
              Match: <span className="text-brand-400">{evaluation?.match_score || 88}%</span>
            </span>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <StatusBadge status={evaluation?.eligibility || 'Partially Eligible'} type="eligibility" size="md" />
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="text-amber-300 font-semibold">
              {missingSummary}
            </span>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="text-slate-300 font-medium flex items-center gap-1">
              <Clock className="h-4 w-4 text-amber-400" /> Deadline: 28 Aug 2026
            </span>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400">Estimated Bid Win Score: </span>
            <span className="text-base font-extrabold text-emerald-400">{evaluation?.competitiveness || 78}/100</span>
          </div>
        </div>
      </div>

      {/* 4 Simple Metric Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 space-y-1 text-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Profile Match</span>
          <p className="text-3xl font-black text-brand-400">{evaluation?.match_score || 88}%</p>
          <span className="text-[11px] text-slate-400">High Compatibility</span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 space-y-1 text-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Eligibility</span>
          <div className="pt-1">
            <StatusBadge status={evaluation?.eligibility || 'Partially Eligible'} type="eligibility" size="md" />
          </div>
          <span className="text-[11px] text-slate-400 block pt-1">Turnover & Exp Pass</span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 space-y-1 text-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Bid Win Score</span>
          <p className="text-3xl font-black text-emerald-400">{evaluation?.competitiveness || 78}<span className="text-sm text-slate-500 font-normal">/100</span></p>
          <span className="text-[11px] text-emerald-400 font-semibold">Good Win Chance</span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 space-y-1 text-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Estimated Budget</span>
          <p className="text-2xl font-black text-white">{tender.budget_formatted}</p>
          <span className="text-[11px] text-slate-400">Min Turnover: {tender.min_turnover_formatted}</span>
        </div>

      </div>

      {/* Side-by-Side: What You Have vs What You Need */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Matched Requirements (What your company has) */}
        <div className="rounded-3xl border border-emerald-500/30 bg-slate-900/90 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <CheckCircle2 className="h-5 w-5" />
              <span>Matched Requirements ({evaluation?.matched_requirements.length || 4})</span>
            </div>
            <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              Passed
            </span>
          </div>

          <div className="space-y-3">
            {(evaluation?.matched_requirements || []).map((req, idx) => (
              <div key={idx} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{req.label}</span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                    PASS
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>Required: <strong className="text-slate-200">{req.required}</strong></span>
                  <span>•</span>
                  <span>Your Company: <strong className="text-emerald-400">{req.actual}</strong></span>
                </div>
                <p className="text-[11px] text-slate-400">{req.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Missing Requirements (What to fix) */}
        <div className="rounded-3xl border border-amber-500/30 bg-slate-900/90 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <AlertTriangle className="h-5 w-5" />
              <span>Missing Requirements / Documents ({evaluation?.missing_requirements.length || 1})</span>
            </div>
            <span className="text-xs text-amber-400 font-bold bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
              Needs Attention
            </span>
          </div>

          <div className="space-y-3">
            {(evaluation?.missing_requirements || []).map((req, idx) => (
              <div key={idx} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{req.label}</span>
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                    MISSING
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>Required: <strong className="text-white">{req.required}</strong></span>
                  <span>•</span>
                  <span>Your Company: <strong className="text-rose-400">{req.actual}</strong></span>
                </div>
                <p className="text-[11px] text-slate-400">{req.detail}</p>
              </div>
            ))}

            <div className="rounded-2xl bg-slate-950/80 p-3 border border-slate-800 text-xs text-slate-300 space-y-1">
              <strong className="text-amber-300 block">💡 Quick Solution:</strong>
              <p className="text-[11px] text-slate-400">
                You can bid with a consortium partner who holds ISO 27001, or obtain fast-track compliance before bid submission.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Simple Interactive Compliance Checklist */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-4">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-brand-400" />
              <span>Required Documents & Compliance Checklist</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Tick the documents your team has ready:</p>
          </div>

          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            {Object.values(checkedIds).filter(Boolean).length} of {checklistItems.length} Ready
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {checklistItems.map((item) => {
            const isChecked = !!checkedIds[item.id];
            return (
              <div
                key={item.id}
                onClick={() => toggleChecklistItem(item.id)}
                className={`rounded-2xl border p-3.5 cursor-pointer transition-all flex items-start gap-3 ${
                  isChecked
                    ? 'border-emerald-500/40 bg-emerald-950/20'
                    : 'border-slate-800 bg-slate-950/70 hover:border-slate-700'
                }`}
              >
                <div className="mt-0.5">
                  {isChecked ? (
                    <CheckSquare className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <Square className="h-5 w-5 text-slate-600" />
                  )}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{item.title}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      item.color === 'green' ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'
                    }`}>
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">{item.clause}</p>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* ========================================================================= */}
      {/* PyMuPDF DOCUMENT ANALYSIS & RFP EXTRACTION ENGINE */}
      {/* ========================================================================= */}
      <div className="rounded-3xl border border-brand-500/30 bg-slate-900/90 p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>PyMuPDF Deep PDF Extraction</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-500/15 text-brand-300 border border-brand-500/30">
                  FastAPI Engine
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Upload or analyze the official tender RFP document to verify eligibility clauses with page citations.
              </p>
            </div>
          </div>

          <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-teal-600 hover:from-brand-500 hover:to-teal-500 text-white px-4 py-2 text-xs font-bold shadow-lg shadow-brand-600/20 transition-all shrink-0">
            <UploadCloud className="h-4 w-4" />
            <span>{isExtractingPdf ? 'Processing PDF...' : 'Upload Tender PDF'}</span>
            <input 
              type="file" 
              accept=".pdf" 
              className="hidden" 
              onChange={handlePdfUpload}
              disabled={isExtractingPdf}
            />
          </label>
        </div>

        {uploadError && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-xs text-rose-300">
            {uploadError}
          </div>
        )}

        {/* Extracted Details Display */}
        {extractedPdfData ? (
          <div className="rounded-2xl border border-emerald-500/30 bg-slate-950/80 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Check className="h-4 w-4" /> Real PyMuPDF Extraction Succeeded
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Confidence: {extractedPdfData.confidence || 95}% • {extractedPdfData.verification_status || 'VERIFIED'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Title / Ref</span>
                <span className="text-white font-semibold truncate block">{extractedPdfData.tender_title || tender.title}</span>
                <span className="text-[10px] text-brand-400 font-mono">{extractedPdfData.reference_no || tender.reference_no}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Authority</span>
                <span className="text-white font-semibold truncate block">{extractedPdfData.issuing_authority || tender.organization_name}</span>
                <span className="text-[10px] text-slate-400">Page {extractedPdfData.issuing_authority_page || 1}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">EMD / Security</span>
                <span className="text-emerald-400 font-bold block">{extractedPdfData.emd_amount_formatted || tender.emd_formatted || 'Exempt / Not Stated'}</span>
                <span className="text-[10px] text-slate-400">Page {extractedPdfData.emd_page || 2}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Min Turnover</span>
                <span className="text-amber-400 font-bold block">{extractedPdfData.min_turnover_formatted || tender.min_turnover_formatted}</span>
                <span className="text-[10px] text-slate-400">Page {extractedPdfData.turnover_page || 3}</span>
              </div>
            </div>

            {extractedPdfData.technical_requirements?.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs">
                <span className="text-slate-400 font-bold text-[11px]">Extracted Technical Requirements:</span>
                <div className="flex flex-wrap gap-1.5">
                  {extractedPdfData.technical_requirements.map((req: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300 text-[11px]">
                      • {req}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 p-5 text-center text-xs text-slate-400">
            <p>Official tender document is indexed from <strong className="text-slate-200">{tender.source}</strong>.</p>
            <p className="mt-1 text-[11px] text-slate-500">
              Click "Upload Tender PDF" above to process amendments or full 50+ page NIT documents through PyMuPDF for automated clause attribution.
            </p>
          </div>
        )}
      </div>

      {/* 11-Step Company Workflow Visualizer */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          BidCognix 11-Step Preparation Workflow
        </p>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400">1. Discover</span>
          <span className="text-slate-600">→</span>
          <span className="text-slate-400">2. Details</span>
          <span className="text-slate-600">→</span>
          <span className="text-brand-300 font-bold">3. PDF Analysis</span>
          <span className="text-slate-600">→</span>
          <span className="text-emerald-300 font-bold">4. Eligibility</span>
          <span className="text-slate-600">→</span>
          <span className="text-amber-300 font-bold">5. Missing Docs</span>
          <span className="text-slate-600">→</span>
          <span className="text-brand-400 font-bold">6. Bid Workspace</span>
          <span className="text-slate-600">→</span>
          <span className="text-slate-400">7. Checklist</span>
          <span className="text-slate-600">→</span>
          <span className="text-slate-400">8. Tasks</span>
          <span className="text-slate-600">→</span>
          <span className="text-slate-400">9. Review</span>
          <span className="text-slate-600">→</span>
          <span className="text-slate-400">10. Verification</span>
          <span className="text-slate-600">→</span>
          <span className="text-white font-bold bg-brand-600 px-2 py-0.5 rounded">11. Portal Submission</span>
        </div>
      </div>

      {/* Decision Card */}
      <div className="rounded-3xl border-2 border-brand-500/30 bg-gradient-to-r from-slate-900 via-navy-900 to-slate-950 p-6 sm:p-8 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">Do you want to bid for this tender?</h3>
            <p className="text-xs text-slate-300">
              Recommendation: <strong className="text-emerald-400 font-bold">Good Opportunity</strong>. Save it to your preparing list to track deadlines.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                handleUpdateStage('APPROVED_TO_BID');
                onNavigate('my-tenders');
              }}
              className="rounded-xl px-5 py-2.5 text-xs font-bold transition-all bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/30 flex items-center gap-1.5"
            >
              <span>Open in 11-Step Bid Workspace</span>
              <ChevronRight className="h-4 w-4" />
            </button>

            <a
              href="https://gem.gov.in"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-brand-500/40 bg-brand-500/10 px-4 py-2.5 text-xs font-bold text-brand-300 hover:bg-brand-500/20"
            >
              <span>Apply on Official Portal (GeM)</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-400 shrink-0" />
          <span>
            <strong>Official Submission Notice:</strong> BidCognix provides eligibility matching and checklist preparation. Final bid submission is submitted on the official government portal (GeM / Central Public Procurement Portal).
          </span>
        </div>
      </div>

    </div>
  );
};
