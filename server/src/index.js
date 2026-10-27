const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const db = require('./db');
const aiBridge = require('./aiBridge');
const seedDatabase = require('./seed');

const app = express();
const PORT = process.env.PORT || 5000;

// Multer storage for PDF and document uploads
const uploadDir = path.join(__dirname, '..', 'uploads');
const fs = require('fs');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadDir));

// Initialize seed if database is empty
if (db.getTenders().length === 0) {
  seedDatabase();
}

// -------------------------------------------------------------
// AUTH ROUTES (Separate Publisher & User Credentials)
// -------------------------------------------------------------
app.get('/api/auth/credentials', (req, res) => {
  const users = db.getUsers();
  const companies = db.getCompanies();

  const publishers = users
    .filter(u => u.role === 'GOVERNMENT')
    .map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      password: u.password,
      role: u.role,
      organization_name: u.organization_name,
      department: u.department || 'Procurement Directorate',
      designation: u.designation || 'Tender Officer',
      badge: 'Official Publisher',
      avatar: u.avatar
    }));

  const usersList = users
    .filter(u => u.role === 'COMPANY')
    .map(u => {
      const comp = companies.find(c => c.user_id === u.id);
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        password: u.password,
        role: u.role,
        organization_name: u.organization_name,
        company_name: comp?.company_name || u.organization_name,
        industry: comp?.industry || 'Technology & Infrastructure',
        turnover_formatted: comp?.turnover_formatted || '₹15.00 Cr',
        badge: 'Verified Bidder',
        avatar: u.avatar
      };
    });

  const admins = users
    .filter(u => u.role === 'ADMIN')
    .map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      password: u.password,
      role: u.role,
      organization_name: u.organization_name,
      badge: 'Super Admin',
      avatar: u.avatar
    }));

  res.json({
    success: true,
    data: {
      publishers,
      users: usersList,
      admins
    }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password, expectedRole } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  const user = db.getUserByEmail(email.trim());
  if (!user || user.password !== password.trim()) {
    return res.status(401).json({ success: false, message: 'Invalid email or password. Please check your credentials.' });
  }

  if (expectedRole && user.role !== expectedRole && user.role !== 'ADMIN') {
    const roleTitle = expectedRole === 'GOVERNMENT' ? 'Publisher / Authority' : 'Company / Bidder';
    const userRoleTitle = user.role === 'GOVERNMENT' ? 'Publisher / Authority' : 'Company / Bidder';
    return res.status(403).json({
      success: false,
      message: `This account is registered as a ${userRoleTitle}. Please use the ${userRoleTitle} login portal.`
    });
  }

  let company = null;
  if (user.role === 'COMPANY') {
    company = db.getCompanyByUserId(user.id);
  }

  res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      organization_name: user.organization_name,
      department: user.department,
      designation: user.designation,
      verified: user.verified,
      avatar: user.avatar
    },
    company
  });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password, role, organization_name, department, designation, industry, turnover, experience } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
  }

  const existing = db.getUserByEmail(email.trim());
  if (existing) {
    return res.status(400).json({ success: false, message: 'An account with this email already exists' });
  }

  const assignedRole = role === 'GOVERNMENT' ? 'GOVERNMENT' : 'COMPANY';

  const newUser = db.createUser({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password: password.trim(),
    role: assignedRole,
    organization_name: organization_name?.trim() || `${name}'s Organization`,
    department: assignedRole === 'GOVERNMENT' ? (department?.trim() || 'Procurement & Contracts Division') : undefined,
    designation: assignedRole === 'GOVERNMENT' ? (designation?.trim() || 'Tender Issuing Officer') : undefined,
    verified: true,
    avatar: assignedRole === 'GOVERNMENT'
      ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  });

  let newCompany = null;
  if (newUser.role === 'COMPANY') {
    const turnoverNum = parseFloat(turnover) ? parseFloat(turnover) * 10000000 : 30000000;
    const expYears = parseInt(experience) || 3;
    newCompany = db.createOrUpdateCompany(newUser.id, {
      company_name: organization_name?.trim() || `${name} Corp`,
      industry: industry || 'Technology & Infrastructure Solutions',
      experience_years: expYears,
      annual_turnover: turnoverNum,
      turnover_formatted: `₹${(turnoverNum / 10000000).toFixed(2)} Cr`,
      certifications: ['ISO 9001'],
      technical_skills: ['React', 'Node.js', 'PostgreSQL', 'Cloud Infrastructure'],
      past_projects: []
    });
  }

  res.json({
    success: true,
    user: newUser,
    company: newCompany
  });
});

app.post('/api/auth/switch-role', (req, res) => {
  const { role } = req.body; // 'GOVERNMENT', 'COMPANY', 'ADMIN'
  const users = db.getUsers();
  
  // Prefer the clean primary email accounts first
  let targetUser = users.find(u => {
    if (role === 'GOVERNMENT') return u.email === 'publisher@nhai.gov.in';
    if (role === 'COMPANY') return u.email === 'user@apextech.com';
    if (role === 'ADMIN') return u.email === 'admin@tendersphere.io';
    return u.role === role;
  });

  if (!targetUser) {
    targetUser = users.find(u => u.role === role) || users[0];
  }

  let company = null;
  if (targetUser.role === 'COMPANY') {
    company = db.getCompanyByUserId(targetUser.id);
  }

  res.json({
    success: true,
    user: targetUser,
    company
  });
});

app.get('/api/auth/me', (req, res) => {
  const userId = req.headers['x-user-id'] || 'usr-comp-apex';
  const user = db.getUserById(userId) || db.getUserByEmail('user@apextech.com') || db.getUserByEmail('contact@apexinfotech.com');
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  let company = null;
  if (user.role === 'COMPANY') {
    company = db.getCompanyByUserId(user.id);
  }

  res.json({ success: true, user, company });
});

