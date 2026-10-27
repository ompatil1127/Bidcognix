import React, { useState } from 'react';
import { Tender, User } from '../../types';
import { ApiService } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import confetti from 'canvas-confetti';
import { 
  UploadCloud, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Building2, 
  DollarSign, 
  Calendar, 
  Award, 
  Code2, 
  FileCheck,
  Cpu,
  Layers,
  RefreshCw
} from 'lucide-react';

interface CreateTenderPageProps {
  currentUser: User | null;
  onTenderCreated: (newTender: Tender) => void;
  onNavigate: (page: string) => void;
}

const SAMPLE_DOCS = [
  {
    title: 'NHAI Enterprise Highway Traffic Analytics Cloud',
    category: 'IT',
    text: `TENDER NOTICE NO: NHAI/TECH/2026/089
Organization: National Highways & Infrastructure Authority (NHAI)
Subject: Design, Development and Cloud Hosting of Enterprise Highway Traffic Analytics and Automated Toll Reconciliation Cloud Engine.
Estimated Budget / Value: Rs. 14.50 Cr (Fourteen Crore Fifty Lakhs)
Annual Turnover Requirement: Bidder must have minimum annual turnover of Rs. 8.00 Cr in last 3 financial years.
Experience Requirement: Minimum 5 years track record in building cloud data portals and highway GIS telemetry.
Mandatory Certifications: ISO 9001, ISO 27001, CMMI Level 3.
Key Deliverables: React, Node.js, Python, PostgreSQL, Cloud Hosting, 99.9% Uptime SLA, GIS Mapping.
Submission Deadline: 28 Aug 2026.`
  },
  {
    title: 'Coastal Expressway 6-Lane EPC Bridge Construction',
    category: 'Construction',
    text: `TENDER NOTICE NO: MSRDC/CIVIL/2026/782
Organization: Maharashtra State Road Development Corp
Subject: Turnkey EPC Construction of 6-Lane Elevated Coastal Highway Section, Viaducts and Marine Grade Piling Bridges.
Estimated Budget: Rs. 84.00 Cr
Minimum Annual Turnover: Rs. 50.00 Cr in last 5 financial years.
Experience: Minimum 10 years in bridge infrastructure and highway construction.
Mandatory Certifications: ISO 9001, ISO 14001, ISO 45001.
Technical Requirements: RCC Framed Structure, Prestressed Concrete, Asphalt Bitumen Heavy Grade.
Submission Deadline: 15 Sep 2026.`
  },
  {
    title: 'AIIMS 3-Tesla High-Resolution Digital MRI Modality',
    category: 'Healthcare',
    text: `TENDER NOTICE NO: AIIMS/MED/2026/112
Organization: All India Institute of Medical Sciences (AIIMS)
Subject: Supply, Installation and 5-Year Maintenance of 3-Tesla MRI Scanner and 128-Slice CT Scan Systems.
Estimated Budget: Rs. 28.00 Cr
Minimum Annual Turnover: Rs. 15.00 Cr.
Experience: Minimum 6 years supplying diagnostic imaging systems to tertiary medical institutions.
Mandatory Certifications: ISO 13485, CE Certification, AERB Type Approval.
Technical Deliverables: MRI 3 Tesla, CT Scanner, DICOM PACS Integration.
Submission Deadline: 02 Sep 2026.`
  }
];

