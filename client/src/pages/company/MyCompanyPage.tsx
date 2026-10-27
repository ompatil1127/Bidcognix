import React, { useState, useEffect } from 'react';
import { Company, PastProject, CompanyDocument } from '../../types';
import { ApiService } from '../../services/api';
import confetti from 'canvas-confetti';
import { 
  Building2, 
  Save, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  DollarSign, 
  Award, 
  Code2, 
  Briefcase,
  Upload,
  FileText,
  FileCheck2,
  Download,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  FolderOpen
} from 'lucide-react';

interface MyCompanyPageProps {
  currentCompany: Company | null;
  onProfileUpdated: (updated: Company) => void;
}

const AVAILABLE_CERTS = [
  'ISO 9001',
  'ISO 27001',
  'ISO 14001',
  'ISO 45001',
  'CMMI Level 3',
  'CMMI Level 5',
  'SOC 2',
  'MeitY Empanelled',
  'STQC Certified',
  'CE Certification',
  'MSME Registered',
  'Startup India DPIIT',
  'Class-I Civil License'
];

export const MyCompanyPage: React.FC<MyCompanyPageProps> = ({
  currentCompany,
  onProfileUpdated
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'documents'>('profile');

  // Form State
  const [formData, setFormData] = useState<Partial<Company>>({
    company_name: '',
    industry: '',
    experience_years: 5,
    annual_turnover: 185000000,
    headquarters: '',
    gstin: '',
    pan: '',
    certifications: [],
    technical_skills: [],
    past_projects: []
  });

  const [newSkill, setNewSkill] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Document Center State
  const [documents, setDocuments] = useState<CompanyDocument[]>([]);
  const [docUploadCategory, setDocUploadCategory] = useState<string>('Statutory');
  const [docUploadTitle, setDocUploadTitle] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  useEffect(() => {
    if (currentCompany) {
      setFormData(currentCompany);
    }
    loadCompanyDocuments();
  }, [currentCompany]);

  const loadCompanyDocuments = async () => {
    try {
      const docs = await ApiService.getCompanyDocuments();
      setDocuments(docs);
    } catch (err) {
      console.error('Failed to load company documents:', err);
    }
  };

  const toggleCert = (cert: string) => {
    const list = formData.certifications || [];
    if (list.includes(cert)) {
      setFormData({ ...formData, certifications: list.filter(c => c !== cert) });
    } else {
      setFormData({ ...formData, certifications: [...list, cert] });
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !(formData.technical_skills || []).includes(newSkill.trim())) {
      setFormData({
        ...formData,
        technical_skills: [...(formData.technical_skills || []), newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const removeSkill = (s: string) => {
    setFormData({
      ...formData,
      technical_skills: (formData.technical_skills || []).filter(item => item !== s)
    });
  };

  const addProject = () => {
    const proj: PastProject = {
      title: 'Public Enterprise Turnkey Project',
      client: 'State Agency / Public Undertaking',
      value: 45000000,
      value_formatted: '₹4.50 Cr',
      year: 2024,
      completion_status: 'Successfully Completed'
    };
    setFormData({
      ...formData,
      past_projects: [...(formData.past_projects || []), proj]
    });
  };

  const removeProject = (index: number) => {
    const list = [...(formData.past_projects || [])];
    list.splice(index, 1);
    setFormData({ ...formData, past_projects: list });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const updated = await ApiService.updateCompanyProfile(formData);
      onProfileUpdated(updated);
      setSavedSuccess(true);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.3 } });
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Save profile error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    try {
      setUploadingDoc(true);
      const title = docUploadTitle.trim() || selectedFile.name;
      await ApiService.uploadCompanyDocument(selectedFile, title, docUploadCategory);
      setSelectedFile(null);
      setDocUploadTitle('');
      await loadCompanyDocuments();
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.5 } });
    } catch (err: any) {
      alert(err.message || 'Upload failed');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (!confirm('Are you sure you want to delete this company document?')) return;
    try {
      await ApiService.deleteCompanyDocument(id);
      await loadCompanyDocuments();
    } catch (err) {
      console.error('Delete doc error:', err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-teal-500/10 border border-teal-500/30 px-3 py-0.5 text-xs font-bold text-teal-700 dark:text-teal-300 mb-2">
            <ShieldCheck className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
            <span>Verified Company Profile & Document Vault</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Company Profile & Document Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Maintain your official corporate credentials, financial turnover, and compliance documents for automatic tender qualification.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'profile'
                ? 'bg-teal-700 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Company Profile
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'documents'
                ? 'bg-teal-700 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>Document Center</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {documents.length}
            </span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
          <span>Company profile updated successfully! All match scores recalculating with new credentials.</span>
        </div>
      )}

      {activeTab === 'profile' ? (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          
          {/* General Information Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Building2 className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              <span>Corporate Identity & Registration</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Company Legal Name</label>
                <input
                  type="text"
                  value={formData.company_name || ''}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className="mt-1 w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Industry / Domain</label>
                <input
                  type="text"
                  value={formData.industry || ''}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="mt-1 w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Registered Headquarters</label>
                <input
                  type="text"
                  value={formData.headquarters || ''}
                  onChange={(e) => setFormData({ ...formData, headquarters: e.target.value })}
                  placeholder="e.g. Bengaluru, Karnataka"
                  className="mt-1 w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">GSTIN Identification Number</label>
                <input
                  type="text"
                  value={formData.gstin || ''}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                  placeholder="29AABCA1234F1Z8"
                  className="mt-1 w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Company PAN Card</label>
                <input
                  type="text"
                  value={formData.pan || ''}
                  onChange={(e) => setFormData({ ...formData, pan: e.target.value })}
                  placeholder="AABCA1234F"
                  className="mt-1 w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Years of Commercial Experience</label>
                <input
                  type="number"
                  min="0"
                  max="80"
                  value={formData.experience_years || 5}
                  onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) || 0 })}
                  className="mt-1 w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Financial Capacity */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <DollarSign className="h-4 w-4 text-emerald-500" />
              <span>Financial Capacity & Turnover Qualification</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Average Annual Turnover (in INR Crore)</label>
                <input
                  type="number"
                  step="0.01"
                  value={((formData.annual_turnover || 185000000) / 10000000).toFixed(2)}
                  onChange={(e) => {
                    const cr = parseFloat(e.target.value) || 0;
                    setFormData({
                      ...formData,
                      annual_turnover: cr * 10000000,
                      turnover_formatted: `₹${cr.toFixed(2)} Cr`
                    });
                  }}
                  className="mt-1 w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                  required
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Current: <strong className="text-teal-600 dark:text-teal-400">{formData.turnover_formatted || '₹18.50 Cr'}</strong> (Audited 3-year average)
                </span>
              </div>
            </div>
          </div>

          {/* Certifications Selection */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Award className="h-4 w-4 text-amber-500" />
              <span>Accredited Certifications & Quality Standards</span>
            </h3>

            <div className="flex flex-wrap gap-2">
              {AVAILABLE_CERTS.map((cert) => {
                const isSelected = (formData.certifications || []).includes(cert);
                return (
                  <button
                    type="button"
                    key={cert}
                    onClick={() => toggleCert(cert)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-mono font-bold transition-all border ${
                      isSelected
                        ? 'bg-teal-700 border-teal-600 text-white shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <span>{isSelected ? '✓ ' : '+ '}{cert}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Technical Skills & Keywords */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Code2 className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              <span>Technical Competencies & Deliverables</span>
            </h3>

            <div className="flex flex-wrap gap-2">
              {(formData.technical_skills || []).map((skill) => (
                <span
                  key={skill}
                  className="rounded-xl bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5"
                >
                  <span>{skill}</span>
                  <button 
                    type="button" 
                    onClick={() => removeSkill(skill)}
                    className="text-slate-400 hover:text-rose-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2 max-w-md pt-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add skill (e.g. PostgreSQL, Python, ANPR)..."
                className="flex-1 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
              />
              <button
                type="button"
                onClick={addSkill}
                className="rounded-xl bg-slate-200 dark:bg-slate-800 px-3.5 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700"
              >
                Add
              </button>
            </div>
          </div>

          {/* Past Projects List */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-blue-500" />
                <span>Track Record & Previous Contracts</span>
              </h3>
              <button
                type="button"
                onClick={addProject}
                className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 dark:text-teal-400 hover:underline"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Contract</span>
              </button>
            </div>

            <div className="space-y-3">
              {(formData.past_projects || []).map((proj, idx) => (
                <div 
                  key={idx}
                  className="rounded-xl border border-slate-100 dark:border-slate-800 p-3.5 flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{proj.title}</p>
                    <span className="text-[11px] text-slate-500">{proj.client} • Year: {proj.year}</span>
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block">{proj.value_formatted}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeProject(idx)}
                    className="text-slate-400 hover:text-rose-500 p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Save Button Bar */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-700 hover:bg-teal-600 px-6 py-3 text-xs font-bold text-white shadow-md shadow-teal-700/20 transition-all"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Saving...' : 'Save Corporate Profile'}</span>
            </button>
          </div>

        </form>
      ) : (
        /* Document Center Tab */
        <div className="space-y-6">
          
          {/* Upload New Document Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Upload className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              <span>Upload New Corporate Document</span>
            </h3>

            <form onSubmit={handleUploadDocument} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Document Category</label>
                <select
                  value={docUploadCategory}
                  onChange={(e) => setDocUploadCategory(e.target.value)}
                  className="mt-1 w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="Statutory">Statutory (GST, PAN, Incorporation)</option>
                  <option value="Financial">Financial (Audited Balance Sheets, Solvency, UDIN)</option>
                  <option value="Certifications">Certifications (ISO, CMMI, MSME)</option>
                  <option value="Technical">Technical (Work Orders, Completion Letters)</option>
                  <option value="Compliance">Compliance (Non-Blacklisting Undertakings, PoA)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Document Title / Description</label>
                <input
                  type="text"
                  value={docUploadTitle}
                  onChange={(e) => setDocUploadTitle(e.target.value)}
                  placeholder="e.g. FY24-25 CA Turnover Certificate"
                  className="mt-1 w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Select File (PDF, DOCX)</label>
                <input
                  type="file"
                  accept=".pdf,.docx,.doc,.jpg,.png"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedFile(e.target.files[0]);
                      if (!docUploadTitle) setDocUploadTitle(e.target.files[0].name.replace(/\.[^/.]+$/, ''));
                    }
                  }}
                  className="mt-1 w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 dark:file:bg-teal-950 dark:file:text-teal-300 hover:file:bg-teal-100"
                  required
                />
              </div>

              <div className="sm:col-span-3 flex justify-end">
                <button
                  type="submit"
                  disabled={uploadingDoc || !selectedFile}
                  className="rounded-xl bg-teal-700 hover:bg-teal-600 px-5 py-2 text-xs font-bold text-white transition-colors"
                >
                  {uploadingDoc ? 'Uploading...' : 'Save Document to Vault'}
                </button>
              </div>
            </form>
          </div>

          {/* Existing Documents Vault List */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <FolderOpen className="h-4 w-4 text-blue-500" />
              <span>Company Document Vault ({documents.length} verified documents)</span>
            </h3>

            {documents.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <p className="text-xs">No documents uploaded yet. Upload your statutory certificates above.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="rounded-xl border border-slate-100 dark:border-slate-800 p-3.5 flex items-center justify-between gap-4 hover:border-slate-200 dark:hover:border-slate-700 transition-all text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">{doc.title}</h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <span className="font-semibold text-teal-700 dark:text-teal-400">{doc.category}</span>
                          <span>•</span>
                          <span>{(doc.file_size / 1024).toFixed(1)} KB</span>
                          <span>•</span>
                          <span>{new Date(doc.uploaded_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        ✓ {doc.verification_status || 'VERIFIED'}
                      </span>
                      <a
                        href={doc.file_path}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-slate-400 hover:text-teal-600 dark:hover:text-teal-400"
                        title="Download / View Document"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                      <button
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500"
                        title="Delete Document"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