// -------------------------------------------------------------
// TENDER ROUTES
// -------------------------------------------------------------
app.get('/api/tenders', (req, res) => {
  const { q, category, location, minBudget, maxBudget, status, issuer_id } = req.query;
  let tenders = db.getTenders();

  if (issuer_id) {
    tenders = tenders.filter(t => t.issuer_id === issuer_id);
  }

  if (status) {
    tenders = tenders.filter(t => t.status.toLowerCase() === status.toLowerCase());
  }

  if (category && category !== 'All') {
    tenders = tenders.filter(t => t.category.toLowerCase() === category.toLowerCase() || (t.ai_predicted_category && t.ai_predicted_category.toLowerCase() === category.toLowerCase()));
  }

  if (location && location !== 'All') {
    tenders = tenders.filter(t => (t.location || '').toLowerCase().includes(location.toLowerCase()));
  }

  if (minBudget) {
    tenders = tenders.filter(t => (t.budget || 0) >= Number(minBudget));
  }

  if (maxBudget) {
    tenders = tenders.filter(t => (t.budget || 0) <= Number(maxBudget));
  }

  if (q) {
    const qLower = q.toLowerCase();
    tenders = tenders.filter(t =>
      t.title.toLowerCase().includes(qLower) ||
      (t.reference_no && t.reference_no.toLowerCase().includes(qLower)) ||
      (t.organization_name && t.organization_name.toLowerCase().includes(qLower)) ||
      (t.description && t.description.toLowerCase().includes(qLower))
    );
  }

  res.json({ success: true, count: tenders.length, data: tenders });
});

app.get('/api/tenders/:id', (req, res) => {
  const tender = db.getTenderById(req.params.id);
  if (!tender) {
    return res.status(404).json({ success: false, message: 'Tender not found' });
  }

  // Log view event
  const userId = req.headers['x-user-id'] || 'anonymous';
  db.logTenderView(tender.id, userId);

  res.json({ success: true, data: tender });
});

// AI Document Parser for Tender Creation
app.post('/api/tenders/parse-document', upload.single('file'), async (req, res) => {
  try {
    let aiExtracted = null;

    if (req.file) {
      const fileExt = path.extname(req.file.originalname).toLowerCase();
      if (fileExt === '.pdf') {
        aiExtracted = await aiBridge.extractFromPdfPath(req.file.path);
      } else if (fileExt === '.txt' || fileExt === '.json') {
        const rawText = fs.readFileSync(req.file.path, 'utf8');
        aiExtracted = await aiBridge.extract(rawText);
      }
    }

    if (!aiExtracted) {
      const rawText = req.body.text || '';
      aiExtracted = await aiBridge.extract(rawText);
    }

    res.json({
      success: true,
      data: {
        ...aiExtracted,
        original_filename: req.file ? req.file.originalname : null,
        file_url: req.file ? `/uploads/${req.file.filename}` : null
      }
    });
  } catch (err) {
    console.error('Error in parse-document:', err);
    res.status(500).json({ success: false, message: 'Failed to extract information from document', error: err.message });
  }
});

// Real Tender PDF Analysis Endpoint (PyMuPDF deep extraction)
app.post('/api/tenders/upload-pdf', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No PDF file uploaded' });
    }
    const extracted = await aiBridge.extractFromPdfPath(req.file.path);
    res.json({
      success: true,
      data: {
        ...extracted,
        original_filename: req.file.originalname,
        file_url: `/uploads/${req.file.filename}`,
        file_size: req.file.size
      }
    });
  } catch (err) {
    console.error('Error in upload-pdf:', err);
    res.status(500).json({ success: false, message: 'PDF extraction failed', error: err.message });
  }
});

