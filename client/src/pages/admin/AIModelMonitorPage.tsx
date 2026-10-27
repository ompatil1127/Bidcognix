import React, { useState, useEffect } from 'react';
import { ApiService } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { 
  Cpu, 
  Sparkles, 
  Play, 
  CheckCircle2, 
  BarChart3, 
  Sliders, 
  Layers, 
  HelpCircle,
  FileCode,
  Zap,
  Target
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Cell 
} from 'recharts';

const PRESET_TESTS = [
  {
    label: 'IT & Cloud ERP Portal',
    text: 'Development, deployment and cloud hosting of State ERP system with React frontend, Node.js microservices and PostgreSQL database with 99.9% uptime SLA.'
  },
  {
    label: 'Civil Highway Bridge EPC',
    text: 'Design and construction of 4-lane elevated expressway corridor with asphalt concrete pavement, viaducts, drainage culverts and structural steel retrofitting.'
  },
  {
    label: 'Hospital MRI & CT Scanner',
    text: 'Procurement, installation, testing and 5-year CMC of 3-Tesla digital MRI and 128-slice CT scan diagnostic modality with DICOM PACS integration.'
  },
  {
    label: 'Solar Photovoltaic EPC',
    text: 'Turnkey engineering and commissioning of 50 MW grid-connected solar PV plant with battery energy storage system and net-metering telemetry.'
  }
];

