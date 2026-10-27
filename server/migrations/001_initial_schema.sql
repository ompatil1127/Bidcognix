-- ============================================================================
-- BidCognix Database Schema Migration: 001_initial_schema.sql
-- Enterprise AI-Powered Tender Intelligence & Bid Management Platform
-- ============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL CHECK (role IN ('GOVERNMENT', 'COMPANY', 'ADMIN')),
    organization_name VARCHAR(255) NOT NULL,
    department VARCHAR(255),
    designation VARCHAR(255),
    verified BOOLEAN DEFAULT true,
    avatar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Companies Table
CREATE TABLE IF NOT EXISTS companies (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    business_type VARCHAR(64) DEFAULT 'Private Limited',
    industry VARCHAR(128) NOT NULL,
    incorporation_year INTEGER,
    experience_years INTEGER DEFAULT 0,
    annual_turnover BIGINT DEFAULT 0,
    turnover_formatted VARCHAR(64),
    employee_count INTEGER DEFAULT 0,
    headquarters VARCHAR(255),
    gstin VARCHAR(32),
    pan VARCHAR(32),
    certifications JSONB DEFAULT '[]'::jsonb,
    technical_skills JSONB DEFAULT '[]'::jsonb,
    past_projects JSONB DEFAULT '[]'::jsonb,
    financial_rating VARCHAR(32) DEFAULT 'A+',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Company Documents Table
CREATE TABLE IF NOT EXISTS company_documents (
    id VARCHAR(64) PRIMARY KEY,
    company_id VARCHAR(64) REFERENCES companies(id) ON DELETE CASCADE,
    category VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT DEFAULT 0,
    mime_type VARCHAR(128),
    verification_status VARCHAR(32) DEFAULT 'VERIFIED',
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tender Sources Table
CREATE TABLE IF NOT EXISTS tender_sources (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(32) UNIQUE NOT NULL,
    portal_url TEXT NOT NULL,
    sync_enabled BOOLEAN DEFAULT true,
    last_synced_at TIMESTAMP WITH TIME ZONE,
    total_imported INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tenders Table
CREATE TABLE IF NOT EXISTS tenders (
    id VARCHAR(64) PRIMARY KEY,
    reference_no VARCHAR(128) UNIQUE NOT NULL,
    title TEXT NOT NULL,
    organization_name VARCHAR(255) NOT NULL,
    issuer_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    category VARCHAR(64) NOT NULL,
    ai_predicted_category VARCHAR(64),
    ai_confidence NUMERIC(5,2) DEFAULT 95.0,
    category_distribution JSONB DEFAULT '{}'::jsonb,
    budget BIGINT DEFAULT 0,
    budget_formatted VARCHAR(64),
    currency VARCHAR(16) DEFAULT 'INR',
    min_turnover BIGINT DEFAULT 0,
    min_turnover_formatted VARCHAR(64),
    min_experience_years INTEGER DEFAULT 0,
    location VARCHAR(255) NOT NULL,
    source VARCHAR(255) NOT NULL,
    source_url TEXT,
    source_badge VARCHAR(64) DEFAULT 'GeM Verified',
    status VARCHAR(32) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'DRAFT', 'CLOSED', 'EVALUATION', 'ARCHIVED')),
    publication_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    deadline_formatted VARCHAR(64),
    required_certifications JSONB DEFAULT '[]'::jsonb,
    technical_requirements JSONB DEFAULT '[]'::jsonb,
    required_documents JSONB DEFAULT '[]'::jsonb,
    description TEXT,
    emd_amount BIGINT DEFAULT 0,
    emd_formatted VARCHAR(64),
    tender_fee BIGINT DEFAULT 0,
    tender_fee_formatted VARCHAR(64),
    evaluation_criteria TEXT DEFAULT 'Lowest Evaluated Responsive Bidder (L1)',
    submission_instructions TEXT,
    is_genuine_data BOOLEAN DEFAULT true,
    views_count INTEGER DEFAULT 0,
    evaluation_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tender Documents & Uploaded PDFs
CREATE TABLE IF NOT EXISTS tender_documents (
    id VARCHAR(64) PRIMARY KEY,
    tender_id VARCHAR(64) REFERENCES tenders(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT DEFAULT 0,
    mime_type VARCHAR(128),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(32) DEFAULT 'PARSED'
);

-- 7. AI Analysis Records
CREATE TABLE IF NOT EXISTS ai_analyses (
    id VARCHAR(64) PRIMARY KEY,
    tender_id VARCHAR(64) REFERENCES tenders(id) ON DELETE CASCADE,
    model_version VARCHAR(64) DEFAULT 'BidCognix-AI-v2.0',
    extracted_params JSONB NOT NULL,
    confidence_scores JSONB DEFAULT '{}'::jsonb,
    page_attributions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Eligibility Assessments
CREATE TABLE IF NOT EXISTS eligibility_assessments (
    id VARCHAR(64) PRIMARY KEY,
    tender_id VARCHAR(64) REFERENCES tenders(id) ON DELETE CASCADE,
    company_id VARCHAR(64) REFERENCES companies(id) ON DELETE CASCADE,
    eligibility_status VARCHAR(64) NOT NULL,
    match_score NUMERIC(5,2) NOT NULL,
    competitiveness NUMERIC(5,2) NOT NULL,
    matched_requirements JSONB DEFAULT '[]'::jsonb,
    missing_requirements JSONB DEFAULT '[]'::jsonb,
    compliance_checklist JSONB DEFAULT '[]'::jsonb,
    recommendations JSONB DEFAULT '[]'::jsonb,
    breakdown JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Bid Workspaces (Pipeline & Preparation Tracking)
CREATE TABLE IF NOT EXISTS bid_workspaces (
    id VARCHAR(64) PRIMARY KEY,
    tender_id VARCHAR(64) REFERENCES tenders(id) ON DELETE CASCADE,
    company_id VARCHAR(64) REFERENCES companies(id) ON DELETE CASCADE,
    stage VARCHAR(64) NOT NULL DEFAULT 'SAVED' CHECK (stage IN (
        'SAVED', 'UNDER_REVIEW', 'PREPARING_DOCUMENTS', 
        'READY_FOR_REVIEW', 'READY_FOR_SUBMISSION', 
        'SUBMITTED', 'AWARDED', 'REJECTED', 'WITHDRAWN'
    )),
    target_submission_date TIMESTAMP WITH TIME ZONE,
    bid_value BIGINT,
    bid_value_formatted VARCHAR(64),
    submission_reference VARCHAR(128),
    submission_portal VARCHAR(128),
    submitted_at TIMESTAMP WITH TIME ZONE,
    readiness_score INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_company_tender_workspace UNIQUE (company_id, tender_id)
);

-- 10. Bid Tasks
CREATE TABLE IF NOT EXISTS bid_tasks (
    id VARCHAR(64) PRIMARY KEY,
    workspace_id VARCHAR(64) REFERENCES bid_workspaces(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assigned_to VARCHAR(128),
    due_date TIMESTAMP WITH TIME ZONE,
    priority VARCHAR(16) DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    status VARCHAR(32) DEFAULT 'TODO' CHECK (status IN ('TODO', 'IN_PROGRESS', 'DONE', 'BLOCKED')),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Bid Document Checklists
CREATE TABLE IF NOT EXISTS bid_document_checklists (
    id VARCHAR(64) PRIMARY KEY,
    workspace_id VARCHAR(64) REFERENCES bid_workspaces(id) ON DELETE CASCADE,
    document_title VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL,
    mandatory BOOLEAN DEFAULT true,
    status VARCHAR(32) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ATTACHED', 'VERIFIED', 'EXEMPT')),
    attached_company_doc_id VARCHAR(64) REFERENCES company_documents(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Notifications & Deadline Alerts
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    company_id VARCHAR(64) REFERENCES companies(id) ON DELETE CASCADE,
    tender_id VARCHAR(64) REFERENCES tenders(id) ON DELETE SET NULL,
    workspace_id VARCHAR(64) REFERENCES bid_workspaces(id) ON DELETE SET NULL,
    type VARCHAR(32) NOT NULL CHECK (type IN ('DEADLINE_WARNING', 'ELIGIBILITY_ALERT', 'STAGE_CHANGE', 'TASK_DUE', 'SYSTEM')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    read BOOLEAN DEFAULT false,
    days_left INTEGER,
    scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. Data Import Jobs
CREATE TABLE IF NOT EXISTS data_import_jobs (
    id VARCHAR(64) PRIMARY KEY,
    source_name VARCHAR(128) NOT NULL,
    import_format VARCHAR(16) NOT NULL,
    total_records INTEGER DEFAULT 0,
    imported_count INTEGER DEFAULT 0,
    duplicate_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    status VARCHAR(32) DEFAULT 'COMPLETED',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    log_details JSONB DEFAULT '[]'::jsonb
);

-- Indexes for high performance querying
CREATE INDEX IF NOT EXISTS idx_tenders_category ON tenders(category);
CREATE INDEX IF NOT EXISTS idx_tenders_deadline ON tenders(deadline);
CREATE INDEX IF NOT EXISTS idx_tenders_status ON tenders(status);
CREATE INDEX IF NOT EXISTS idx_tenders_ref_no ON tenders(reference_no);
CREATE INDEX IF NOT EXISTS idx_workspaces_company ON bid_workspaces(company_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_stage ON bid_workspaces(stage);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_bid_tasks_workspace ON bid_tasks(workspace_id);
CREATE INDEX IF NOT EXISTS idx_bid_checklists_workspace ON bid_document_checklists(workspace_id);
