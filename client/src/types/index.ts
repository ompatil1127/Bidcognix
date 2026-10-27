export type UserRole = 'GOVERNMENT' | 'COMPANY' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organization_name: string;
  department?: string;
  /** Add optional verified for compatibility with existing code */
  verified?: boolean;
  /** UI uses is_verified; keep optional for compatibility */
  is_verified?: boolean;
  /** Some demo payloads include company_id on the user */
  company_id?: string;
  avatar?: string;
  created_at?: string;
}

export interface PastProject {
  title: string;
  client: string;
  value: number;
  value_formatted: string;
  year: number;
  completion_status: string;
}

export interface Company {
  id: string;
  user_id: string;
  company_name: string;
  industry?: string;
  /** Optional category for UI badge */
  business_category?: string;
  incorporation_year?: number;
  experience_years: number;
  annual_turnover: number;
  /** Added for UI compatibility */
  annual_turnover_formatted?: string;
  turnover_formatted?: string;

  is_verified?: boolean;
  created_at?: string;
  updated_at?: string;
  employee_count?: number;
  headquarters?: string;
  gstin?: string;
  pan?: string;
  certifications: string[];
  technical_skills: string[];
  past_projects?: PastProject[];
  financial_rating?: string;
}

export interface Tender {
  id: string;
  reference_no: string;
  title: string;
  organization_name: string;
  issuer_id?: string;
  category: string;
  ai_predicted_category: string;
  ai_confidence: number;
  category_distribution?: Record<string, number>;
  budget: number;
  budget_formatted: string;
  currency: string;
  min_turnover: number;
  min_turnover_formatted: string;
  min_experience_years: number;
  location: string;
  source: string;
  source_badge: string;
  status: 'ACTIVE' | 'DRAFT' | 'CLOSED' | 'EVALUATION';
  deadline: string;
  deadline_formatted: string;
  required_certifications: string[];
  technical_requirements: string[];
  required_documents: string[];
  description: string;
  emd_amount?: number;
  emd_formatted?: string;
  views_count?: number;
  evaluation_count?: number;
  created_at?: string;
}

export interface RequirementItem {
  type: 'turnover' | 'experience' | 'certification' | 'technical';
  label: string;
  required: string;
  actual: string;
  status: 'PASS' | 'FAIL' | 'MISSING' | 'WARNING';
  detail: string;
}

export interface ComplianceCheckItem {
  id: string;
  category: string;
  title: string;
  clause: string;
  status: 'READY' | 'ACTION_REQUIRED' | 'PARTIAL' | 'IN_PROGRESS';
  badge: string;
  color: 'green' | 'red' | 'amber' | 'blue';
  action: string;
}

export interface RecommendationItem {
  type: 'BID_RECOMMENDATION' | 'PRICING_STRATEGY' | 'RISK_ALERT';
  headline: string;
  description: string;
  sentiment: 'positive' | 'warning' | 'negative' | 'neutral';
}

export interface TenderEvaluation {
  tender_id?: string;
  tender_title?: string;
  category: string;
  ai_confidence: number;
  deadline: string;
  eligibility: 'Eligible' | 'Partially Eligible' | 'Not Eligible';
  eligibility_color: 'green' | 'amber' | 'red';
  eligibility_summary: string;
  match_score: number;
  competitiveness: number;
  matched_requirements: RequirementItem[];
  missing_requirements: RequirementItem[];
  compliance_checklist: ComplianceCheckItem[];
  recommendations: RecommendationItem[];
  breakdown: {
    financial_capacity: number;
    technical_alignment: number;
    certification_coverage: number;
    experience_depth: number;
    past_win_index: number;
  };
}

export interface BookmarkItem {
  id: string;
  company_id: string;
  tender_id: string;
  stage: 'SAVED' | 'EVALUATING' | 'APPROVED_TO_BID' | 'BID_SUBMITTED' | 'WON' | 'LOST';
  notes: string;
  tender: Tender | null;
  created_at: string;
  updated_at: string;
}

export interface AdminStats {
  total_tenders: number;
  active_tenders: number;
  closed_tenders: number;
  draft_tenders: number;
  total_users: number;
  gov_users: number;
  company_users: number;
  admin_users: number;
  total_pipeline_value: number;
  total_pipeline_value_formatted: string;
  total_evaluations: number;
  total_bookmarks: number;
  category_distribution: Record<string, number>;
  ai_accuracy_rate: string;
  avg_processing_time: string;
  system_status: string;
}

// -------------------------------------------------------------
// MULTI-STAGE DOCUMENTATION WORKFLOW TYPES
// -------------------------------------------------------------
export interface TenderDocItem {
  id: string;
  filename: string;
  original_name: string;
  url: string;
  size: number;
  mime_type?: string;
  uploaded_at: string;
  status: string;
}

export interface RequiredDocItem {
  id: string;
  title: string;
  category: string;
  mandatory: boolean;
}

export interface ExtractedAnalysis {
  category: string;
  ai_confidence: number;
  budget: number;
  budget_formatted: string;
  min_turnover: number;
  min_turnover_formatted: string;
  min_experience_years: number;
  deadline: string;
  required_certifications: string[];
  technical_requirements: string[];
  required_documents: RequiredDocItem[];
  raw_text_snippet?: string;
  analyzed_at: string;
}

