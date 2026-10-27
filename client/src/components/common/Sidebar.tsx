import React from 'react';
import { UserRole } from '../../types';
import { 
  Home,
  Search, 
  ClipboardList, 
  Building2, 
  Bell, 
  User as UserIcon,
  LayoutDashboard,
  PlusCircle,
  FileSpreadsheet,
  Users,
  Building,
  Cpu,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

interface SidebarProps {
  currentRole: UserRole;
  activePage: string;
  onNavigate: (page: string) => void;
  bookmarksCount?: number;
  unreadAlertsCount?: number;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  count?: number;
  highlight?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  activePage,
  onNavigate,
  bookmarksCount = 0,
  unreadAlertsCount = 2
}) => {
  // Company Navigation: Home, Find Tenders, My Tenders, My Company, Alerts, Profile
  const companyNav: NavItem[] = [
    { id: 'home', label: 'Home', icon: <Home className="h-4 w-4" /> },
    { id: 'find-tenders', label: 'Find Tenders', icon: <Search className="h-4 w-4" />, badge: 'New' },
    { id: 'my-tenders', label: 'My Tenders', icon: <ClipboardList className="h-4 w-4" />, count: bookmarksCount },
    { id: 'my-company', label: 'My Company', icon: <Building2 className="h-4 w-4" /> },
    { id: 'alerts', label: 'Alerts', icon: <Bell className="h-4 w-4" />, count: unreadAlertsCount },
    { id: 'user-profile', label: 'Profile', icon: <UserIcon className="h-4 w-4" /> },
  ];

  // Government Navigation: Dashboard, Create Tender, My Tenders, Applications, Organization
  const govNav: NavItem[] = [
    { id: 'gov-dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
    { id: 'create-tender', label: 'Create Tender', icon: <PlusCircle className="h-4 w-4" />, highlight: true },
    { id: 'gov-my-tenders', label: 'My Tenders', icon: <FileSpreadsheet className="h-4 w-4" /> },
    { id: 'gov-applications', label: 'Applications', icon: <Users className="h-4 w-4" /> },
    { id: 'gov-organization', label: 'Organization', icon: <Building className="h-4 w-4" /> },
  ];

  // Admin Navigation
  const adminNav: NavItem[] = [
    { id: 'admin-dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
    { id: 'admin-users', label: 'Manage Users', icon: <Users className="h-4 w-4" /> },
    { id: 'admin-models', label: 'AI Settings', icon: <Cpu className="h-4 w-4" />, badge: 'Active' },
  ];

  const navItems: NavItem[] = currentRole === 'GOVERNMENT' ? govNav : currentRole === 'ADMIN' ? adminNav : companyNav;

  return (
    <aside className="w-60 border-r border-slate-800 bg-slate-950/80 p-3 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-4rem)]">
      <div className="space-y-4">
        
        {/* Role Workspace Banner */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Account Type</span>
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <p className="mt-0.5 text-xs font-bold text-white truncate">
            {currentRole === 'GOVERNMENT' ? '🏛️ Government Officer' : currentRole === 'ADMIN' ? '🛡️ Administrator' : '🏢 Company / Bidder'}
          </p>
        </div>

        {/* Nav list */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`group w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                } ${item.highlight && !isActive ? 'border border-brand-500/40 bg-brand-500/10 text-brand-300' : ''}`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-brand-500/15 text-brand-400 border border-brand-500/20'
                  }`}>
                    {item.badge}
                  </span>
                )}

                {item.count !== undefined && item.count > 0 && (
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    isActive ? 'bg-white text-brand-700' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* AI Helper Banner */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-1.5">
          <div className="flex items-center gap-1.5 text-brand-400 text-xs font-bold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>BidCognix AI Active</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            BidCognix scans PDF documents, matches your eligibility, and tracks deadline reminders automatically.
          </p>
        </div>

      </div>

      {/* Footer info */}
      <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
        <span className="font-semibold text-slate-400">BidCognix</span>
        <span className="text-[10px] text-emerald-400 font-mono">v2.4 Enterprise</span>
      </div>
    </aside>
  );
};
