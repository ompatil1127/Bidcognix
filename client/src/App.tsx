import React, { useState, useEffect } from 'react';
import { User, Company, Tender, UserRole } from './types';
import { ApiService } from './services/api';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { LoginPage } from './pages/auth/LoginPage';
import confetti from 'canvas-confetti';

// Company pages
import { CompanyHomePage } from './pages/company/CompanyHomePage';
import { FindTendersPage } from './pages/company/FindTendersPage';
import { TrackedBidsPage } from './pages/company/TrackedBidsPage';
import { MyCompanyPage } from './pages/company/MyCompanyPage';
import { AlertsPage } from './pages/company/AlertsPage';
import { TenderDetailPage } from './pages/company/TenderDetailPage';
import { UserProfilePage } from './pages/company/UserProfilePage';

// Government pages
import { GovDashboardPage } from './pages/government/GovDashboardPage';
import { CreateTenderPage } from './pages/government/CreateTenderPage';
import { ManageTendersPage } from './pages/government/ManageTendersPage';
import { GovApplicationsPage } from './pages/government/GovApplicationsPage';
import { GovOrgProfilePage } from './pages/government/GovOrgProfilePage';

// Admin pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { ManageUsersPage } from './pages/admin/ManageUsersPage';
import { AIModelMonitorPage } from './pages/admin/AIModelMonitorPage';

import { Key, ArrowRight, X, Sparkles, ShieldCheck } from 'lucide-react';

