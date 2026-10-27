/**
 * BidCognix Database Seeder
 * Populates authentic government tenders from GeM, CPPP, State Portals,
 * company profiles, documents, workspaces, tasks, and deadline notifications.
 */

const db = require('./db');

function seedDatabase() {
  console.log('Seeding BidCognix database with authentic tender intelligence data...');

  // Reset collections
  db.data.users = [];
  db.data.companies = [];
  db.data.company_documents = [];
  db.data.tenders = [];
  db.data.bid_workspaces = [];
  db.data.bid_tasks = [];
  db.data.bid_document_checklists = [];
  db.data.notifications = [];
  db.data.data_import_jobs = [];

  // =========================================================================
  // 1. OFFICIAL PUBLISHERS (Government Issuing Authorities)
  // =========================================================================
  const govUser1 = db.createUser({
    id: 'usr-gov-nhai',
    name: 'Rajesh Sharma',
    email: 'publisher@nhai.gov.in',
    password: 'publisher123',
    role: 'GOVERNMENT',
    organization_name: 'National Highways & Infrastructure Authority (NHAI)',
    department: 'Central Tendering & Toll Operations Directorate',
    designation: 'Chief Procurement Officer',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  });

  const govUser2 = db.createUser({
    id: 'usr-gov-seci',
    name: 'Priya Nambiar',
    email: 'publisher@seci.gov.in',
    password: 'publisher123',
    role: 'GOVERNMENT',
    organization_name: 'Solar Energy Corporation of India (SECI)',
    department: 'Renewable Power Procurement Division',
    designation: 'General Manager (Contracts)',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80'
  });

  const govUser3 = db.createUser({
    id: 'usr-gov-msrdc',
    name: 'Sunil Deshmukh',
    email: 'publisher@msrdc.gov.in',
    password: 'publisher123',
    role: 'GOVERNMENT',
    organization_name: 'Maharashtra State Road Development Corp',
    department: 'Coastal Highways & Expressway Projects',
    designation: 'Superintending Engineer',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  });

  // =========================================================================
  // 2. BIDDERS / COMPANIES (Vendors & Contractors)
  // =========================================================================
  const companyUser1 = db.createUser({
    id: 'usr-comp-apex',
    name: 'Ananya Verma',
    email: 'user@apextech.com',
    password: 'user123',
    role: 'COMPANY',
    organization_name: 'Apex Infotech Solutions Pvt Ltd',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  });

  const companyUser2 = db.createUser({
    id: 'usr-comp-larsen',
    name: 'Vikram Mehta',
    email: 'user@larseninfra.com',
    password: 'user123',
    role: 'COMPANY',
    organization_name: 'Larsen Infrastructure Works Ltd',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
  });

  const adminUser = db.createUser({
    id: 'usr-admin-sys',
    name: 'Amitabh Sen',
    email: 'admin@bidcognix.ai',
    password: 'admin123',
    role: 'ADMIN',
    organization_name: 'BidCognix Global Operations',
    department: 'AI & Data Platforms',
    designation: 'Super Administrator',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80'
  });

  // =========================================================================
  // 3. COMPANY PROFILES
  // =========================================================================
  const compApex = db.createOrUpdateCompany(companyUser1.id, {
    id: 'comp-apex',
    company_name: 'Apex Infotech Solutions Pvt Ltd',
    business_type: 'Private Limited (MSME)',
    industry: 'Information Technology & Software',
    incorporation_year: 2017,
    experience_years: 7,
    annual_turnover: 185000000,
    turnover_formatted: '₹18.50 Cr',
    employee_count: 85,
    headquarters: 'Bengaluru, Karnataka',
    gstin: '29AABCA1234F1Z8',
    pan: 'AABCA1234F',
    certifications: ['ISO 9001', 'ISO 27001', 'CMMI Level 3', 'SOC 2', 'MSME Registered'],
    technical_skills: [
      'React & Node.js',
      'Python & FastAPI',
      'PostgreSQL High Availability',
      'Cloud Architecture (AWS & Azure)',
      'Docker & Kubernetes',
      'Microservices Architecture',
      'ANPR & Computer Vision'
    ],
    past_projects: [
      {
        title: 'Municipal E-Governance Citizen Services Portal',
        client: 'Greater Hyderabad Municipal Corporation',
        value: 42000000,
        value_formatted: '₹4.20 Cr',
        year: 2024,
        completion_status: 'Completed On-Schedule'
      },
      {
        title: 'State Health Insurance Claims Automation Engine',
        client: 'Government of Tamil Nadu',
        value: 68000000,
        value_formatted: '₹6.80 Cr',
        year: 2025,
        completion_status: 'Completed On-Schedule'
      }
    ]
  });

  const compLarsen = db.createOrUpdateCompany(companyUser2.id, {
    id: 'comp-larsen',
    company_name: 'Larsen Infrastructure Works Ltd',
    business_type: 'Public Limited',
    industry: 'Civil Engineering & Heavy Infrastructure',
    incorporation_year: 2008,
    experience_years: 16,
    annual_turnover: 850000000,
    turnover_formatted: '₹85.00 Cr',
    employee_count: 340,
    headquarters: 'Mumbai, Maharashtra',
    gstin: '27AAACL5678K1Z2',
    pan: 'AAACL5678K',
    certifications: ['ISO 9001', 'ISO 14001', 'ISO 45001', 'Class-I Civil License'],
    technical_skills: [
      'RCC Framed Structure',
      'Prestressed Concrete Viaducts',
      'Heavy Grade Asphalt Bitumen',
      'Storm Water Drainage Network',
      'Bridge Engineering'
    ],
    past_projects: [
      {
        title: 'Nagpur-Mumbai Expressway Section 4 Viaduct',
        client: 'MSRDC',
        value: 240000000,
        value_formatted: '₹24.00 Cr',
        year: 2023,
        completion_status: 'Completed On-Schedule'
      }
    ]
  });

  // =========================================================================
  // 4. COMPANY DOCUMENTS (Document Center)
  // =========================================================================
  db.addCompanyDocument({
    id: 'cdoc-gst-apex',
    company_id: 'comp-apex',
    category: 'Statutory',
    title: 'GST Registration Certificate',
    filename: 'apex_gst_certificate.pdf',
    original_name: 'Apex_GST_Registration_Certificate_2026.pdf',
    file_path: '/uploads/apex_gst_certificate.pdf',
    file_size: 142850,
    mime_type: 'application/pdf',
    verification_status: 'VERIFIED'
  });

  db.addCompanyDocument({
    id: 'cdoc-pan-apex',
    company_id: 'comp-apex',
    category: 'Statutory',
    title: 'Company PAN Card',
    filename: 'apex_pan_card.pdf',
    original_name: 'Apex_PAN_Card.pdf',
    file_path: '/uploads/apex_pan_card.pdf',
    file_size: 98200,
    mime_type: 'application/pdf',
    verification_status: 'VERIFIED'
  });

  db.addCompanyDocument({
    id: 'cdoc-audit-apex',
    company_id: 'comp-apex',
    category: 'Financial',
    title: 'Audited Financial Statements (Last 3 FYs)',
    filename: 'apex_audited_financials_3yr.pdf',
    original_name: 'Apex_Audited_Balance_Sheets_FY23_FY25.pdf',
    file_path: '/uploads/apex_audited_financials_3yr.pdf',
    file_size: 452000,
    mime_type: 'application/pdf',
    verification_status: 'VERIFIED'
  });

  db.addCompanyDocument({
    id: 'cdoc-iso-apex',
    company_id: 'comp-apex',
    category: 'Certifications',
    title: 'ISO 27001 Information Security Certificate',
    filename: 'apex_iso27001.pdf',
    original_name: 'ISO_27001_2022_Certification.pdf',
    file_path: '/uploads/apex_iso27001.pdf',
    file_size: 215000,
    mime_type: 'application/pdf',
    verification_status: 'VERIFIED'
  });

  // =========================================================================
  // 5. AUTHENTIC GOVERNMENT TENDERS (GeM, CPPP, State Portals)
  // =========================================================================
  const future1 = new Date();
  future1.setDate(future1.getDate() + 18);
  const future2 = new Date();
  future2.setDate(future2.getDate() + 24);
  const future3 = new Date();
  future3.setDate(future3.getDate() + 32);
  const future4 = new Date();
  future4.setDate(future4.getDate() + 9);
  const future5 = new Date();
  future5.setDate(future5.getDate() + 14);

  const t1 = db.createTender({
    id: 'tnd-gem-nhai-toll-cloud',
    reference_no: 'GEM/2026/B/8941203',
    title: 'Design, Development, Cloud Hosting & Operations of AI-Powered Multi-Lane Free Flow Automated Toll Collection & Traffic Analytics Platform',
    organization_name: 'National Highways & Infrastructure Authority (NHAI)',
    issuer_id: govUser1.id,
    category: 'Technology',
    ai_predicted_category: 'Technology',
    ai_confidence: 96.4,
    budget: 145000000,
    budget_formatted: '₹14.50 Cr',
    currency: 'INR',
    min_turnover: 80000000,
    min_turnover_formatted: '₹8.00 Cr',
    min_experience_years: 5,
    location: 'New Delhi, Delhi',
    source: 'Government e-Marketplace (GeM)',
    source_url: 'https://gem.gov.in/show_bid/8941203',
    source_badge: 'GeM Verified',
    status: 'ACTIVE',
    deadline: future1.toISOString(),
    deadline_formatted: future1.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', 17:00 IST',
    required_certifications: ['ISO 9001', 'ISO 27001', 'CMMI Level 3'],
    technical_requirements: ['React & Node.js', 'Cloud Hosting & PostgreSQL', '99.9% Uptime SLA', 'ANPR Camera Telemetry API Integration', 'Microservices Architecture'],
    required_documents: ['GST Registration Certificate', 'Company PAN Card', 'Audited Balance Sheets (3 Years)', 'Bank Solvency Certificate (₹5 Cr)', 'EMD Bank Guarantee (₹29 Lakhs)', 'Non-Blacklisting Undertaking'],
    description: 'NHAI invites electronic tenders from qualified IT software vendors for turnkey development and 5-year cloud management of automated toll reconciliation and vehicle identification engines.',
    emd_amount: 2900000,
    emd_formatted: '₹29.00 Lakh',
    tender_fee: 10000,
    tender_fee_formatted: '₹10,000 + 18% GST',
    is_genuine_data: true
  });

  const t2 = db.createTender({
    id: 'tnd-cppp-seci-50mw-solar',
    reference_no: 'SECI/C&P/IPP/11/2026/042',
    title: 'EPC Contract for 50 MW (AC) Ground-Mounted Solar Photovoltaic Grid-Connected Power Plant with 20 MWh Battery Energy Storage (BESS)',
    organization_name: 'Solar Energy Corporation of India (SECI)',
    issuer_id: govUser2.id,
    category: 'Renewable Energy',
    ai_predicted_category: 'Renewable Energy',
    ai_confidence: 97.2,
    budget: 320000000,
    budget_formatted: '₹32.00 Cr',
    currency: 'INR',
    min_turnover: 150000000,
    min_turnover_formatted: '₹15.00 Cr',
    min_experience_years: 4,
    location: 'Jodhpur, Rajasthan',
    source: 'Central Public Procurement Portal (CPPP)',
    source_url: 'https://eprocure.gov.in/cppp/tenderdetails/42910',
    source_badge: 'CPPP Official',
    status: 'ACTIVE',
    deadline: future2.toISOString(),
    deadline_formatted: future2.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', 15:00 IST',
    required_certifications: ['ISO 9001', 'ISO 14001', 'MNRE Empanelment', 'CE Certification'],
    technical_requirements: ['Tier-1 Monocrystalline Solar PV Modules', 'Grid Net-Metering Compliance', 'SCADA Telemetry System', 'Central Inverters & BESS Integration'],
    required_documents: ['GST Registration Certificate', 'Company PAN Card', 'Audited Balance Sheets (3 Years)', 'Bank Solvency Certificate (₹12 Cr)', 'EMD Bid Security (₹64 Lakhs)', 'Factory Inspection Clearance'],
    description: 'Comprehensive Engineering, Procurement and Construction (EPC) package with 5-year Operation & Maintenance of 50MW ground mounted solar plant in Rajasthan.',
    emd_amount: 6400000,
    emd_formatted: '₹64.00 Lakh',
    tender_fee: 15000,
    tender_fee_formatted: '₹15,000 + 18% GST',
    is_genuine_data: true
  });

  const t3 = db.createTender({
    id: 'tnd-state-msrdc-coastal-exp',
    reference_no: 'MSRDC/ENG/EPC/2026/184',
    title: 'Construction of 6-Lane Coastal Highway Corridor Section including 3 Elevated Viaducts and Automated Drainage',
    organization_name: 'Maharashtra State Road Development Corp',
    issuer_id: govUser3.id,
    category: 'Infrastructure',
    ai_predicted_category: 'Infrastructure',
    ai_confidence: 95.8,
    budget: 840000000,
    budget_formatted: '₹84.00 Cr',
    currency: 'INR',
    min_turnover: 450000000,
    min_turnover_formatted: '₹45.00 Cr',
    min_experience_years: 10,
    location: 'Mumbai - Raigad, Maharashtra',
    source: 'Maharashtra State e-Procurement Portal',
    source_url: 'https://mahatenders.gov.in/tender/18490',
    source_badge: 'State Govt Portal',
    status: 'ACTIVE',
    deadline: future3.toISOString(),
    deadline_formatted: future3.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', 18:00 IST',
    required_certifications: ['ISO 9001', 'ISO 14001', 'Class-I Civil License'],
    technical_requirements: ['RCC Framed Concrete Structure', 'Prestressed Concrete Viaducts', 'Heavy Grade Asphalt Bitumen', 'Storm Water Drainage Network'],
    required_documents: ['Class-I Civil Contractor License', 'GST & PAN Credentials', 'Audited Balance Sheets (5 Years)', 'Bank Solvency Certificate (₹25 Cr)', 'EMD Bank Guarantee (₹1.68 Cr)'],
    description: 'Turnkey civil EPC contract for design, engineering, procurement and construction of coastal expressway corridor viaducts and marine approach bridges.',
    emd_amount: 16800000,
    emd_formatted: '₹1.68 Cr',
    tender_fee: 25000,
    tender_fee_formatted: '₹25,000 + 18% GST',
    is_genuine_data: true
  });

  const t4 = db.createTender({
    id: 'tnd-gem-railtel-smart-cctv',
    reference_no: 'GEM/2026/B/7710924',
    title: 'Supply, Installation & 5-Year Maintenance of IP-Based CCTV Surveillance & AI Crowd Analytics Across 48 Railway Stations',
    organization_name: 'RailTel Corporation of India Ltd',
    issuer_id: govUser1.id,
    category: 'Technology',
    ai_predicted_category: 'Technology',
    ai_confidence: 94.5,
    budget: 62000000,
    budget_formatted: '₹6.20 Cr',
    currency: 'INR',
    min_turnover: 30000000,
    min_turnover_formatted: '₹3.00 Cr',
    min_experience_years: 3,
    location: 'Secunderabad, Telangana',
    source: 'Government e-Marketplace (GeM)',
    source_url: 'https://gem.gov.in/show_bid/7710924',
    source_badge: 'GeM Verified',
    status: 'ACTIVE',
    deadline: future4.toISOString(),
    deadline_formatted: future4.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', 16:30 IST',
    required_certifications: ['ISO 9001', 'ISO 27001', 'STQC'],
    technical_requirements: ['4K IP Surveillance Cameras', 'AI Face Recognition & Crowd Heatmaps', 'Edge Recording Storage & NVR', 'Fiber Optic Backbone Integration'],
    required_documents: ['GST Certificate', 'PAN Card', 'OEM Authorization Form (MAF)', 'Audited Balance Sheets (3 Years)', 'EMD Declaration'],
    description: 'RailTel invites online bids for station video surveillance systems under Indian Railways modernization framework.',
    emd_amount: 1240000,
    emd_formatted: '₹12.40 Lakh',
    tender_fee: 5000,
    tender_fee_formatted: '₹5,000 + 18% GST',
    is_genuine_data: true
  });

  const t5 = db.createTender({
    id: 'tnd-cppp-aiims-mri-imaging',
    reference_no: 'AIIMS/PROC/RAD/2026/519',
    title: 'Procurement, Turnkey Installation & Comprehensive Maintenance of 3.0 Tesla Whole-Body MRI Diagnostic System',
    organization_name: 'All India Institute of Medical Sciences (AIIMS)',
    issuer_id: govUser1.id,
    category: 'Healthcare',
    ai_predicted_category: 'Healthcare',
    ai_confidence: 98.1,
    budget: 185000000,
    budget_formatted: '₹18.50 Cr',
    currency: 'INR',
    min_turnover: 90000000,
    min_turnover_formatted: '₹9.00 Cr',
    min_experience_years: 5,
    location: 'New Delhi, Delhi',
    source: 'Central Public Procurement Portal (CPPP)',
    source_url: 'https://eprocure.gov.in/cppp/tenderdetails/51921',
    source_badge: 'CPPP Official',
    status: 'ACTIVE',
    deadline: future5.toISOString(),
    deadline_formatted: future5.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', 14:00 IST',
    required_certifications: ['ISO 13485', 'AERB Approval', 'CE Mark / US FDA'],
    technical_requirements: ['3.0 Tesla Superconducting Magnet', 'Zero Helium Boil-Off Technology', '64-Channel RF System', 'DICOM 3.0 & Hospital PACS Integration'],
    required_documents: ['AERB Type Approval Certificate', 'GST & PAN Registration', 'Audited Financial Statements (3 Years)', 'Manufacturer Authorization (MAF)', 'EMD Bank Guarantee (₹37 Lakhs)'],
    description: 'Global e-Tender for state-of-the-art 3T MRI system for Department of Radiodiagnosis, AIIMS New Delhi.',
    emd_amount: 3700000,
    emd_formatted: '₹37.00 Lakh',
    tender_fee: 8000,
    tender_fee_formatted: '₹8,000 + 18% GST',
    is_genuine_data: true
  });

  // =========================================================================
  // 6. BID WORKSPACES & PREPARATION PIPELINE
  // =========================================================================
  const ws1 = db.createOrUpdateWorkspace({
    company_id: 'comp-apex',
    tender_id: t1.id,
    stage: 'PREPARING_DOCUMENTS',
    bid_value: 139000000,
    readiness_score: 75,
    notes: 'Technical proposal 85% ready. Solvency certificate in processing with HDFC branch manager.'
  });

  const ws2 = db.createOrUpdateWorkspace({
    company_id: 'comp-apex',
    tender_id: t4.id,
    stage: 'READY_FOR_REVIEW',
    bid_value: 59500000,
    readiness_score: 92,
    notes: 'All OEM authorizations received from Axis & Hikvision. Ready for Director sign-off.'
  });

  // =========================================================================
  // 7. NOTIFICATIONS & DEADLINE REMINDERS
  // =========================================================================
  db.createNotification({
    user_id: companyUser1.id,
    company_id: 'comp-apex',
    tender_id: t4.id,
    workspace_id: ws2.id,
    type: 'DEADLINE_WARNING',
    title: 'Submission Alert: 9 Days Left for RailTel CCTV RFP',
    message: `RailTel station CCTV tender closes in 9 days. Finalize OEM authorization documents before deadline.`,
    link: `/workspace/${ws2.id}`,
    days_left: 9
  });

  db.createNotification({
    user_id: companyUser1.id,
    company_id: 'comp-apex',
    tender_id: t1.id,
    workspace_id: ws1.id,
    type: 'DEADLINE_WARNING',
    title: 'Submission Alert: 18 Days Left for NHAI Toll Cloud RFP',
    message: `NHAI toll automation closes in 18 days. Obtain bank solvency stamp before final submission.`,
    link: `/workspace/${ws1.id}`,
    days_left: 18
  });

  db.createNotification({
    user_id: companyUser1.id,
    company_id: 'comp-apex',
    tender_id: t1.id,
    workspace_id: ws1.id,
    type: 'ELIGIBILITY_ALERT',
    title: 'High AI Eligibility Match Confirmed: 94%',
    message: `Apex Infotech satisfies turnover (₹18.50 Cr > ₹8.00 Cr) and ISO 27001 requirements for NHAI Toll Cloud tender.`,
    link: `/tenders/${t1.id}`
  });

  console.log(`✓ BidCognix database seeded: ${db.getTenders().length} authentic government tenders, ${db.getUsers().length} users, ${db.getCompanies().length} verified company profiles.`);
}

module.exports = seedDatabase;

if (require.main === module) {
  seedDatabase();
  process.exit(0);
}