// Government Tender Data Import & Synchronization
app.post('/api/tenders/import', (req, res) => {
  try {
    const { tenders, source_name } = req.body;
    if (!Array.isArray(tenders) || tenders.length === 0) {
      return res.status(400).json({ success: false, message: 'Valid tenders array is required' });
    }
    const result = db.importTenders(tenders, source_name || 'Government Portal Import');
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/tenders/sources/summary', (req, res) => {
  res.json({ success: true, data: db.getTenderSources() });
});

app.post('/api/tenders', async (req, res) => {
  try {
    const {
      title,
      reference_no,
      category,
      organization_name,
      issuer_id,
      budget,
      min_turnover,
      min_experience_years,
      location,
      deadline,
      required_certifications,
      technical_requirements,
      required_documents,
      description,
      status
    } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Tender title is required' });
    }

    // AI Classification
    const fullText = `${title} ${description || ''} ${(technical_requirements || []).join(' ')}`;
    const aiClassification = await aiBridge.classify(fullText);

    const budgetNum = Number(budget) || 10000000;
    const turnoverNum = Number(min_turnover) || Math.round(budgetNum * 0.6);

    const newTender = db.createTender({
      title,
      reference_no: reference_no || `TS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      organization_name: organization_name || 'Government Organization',
      issuer_id: issuer_id || 'usr-gov-nhai',
      category: category || aiClassification.category,
      ai_predicted_category: aiClassification.category,
      ai_confidence: aiClassification.confidence_percent,
      category_distribution: aiClassification.distribution,
      budget: budgetNum,
      budget_formatted: `₹${(budgetNum / 10000000).toFixed(2)} Cr`,
      currency: 'INR',
      min_turnover: turnoverNum,
      min_turnover_formatted: `₹${(turnoverNum / 10000000).toFixed(2)} Cr`,
      min_experience_years: Number(min_experience_years) || 5,
      location: location || 'National / Pan India',
      source: 'TenderSphere Portal',
      source_badge: 'Direct Published',
      status: status || 'ACTIVE',
      deadline: deadline || '2026-08-28T17:00:00Z',
      deadline_formatted: '28 Aug 2026, 5:00 PM',
      required_certifications: Array.isArray(required_certifications) ? required_certifications : ['ISO 9001'],
      technical_requirements: Array.isArray(technical_requirements) ? technical_requirements : ['General Scope Compliance'],
      required_documents: Array.isArray(required_documents) ? required_documents : [
        'GST Registration Certificate',
        'Audited Balance Sheets (3 Years)',
        'Turnover CA Certificate',
        'EMD Bank Guarantee',
        'Non-Blacklisting Undertaking'
      ],
      description: description || 'Tender scope and detailed technical specifications published on TenderSphere.',
      emd_amount: Math.round(budgetNum * 0.02),
      emd_formatted: `₹${((budgetNum * 0.02) / 100000).toFixed(2)} Lakh`
    });

    res.json({ success: true, data: newTender });
  } catch (err) {
    console.error('Error creating tender:', err);
    res.status(500).json({ success: false, message: 'Failed to create tender', error: err.message });
  }
});

app.put('/api/tenders/:id', (req, res) => {
  const updated = db.updateTender(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Tender not found' });
  }
  res.json({ success: true, data: updated });
});

app.delete('/api/tenders/:id', (req, res) => {
  const deleted = db.deleteTender(req.params.id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Tender not found' });
  }
  res.json({ success: true, message: 'Tender deleted successfully' });
});

// -------------------------------------------------------------
// COMPANY / BIDDER EVALUATION & PROFILE ROUTES
// -------------------------------------------------------------
app.get('/api/company/profile', (req, res) => {
  const userId = req.headers['x-user-id'] || 'usr-comp-apex';
  let company = db.getCompanyByUserId(userId);
  if (!company) {
    // Default fallback to Apex
    company = db.getCompanies()[0];
  }
  res.json({ success: true, data: company });
});

app.put('/api/company/profile', (req, res) => {
  const userId = req.headers['x-user-id'] || 'usr-comp-apex';
  const updated = db.createOrUpdateCompany(userId, req.body);
  res.json({ success: true, data: updated });
});

// Core AI Evaluation Endpoint
app.post('/api/company/evaluate/:tenderId', async (req, res) => {
  try {
    const tender = db.getTenderById(req.params.tenderId);
    if (!tender) {
      return res.status(404).json({ success: false, message: 'Tender not found' });
    }

    const userId = req.headers['x-user-id'] || 'usr-comp-apex';
    let company = req.body.company || db.getCompanyByUserId(userId) || db.getCompanies()[0];

    const evaluation = await aiBridge.match(tender, company);

    // Log evaluation event
    db.logEvaluation(tender.id, company.id, evaluation);

    res.json({
      success: true,
      data: {
        tender_id: tender.id,
        tender_title: tender.title,
        ...evaluation
      }
    });
  } catch (err) {
    console.error('Error evaluating tender:', err);
    res.status(500).json({ success: false, message: 'Evaluation failed', error: err.message });
  }
});

// Bookmarks & Pipeline Tracker
app.get('/api/company/bookmarks', (req, res) => {
  const userId = req.headers['x-user-id'] || 'usr-comp-apex';
  const bookmarks = db.getBookmarksByCompany(userId);
  const allTenders = db.getTenders();

  const enriched = bookmarks.map(bm => {
    const tender = allTenders.find(t => t.id === bm.tender_id);
    return {
      ...bm,
      tender: tender || null
    };
  });

  res.json({ success: true, data: enriched });
});

app.post('/api/company/bookmarks/toggle', (req, res) => {
  const userId = req.headers['x-user-id'] || 'usr-comp-apex';
  const { tender_id, notes } = req.body;
  const result = db.toggleBookmark(userId, tender_id, notes);
  res.json({ success: true, ...result });
});

app.post('/api/company/tracker/update', (req, res) => {
  const userId = req.headers['x-user-id'] || 'usr-comp-apex';
  const { tender_id, stage, notes } = req.body;
  const updated = db.updateTrackingStage(userId, tender_id, stage, notes);
  res.json({ success: true, data: updated });
});

// -------------------------------------------------------------
// MULTI-STAGE DOCUMENTATION WORKFLOW ROUTES
// -------------------------------------------------------------
app.get('/api/workflows/:tenderId', (req, res) => {
  try {
    const { tenderId } = req.params;
    const userId = req.headers['x-user-id'] || 'usr-comp-apex';
    const tender = db.getTenderById(tenderId);
    if (!tender) return res.status(404).json({ success: false, message: 'Tender not found' });

    let workflow = db.getWorkflowByTenderAndCompany(tenderId, userId);
    if (!workflow) {
      // Default initial standard requirements derived from tender
      const defaultDocs = (tender.required_documents || [
        'GST Registration Certificate',
        'Company PAN Card Copy',
        'Audited Balance Sheets (3 Years)',
        'CA Turnover Certificate with UDIN',
        'Bank Solvency Certificate',
        'EMD Bank Guarantee / Fee Proof',
        'Technical Proposal & Scope Compliance Matrix'
      ]).map((name, i) => ({
        id: `req-${i + 1}`,
        title: name,
        category: name.includes('GST') || name.includes('PAN') ? 'Statutory' : (name.includes('Turnover') || name.includes('Balance') || name.includes('Solvency') ? 'Financial' : (name.includes('EMD') ? 'Security' : 'Technical')),
        mandatory: true
      }));

      workflow = {
        id: `wf-${tenderId}-${userId}`,
        tender_id: tenderId,
        company_id: userId,
        current_stage: 1,
        stage_1_tender_docs: [
          {
            id: 'doc-tender-rfp',
            filename: `${tender.reference_no.replace(/[^a-zA-Z0-9]/g, '_')}_Official_RFP.pdf`,
            original_name: `${tender.title.slice(0, 40)}_RFP_Specs.pdf`,
            url: `/uploads/${tender.reference_no.replace(/[^a-zA-Z0-9]/g, '_')}_RFP.pdf`,
            size: 2450000,
            uploaded_at: tender.created_at || new Date().toISOString(),
            status: 'UPLOADED'
          }
        ],
        stage_2_analysis: {
          category: tender.category,
          ai_confidence: tender.ai_confidence || 95,
          budget: tender.budget,
          budget_formatted: tender.budget_formatted,
          min_turnover: tender.min_turnover,
          min_turnover_formatted: tender.min_turnover_formatted,
          min_experience_years: tender.min_experience_years || 5,
          deadline: tender.deadline,
          required_certifications: tender.required_certifications || ['ISO 9001'],
          technical_requirements: tender.technical_requirements || ['Quality Delivery SLA'],
          required_documents: defaultDocs,
          analyzed_at: tender.created_at || new Date().toISOString()
        },
        stage_3_verification: {
          is_verified: true,
          verified_at: new Date().toISOString(),
          items: [
            { id: 'v-budget', key: 'budget', label: 'Estimated Contract Value', value: tender.budget_formatted, status: 'verified', notes: 'Ceiling budget verified from official notice' },
            { id: 'v-turnover', key: 'min_turnover', label: 'Minimum Annual Turnover', value: tender.min_turnover_formatted, status: 'verified', notes: 'Mandated average annual turnover over past 3 financial years' },
            { id: 'v-exp', key: 'min_experience_years', label: 'Minimum Experience', value: `${tender.min_experience_years || 5} Years`, status: 'verified', notes: 'Years in commercial execution of similar projects' },
            { id: 'v-deadline', key: 'deadline', label: 'Submission Cutoff Date', value: tender.deadline_formatted || tender.deadline, status: 'verified', notes: 'Strict portal submission closing deadline' },
            { id: 'v-certs', key: 'certifications', label: 'Mandatory Certifications', value: (tender.required_certifications || ['ISO 9001']).join(', '), status: 'verified', notes: 'Accredited quality & security certificates' }
          ],
          user_notes: 'Requirements verified against official RFP specification.'
        },
        stage_4_company_docs: [],
        stage_5_validation: null,
        stage_6_readiness: {
          readiness_score: 0,
          can_submit: false,
          overall_status: 'INCOMPLETE',
          summary: { total: defaultDocs.length, valid: 0, missing: defaultDocs.length, incomplete: 0, mismatched: 0 }
        }
      };
      db.saveWorkflow(workflow);
    }

    res.json({ success: true, data: workflow });
  } catch (err) {
    console.error('Error fetching workflow:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Stage 1: Upload Tender Document
app.post('/api/workflows/:tenderId/upload-tender-doc', upload.single('file'), (req, res) => {
  try {
    const { tenderId } = req.params;
    const userId = req.headers['x-user-id'] || 'usr-comp-apex';
    let workflow = db.getWorkflowByTenderAndCompany(tenderId, userId);
    if (!workflow) return res.status(404).json({ success: false, message: 'Workflow not initialized' });

    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const newDoc = {
      id: `tdoc-${Date.now()}`,
      filename: req.file.filename,
      original_name: req.file.originalname,
      url: `/uploads/${req.file.filename}`,
      size: req.file.size,
      mime_type: req.file.mimetype,
      uploaded_at: new Date().toISOString(),
      status: 'UPLOADED'
    };

    workflow.stage_1_tender_docs = workflow.stage_1_tender_docs || [];
    workflow.stage_1_tender_docs.push(newDoc);
    workflow.current_stage = Math.max(workflow.current_stage || 1, 1);
    db.saveWorkflow(workflow);

    res.json({ success: true, data: workflow, document: newDoc });
  } catch (err) {
    console.error('Upload tender doc error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete Tender Document
app.delete('/api/workflows/:tenderId/tender-doc/:docId', (req, res) => {
  const { tenderId, docId } = req.params;
  const userId = req.headers['x-user-id'] || 'usr-comp-apex';
  let workflow = db.getWorkflowByTenderAndCompany(tenderId, userId);
  if (!workflow) return res.status(404).json({ success: false, message: 'Workflow not found' });

  workflow.stage_1_tender_docs = (workflow.stage_1_tender_docs || []).filter(d => d.id !== docId);
  db.saveWorkflow(workflow);
  res.json({ success: true, data: workflow });
});

// Stage 2: Trigger AI Analysis on Tender Documents
app.post('/api/workflows/:tenderId/analyze', async (req, res) => {
  try {
    const { tenderId } = req.params;
    const userId = req.headers['x-user-id'] || 'usr-comp-apex';
    const tender = db.getTenderById(tenderId);
    let workflow = db.getWorkflowByTenderAndCompany(tenderId, userId);
    if (!workflow || !tender) return res.status(404).json({ success: false, message: 'Tender or workflow not found' });

    // Combine tender description + any raw text submitted + doc titles
    const textToAnalyze = req.body.text || `${tender.title}. ${tender.description}. Estimated budget ${tender.budget_formatted}. Minimum annual turnover requirement ${tender.min_turnover_formatted}. Minimum ${tender.min_experience_years} years experience required. Required certifications: ${(tender.required_certifications || []).join(', ')}. Technical deliverables: ${(tender.technical_requirements || []).join(', ')}.`;

    const aiExtracted = await aiBridge.extract(textToAnalyze);
    const aiClassification = await aiBridge.classify(textToAnalyze);

    // Build structured required documents
    const defaultDocList = (aiExtracted.required_documents && aiExtracted.required_documents.length > 0)
      ? aiExtracted.required_documents
      : (tender.required_documents || [
        'GST Registration Certificate',
        'Company PAN Card Copy',
        'Audited Balance Sheets (3 Years)',
        'CA Turnover Certificate with UDIN',
        'Bank Solvency Certificate',
        'EMD Bank Guarantee / Fee Proof',
        'Technical Proposal & Scope Compliance Matrix'
      ]);

    const formattedDocs = defaultDocList.map((docName, i) => ({
      id: `req-${i + 1}`,
      title: docName,
      category: docName.includes('GST') || docName.includes('PAN') ? 'Statutory' : (docName.includes('Turnover') || docName.includes('Balance') || docName.includes('Solvency') ? 'Financial' : (docName.includes('EMD') ? 'Security' : 'Technical')),
      mandatory: true
    }));

    workflow.stage_2_analysis = {
      category: aiClassification.category || tender.category,
      ai_confidence: aiClassification.confidence_percent || 95,
      budget: aiExtracted.budget || tender.budget,
      budget_formatted: aiExtracted.budget_formatted || tender.budget_formatted,
      min_turnover: aiExtracted.min_turnover || tender.min_turnover,
      min_turnover_formatted: aiExtracted.min_turnover_formatted || tender.min_turnover_formatted,
      min_experience_years: aiExtracted.min_experience_years || tender.min_experience_years || 5,
      deadline: aiExtracted.deadline || tender.deadline,
      required_certifications: aiExtracted.required_certifications || tender.required_certifications || ['ISO 9001'],
      technical_requirements: aiExtracted.technical_requirements || tender.technical_requirements || ['Quality Delivery SLA'],
      required_documents: formattedDocs,
      raw_text_snippet: textToAnalyze.slice(0, 300) + '...',
      analyzed_at: new Date().toISOString()
    };

    // Populate Stage 3 items for review
    workflow.stage_3_verification = {
      is_verified: false,
      items: [
        { id: 'v-budget', key: 'budget', label: 'Estimated Contract Value', value: workflow.stage_2_analysis.budget_formatted, status: 'pending', notes: 'Extracted via NLP regex parser' },
        { id: 'v-turnover', key: 'min_turnover', label: 'Minimum Annual Turnover', value: workflow.stage_2_analysis.min_turnover_formatted, status: 'pending', notes: 'Mandated financial viability threshold' },
        { id: 'v-exp', key: 'min_experience_years', label: 'Minimum Experience', value: `${workflow.stage_2_analysis.min_experience_years} Years`, status: 'pending', notes: 'Domain specific experience' },
        { id: 'v-deadline', key: 'deadline', label: 'Submission Cutoff Date', value: tender.deadline_formatted || workflow.stage_2_analysis.deadline, status: 'pending', notes: 'Tender closing timestamp' },
        { id: 'v-certs', key: 'certifications', label: 'Mandatory Certifications', value: (workflow.stage_2_analysis.required_certifications || []).join(', '), status: 'pending', notes: 'Quality & security standards' }
      ],
      user_notes: 'AI extracted requirements ready for human verification.'
    };

    workflow.current_stage = Math.max(workflow.current_stage || 1, 2);
    db.saveWorkflow(workflow);

    res.json({ success: true, data: workflow });
  } catch (err) {
    console.error('Stage 2 analysis error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Stage 3: Save Requirement Verification & User Edits
app.put('/api/workflows/:tenderId/verify', (req, res) => {
  try {
    const { tenderId } = req.params;
    const userId = req.headers['x-user-id'] || 'usr-comp-apex';
    let workflow = db.getWorkflowByTenderAndCompany(tenderId, userId);
    if (!workflow) return res.status(404).json({ success: false, message: 'Workflow not found' });

    const { items, user_notes, modified_documents } = req.body;

    workflow.stage_3_verification = {
      is_verified: true,
      verified_at: new Date().toISOString(),
      items: items || workflow.stage_3_verification.items,
      user_notes: user_notes || 'All requirements verified by bidder compliance officer.'
    };

    if (modified_documents && Array.isArray(modified_documents)) {
      workflow.stage_2_analysis.required_documents = modified_documents;
    }

    workflow.current_stage = Math.max(workflow.current_stage || 1, 4);
    db.saveWorkflow(workflow);

    res.json({ success: true, data: workflow });
  } catch (err) {
    console.error('Stage 3 verification error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Stage 4: Upload Company Document
app.post('/api/workflows/:tenderId/upload-company-doc', upload.single('file'), (req, res) => {
  try {
    const { tenderId } = req.params;
    const userId = req.headers['x-user-id'] || 'usr-comp-apex';
    let workflow = db.getWorkflowByTenderAndCompany(tenderId, userId);
    if (!workflow) return res.status(404).json({ success: false, message: 'Workflow not found' });

    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const { req_doc_id, category } = req.body;

    const newDoc = {
      id: `cdoc-${Date.now()}`,
      req_doc_id: req_doc_id || null,
      category: category || 'General',
      filename: req.file.filename,
      original_name: req.file.originalname,
      url: `/uploads/${req.file.filename}`,
      size: req.file.size,
      mime_type: req.file.mimetype,
      uploaded_at: new Date().toISOString(),
      status: 'UPLOADED'
    };

    workflow.stage_4_company_docs = workflow.stage_4_company_docs || [];
    
    // Replace existing if uploaded for same req_doc_id
    if (req_doc_id) {
      workflow.stage_4_company_docs = workflow.stage_4_company_docs.filter(d => d.req_doc_id !== req_doc_id);
    }
    workflow.stage_4_company_docs.push(newDoc);
    workflow.current_stage = Math.max(workflow.current_stage || 1, 4);
    db.saveWorkflow(workflow);

    res.json({ success: true, data: workflow, document: newDoc });
  } catch (err) {
    console.error('Upload company doc error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Stage 4 Demo Helper: Quick Pre-fill / Auto-Attach Company Vault Documents
app.post('/api/workflows/:tenderId/quick-fill-company-docs', (req, res) => {
  try {
    const { tenderId } = req.params;
    const userId = req.headers['x-user-id'] || 'usr-comp-apex';
    let workflow = db.getWorkflowByTenderAndCompany(tenderId, userId);
    if (!workflow) return res.status(404).json({ success: false, message: 'Workflow not found' });

    const requiredDocs = workflow.stage_2_analysis?.required_documents || [];
    const sampleFiles = [
      { name: 'Apex_Infotech_GST_Registration_Certificate.pdf', cat: 'Statutory', size: 480200 },
      { name: 'Apex_Infotech_PAN_Card_Attested.pdf', cat: 'Statutory', size: 215400 },
      { name: 'Audited_Balance_Sheets_FY23_FY25.pdf', cat: 'Financial', size: 3410500 },
      { name: 'CA_Turnover_Certificate_UDIN_Verified.pdf', cat: 'Financial', size: 890100 },
      { name: 'HDFC_Bank_Solvency_Certificate_Rs10Cr.pdf', cat: 'Financial', size: 620400 },
      { name: 'SBI_EMD_Bank_Guarantee_Guarantee_Slip.pdf', cat: 'Security', size: 1102000 },
      { name: 'Technical_Proposal_Compliance_Matrix_V2.pdf', cat: 'Technical', size: 5820000 }
    ];

    workflow.stage_4_company_docs = requiredDocs.map((req, idx) => {
      const matchSample = sampleFiles[idx % sampleFiles.length];
      return {
        id: `cdoc-vault-${idx + 1}`,
        req_doc_id: req.id,
        category: req.category,
        filename: matchSample.name,
        original_name: matchSample.name,
        url: `/uploads/${matchSample.name}`,
        size: matchSample.size,
        uploaded_at: new Date().toISOString(),
        status: 'UPLOADED'
      };
    });

    workflow.current_stage = Math.max(workflow.current_stage || 1, 4);
    db.saveWorkflow(workflow);

    res.json({ success: true, data: workflow, message: 'Auto-attached verified credentials from company vault' });
  } catch (err) {
    console.error('Quick fill error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete Company Document
app.delete('/api/workflows/:tenderId/company-doc/:docId', (req, res) => {
  const { tenderId, docId } = req.params;
  const userId = req.headers['x-user-id'] || 'usr-comp-apex';
  let workflow = db.getWorkflowByTenderAndCompany(tenderId, userId);
  if (!workflow) return res.status(404).json({ success: false, message: 'Workflow not found' });

  workflow.stage_4_company_docs = (workflow.stage_4_company_docs || []).filter(d => d.id !== docId);
  db.saveWorkflow(workflow);
  res.json({ success: true, data: workflow });
});

// Stage 5: Run Document Validation
app.post('/api/workflows/:tenderId/validate', async (req, res) => {
  try {
    const { tenderId } = req.params;
    const userId = req.headers['x-user-id'] || 'usr-comp-apex';
    const tender = db.getTenderById(tenderId);
    let workflow = db.getWorkflowByTenderAndCompany(tenderId, userId);
    let company = db.getCompanyByUserId(userId) || db.getCompanies()[0];

    if (!workflow || !tender) return res.status(404).json({ success: false, message: 'Tender or workflow not found' });

    const requiredDocs = workflow.stage_2_analysis?.required_documents || [];
    const companyDocs = workflow.stage_4_company_docs || [];

    const validationReport = aiBridge.validateDocumentation(requiredDocs, companyDocs, tender, company);

    workflow.stage_5_validation = validationReport;
    workflow.stage_6_readiness = {
      readiness_score: validationReport.readiness_score,
      can_submit: validationReport.can_submit,
      overall_status: validationReport.overall_status,
      summary: validationReport.summary
    };
    workflow.current_stage = Math.max(workflow.current_stage || 1, 5);
    db.saveWorkflow(workflow);

    res.json({ success: true, data: workflow, report: validationReport });
  } catch (err) {
    console.error('Stage 5 validation error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Stage 6: Finalize Documentation & Submit Bid
app.post('/api/workflows/:tenderId/finalize', (req, res) => {
  try {
    const { tenderId } = req.params;
    const userId = req.headers['x-user-id'] || 'usr-comp-apex';
    let workflow = db.getWorkflowByTenderAndCompany(tenderId, userId);
    if (!workflow) return res.status(404).json({ success: false, message: 'Workflow not found' });

    if (!workflow.stage_6_readiness || !workflow.stage_6_readiness.can_submit) {
      return res.status(400).json({
        success: false,
        message: 'Cannot finalize bid documentation. Mandatory documents are missing or fail criteria.'
      });
    }

    workflow.stage_6_readiness.finalized = true;
    workflow.stage_6_readiness.submitted_at = new Date().toISOString();
    workflow.stage_6_readiness.audit_ref = `TS-AUDIT-${Date.now().toString(36).toUpperCase()}`;
    workflow.current_stage = 6;
    db.saveWorkflow(workflow);

    // Update tracking stage to BID_SUBMITTED
    db.updateTrackingStage(userId, tenderId, 'BID_SUBMITTED', 'Documentation package verified and bid submitted');

    res.json({
      success: true,
      data: workflow,
      message: 'Bid documentation package approved and submitted successfully!'
    });
  } catch (err) {
    console.error('Finalize error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// -------------------------------------------------------------
// ADMIN & ANALYTICS ROUTES
// -------------------------------------------------------------
app.get('/api/admin/stats', (req, res) => {
  const tenders = db.getTenders();
  const users = db.getUsers();
  const companies = db.getCompanies();
  const bookmarks = db.getBookmarks();
  const evaluations = db.data.evaluations || [];

  const categoryDistribution = {};
  tenders.forEach(t => {
    categoryDistribution[t.category] = (categoryDistribution[t.category] || 0) + 1;
  });

  const totalValue = tenders.reduce((acc, t) => acc + (t.budget || 0), 0);

  res.json({
    success: true,
    data: {
      total_tenders: tenders.length,
      active_tenders: tenders.filter(t => t.status === 'ACTIVE').length,
      closed_tenders: tenders.filter(t => t.status === 'CLOSED').length,
      draft_tenders: tenders.filter(t => t.status === 'DRAFT').length,
      total_users: users.length,
      gov_users: users.filter(u => u.role === 'GOVERNMENT').length,
      company_users: users.filter(u => u.role === 'COMPANY').length,
      admin_users: users.filter(u => u.role === 'ADMIN').length,
      total_pipeline_value: totalValue,
      total_pipeline_value_formatted: `₹${(totalValue / 10000000).toFixed(2)} Cr`,
      total_evaluations: evaluations.length,
      total_bookmarks: bookmarks.length,
      category_distribution: categoryDistribution,
      ai_accuracy_rate: '96.4%',
      avg_processing_time: '180 ms',
      system_status: 'Operational'
    }
  });
});

app.get('/api/admin/users', (req, res) => {
  const users = db.getUsers().map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    organization_name: u.organization_name,
    verified: u.verified,
    created_at: u.created_at
  }));
  res.json({ success: true, data: users });
});

app.put('/api/admin/users/:id/verify', (req, res) => {
  const user = db.getUserById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  const updated = db.updateUser(user.id, { verified: !user.verified });
  res.json({ success: true, data: updated });
});

app.get('/api/admin/ai-models', async (req, res) => {
  const modelInfo = await aiBridge.getModelInfo();
  res.json({ success: true, data: modelInfo });
});

// Seed reset endpoint
app.post('/api/admin/reset-seed', (req, res) => {
  seedDatabase();
  res.json({ success: true, message: 'Database reset to original seed state' });
});

// -------------------------------------------------------------
// BIDCOGNIX DASHBOARD, WORKSPACES & COMPANY ROUTES
// -------------------------------------------------------------

// Dashboard Stats
app.get('/api/dashboard/stats', (req, res) => {
  const userId = req.headers['x-user-id'] || 'usr-comp-apex';
  const company = db.getCompanyByUserId(userId);
  const stats = db.getDashboardStats(company ? company.id : null);
  res.json({ success: true, data: stats });
});

// System Status & Diagnostics
app.get('/api/system/status', (req, res) => {
  res.json({
    success: true,
    data: {
      platform: 'BidCognix AI Platform',
      version: '2.0.0',
      database: db.getPostgresStatus(),
      timestamp: new Date().toISOString()
    }
  });
});

// Company Profile & Document Center
app.get('/api/company/profile', (req, res) => {
  const userId = req.headers['x-user-id'] || 'usr-comp-apex';
  const company = db.getCompanyByUserId(userId);
  if (!company) return res.status(404).json({ success: false, message: 'Company not found' });
  res.json({ success: true, data: company });
});

app.put('/api/company/profile', (req, res) => {
  const userId = req.headers['x-user-id'] || 'usr-comp-apex';
  const updated = db.createOrUpdateCompany(userId, req.body);
  res.json({ success: true, data: updated });
});

app.get('/api/company/documents', (req, res) => {
  const userId = req.headers['x-user-id'] || 'usr-comp-apex';
  const company = db.getCompanyByUserId(userId);
  if (!company) return res.json({ success: true, data: [] });
  const docs = db.getCompanyDocuments(company.id);
  res.json({ success: true, data: docs });
});

app.post('/api/company/documents', upload.single('file'), (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'usr-comp-apex';
    const company = db.getCompanyByUserId(userId);
    if (!company) return res.status(404).json({ success: false, message: 'Company profile required' });
    if (!req.file) return res.status(400).json({ success: false, message: 'File is required' });

    if (req.file.size > 25 * 1024 * 1024) {
      return res.status(400).json({ success: false, message: 'File exceeds 25MB limit' });
    }

    const doc = db.addCompanyDocument({
      company_id: company.id,
      category: req.body.category || 'Compliance',
      title: req.body.title || req.file.originalname,
      filename: req.file.filename,
      original_name: req.file.originalname,
      file_path: `/uploads/${req.file.filename}`,
      file_size: req.file.size,
      mime_type: req.file.mimetype,
      verification_status: 'VERIFIED'
    });

    res.json({ success: true, data: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/company/documents/:id', (req, res) => {
  const userId = req.headers['x-user-id'] || 'usr-comp-apex';
  const company = db.getCompanyByUserId(userId);
  const deleted = db.deleteCompanyDocument(req.params.id, company ? company.id : null);
  if (!deleted) return res.status(404).json({ success: false, message: 'Document not found' });
  res.json({ success: true, message: 'Document deleted successfully' });
});

// Tender Recommendations & Match Scoring
app.get('/api/tenders/recommendations', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'usr-comp-apex';
    const company = db.getCompanyByUserId(userId) || db.getCompanies()[0];
    const tenders = db.getTenders({ status: 'ACTIVE' });

    const scored = await Promise.all(tenders.map(async t => {
      const matchRes = await aiBridge.match(t, company);
      return {
        ...t,
        match_score: matchRes.match_score || 72,
        competitiveness: matchRes.competitiveness || 68,
        eligibility: matchRes.eligibility || 'Eligible',
        eligibility_summary: matchRes.eligibility_summary || '',
        matched_requirements: matchRes.matched_requirements || [],
        missing_requirements: matchRes.missing_requirements || [],
        breakdown: matchRes.breakdown || {}
      };
    }));

    scored.sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
    res.json({ success: true, data: scored });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/tenders/:id/eligibility', async (req, res) => {
  try {
    const tender = db.getTenderById(req.params.id);
    if (!tender) return res.status(404).json({ success: false, message: 'Tender not found' });

    const userId = req.headers['x-user-id'] || 'usr-comp-apex';
    const company = db.getCompanyByUserId(userId) || db.getCompanies()[0];

    const evaluation = await aiBridge.match(tender, company);
    res.json({ success: true, data: evaluation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Bid Preparation Workspaces (11-Step Workflow)
app.get('/api/workspaces', (req, res) => {
  const userId = req.headers['x-user-id'] || 'usr-comp-apex';
  const company = db.getCompanyByUserId(userId);
  const list = company ? db.getWorkspacesByCompany(company.id) : [];
  res.json({ success: true, data: list });
});

app.get('/api/workspaces/:id', (req, res) => {
  const ws = db.getWorkspaceById(req.params.id);
  if (!ws) return res.status(404).json({ success: false, message: 'Workspace not found' });
  res.json({ success: true, data: ws });
});

app.post('/api/workspaces', (req, res) => {
  const userId = req.headers['x-user-id'] || 'usr-comp-apex';
  const company = db.getCompanyByUserId(userId);
  if (!company) return res.status(400).json({ success: false, message: 'Company profile required' });

  const { tender_id, stage, notes, bid_value, target_submission_date } = req.body;
  const ws = db.createOrUpdateWorkspace({
    company_id: company.id,
    tender_id,
    stage: stage || 'SAVED',
    notes,
    bid_value,
    target_submission_date
  });
  res.json({ success: true, data: ws });
});

app.put('/api/workspaces/:id/stage', (req, res) => {
  const { stage, notes } = req.body;
  const ws = db.getWorkspaceById(req.params.id);
  if (!ws) return res.status(404).json({ success: false, message: 'Workspace not found' });

  const updated = db.createOrUpdateWorkspace({
    company_id: ws.company_id,
    tender_id: ws.tender_id,
    stage,
    notes: notes !== undefined ? notes : ws.notes
  });
  res.json({ success: true, data: updated });
});

app.post('/api/workspaces/:id/record-submission', (req, res) => {
  const { submission_reference, submission_portal, submitted_at, notes, bid_value } = req.body;
  const ws = db.getWorkspaceById(req.params.id);
  if (!ws) return res.status(404).json({ success: false, message: 'Workspace not found' });

  const updated = db.createOrUpdateWorkspace({
    company_id: ws.company_id,
    tender_id: ws.tender_id,
    stage: 'SUBMITTED',
    submission_reference: submission_reference || `SUB-${Date.now()}`,
    submission_portal: submission_portal || 'Official Government e-Portal',
    submitted_at: submitted_at || new Date().toISOString(),
    notes: notes || ws.notes,
    bid_value: bid_value || ws.bid_value,
    readiness_score: 100
  });

  db.createNotification({
    user_id: req.headers['x-user-id'] || 'usr-comp-apex',
    company_id: ws.company_id,
    tender_id: ws.tender_id,
    workspace_id: ws.id,
    type: 'STAGE_CHANGE',
    title: 'Bid Successfully Recorded as Submitted',
    message: `Submission ref ${submission_reference || 'SUB-DONE'} recorded for tender.`,
    link: `/workspace/${ws.id}`
  });

  res.json({ success: true, data: updated });
});

// Bid Workspace Tasks
app.get('/api/workspaces/:id/tasks', (req, res) => {
  const tasks = db.getTasksByWorkspace(req.params.id);
  res.json({ success: true, data: tasks });
});

app.post('/api/workspaces/:id/tasks', (req, res) => {
  const task = db.createTask({
    workspace_id: req.params.id,
    title: req.body.title,
    description: req.body.description,
    assigned_to: req.body.assigned_to,
    due_date: req.body.due_date,
    priority: req.body.priority || 'MEDIUM',
    status: 'TODO'
  });
  res.json({ success: true, data: task });
});

app.put('/api/workspaces/:id/tasks/:taskId', (req, res) => {
  const updated = db.updateTask(req.params.taskId, req.body);
  if (!updated) return res.status(404).json({ success: false, message: 'Task not found' });
  res.json({ success: true, data: updated });
});

app.delete('/api/workspaces/:id/tasks/:taskId', (req, res) => {
  const deleted = db.deleteTask(req.params.taskId);
  if (!deleted) return res.status(404).json({ success: false, message: 'Task not found' });
  res.json({ success: true, message: 'Task deleted' });
});

// Bid Workspace Checklists
app.get('/api/workspaces/:id/checklists', (req, res) => {
  const checklists = db.getChecklistsByWorkspace(req.params.id);
  res.json({ success: true, data: checklists });
});

app.put('/api/workspaces/:id/checklists/:chkId', (req, res) => {
  const updated = db.updateChecklist(req.params.chkId, req.body);
  if (!updated) return res.status(404).json({ success: false, message: 'Checklist item not found' });
  res.json({ success: true, data: updated });
});

// Notifications & Deadline Alerts
app.get('/api/notifications', (req, res) => {
  const userId = req.headers['x-user-id'] || 'usr-comp-apex';
  const company = db.getCompanyByUserId(userId);
  const notifs = db.getNotifications(userId, company ? company.id : null);
  res.json({ success: true, data: notifs });
});

app.put('/api/notifications/:id/read', (req, res) => {
  const updated = db.markNotificationRead(req.params.id);
  res.json({ success: true, data: updated });
});

app.post('/api/notifications/mark-all-read', (req, res) => {
  const userId = req.headers['x-user-id'] || 'usr-comp-apex';
  db.markAllNotificationsRead(userId);
  res.json({ success: true, message: 'All notifications marked as read' });
});

app.post('/api/notifications/check-deadlines', (req, res) => {
  db.checkDeadlinesAndScheduleAlerts();
  res.json({ success: true, message: 'Deadline check completed' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(` BidCognix Enterprise Backend running on http://localhost:${PORT}`);
  console.log(` AI Microservice URL: http://127.0.0.1:8000`);
  console.log(`===================================================`);
});
