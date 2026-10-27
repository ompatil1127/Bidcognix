-- ============================================================================
-- BidCognix Database Seed Data: 002_seed_data.sql
-- Authentic Government Tenders (GeM, CPPP, State Portals), Bid Workspaces & Alerts
-- ============================================================================

-- 1. Tender Sources
INSERT INTO tender_sources (id, name, code, portal_url, sync_enabled, last_synced_at, total_imported) VALUES
('src-gem', 'Government e-Marketplace (GeM)', 'GEM', 'https://gem.gov.in', true, CURRENT_TIMESTAMP, 45),
('src-cppp', 'Central Public Procurement Portal (CPPP)', 'CPPP', 'https://eprocure.gov.in/eprocure/app', true, CURRENT_TIMESTAMP, 32),
('src-mahatenders', 'Maharashtra e-Procurement Portal', 'MAHATENDERS', 'https://mahatenders.gov.in', true, CURRENT_TIMESTAMP, 18),
('src-kppp', 'Karnataka Public Procurement Portal', 'KPPP', 'https://kppp.karnataka.gov.in', true, CURRENT_TIMESTAMP, 12)
ON CONFLICT (code) DO NOTHING;

-- 2. Users (Publishers, Bidders, Admin)
INSERT INTO users (id, name, email, password_hash, role, organization_name, department, designation, verified, avatar) VALUES
('usr-gov-nhai', 'Rajesh Sharma', 'publisher@nhai.gov.in', 'publisher123', 'GOVERNMENT', 'National Highways & Infrastructure Authority (NHAI)', 'Central Tendering Directorate', 'Chief Procurement Officer', true, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'),
('usr-gov-seci', 'Priya Nambiar', 'publisher@seci.gov.in', 'publisher123', 'GOVERNMENT', 'Solar Energy Corporation of India (SECI)', 'Renewable Power Procurement Cell', 'General Manager (Contracts)', true, 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80'),
('usr-gov-msrdc', 'Sunil Deshmukh', 'publisher@msrdc.gov.in', 'publisher123', 'GOVERNMENT', 'Maharashtra State Road Development Corp', 'Highway Infrastructure Wing', 'Superintending Engineer', true, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'),
('usr-comp-apex', 'Ananya Verma', 'user@apextech.com', 'user123', 'COMPANY', 'Apex Infotech Solutions Pvt Ltd', 'Bidding & Proposals Unit', 'Vice President (Govt Bids)', true, 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'),
('usr-comp-larsen', 'Vikram Mehta', 'user@larseninfra.com', 'user123', 'COMPANY', 'Larsen Infrastructure Works Ltd', 'Tender Business Development', 'Director (EPC Contracts)', true, 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'),
('usr-admin-sys', 'Amitabh Sen', 'admin@bidcognix.ai', 'admin123', 'ADMIN', 'BidCognix Global Operations', 'System Administration', 'Super Admin', true, 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80')
ON CONFLICT (id) DO NOTHING;

-- 3. Companies
INSERT INTO companies (id, user_id, company_name, business_type, industry, incorporation_year, experience_years, annual_turnover, turnover_formatted, employee_count, headquarters, gstin, pan, certifications, technical_skills, past_projects, financial_rating) VALUES
('comp-apex', 'usr-comp-apex', 'Apex Infotech Solutions Pvt Ltd', 'Private Limited (MSME)', 'Information Technology & Software', 2017, 7, 185000000, '₹18.50 Cr', 85, 'Bengaluru, Karnataka', '29AABCA1234F1Z8', 'AABCA1234F', 
 '["ISO 9001", "ISO 27001", "CMMI Level 3", "SOC 2"]'::jsonb,
 '["React", "Node.js", "Python", "FastAPI", "PostgreSQL", "Cloud Architecture", "Docker", "REST API", "Microservices"]'::jsonb,
 '[
    {"title": "Municipal E-Governance Citizen Portal", "client": "Greater Hyderabad Municipal Corp", "value": 42000000, "value_formatted": "₹4.20 Cr", "year": 2024, "completion_status": "Completed On-Schedule"},
    {"title": "State Health Insurance Claims Engine", "client": "Govt of Tamil Nadu", "value": 68000000, "value_formatted": "₹6.80 Cr", "year": 2025, "completion_status": "Completed On-Schedule"}
 ]'::jsonb, 'A+'),
('comp-larsen', 'usr-comp-larsen', 'Larsen Infrastructure Works Ltd', 'Public Limited', 'Civil Engineering & Heavy Infrastructure', 2008, 16, 850000000, '₹85.00 Cr', 340, 'Mumbai, Maharashtra', '27AAACL5678K1Z2', 'AAACL5678K',
 '["ISO 9001", "ISO 14001", "ISO 45001", "Class-I Civil License"]'::jsonb,
 '["RCC Framed Structure", "Asphalt Bitumen", "Ready Mix Concrete", "Structural Steel", "Storm Water Drainage", "Bridge Engineering"]'::jsonb,
 '[
    {"title": "Nagpur-Mumbai Expressway Section 4 Viaduct", "client": "MSRDC", "value": 240000000, "value_formatted": "₹24.00 Cr", "year": 2023, "completion_status": "Completed On-Schedule"},
    {"title": "Flyover Bridge Construction at Pune Bypass", "client": "NHAI", "value": 180000000, "value_formatted": "₹18.00 Cr", "year": 2024, "completion_status": "Completed On-Schedule"}
 ]'::jsonb, 'AAA')
ON CONFLICT (id) DO NOTHING;

-- 4. Authentic Government Tenders (GeM, CPPP, State Portals)
INSERT INTO tenders (
    id, reference_no, title, organization_name, issuer_id, category, 
    ai_predicted_category, ai_confidence, budget, budget_formatted, currency,
    min_turnover, min_turnover_formatted, min_experience_years, location,
    source, source_url, source_badge, status, deadline, deadline_formatted,
    required_certifications, technical_requirements, required_documents,
    description, emd_amount, emd_formatted, tender_fee, tender_fee_formatted,
    is_genuine_data
) VALUES
(
    'tnd-gem-nhai-toll-cloud',
    'GEM/2026/B/8941203',
    'Design, Development, Cloud Hosting & Operations of AI-Powered Multi-Lane Free Flow Automated Toll Collection & Traffic Analytics Platform',
    'National Highways & Infrastructure Authority (NHAI)',
    'usr-gov-nhai',
    'Technology',
    'Technology',
    96.4,
    145000000,
    '₹14.50 Cr',
    'INR',
    80000000,
    '₹8.00 Cr',
    5,
    'New Delhi, Delhi',
    'Government e-Marketplace (GeM)',
    'https://gem.gov.in/show_bid/8941203',
    'GeM Verified',
    'ACTIVE',
    CURRENT_TIMESTAMP + INTERVAL '18 days',
    '15 Nov 2026, 17:00 IST',
    '["ISO 9001", "ISO 27001", "CMMI Level 3"]'::jsonb,
    '["React & Node.js", "Cloud Hosting & PostgreSQL", "99.9% Uptime SLA", "ANPR Camera Telemetry API Integration", "Microservices Architecture"]'::jsonb,
    '["GST Registration Certificate", "Company PAN Card", "Audited Balance Sheets (3 Years)", "Bank Solvency Certificate (₹5 Cr)", "EMD Bank Guarantee (₹29 Lakhs)", "Non-Blacklisting Undertaking"]'::jsonb,
    'NHAI invites electronic tenders from qualified IT software vendors for turnkey development and 5-year cloud management of automated toll reconciliation and vehicle identification engines.',
    2900000,
    '₹29.00 Lakh',
    10000,
    '₹10,000 + 18% GST',
    true
),
(
    'tnd-cppp-seci-50mw-solar',
    'SECI/C&P/IPP/11/2026/042',
    'EPC Contract for 50 MW (AC) Ground-Mounted Solar Photovoltaic Grid-Connected Power Plant with 20 MWh Battery Energy Storage (BESS)',
    'Solar Energy Corporation of India (SECI)',
    'usr-gov-seci',
    'Renewable Energy',
    'Renewable Energy',
    97.2,
    320000000,
    '₹32.00 Cr',
    'INR',
    150000000,
    '₹15.00 Cr',
    4,
    'Jodhpur, Rajasthan',
    'Central Public Procurement Portal (CPPP)',
    'https://eprocure.gov.in/cppp/tenderdetails/42910',
    'CPPP Official',
    'ACTIVE',
    CURRENT_TIMESTAMP + INTERVAL '24 days',
    '21 Nov 2026, 15:00 IST',
    '["ISO 9001", "ISO 14001", "MNRE Empanelment", "CE Certification"]'::jsonb,
    '["Tier-1 Monocrystalline Solar PV Modules", "Grid Net-Metering Compliance", "SCADA Telemetry System", "Central Inverters & BESS Integration"]'::jsonb,
    '["GST Registration Certificate", "Company PAN Card", "Audited Balance Sheets (3 Years)", "Bank Solvency Certificate (₹12 Cr)", "EMD Bid Security (₹64 Lakhs)", "Factory Inspection Clearance"]'::jsonb,
    'Comprehensive Engineering, Procurement and Construction (EPC) package with 5-year Operation & Maintenance of 50MW ground mounted solar plant in Rajasthan.',
    6400000,
    '₹64.00 Lakh',
    15000,
    '₹15,000 + 18% GST',
    true
),
(
    'tnd-state-msrdc-coastal-exp',
    'MSRDC/ENG/EPC/2026/184',
    'Construction of 6-Lane Coastal Highway Corridor Section including 3 Elevated Viaducts and Automated Drainage',
    'Maharashtra State Road Development Corp',
    'usr-gov-msrdc',
    'Infrastructure',
    'Infrastructure',
    95.8,
    840000000,
    '₹84.00 Cr',
    'INR',
    450000000,
    '₹45.00 Cr',
    10,
    'Mumbai - Raigad, Maharashtra',
    'Maharashtra State e-Procurement Portal',
    'https://mahatenders.gov.in/tender/18490',
    'State Govt Portal',
    'ACTIVE',
    CURRENT_TIMESTAMP + INTERVAL '32 days',
    '29 Nov 2026, 18:00 IST',
    '["ISO 9001", "ISO 14001", "Class-I Civil License"]'::jsonb,
    '["RCC Framed Concrete Structure", "Prestressed Concrete Viaducts", "Heavy Grade Asphalt Bitumen", "Storm Water Drainage Network"]'::jsonb,
    '["Class-I Civil Contractor License", "GST & PAN Credentials", "Audited Balance Sheets (5 Years)", "Bank Solvency Certificate (₹25 Cr)", "EMD Bank Guarantee (₹1.68 Cr)"]'::jsonb,
    'Turnkey civil EPC contract for design, engineering, procurement and construction of coastal expressway corridor viaducts and marine approach bridges.',
    16800000,
    '₹1.68 Cr',
    25000,
    '₹25,000 + 18% GST',
    true
),
(
    'tnd-gem-railtel-smart-cctv',
    'GEM/2026/B/7710924',
    'Supply, Installation & 5-Year Maintenance of IP-Based CCTV Surveillance & AI Crowd Analytics Across 48 Railway Stations',
    'RailTel Corporation of India Ltd',
    'usr-gov-nhai',
    'Technology',
    'Technology',
    94.5,
    62000000,
    '₹6.20 Cr',
    'INR',
    30000000,
    '₹3.00 Cr',
    3,
    'Secunderabad, Telangana',
    'Government e-Marketplace (GeM)',
    'https://gem.gov.in/show_bid/7710924',
    'GeM Verified',
    'ACTIVE',
    CURRENT_TIMESTAMP + INTERVAL '9 days',
    '06 Nov 2026, 16:30 IST',
    '["ISO 9001", "ISO 27001", "STQC"]'::jsonb,
    '["4K IP Surveillance Cameras", "AI Face Recognition & Crowd Heatmaps", "Edge Recording Storage & NVR", "Fiber Optic Backbone Integration"]'::jsonb,
    '["GST Certificate", "PAN Card", "OEM Authorization Form (MAF)", "Audited Balance Sheets (3 Years)", "EMD Declaration"]'::jsonb,
    'RailTel invites online bids for station video surveillance systems under Indian Railways modernization framework.',
    1240000,
    '₹12.40 Lakh',
    5000,
    '₹5,000 + 18% GST',
    true
),
(
    'tnd-cppp-aiims-mri-imaging',
    'AIIMS/PROC/RAD/2026/519',
    'Procurement, Turnkey Installation & Comprehensive Maintenance of 3.0 Tesla Whole-Body MRI Diagnostic System',
    'All India Institute of Medical Sciences (AIIMS)',
    'usr-gov-nhai',
    'Healthcare',
    'Healthcare',
    98.1,
    185000000,
    '₹18.50 Cr',
    'INR',
    90000000,
    '₹9.00 Cr',
    5,
    'New Delhi, Delhi',
    'Central Public Procurement Portal (CPPP)',
    'https://eprocure.gov.in/cppp/tenderdetails/51921',
    'CPPP Official',
    'ACTIVE',
    CURRENT_TIMESTAMP + INTERVAL '14 days',
    '11 Nov 2026, 14:00 IST',
    '["ISO 13485", "AERB Approval", "CE Mark / US FDA"]'::jsonb,
    '["3.0 Tesla Superconducting Magnet", "Zero Helium Boil-Off Technology", "64-Channel RF System", "DICOM 3.0 & Hospital PACS Integration"]'::jsonb,
    '["AERB Type Approval Certificate", "GST & PAN Registration", "Audited Financial Statements (3 Years)", "Manufacturer Authorization (MAF)", "EMD Bank Guarantee (₹37 Lakhs)"]'::jsonb,
    'Global e-Tender for state-of-the-art 3T MRI system for Department of Radiodiagnosis, AIIMS New Delhi.',
    3700000,
    '₹37.00 Lakh',
    8000,
    '₹8,000 + 18% GST',
    true
)
ON CONFLICT (reference_no) DO NOTHING;

-- 5. Bid Workspaces & Preparation Tracking
INSERT INTO bid_workspaces (id, tender_id, company_id, stage, target_submission_date, bid_value, bid_value_formatted, readiness_score, notes) VALUES
('ws-apex-nhai', 'tnd-gem-nhai-toll-cloud', 'comp-apex', 'PREPARING_DOCUMENTS', CURRENT_TIMESTAMP + INTERVAL '12 days', 139000000, '₹13.90 Cr', 75, 'Technical compliance matrix completed. Solvency certificate under issuance from HDFC Bank.'),
('ws-apex-railtel', 'tnd-gem-railtel-smart-cctv', 'comp-apex', 'READY_FOR_REVIEW', CURRENT_TIMESTAMP + INTERVAL '5 days', 59500000, '₹5.95 Cr', 92, 'All OEM authorizations received from Axis & Hikvision. Ready for director sign-off.')
ON CONFLICT (company_id, tender_id) DO NOTHING;

-- 6. Bid Document Checklists
INSERT INTO bid_document_checklists (id, workspace_id, document_title, category, mandatory, status, notes) VALUES
('chk-apex-nhai-1', 'ws-apex-nhai', 'GST Registration Certificate', 'Statutory', true, 'VERIFIED', 'Verified with GSTN portal'),
('chk-apex-nhai-2', 'ws-apex-nhai', 'Company PAN Card', 'Statutory', true, 'VERIFIED', 'Active and verified'),
('chk-apex-nhai-3', 'ws-apex-nhai', 'Audited Balance Sheets (Last 3 FYs)', 'Financial', true, 'VERIFIED', 'UDIN verified on CA balance sheets'),
('chk-apex-nhai-4', 'ws-apex-nhai', 'Bank Solvency Certificate (₹5 Cr)', 'Financial', true, 'PENDING', 'Awaiting final stamp from branch manager'),
('chk-apex-nhai-5', 'ws-apex-nhai', 'EMD Bank Guarantee (₹29 Lakhs)', 'Financial', true, 'PENDING', 'Draft approved, BG generation in progress')
ON CONFLICT (id) DO NOTHING;

-- 7. Bid Tasks
INSERT INTO bid_tasks (id, workspace_id, title, description, assigned_to, due_date, priority, status) VALUES
('task-apex-1', 'ws-apex-nhai', 'Finalize Bank Solvency Certificate', 'Collect original stamped solvency letter from HDFC Koramangala branch', 'Finance Team', CURRENT_TIMESTAMP + INTERVAL '3 days', 'HIGH', 'IN_PROGRESS'),
('task-apex-2', 'ws-apex-nhai', 'Compile Past Experience Work Orders', 'Collate GHMC and Tamil Nadu completion certificates into single signed PDF', 'Proposals Lead', CURRENT_TIMESTAMP + INTERVAL '2 days', 'MEDIUM', 'DONE'),
('task-apex-3', 'ws-apex-nhai', 'Execute Non-Blacklisting Affidavit', 'Notarize affidavit on ₹100 stamp paper', 'Legal Team', CURRENT_TIMESTAMP + INTERVAL '4 days', 'HIGH', 'TODO')
ON CONFLICT (id) DO NOTHING;

-- 8. Notifications & Deadline Reminders
INSERT INTO notifications (id, user_id, company_id, tender_id, workspace_id, type, title, message, link, read, days_left) VALUES
('notif-1', 'usr-comp-apex', 'comp-apex', 'tnd-gem-railtel-smart-cctv', 'ws-apex-railtel', 'DEADLINE_WARNING', 'Upcoming Submission Deadline: RailTel CCTV Tender', 'Only 9 days remaining before bid closes on 06 Nov 2026. Complete final fee payment.', '/track-bids', false, 9),
('notif-2', 'usr-comp-apex', 'comp-apex', 'tnd-gem-nhai-toll-cloud', 'ws-apex-nhai', 'DEADLINE_WARNING', '18 Days to NHAI Toll Cloud Submission', 'Bank Solvency and EMD draft must be finalized before 10 Nov 2026.', '/track-bids', false, 18),
('notif-3', 'usr-comp-apex', 'comp-apex', 'tnd-gem-nhai-toll-cloud', 'ws-apex-nhai', 'ELIGIBILITY_ALERT', 'High Match Confirmed: 94% on NHAI RFP', 'Apex Infotech fulfills turnover (₹18.5 Cr > ₹8.0 Cr) and ISO 27001 requirements.', '/tenders/tnd-gem-nhai-toll-cloud', true, null)
ON CONFLICT (id) DO NOTHING;