export interface VerificationItem {
  id: string;
  key: string;
  label: string;
  value: string;
  status: 'verified' | 'pending' | 'requires_attention';
  notes?: string;
}

export interface Stage3Verification {
  is_verified: boolean;
  verified_at?: string;
  items: VerificationItem[];
  user_notes?: string;
}

export interface CompanyDocItem {
  id: string;
  req_doc_id?: string;
  category: string;
  filename: string;
  original_name: string;
  url: string;
  size: number;
  mime_type?: string;
  uploaded_at: string;
  status: string;
}

export interface ValidationItem {
  req_doc_id: string;
  title: string;
  category: string;
  mandatory: boolean;
  status: 'VALID' | 'MISSING' | 'INCOMPLETE' | 'MISMATCHED';
  badge: string;
  color: 'green' | 'red' | 'amber';
  uploaded_file?: {
    id: string;
    original_name: string;
    url: string;
    size: number;
    uploaded_at: string;
  } | null;
  notes: string;
}

export interface ValidationReport {
  readiness_score: number;
  can_submit: boolean;
  overall_status: 'READY_TO_SUBMIT' | 'ACTION_REQUIRED' | 'INCOMPLETE';
  summary: {
    total: number;
    valid: number;
    missing: number;
    incomplete: number;
    mismatched: number;
  };
  items: ValidationItem[];
}

export interface ReadinessSummary {
  readiness_score: number;
  can_submit: boolean;
  overall_status: 'READY_TO_SUBMIT' | 'ACTION_REQUIRED' | 'INCOMPLETE';
  summary?: {
    total: number;
    valid: number;
    missing: number;
    incomplete: number;
    mismatched: number;
  };
  finalized?: boolean;
  submitted_at?: string;
  audit_ref?: string;
}

export interface DocumentationWorkflow {
  id: string;
  tender_id: string;
  company_id: string;
  current_stage: number;
  stage_1_tender_docs: TenderDocItem[];
  stage_2_analysis: ExtractedAnalysis;
  stage_3_verification: Stage3Verification;
  stage_4_company_docs: CompanyDocItem[];
  stage_5_validation: ValidationReport | null;
  stage_6_readiness: ReadinessSummary;
  created_at?: string;
  updated_at?: string;
}

// -------------------------------------------------------------
// BIDCOGNIX ENTERPRISE PLATFORM TYPES
// -------------------------------------------------------------

export interface CompanyDocument {
  id: string;
  company_id: string;
  category: 'Statutory' | 'Financial' | 'Certifications' | 'Technical' | 'Compliance' | 'Legal';
  title: string;
  filename: string;
  original_name: string;
  file_path: string;
  file_size: number;
  mime_type?: string;
  verification_status: 'VERIFIED' | 'PENDING' | 'EXPIRED';
  uploaded_at: string;
}

export type BidStage = 
  | 'SAVED'
  | 'UNDER_REVIEW'
  | 'PREPARING_DOCUMENTS'
  | 'READY_FOR_REVIEW'
  | 'READY_FOR_SUBMISSION'
  | 'SUBMITTED'
  | 'AWARDED'
  | 'REJECTED'
  | 'WITHDRAWN';

export interface BidTask {
  id: string;
  workspace_id: string;
  title: string;
  description?: string;
  assigned_to?: string;
  due_date?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED';
  completed_at?: string;
  created_at: string;
}

export interface BidChecklistItem {
  id: string;
  workspace_id: string;
  document_title: string;
  category: string;
  mandatory: boolean;
  status: 'PENDING' | 'ATTACHED' | 'VERIFIED' | 'EXEMPT';
  attached_company_doc_id?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface BidWorkspace {
  id: string;
  tender_id: string;
  company_id: string;
  stage: BidStage;
  target_submission_date?: string;
  bid_value?: number;
  bid_value_formatted?: string;
  submission_reference?: string;
  submission_portal?: string;
  submitted_at?: string;
  readiness_score: number;
  notes?: string;
  tender?: Tender;
  tasks?: BidTask[];
  checklists?: BidChecklistItem[];
  created_at: string;
  updated_at: string;
}

export interface AppNotification {
  id: string;
  user_id?: string;
  company_id?: string;
  tender_id?: string;
  workspace_id?: string;
  type: 'DEADLINE_WARNING' | 'ELIGIBILITY_ALERT' | 'STAGE_CHANGE' | 'TASK_DUE' | 'SYSTEM';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  days_left?: number;
  created_at: string;
}

export interface UpcomingDeadlineItem {
  id: string;
  title: string;
  reference_no: string;
  organization: string;
  category: string;
  budget_formatted: string;
  deadline: string;
  deadline_formatted: string;
  days_left: number;
}

export interface DashboardStats {
  total_tenders: number;
  active_tenders: number;
  saved_tenders: number;
  under_preparation_count: number;
  submitted_count: number;
  unread_alerts_count: number;
  upcoming_deadlines: UpcomingDeadlineItem[];
  recent_workspaces: any[];
  recent_activity: AppNotification[];
  sources_summary: any[];
  postgres_status: {
    connected: boolean;
    database_type: string;
    database_name: string;
    host: string;
    port: number;
  };
}