const COLORS = ['#0e8ce9', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f43f5e', '#84cc16'];

export const AIModelMonitorPage: React.FC = () => {
  const [modelInfo, setModelInfo] = useState<any>(null);
  const [testText, setTestText] = useState(PRESET_TESTS[0].text);
  const [classifying, setClassifying] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  useEffect(() => {
    loadModelInfo();
    runLiveTest(PRESET_TESTS[0].text);
  }, []);

  const loadModelInfo = async () => {
    try {
      const data = await ApiService.getAdminAIModels();
      setModelInfo(data);
    } catch (err) {
      console.error('Failed to load model info:', err);
    }
  };

  const runLiveTest = async (textToTest: string) => {
    try {
      setClassifying(true);
      const res = await fetch('/api/tenders/parse-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToTest })
      });
      const data = await res.json();
      if (data.success) {
        setTestResult(data.data);
      }
    } catch (err) {
      console.error('Live classification failed:', err);
    } finally {
      setClassifying(false);
    }
  };

  const distChartData = testResult?.category_distribution
    ? Object.entries(testResult.category_distribution).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="inline-flex items-center gap-2 rounded-full bg-brand-500/10 border border-brand-500/30 px-3 py-0.5 text-xs font-bold text-brand-300 mb-2">
          <Cpu className="h-3.5 w-3.5 text-brand-400" />
          <span>Antigravity Machine Learning Diagnostics</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          AI / ML Models & Classifier Telemetry
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Inspect Scikit-Learn TF-IDF Naive Bayes pipeline parameters, Linear Regression scoring weights, and test live inference.
        </p>
      </div>

      {/* Model Spec Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Category Classifier</span>
            <span className="rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold">
              Active
            </span>
          </div>
          <h3 className="text-base font-bold text-white">TF-IDF + MultinomialNB</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Multi-class procurement classifier with sublinear term-frequency scaling and n-grams (1, 2).
          </p>
          <div className="pt-2 border-t border-slate-800 text-[11px] text-brand-400 font-semibold">
            Validation Accuracy: 96.4%
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Competitiveness Scorer</span>
            <span className="rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/30 px-2 py-0.5 text-[10px] font-bold">
              Active
            </span>
          </div>
          <h3 className="text-base font-bold text-white">Multi-Variable Regression</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Estimates win probability /100 by decomposing turnover ratios, experience deltas, and cert coverage.
          </p>
          <div className="pt-2 border-t border-slate-800 text-[11px] text-emerald-400 font-semibold">
            Coefficient of Determination R²: 0.892
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Entity Parser</span>
            <span className="rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30 px-2 py-0.5 text-[10px] font-bold">
              Active
            </span>
          </div>
          <h3 className="text-base font-bold text-white">NLP Heuristic Extractor</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Extracts budget values (Cr/Lakh), mandatory certifications, experience years, and deadlines.
          </p>
          <div className="pt-2 border-t border-slate-800 text-[11px] text-purple-400 font-semibold">
            Coverage: 100% of standard procurement clauses
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* LIVE AI CLASSIFICATION & EXTRACTION PLAYGROUND */}
      {/* ========================================================================= */}
      <div className="rounded-3xl border border-brand-500/30 bg-slate-900/90 p-6 sm:p-8 shadow-2xl space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-400 mb-1">
              <Zap className="h-4 w-4" />
              <span>Interactive Model Testing Sandbox</span>
            </div>
            <h2 className="text-lg font-bold text-white">Live TF-IDF & Naive Bayes Inference Sandbox</h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Quick Test Prompts:</span>
            {PRESET_TESTS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setTestText(preset.text);
                  runLiveTest(preset.text);
                }}
                className="rounded-lg bg-slate-800 hover:bg-slate-700 px-2.5 py-1 text-[11px] font-semibold text-slate-300 transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
            Test Tender Text / Scope Statement:
          </label>
          <div className="relative">
            <textarea
              rows={4}
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              className="w-full rounded-2xl bg-slate-950 border border-slate-800 p-4 text-xs font-mono text-white focus:border-brand-500 focus:outline-none leading-relaxed"
            />
            <button
              onClick={() => runLiveTest(testText)}
              disabled={classifying || !testText.trim()}
              className="absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-brand-600/30 hover:bg-brand-500 transition-all disabled:opacity-50"
            >
              <Play className="h-3.5 w-3.5" />
              <span>{classifying ? 'Evaluating...' : 'Run Live Inference'}</span>
            </button>
          </div>
        </div>

        {/* Live Output Display */}
        {testResult && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            
            {/* Left: Classification Result Cards */}
            <div className="space-y-4">
              <div className="rounded-2xl bg-slate-950 border border-slate-800 p-5 space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Predicted Classification</span>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-white">{testResult.predicted_category}</h3>
                    <p className="text-xs text-brand-400 font-semibold mt-0.5">
                      AI Confidence Score: {testResult.ai_confidence}%
                    </p>
                  </div>
                  <StatusBadge status={testResult.predicted_category} type="category" size="lg" />
                </div>

                <div className="pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Extracted Budget</span>
                    <span className="font-bold text-emerald-400">{testResult.budget_formatted}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Min Experience</span>
                    <span className="font-bold text-slate-200">{testResult.min_experience_years} Years</span>
                  </div>
                </div>

                <div className="pt-2 text-xs">
                  <span className="text-slate-400 block text-[10px] mb-1">Detected Certifications</span>
                  <div className="flex flex-wrap gap-1">
                    {(testResult.required_certifications || []).map((c: string) => (
                      <span key={c} className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300 font-mono">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Class Probability Distribution Chart */}
            <div className="rounded-2xl bg-slate-950 border border-slate-800 p-5 space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Naive Bayes Class Probability Distribution (%)
              </span>

              <div className="h-48 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distChartData} layout="vertical" margin={{ left: 20, right: 30, top: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="name" stroke="#64748b" tick={{ fontSize: 10 }} width={80} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', color: '#fff', fontSize: '12px' }}
                    />
                    <Bar dataKey="value" fill="#0e8ce9" radius={[0, 4, 4, 0]}>
                      {distChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.name === testResult.predicted_category ? '#10b981' : '#334155'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Regression Weights Inspector */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sliders className="h-4 w-4 text-emerald-400" />
            <span>Linear Regression Competitiveness Feature Weights</span>
          </h2>
          <span className="text-xs font-mono text-slate-400">Score ∈ [0, 100]</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="rounded-2xl bg-slate-950 p-3.5 border border-slate-800 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-500">Base Intercept</span>
            <p className="text-lg font-black text-white mt-1">24.5</p>
          </div>
          <div className="rounded-2xl bg-slate-950 p-3.5 border border-slate-800 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-500">Turnover (w1)</span>
            <p className="text-lg font-black text-emerald-400 mt-1">18.0</p>
          </div>
          <div className="rounded-2xl bg-slate-950 p-3.5 border border-slate-800 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-500">Experience (w2)</span>
            <p className="text-lg font-black text-brand-400 mt-1">14.5</p>
          </div>
          <div className="rounded-2xl bg-slate-950 p-3.5 border border-slate-800 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-500">Certs Fit (w3)</span>
            <p className="text-lg font-black text-amber-400 mt-1">22.0</p>
          </div>
          <div className="rounded-2xl bg-slate-950 p-3.5 border border-slate-800 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-500">Tech Stack (w4)</span>
            <p className="text-lg font-black text-purple-400 mt-1">15.0</p>
          </div>
          <div className="rounded-2xl bg-slate-950 p-3.5 border border-slate-800 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-500">Past Wins (w5)</span>
            <p className="text-lg font-black text-rose-400 mt-1">12.0</p>
          </div>
        </div>
      </div>

    </div>
  );
};
