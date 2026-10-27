import { User, Company, Tender, TenderEvaluation, BookmarkItem, AdminStats, UserRole, DocumentationWorkflow, ValidationReport } from '../types';

const API_BASE = '/api';

export class ApiService {
  private static getHeaders(extraHeaders: Record<string, string> = {}) {
    const currentUserId = localStorage.getItem('tendersphere_user_id') || 'usr-comp-apex';
    return {
      'Content-Type': 'application/json',
      'x-user-id': currentUserId,
      ...extraHeaders
    };
  }

  // Auth & Session
  static async getCredentials(): Promise<{
    publishers: Array<{ id: string; name: string; email: string; password: string; role: UserRole; organization_name: string; department?: string; designation?: string; badge: string; avatar?: string }>;
    users: Array<{ id: string; name: string; email: string; password: string; role: UserRole; organization_name: string; company_name: string; industry: string; turnover_formatted: string; badge: string; avatar?: string }>;
    admins: Array<{ id: string; name: string; email: string; password: string; role: UserRole; organization_name: string; badge: string; avatar?: string }>;
  }> {
    const res = await fetch(`${API_BASE}/auth/credentials`);
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to fetch credentials');
    return data.data;
  }

  static async getMe(): Promise<{ user: User; company: Company | null }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: this.getHeaders()
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to fetch user');
    return data;
  }

  static async switchRole(role: UserRole): Promise<{ user: User; company: Company | null }> {
    const res = await fetch(`${API_BASE}/auth/switch-role`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    });
    const data = await res.json();
    if (data.success && data.user) {
      localStorage.setItem('tendersphere_user_id', data.user.id);
    }
    return data;
  }

  static async login(email: string, password: string, expectedRole?: UserRole): Promise<{ user: User; company: Company | null }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, expectedRole })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Login failed');
    if (data.user) {
      localStorage.setItem('tendersphere_user_id', data.user.id);
    }
    return data;
  }

  static logout(): void {
    localStorage.removeItem('tendersphere_user_id');
  }

  static async register(payload: any): Promise<{ user: User; company: Company | null }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Registration failed');
    if (data.user) {
      localStorage.setItem('tendersphere_user_id', data.user.id);
    }
    return data;
  }

  // Tenders
  static async getTenders(params: Record<string, string | number | undefined> = {}): Promise<Tender[]> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== '') {
        searchParams.append(key, String(val));
      }
    });

    const res = await fetch(`${API_BASE}/tenders?${searchParams.toString()}`, {
      headers: this.getHeaders()
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to fetch tenders');
    return data.data;
  }

  static async getTender(id: string): Promise<Tender> {
    const res = await fetch(`${API_BASE}/tenders/${id}`, {
      headers: this.getHeaders()
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Tender not found');
    return data.data;
  }

  static async createTender(payload: Partial<Tender>): Promise<Tender> {
    const res = await fetch(`${API_BASE}/tenders`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to create tender');
    return data.data;
  }

  static async updateTender(id: string, payload: Partial<Tender>): Promise<Tender> {
    const res = await fetch(`${API_BASE}/tenders/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to update tender');
    return data.data;
  }

  static async deleteTender(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/tenders/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to delete tender');
  }

  static async parseDocument(formData: FormData): Promise<any> {
    const currentUserId = localStorage.getItem('tendersphere_user_id') || 'usr-comp-apex';
    const res = await fetch(`${API_BASE}/tenders/parse-document`, {
      method: 'POST',
      headers: {
        'x-user-id': currentUserId
      },
      body: formData
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to parse document');
    return data.data;
  }

  // Company Evaluation & Profile
  static async getCompanyProfile(): Promise<Company> {
    const res = await fetch(`${API_BASE}/company/profile`, {
      headers: this.getHeaders()
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to fetch company profile');
    return data.data;
  }

  static async updateCompanyProfile(profile: Partial<Company>): Promise<Company> {
    const res = await fetch(`${API_BASE}/company/profile`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(profile)
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to update profile');
    return data.data;
  }

  static async evaluateTender(tenderId: string, customCompany?: Partial<Company>): Promise<TenderEvaluation> {
    const res = await fetch(`${API_BASE}/company/evaluate/${tenderId}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ company: customCompany })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to evaluate tender');
    return data.data;
  }

  // Bookmarks & Tracker
  static async getBookmarks(): Promise<BookmarkItem[]> {
    const res = await fetch(`${API_BASE}/company/bookmarks`, {
      headers: this.getHeaders()
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to fetch bookmarks');
    return data.data;
  }

  static async toggleBookmark(tenderId: string, notes: string = ''): Promise<{ bookmarked: boolean }> {
    const res = await fetch(`${API_BASE}/company/bookmarks/toggle`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ tender_id: tenderId, notes })
    });
    const data = await res.json();
    return data;
  }

  static async updateTrackingStage(tenderId: string, stage: string, notes?: string): Promise<BookmarkItem> {
    const res = await fetch(`${API_BASE}/company/tracker/update`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ tender_id: tenderId, stage, notes })
    });
    const data = await res.json();
    return data.data;
  }

  // Admin
  static async getAdminStats(): Promise<AdminStats> {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: this.getHeaders()
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to fetch stats');
    return data.data;
  }

  static async getAdminUsers(): Promise<User[]> {
    const res = await fetch(`${API_BASE}/admin/users`, {
      headers: this.getHeaders()
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to fetch users');
    return data.data;
  }

  static async toggleUserVerification(id: string): Promise<User> {
    const res = await fetch(`${API_BASE}/admin/users/${id}/verify`, {
      method: 'PUT',
      headers: this.getHeaders()
    });
    const data = await res.json();
    return data.data;
  }

  static async getAdminAIModels(): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/ai-models`, {
      headers: this.getHeaders()
    });
    const data = await res.json();
    return data.data;
  }

  static async resetSeed(): Promise<void> {
    await fetch(`${API_BASE}/admin/reset-seed`, {
      method: 'POST',
      headers: this.getHeaders()
    });
  }

  // Multi-Stage Documentation Workflow
  static async getWorkflow(tenderId: string): Promise<DocumentationWorkflow> {
    const res = await fetch(`${API_BASE}/workflows/${tenderId}`, {
      headers: this.getHeaders()
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to fetch workflow');
    return data.data;
  }

  static async uploadTenderDoc(tenderId: string, file: File): Promise<{ workflow: DocumentationWorkflow; document: any }> {
    const formData = new FormData();
    formData.append('file', file);
    const currentUserId = localStorage.getItem('tendersphere_user_id') || 'usr-comp-apex';
    const res = await fetch(`${API_BASE}/workflows/${tenderId}/upload-tender-doc`, {
      method: 'POST',
      headers: { 'x-user-id': currentUserId },
      body: formData
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Upload failed');
    return { workflow: data.data, document: data.document };
  }

  static async deleteTenderDoc(tenderId: string, docId: string): Promise<DocumentationWorkflow> {
    const res = await fetch(`${API_BASE}/workflows/${tenderId}/tender-doc/${docId}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Delete failed');
    return data.data;
  }

  static async runWorkflowAnalysis(tenderId: string, text?: string): Promise<DocumentationWorkflow> {
    const res = await fetch(`${API_BASE}/workflows/${tenderId}/analyze`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ text })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Analysis failed');
    return data.data;
  }

  static async saveWorkflowVerification(tenderId: string, payload: { items: any[]; user_notes?: string; modified_documents?: any[] }): Promise<DocumentationWorkflow> {
    const res = await fetch(`${API_BASE}/workflows/${tenderId}/verify`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Verification save failed');
    return data.data;
  }

  static async uploadCompanyDoc(tenderId: string, file: File, reqDocId?: string, category?: string): Promise<{ workflow: DocumentationWorkflow; document: any }> {
    const formData = new FormData();
    formData.append('file', file);
    if (reqDocId) formData.append('req_doc_id', reqDocId);
    if (category) formData.append('category', category);
    const currentUserId = localStorage.getItem('tendersphere_user_id') || 'usr-comp-apex';
    const res = await fetch(`${API_BASE}/workflows/${tenderId}/upload-company-doc`, {
      method: 'POST',
      headers: { 'x-user-id': currentUserId },
      body: formData
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Company doc upload failed');
    return { workflow: data.data, document: data.document };
  }

  static async quickFillCompanyDocs(tenderId: string): Promise<DocumentationWorkflow> {
    const res = await fetch(`${API_BASE}/workflows/${tenderId}/quick-fill-company-docs`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Quick fill failed');
    return data.data;
  }

  static async deleteCompanyDoc(tenderId: string, docId: string): Promise<DocumentationWorkflow> {
    const res = await fetch(`${API_BASE}/workflows/${tenderId}/company-doc/${docId}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Delete failed');
    return data.data;
  }

  static async runWorkflowValidation(tenderId: string): Promise<{ workflow: DocumentationWorkflow; report: ValidationReport }> {
    const res = await fetch(`${API_BASE}/workflows/${tenderId}/validate`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Validation failed');
    return { workflow: data.data, report: data.report };
  }

  static async finalizeWorkflow(tenderId: string): Promise<{ workflow: DocumentationWorkflow; message: string }> {
    const res = await fetch(`${API_BASE}/workflows/${tenderId}/finalize`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Finalization failed');
    return { workflow: data.data, message: data.message };
  }

  // -----------------------------------------------------------
  // BIDCOGNIX ENTERPRISE PLATFORM METHODS
  // -----------------------------------------------------------

  // Dashboard Statistics
  static async getDashboardStats(): Promise<any> {
    const res = await fetch(`${API_BASE}/dashboard/stats`, {
      headers: this.getHeaders()
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to fetch dashboard stats');
    return data.data;
  }

  // Tender Recommendations & Scoring
  static async getRecommendations(): Promise<Tender[]> {
    const res = await fetch(`${API_BASE}/tenders/recommendations`, {
      headers: this.getHeaders()
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to fetch recommendations');
    return data.data;
  }

  // Tender Eligibility Assessment
  static async getTenderEligibility(tenderId: string): Promise<TenderEvaluation> {
    const res = await fetch(`${API_BASE}/tenders/${tenderId}/eligibility`, {
      headers: this.getHeaders()
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to evaluate eligibility');
    return data.data;
  }

  // PDF Deep Analysis
  static async uploadTenderPdf(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    const currentUserId = localStorage.getItem('tendersphere_user_id') || 'usr-comp-apex';
    const res = await fetch(`${API_BASE}/tenders/upload-pdf`, {
      method: 'POST',
      headers: { 'x-user-id': currentUserId },
      body: formData
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to extract PDF details');
    return data.data;
  }

  // Tender Import & Data Sources
  static async importTenders(tenders: any[], sourceName?: string): Promise<{ imported: number; duplicates: number }> {
    const res = await fetch(`${API_BASE}/tenders/import`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ tenders, source_name: sourceName })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to import tenders');
    return data;
  }

  static async getTenderSources(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/tenders/sources/summary`, {
      headers: this.getHeaders()
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to fetch tender sources');
    return data.data;
  }

  // Company Document Center
  static async getCompanyDocuments(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/company/documents`, {
      headers: this.getHeaders()
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to fetch company documents');
    return data.data;
  }

  static async uploadCompanyDocument(file: File, title: string, category: string): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('category', category);
    const currentUserId = localStorage.getItem('tendersphere_user_id') || 'usr-comp-apex';
    const res = await fetch(`${API_BASE}/company/documents`, {
      method: 'POST',
      headers: { 'x-user-id': currentUserId },
      body: formData
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to upload document');
    return data.data;
  }

  static async deleteCompanyDocument(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/company/documents/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to delete document');
  }

  // Bid Preparation Workspaces (11-Step Pipeline)
  static async getWorkspaces(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/workspaces`, {
      headers: this.getHeaders()
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to fetch workspaces');
    return data.data;
  }

  static async getWorkspace(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/workspaces/${id}`, {
      headers: this.getHeaders()
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Workspace not found');
    return data.data;
  }

  static async createOrUpdateWorkspace(payload: { tender_id: string; stage?: string; notes?: string; bid_value?: number }): Promise<any> {
    const res = await fetch(`${API_BASE}/workspaces`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to save workspace');
    return data.data;
  }

  static async updateWorkspaceStage(id: string, stage: string, notes?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/workspaces/${id}/stage`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ stage, notes })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to update stage');
    return data.data;
  }

  static async recordWorkspaceSubmission(id: string, payload: { submission_reference: string; submission_portal?: string; submitted_at?: string; notes?: string; bid_value?: number }): Promise<any> {
    const res = await fetch(`${API_BASE}/workspaces/${id}/record-submission`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to record submission');
    return data.data;
  }

  // Workspace Tasks & Checklists
  static async getWorkspaceTasks(id: string): Promise<any[]> {
    const res = await fetch(`${API_BASE}/workspaces/${id}/tasks`, {
      headers: this.getHeaders()
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to fetch tasks');
    return data.data;
  }

  static async createWorkspaceTask(id: string, task: { title: string; description?: string; assigned_to?: string; due_date?: string; priority?: string }): Promise<any> {
    const res = await fetch(`${API_BASE}/workspaces/${id}/tasks`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(task)
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to create task');
    return data.data;
  }

  static async updateWorkspaceTask(id: string, taskId: string, updates: any): Promise<any> {
    const res = await fetch(`${API_BASE}/workspaces/${id}/tasks/${taskId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to update task');
    return data.data;
  }

  static async deleteWorkspaceTask(id: string, taskId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/workspaces/${id}/tasks/${taskId}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to delete task');
  }

  static async getWorkspaceChecklists(id: string): Promise<any[]> {
    const res = await fetch(`${API_BASE}/workspaces/${id}/checklists`, {
      headers: this.getHeaders()
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to fetch checklists');
    return data.data;
  }

  static async updateWorkspaceChecklist(id: string, chkId: string, updates: any): Promise<any> {
    const res = await fetch(`${API_BASE}/workspaces/${id}/checklists/${chkId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to update checklist item');
    return data.data;
  }

  // Notifications & Deadlines
  static async getNotifications(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/notifications`, {
      headers: this.getHeaders()
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to fetch notifications');
    return data.data;
  }

  static async markNotificationRead(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PUT',
      headers: this.getHeaders()
    });
    const data = await res.json();
    return data.data;
  }

  static async markAllNotificationsRead(): Promise<void> {
    await fetch(`${API_BASE}/notifications/mark-all-read`, {
      method: 'POST',
      headers: this.getHeaders()
    });
  }

  static async checkDeadlines(): Promise<void> {
    await fetch(`${API_BASE}/notifications/check-deadlines`, {
      method: 'POST',
      headers: this.getHeaders()
    });
  }

  // System Diagnostics
  static async getSystemStatus(): Promise<any> {
    const res = await fetch(`${API_BASE}/system/status`, {
      headers: this.getHeaders()
    });
    const data = await res.json();
    return data.data;
  }
}