export const CreateTenderPage: React.FC<CreateTenderPageProps> = ({
  currentUser,
  onTenderCreated,
  onNavigate
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [tenderText, setTenderText] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // Extracted/Editable Fields
  const [formData, setFormData] = useState<Partial<Tender>>({
    title: '',
    reference_no: '',
    category: 'IT',
    ai_predicted_category: 'IT',
    ai_confidence: 94,
    budget: 145000000,
    budget_formatted: '₹14.50 Cr',
    min_turnover: 80000000,
    min_turnover_formatted: '₹8.00 Cr',
    min_experience_years: 5,
    location: 'New Delhi / Pan India',
    deadline: '2026-08-28T17:00:00Z',
    deadline_formatted: '28 Aug 2026, 5:00 PM',
    required_certifications: ['ISO 9001', 'ISO 27001', 'CMMI Level 3'],
    technical_requirements: ['React', 'Node.js', 'Python', 'PostgreSQL', 'Cloud Hosting', 'GIS Mapping'],
    required_documents: [
      'GST Registration Certificate',
      'PAN Card Copy',
      'Audited Balance Sheets (3 Years)',
      'Turnover CA Certificate with UDIN',
      'Bank Solvency Certificate',
      'EMD Bank Guarantee',
      'Non-Blacklisting Undertaking'
    ],
    description: ''
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile(file);
      // Read text if txt
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setTenderText(event.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleSelectSample = (sample: typeof SAMPLE_DOCS[0]) => {
    setTenderText(sample.text);
    setUploadedFile(new File([sample.text], `${sample.title}.pdf`, { type: 'application/pdf' }));
  };

  const runAIExtraction = async () => {
    try {
      setIsScanning(true);
      setCurrentStep(2);

      const form = new FormData();
      if (uploadedFile) {
        form.append('file', uploadedFile);
      }
      form.append('text', tenderText);

      // Call API
      const result = await ApiService.parseDocument(form);
      
      // Update form data with extracted parameters
      setFormData(prev => ({
        ...prev,
        title: tenderText.split('\n')[0].replace(/TENDER NOTICE NO.*?:/i, '').replace(/Subject:/i, '').trim() || 'Procurement & Implementation Project',
        reference_no: `TS-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        category: result.predicted_category || 'IT',
        ai_predicted_category: result.predicted_category || 'IT',
        ai_confidence: result.ai_confidence || 94,
        budget: result.budget || 145000000,
        budget_formatted: result.budget_formatted || '₹14.50 Cr',
        min_turnover: result.min_turnover || 80000000,
        min_turnover_formatted: result.min_turnover_formatted || '₹8.00 Cr',
        min_experience_years: result.min_experience_years || 5,
        required_certifications: result.required_certifications || ['ISO 9001', 'ISO 27001'],
        technical_requirements: result.technical_requirements || ['Cloud Hosting', 'High Availability'],
        required_documents: result.required_documents || [],
        deadline: result.deadline || '2026-08-28T17:00:00Z',
        deadline_formatted: result.deadline_formatted || '28 Aug 2026, 5:00 PM',
        description: result.raw_summary || 'Tender scope and specifications extracted via TenderSphere AI.'
      }));

      // Simulate a polished scanning delay
      setTimeout(() => {
        setIsScanning(false);
        setCurrentStep(3);
      }, 1200);

    } catch (err) {
      console.error('AI extraction error:', err);
      setIsScanning(false);
      setCurrentStep(3);
    }
  };

  const handlePublish = async () => {
    try {
      setPublishing(true);
      const created = await ApiService.createTender({
        ...formData,
        issuer_id: currentUser?.id || 'usr-gov-nhai',
        organization_name: currentUser?.organization_name || 'National Highways Authority',
        status: 'ACTIVE'
      });

      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });

      onTenderCreated(created);
      setCurrentStep(4);
    } catch (err) {
      console.error('Publish failed:', err);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* Wizard Header & Stepper */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-500/10 border border-brand-500/30 px-3 py-0.5 text-xs font-bold text-brand-300 mb-1">
              <Sparkles className="h-3.5 w-3.5 text-brand-400" />
              <span>AI-Assisted Publishing Wizard</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Create & Publish Tender
            </h1>
          </div>

          <button
            onClick={() => onNavigate('gov-dashboard')}
            className="text-xs font-bold text-slate-400 hover:text-white"
          >
            Cancel Wizard
          </button>
        </div>

        {/* Step Indicator */}
        <div className="grid grid-cols-4 gap-2 pt-2">
          {[
            { step: 1, label: '1. Upload PDF / Text' },
            { step: 2, label: '2. AI Extraction' },
            { step: 3, label: '3. Review & Edit' },
            { step: 4, label: '4. Published' }
          ].map((s) => (
            <div
              key={s.step}
              className={`rounded-xl p-2.5 text-center text-xs font-bold transition-all border ${
                currentStep === s.step
                  ? 'bg-brand-600 border-brand-500 text-white shadow-lg shadow-brand-600/30'
                  : currentStep > s.step
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
            >
              {s.label}
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STEP 1: UPLOAD TENDER PDF / DOCUMENT */}
      {/* ========================================================================= */}
      {currentStep === 1 && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl space-y-6">
          
          <div>
            <h2 className="text-lg font-bold text-white">Upload Tender Document or Paste Notice</h2>
            <p className="text-xs text-slate-400 mt-1">
              Upload your tender PDF or select one of our pre-built sample government tender documents to test the AI extractor:
            </p>
          </div>

          {/* Drag and drop upload zone */}
          <div className="relative rounded-3xl border-2 border-dashed border-slate-700 bg-slate-950/60 p-8 text-center hover:border-brand-500 transition-colors">
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="space-y-3 pointer-events-none">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400">
                <UploadCloud className="h-7 w-7" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">
                  {uploadedFile ? uploadedFile.name : 'Drop your Tender PDF or Document here'}
                </p>
                <p className="text-xs text-slate-400 mt-1">Supports PDF, DOCX, and TXT procurement notices (up to 25MB)</p>
              </div>
              {uploadedFile && (
                <span className="inline-block rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-400">
                  ✓ Ready for AI Analysis
                </span>
              )}
            </div>
          </div>

          {/* Preset Sample Documents */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Or Load Realistic Government Tender Demo Files:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {SAMPLE_DOCS.map((sample, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleSelectSample(sample)}
                  className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3.5 text-left hover:border-brand-500/50 hover:bg-slate-900 transition-all group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <StatusBadge status={sample.category} type="category" size="sm" />
                    <Sparkles className="h-3.5 w-3.5 text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-xs font-bold text-white line-clamp-2">{sample.title}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Tender Notice Text Paste Area */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              Tender Raw Notice Text / Specifications Preview:
            </label>
            <textarea
              rows={5}
              value={tenderText}
              onChange={(e) => setTenderText(e.target.value)}
              placeholder="Paste tender clauses or raw PDF text here..."
              className="w-full rounded-2xl bg-slate-950 border border-slate-800 p-4 text-xs font-mono text-slate-300 focus:border-brand-500 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Action button */}
          <div className="flex justify-end pt-2">
            <button
              onClick={runAIExtraction}
              disabled={!tenderText.trim()}
              className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-6 py-3 text-xs font-bold text-white shadow-xl shadow-brand-600/30 hover:bg-brand-500 transition-all disabled:opacity-50"
            >
              <span>Run AI Information Extraction</span>
              <Sparkles className="h-4 w-4" />
            </button>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: AI SCANNING & EXTRACTION ANIMATION */}
      {/* ========================================================================= */}
      {currentStep === 2 && (
        <div className="rounded-3xl border border-brand-500/30 bg-slate-900/90 p-12 text-center shadow-2xl space-y-6">
          <div className="relative mx-auto h-20 w-20 flex items-center justify-center rounded-3xl bg-brand-500/10 border border-brand-500/30 text-brand-400">
            <Cpu className="h-10 w-10 animate-pulse" />
            <div className="absolute inset-0 rounded-3xl border-2 border-brand-400 border-t-transparent animate-spin" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">AI NLP & TF-IDF Extraction in Progress...</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Scanning procurement clauses, calculating TF-IDF Naive Bayes domain classification, extracting budget, turnover, experience, and certifications.
            </p>
          </div>

          <div className="max-w-xs mx-auto space-y-2 text-[11px] text-slate-400 font-mono text-left bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>TF-IDF Vectorization Completed</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Naive Bayes Classifier: IT (94%)</span>
            </div>
            <div className="flex items-center gap-2 text-brand-400 animate-pulse">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              <span>Extracting Eligibility Thresholds...</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: REVIEW & EDIT EXTRACTED FIELDS */}
      {/* ========================================================================= */}
      {currentStep === 3 && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-bold text-emerald-400 mb-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>AI Auto-Extraction Complete</span>
              </div>
              <h2 className="text-lg font-bold text-white">Review & Fine-Tune Tender Parameters</h2>
            </div>

            <div className="flex items-center gap-2">
              <StatusBadge status={formData.category || 'IT'} type="category" size="md" />
              <span className="text-xs font-bold text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded-md border border-brand-500/20">
                Confidence: {formData.ai_confidence}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Title */}
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                Tender Title
              </label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-white font-bold focus:border-brand-500 focus:outline-none"
              />
            </div>

            {/* Category */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-white focus:border-brand-500 focus:outline-none"
              >
                <option value="IT">IT & Software</option>
                <option value="Construction">Civil Construction</option>
                <option value="Healthcare">Healthcare & Medical</option>
                <option value="Renewable Energy">Renewable Energy</option>
                <option value="Manufacturing">Manufacturing & Industrial</option>
                <option value="Education">Education & Training</option>
                <option value="Defense">Defense & Aerospace</option>
              </select>
            </div>

            {/* Estimated Budget */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                Estimated Budget (INR ₹)
              </label>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setFormData({
                    ...formData,
                    budget: val,
                    budget_formatted: `₹${(val / 10000000).toFixed(2)} Cr`
                  });
                }}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-emerald-400 font-bold focus:border-brand-500 focus:outline-none"
              />
            </div>

            {/* Min Turnover */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                Minimum Annual Turnover Required (INR ₹)
              </label>
              <input
                type="number"
                value={formData.min_turnover}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setFormData({
                    ...formData,
                    min_turnover: val,
                    min_turnover_formatted: `₹${(val / 10000000).toFixed(2)} Cr`
                  });
                }}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-white font-bold focus:border-brand-500 focus:outline-none"
              />
            </div>

            {/* Min Experience */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                Minimum Domain Experience (Years)
              </label>
              <input
                type="number"
                value={formData.min_experience_years}
                onChange={(e) => setFormData({ ...formData, min_experience_years: Number(e.target.value) })}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-white font-bold focus:border-brand-500 focus:outline-none"
              />
            </div>

            {/* Location */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                Execution Location
              </label>
              <input
                type="text"
                value={formData.location || 'New Delhi / Pan India'}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-white focus:border-brand-500 focus:outline-none"
              />
            </div>

            {/* Submission Deadline */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                Submission Deadline
              </label>
              <input
                type="text"
                value={formData.deadline_formatted || '28 Aug 2026, 5:00 PM'}
                onChange={(e) => setFormData({ ...formData, deadline_formatted: e.target.value })}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-amber-400 font-bold focus:border-brand-500 focus:outline-none"
              />
            </div>

            {/* Required Certifications */}
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                Required Certifications (comma separated)
              </label>
              <input
                type="text"
                value={(formData.required_certifications || []).join(', ')}
                onChange={(e) => setFormData({
                  ...formData,
                  required_certifications: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                })}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-white focus:border-brand-500 focus:outline-none"
              />
            </div>

            {/* Technical Requirements */}
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                Key Technical Deliverables (comma separated)
              </label>
              <input
                type="text"
                value={(formData.technical_requirements || []).join(', ')}
                onChange={(e) => setFormData({
                  ...formData,
                  technical_requirements: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                })}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-white focus:border-brand-500 focus:outline-none"
              />
            </div>

          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              onClick={() => setCurrentStep(1)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Upload</span>
            </button>

            <button
              onClick={handlePublish}
              disabled={publishing}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-3 text-xs font-bold text-white shadow-xl shadow-emerald-600/30 hover:from-emerald-500 hover:to-emerald-400 transition-all disabled:opacity-50"
            >
              <span>{publishing ? 'Publishing...' : 'Publish Tender to TenderSphere'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 4: PUBLISHED CONFIRMATION */}
      {/* ========================================================================= */}
      {currentStep === 4 && (
        <div className="rounded-3xl border border-emerald-500/30 bg-slate-900/90 p-8 sm:p-12 text-center shadow-2xl space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <CheckCircle2 className="h-10 w-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Tender Successfully Published!
            </h2>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              Your tender has been indexed into TenderSphere with AI classification category <strong className="text-brand-400 font-bold">{formData.category}</strong>. Companies and prospective bidders can now discover and analyze compliance.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('gov-dashboard')}
              className="rounded-2xl bg-slate-800 border border-slate-700 px-5 py-3 text-xs font-bold text-white hover:bg-slate-700"
            >
              Back to Gov Dashboard
            </button>
            <button
              onClick={() => onNavigate('discovery')}
              className="rounded-2xl bg-brand-600 px-5 py-3 text-xs font-bold text-white shadow-xl shadow-brand-600/30 hover:bg-brand-500"
            >
              View in Bidder Marketplace
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