function App() {
  // Authentication & Profile State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalPortal, setAuthModalPortal] = useState<'PUBLISHER' | 'USER' | 'ADMIN'>('USER');
  const [credentialsBannerOpen, setCredentialsBannerOpen] = useState(true);

  // Navigation State
  const [activePage, setActivePage] = useState<string>('home');
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);

  // Badges & Counters
  const [unreadAlertsCount, setUnreadAlertsCount] = useState<number>(0);
  const [bookmarksCount, setBookmarksCount] = useState<number>(0);

  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    // 1. Try to restore active user session
    try {
      const authData = await ApiService.getMe();
      if (authData && authData.user) {
        setCurrentUser(authData.user);
        setCurrentCompany(authData.company);
        if (authData.user.role === 'GOVERNMENT') {
          setActivePage('gov-dashboard');
        } else if (authData.user.role === 'ADMIN') {
          setActivePage('admin-dashboard');
        } else {
          setActivePage('home');
        }
      } else {
        // Fallback default: set initial demo company user
        handleRoleSwitch('COMPANY');
      }
    } catch (e) {
      handleRoleSwitch('COMPANY');
    }

    // 2. Fetch initial notification count and bookmarks count
    refreshCounters();
  };

  const refreshCounters = async () => {
    try {
      const notifs = await ApiService.getNotifications();
      if (Array.isArray(notifs)) {
        const unread = notifs.filter(n => !n.is_read).length;
        setUnreadAlertsCount(unread);
      }
    } catch (e) {
      // Ignore
    }

    try {
      const bookmarks = await ApiService.getBookmarks();
      if (Array.isArray(bookmarks)) {
        setBookmarksCount(bookmarks.length);
      }
    } catch (e) {
      // Ignore
    }
  };

  const handleRoleSwitch = async (role: UserRole) => {
    if (role === 'GOVERNMENT') {
      try {
        const res = await ApiService.login('publisher@nhai.gov.in', 'publisher123', 'GOVERNMENT');
        setCurrentUser(res.user);
        setCurrentCompany(null);
        setActivePage('gov-dashboard');
      } catch (err) {
        setCurrentUser({
          id: 'usr-gov-nhai',
          name: 'Rajesh Sharma',
          email: 'publisher@nhai.gov.in',
          role: 'GOVERNMENT',
          organization_name: 'National Highways & Infrastructure Authority (NHAI)',
          is_verified: true,
          created_at: '2026-01-10T10:00:00Z'
        });
        setCurrentCompany(null);
        setActivePage('gov-dashboard');
      }
    } else if (role === 'ADMIN') {
      try {
        const res = await ApiService.login('admin@bidcognix.ai', 'admin123', 'ADMIN');
        setCurrentUser(res.user);
        setCurrentCompany(null);
        setActivePage('admin-dashboard');
      } catch (err) {
        setCurrentUser({
          id: 'usr-admin-master',
          name: 'Dr. Sarah Mitchell',
          email: 'admin@bidcognix.ai',
          role: 'ADMIN',
          organization_name: 'BidCognix Operations',
          is_verified: true,
          created_at: '2026-01-01T00:00:00Z'
        });
        setCurrentCompany(null);
        setActivePage('admin-dashboard');
      }
    } else {
      // COMPANY
      try {
        const res = await ApiService.login('user@apextech.com', 'user123', 'COMPANY');
        setCurrentUser(res.user);
        setCurrentCompany(res.company);
        setActivePage('home');
      } catch (err) {
        setCurrentUser({
          id: 'usr-company-apex',
          name: 'Ananya Verma',
          email: 'user@apextech.com',
          role: 'COMPANY',
          organization_name: 'Apex Infotech Solutions Pvt Ltd',
          company_id: 'cmp-apex-001',
          is_verified: true,
          created_at: '2026-01-15T09:00:00Z'
        });
        setCurrentCompany({
          id: 'cmp-apex-001',
          user_id: 'usr-company-apex',
          company_name: 'Apex Infotech Solutions Pvt Ltd',
          business_category: 'Technology & Cloud Infrastructure',
          annual_turnover: 150000000,
          annual_turnover_formatted: '₹15.00 Cr',
          experience_years: 7,
          certifications: ['ISO 9001', 'ISO 27001', 'CMMI Level 3', 'GST Verified'],
          technical_skills: ['React', 'Node.js', 'Python', 'PostgreSQL', 'Cloud Infrastructure', 'REST APIs', 'DevOps CI/CD'],
          is_verified: true,
          created_at: '2026-01-15T09:00:00Z',
          updated_at: '2026-10-27T00:00:00Z'
        });
        setActivePage('home');
      }
    }
    refreshCounters();
  };

  const handleLoginSuccess = (user: User, company: Company | null) => {
    setCurrentUser(user);
    setCurrentCompany(company);
    setAuthModalOpen(false);
    if (user.role === 'GOVERNMENT') {
      setActivePage('gov-dashboard');
    } else if (user.role === 'ADMIN') {
      setActivePage('admin-dashboard');
    } else {
      setActivePage('home');
    }
    refreshCounters();
    confetti({ particleCount: 60, spread: 50, origin: { y: 0.2 } });
  };

  const handleLogout = () => {
    ApiService.logout();
    setCurrentUser(null);
    setCurrentCompany(null);
    setAuthModalPortal('USER');
    setAuthModalOpen(true);
  };

  const handleSelectTender = (tender: Tender) => {
    setSelectedTender(tender);
    setActivePage('tender-detail');
  };

  const handleNavigate = (page: string) => {
    setActivePage(page);
    refreshCounters();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentRole = currentUser?.role || 'COMPANY';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-brand-500 selection:text-white">
      
      {/* 0. Demo Credentials Quick Switcher Banner */}
      {credentialsBannerOpen && (
        <aside aria-label="Demo Quick Switcher" className="bg-slate-900 border-b border-slate-800 px-4 py-2 text-xs">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-brand-500/15 text-brand-300 font-mono text-[10px] font-bold border border-brand-500/30 flex items-center gap-1">
                <Key className="w-3 h-3 text-brand-400" />
                OFFICIAL WORKSPACE SWITCHER
              </span>
              <span className="text-slate-400 text-[11px] hidden md:inline">
                Test dual portal functionality with authentic credentials:
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              {/* Publisher switch button */}
              <button
                onClick={() => handleRoleSwitch('GOVERNMENT')}
                className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition-all ${
                  currentRole === 'GOVERNMENT'
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold ring-1 ring-emerald-500/50'
                    : 'bg-slate-800/80 border-slate-700 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <span>🏛️ NHAI Gov Issuer</span>
                <span className="text-[10px] text-slate-500">(publisher@nhai.gov.in)</span>
              </button>

              {/* Bidder switch button */}
              <button
                onClick={() => handleRoleSwitch('COMPANY')}
                className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition-all ${
                  currentRole === 'COMPANY'
                    ? 'bg-brand-950/80 border-brand-500 text-brand-300 font-bold ring-1 ring-brand-500/50'
                    : 'bg-slate-800/80 border-slate-700 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <span>🏢 Apex Infotech Bidder</span>
                <span className="text-[10px] text-slate-500">(user@apextech.com)</span>
              </button>

              {/* Admin switch button */}
              <button
                onClick={() => handleRoleSwitch('ADMIN')}
                className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition-all ${
                  currentRole === 'ADMIN'
                    ? 'bg-purple-950/80 border-purple-500 text-purple-300 font-bold ring-1 ring-purple-500/50'
                    : 'bg-slate-800/80 border-slate-700 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <span>🛡️ Super Admin</span>
              </button>

              <button
                onClick={() => setCredentialsBannerOpen(false)}
                className="text-slate-500 hover:text-white p-1 ml-1"
                title="Dismiss banner"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* 1. Header / Navbar */}
      <Navbar
        currentUser={currentUser}
        currentCompany={currentCompany}
        onRoleSwitch={handleRoleSwitch}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        activePage={activePage}
        unreadAlertsCount={unreadAlertsCount}
      />

      {/* 2. Main Layout Container: Sidebar + Page View */}
      <div className="flex-1 flex w-full">
        <Sidebar
          currentRole={currentRole}
          activePage={activePage}
          onNavigate={handleNavigate}
          bookmarksCount={bookmarksCount}
          unreadAlertsCount={unreadAlertsCount}
        />

        <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8 bg-slate-950 min-h-[calc(100vh-4rem)]">
          <div className="max-w-7xl mx-auto">
            {/* Dynamic Page Router */}
            {currentRole === 'COMPANY' && (
              <>
                {activePage === 'home' && (
                  <CompanyHomePage
                    currentCompany={currentCompany}
                    onNavigate={handleNavigate}
                    onSelectTender={handleSelectTender}
                  />
                )}
                {activePage === 'find-tenders' && (
                  <FindTendersPage
                    currentCompany={currentCompany}
                    onNavigate={handleNavigate}
                    onSelectTender={handleSelectTender}
                  />
                )}
                {activePage === 'my-tenders' && (
                  <TrackedBidsPage
                    onNavigate={handleNavigate}
                    onSelectTender={handleSelectTender}
                  />
                )}
                {activePage === 'my-company' && (
                  <MyCompanyPage
                  currentCompany={currentCompany}
                  onProfileUpdated={(updated) => setCurrentCompany(updated)}
                />
                )}
                {activePage === 'alerts' && (
                  <AlertsPage onNavigate={handleNavigate} />
                )}
                {activePage === 'user-profile' && (
                  <UserProfilePage
                    currentUser={currentUser}
                    currentCompany={currentCompany}
                    onNavigate={handleNavigate}
                  />
                )}
                {activePage === 'tender-detail' && selectedTender && (
                  <TenderDetailPage
                    tender={selectedTender}
                    currentCompany={currentCompany}
                    onBack={() => handleNavigate('find-tenders')}
                    onNavigate={handleNavigate}
                  />
                )}
              </>
            )}

            {currentRole === 'GOVERNMENT' && (
              <>
                {activePage === 'gov-dashboard' && (
                  <GovDashboardPage
                    currentUser={currentUser}
                    onNavigate={handleNavigate}
                    onSelectTender={handleSelectTender}
                  />
                )}
                {activePage === 'create-tender' && (
                  <CreateTenderPage
                    currentUser={currentUser}
                    onNavigate={handleNavigate}
                    onTenderCreated={(t) => {
                      handleSelectTender(t);
                    }}
                  />
                )}
                {activePage === 'gov-my-tenders' && (
                  <ManageTendersPage
                    currentUser={currentUser}
                    onNavigate={handleNavigate}
                    onSelectTender={handleSelectTender}
                  />
                )}
                {activePage === 'gov-applications' && (
                  <GovApplicationsPage
                    onSelectTender={handleSelectTender}
                  />
                )}
                {activePage === 'gov-organization' && (
                  <GovOrgProfilePage
                    currentUser={currentUser}
                  />
                )}
                {activePage === 'tender-detail' && selectedTender && (
                  <TenderDetailPage
                    tender={selectedTender}
                    currentCompany={null}
                    onBack={() => handleNavigate('gov-dashboard')}
                    onNavigate={handleNavigate}
                  />
                )}
              </>
            )}

            {currentRole === 'ADMIN' && (
              <>
                {activePage === 'admin-dashboard' && (
                  <AdminDashboardPage
                    currentUser={currentUser}
                    onNavigate={handleNavigate}
                  />
                )}
                {activePage === 'admin-users' && (
                  <ManageUsersPage />
                )}
                {activePage === 'admin-models' && (
                  <AIModelMonitorPage />
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Login / Switch Account Modal */}
      {authModalOpen && (
        <LoginPage
          initialPortal={authModalPortal}
          onLoginSuccess={handleLoginSuccess}
          onClose={() => setAuthModalOpen(false)}
        />
      )}

    </div>
  );
}
export default App;
