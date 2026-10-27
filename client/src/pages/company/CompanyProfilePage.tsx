import React, { useState, useEffect } from 'react';
import { Company, PastProject } from '../../types';
import { ApiService } from '../../services/api';
import { 
  Building, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Save, 
  Sparkles, 
  DollarSign, 
  Calendar, 
  Award, 
  Code2, 
  Briefcase,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface CompanyProfilePageProps {
  currentCompany: Company | null;
  onProfileUpdated: (updated: Company) => void;
}

const AVAILABLE_CERTIFICATIONS = [
  'ISO 9001',
  'ISO 27001',
  'ISO 14001',
  'ISO 45001',
  'ISO 13485',
  'CMMI Level 3',
  'CMMI Level 5',
  'SOC 2',
  'MeitY Empanelment',
  'STQC Certified',
  'CE Certification',
  'BIS Standard',
  'HIPAA Compliance'
];

export const CompanyProfilePage: React.FC<CompanyProfilePageProps> = ({
  currentCompany,
  onProfileUpdated
}) => {
  const [formData, setFormData] = useState<Partial<Company>>({
    company_name: '',
    industry: '',
    experience_years: 5,
    annual_turnover: 100000000,
    headquarters: '',
    gstin: '',
    pan: '',
    certifications: [],
    technical_skills: [],
    past_projects: []
  });

  const [newSkill, setNewSkill] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  useEffect(() => {
    if (currentCompany) {
      setFormData(currentCompany);
    }
  }, [currentCompany]);

  const handleToggleCert = (cert: string) => {
    const current = formData.certifications || [];
    if (current.includes(cert)) {
      setFormData({ ...formData, certifications: current.filter(c => c !== cert) });
    } else {
      setFormData({ ...formData, certifications: [...current, cert] });
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !(formData.technical_skills || []).includes(newSkill.trim())) {
      setFormData({
        ...formData,
        technical_skills: [...(formData.technical_skills || []), newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      technical_skills: (formData.technical_skills || []).filter(s => s !== skillToRemove)
    });
  };

  const handleAddProject = () => {
    const newProj: PastProject = {
      title: 'New Government / Enterprise Project',
      client: 'State Agency / Public Undertaking',
      value: 30000000,
      value_formatted: '₹3.00 Cr',
      year: 2024,
      completion_status: 'Successfully Completed'
    };
    setFormData({
      ...formData,
      past_projects: [...(formData.past_projects || []), newProj]
    });
  };

  const handleRemoveProject = (index: number) => {
    const updated = [...(formData.past_projects || [])];
    updated.splice(index, 1);
    setFormData({ ...formData, past_projects: updated });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const turnoverNum = Number(formData.annual_turnover) || 100000000;
      const payload: Partial<Company> = {
        ...formData,
        annual_turnover: turnoverNum,
        turnover_formatted: `₹${(turnoverNum / 10000000).toFixed(2)} Cr`
      };
      const updated = await ApiService.updateCompanyProfile(payload);
      onProfileUpdated(updated);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-5xl mx-auto pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-500/10 border border-brand-500/30 px-3 py-0.5 text-xs font-bold text-brand-300 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-brand-400" />
            <span>AI Match Profile Engine</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Company Qualifications & Credentials
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Keep your credentials updated. TenderSphere uses these parameters to calculate live eligibility, certification fit, and bid competitiveness.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-brand-600/30 hover:bg-brand-500 transition-all focus:outline-none disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
        </button>
      </div>

      {successMsg && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 flex items-center gap-3 text-emerald-400 text-xs font-semibold">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>Company profile updated successfully! Tender match scores have been recalculated.</span>
        </div>
      )}

      {/* 1. Core Profile Details */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Building className="h-4 w-4 text-brand-400" />
          <span>Organization Identity</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Company Name
            </label>
            <input
              type="text"
              value={formData.company_name || ''}
              onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:border-brand-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Primary Industry
            </label>
            <input
              type="text"
              value={formData.industry || ''}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:border-brand-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Headquarters City
            </label>
            <input
              type="text"
              value={formData.headquarters || ''}
              onChange={(e) => setFormData({ ...formData, headquarters: e.target.value })}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              GSTIN Registration
            </label>
            <input
              type="text"
              value={formData.gstin || ''}
              onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs font-mono text-white focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              PAN Number
            </label>
            <input
              type="text"
              value={formData.pan || ''}
              onChange={(e) => setFormData({ ...formData, pan: e.target.value })}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs font-mono text-white focus:border-brand-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 2. Financial & Experience Capacity */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <DollarSign className="h-4 w-4 text-emerald-400" />
          <span>Financial & Operational Thresholds</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Annual Turnover (in INR Rupees)
            </label>
            <div className="relative">
              <input
                type="number"
                value={formData.annual_turnover || 0}
                onChange={(e) => setFormData({ ...formData, annual_turnover: Number(e.target.value) })}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-emerald-400 font-bold focus:border-brand-500 focus:outline-none"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                ₹{((formData.annual_turnover || 0) / 10000000).toFixed(2)} Cr
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Average audited turnover of past 3 financial years</p>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Years of Domain Experience
            </label>
            <input
              type="number"
              value={formData.experience_years || 5}
              onChange={(e) => setFormData({ ...formData, experience_years: Number(e.target.value) })}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white font-bold focus:border-brand-500 focus:outline-none"
            />
            <p className="text-[11px] text-slate-500 mt-1">Years since formal incorporation in this sector</p>
          </div>
        </div>
      </div>

      {/* 3. Certifications Selector */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Award className="h-4 w-4 text-amber-400" />
            <span>Active Certifications & Compliance Badges</span>
          </h2>
          <span className="text-xs text-slate-400 font-semibold">
            {(formData.certifications || []).length} Active
          </span>
        </div>

        <p className="text-xs text-slate-400">
          Toggle the quality, security, and statutory certifications your organization actively holds:
        </p>

        <div className="flex flex-wrap gap-2 pt-2">
          {AVAILABLE_CERTIFICATIONS.map((cert) => {
            const hasCert = (formData.certifications || []).includes(cert);
            return (
              <button
                type="button"
                key={cert}
                onClick={() => handleToggleCert(cert)}
                className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-all flex items-center gap-2 border ${
                  hasCert
                    ? 'bg-brand-500/20 border-brand-500/50 text-brand-300 shadow-md shadow-brand-500/10'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${hasCert ? 'bg-brand-400' : 'bg-slate-700'}`} />
                <span>{cert}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Technical Skills & Capabilities */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Code2 className="h-4 w-4 text-purple-400" />
          <span>Technical Stack & Domain Skills</span>
        </h2>

        <div className="flex gap-2">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); } }}
            placeholder="Add capability e.g. Kubernetes, React, GIS, DICOM, BESS..."
            className="flex-1 rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs text-white focus:border-brand-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleAddSkill}
            className="rounded-xl bg-slate-800 border border-slate-700 px-4 py-2 text-xs font-bold text-white hover:bg-slate-700"
          >
            Add Tag
          </button>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {(formData.technical_skills || []).map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 border border-slate-700 px-2.5 py-1 text-xs text-slate-200"
            >
              <span>{skill}</span>
              <button
                type="button"
                onClick={() => handleRemoveSkill(skill)}
                className="text-slate-400 hover:text-rose-400 focus:outline-none"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* 5. Past Completed Projects Portfolio */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-brand-400" />
            <span>Proven Past Projects Track Record</span>
          </h2>
          <button
            type="button"
            onClick={handleAddProject}
            className="inline-flex items-center gap-1 text-xs font-bold text-brand-400 hover:text-brand-300"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Past Project</span>
          </button>
        </div>

        <div className="space-y-3">
          {(formData.past_projects || []).map((proj, idx) => (
            <div key={idx} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 flex items-start justify-between gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Project Title</label>
                  <input
                    type="text"
                    value={proj.title}
                    onChange={(e) => {
                      const updated = [...(formData.past_projects || [])];
                      updated[idx].title = e.target.value;
                      setFormData({ ...formData, past_projects: updated });
                    }}
                    className="w-full rounded bg-slate-900 border border-slate-800 px-2 py-1 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Client Name</label>
                  <input
                    type="text"
                    value={proj.client}
                    onChange={(e) => {
                      const updated = [...(formData.past_projects || [])];
                      updated[idx].client = e.target.value;
                      setFormData({ ...formData, past_projects: updated });
                    }}
                    className="w-full rounded bg-slate-900 border border-slate-800 px-2 py-1 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Project Value (₹)</label>
                  <input
                    type="number"
                    value={proj.value}
                    onChange={(e) => {
                      const updated = [...(formData.past_projects || [])];
                      const val = Number(e.target.value);
                      updated[idx].value = val;
                      updated[idx].value_formatted = `₹${(val / 10000000).toFixed(2)} Cr`;
                      setFormData({ ...formData, past_projects: updated });
                    }}
                    className="w-full rounded bg-slate-900 border border-slate-800 px-2 py-1 text-xs text-emerald-400 font-bold"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleRemoveProject(idx)}
                className="text-slate-500 hover:text-rose-400 p-1"
                title="Remove Project"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

    </form>
  );
};
