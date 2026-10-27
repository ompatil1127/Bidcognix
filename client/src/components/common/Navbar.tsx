import React, { useState } from 'react';
import { User, UserRole, Company } from '../../types';
import { 
  Layers, 
  ChevronDown, 
  Bell, 
  Search, 
  CheckCircle2, 
  Briefcase,
  Building,
  ShieldAlert,
  LogOut
} from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  currentCompany: Company | null;
  onRoleSwitch: (role: UserRole) => void;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  activePage: string;
  unreadAlertsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  currentCompany,
  onRoleSwitch,
  onNavigate,
  onLogout,
  activePage,
  unreadAlertsCount = 0
}) => {
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const roleLabels = {
    GOVERNMENT: {
      title: 'Government',
      subtitle: currentUser?.organization_name || 'NHAI',
      badge: 'Gov Officer',
      color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
    },
    COMPANY: {
      title: 'Company',
      subtitle: currentCompany?.company_name || 'Apex Infotech',
      badge: 'Bidder',
      color: 'bg-brand-500/10 text-brand-400 border-brand-500/30'
    },
    ADMIN: {
      title: 'Admin',
      subtitle: 'BidCognix Platform',
      badge: 'Admin',
      color: 'bg-purple-500/10 text-purple-400 border-purple-500/30'
    }
  };

  const currentRole = currentUser?.role || 'COMPANY';
  const roleInfo = roleLabels[currentRole];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-6">
          <button 
            onClick={() => onNavigate(currentRole === 'GOVERNMENT' ? 'gov-dashboard' : currentRole === 'ADMIN' ? 'admin-dashboard' : 'home')}
            className="flex items-center gap-2.5 group text-left focus:outline-none"
          >
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 shadow-md shadow-brand-500/25">
              <Layers className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight text-white">
                Bid<span className="text-brand-400">Cognix</span>
              </span>
            </div>
          </button>
        </div>

        {/* Center: Search Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input 
              type="text"
              onFocus={() => {
                if (currentRole === 'COMPANY' && activePage !== 'find-tenders') {
                  onNavigate('find-tenders');
                }
              }}
              placeholder="Search tenders by keyword, work type, or location..."
              className="w-full rounded-xl bg-slate-900 border border-slate-800 py-1.5 pl-10 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:border-brand-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Right: Quick Role Switcher + Alerts + Profile + Logout */}
        <div className="flex items-center gap-3">
          
          {/* Quick Demo Switcher */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-left text-xs transition-all hover:bg-slate-800 focus:outline-none"
            >
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-400">Role:</span>
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${roleInfo.color}`}>
                    {roleInfo.badge}
                  </span>
                </div>
                <span className="font-semibold text-white truncate max-w-[120px] text-xs">
                  {currentUser?.name || 'Demo User'}
                </span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-700 bg-slate-900 p-2 shadow-2xl z-50 animate-in fade-in">
                <div className="px-3 py-1.5 border-b border-slate-800">
                  <p className="text-[11px] font-bold text-slate-300">Switch Workspace Role</p>
                  <p className="text-[10px] text-slate-500">Test the 3 user workflows:</p>
                </div>

                <div className="space-y-1 mt-1">
                  <button
                    onClick={() => {
                      onRoleSwitch('COMPANY');
                      setRoleDropdownOpen(false);
                      onNavigate('home');
                    }}
                    className={`w-full flex items-center gap-2.5 rounded-xl p-2 text-left text-xs transition-all ${
                      currentRole === 'COMPANY' ? 'bg-brand-600/20 text-brand-300 font-bold' : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <Briefcase className="h-4 w-4 text-brand-400" />
                    <div className="flex-1">
                      <p className="text-xs">Company / Business</p>
                      <p className="text-[10px] text-slate-500 font-normal">Apex Infotech Solutions</p>
                    </div>
                    {currentRole === 'COMPANY' && <CheckCircle2 className="h-3.5 w-3.5 text-brand-400" />}
                  </button>

                  <button
                    onClick={() => {
                      onRoleSwitch('GOVERNMENT');
                      setRoleDropdownOpen(false);
                      onNavigate('gov-dashboard');
                    }}
                    className={`w-full flex items-center gap-2.5 rounded-xl p-2 text-left text-xs transition-all ${
                      currentRole === 'GOVERNMENT' ? 'bg-emerald-600/20 text-emerald-300 font-bold' : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <Building className="h-4 w-4 text-emerald-400" />
                    <div className="flex-1">
                      <p className="text-xs">Government / Org</p>
                      <p className="text-[10px] text-slate-500 font-normal">National Highways Authority</p>
                    </div>
                    {currentRole === 'GOVERNMENT' && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
                  </button>

                  <button
                    onClick={() => {
                      onRoleSwitch('ADMIN');
                      setRoleDropdownOpen(false);
                      onNavigate('admin-dashboard');
                    }}
                    className={`w-full flex items-center gap-2.5 rounded-xl p-2 text-left text-xs transition-all ${
                      currentRole === 'ADMIN' ? 'bg-purple-600/20 text-purple-300 font-bold' : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <ShieldAlert className="h-4 w-4 text-purple-400" />
                    <div className="flex-1">
                      <p className="text-xs">Administrator</p>
                      <p className="text-[10px] text-slate-500 font-normal">Super Admin Console</p>
                    </div>
                    {currentRole === 'ADMIN' && <CheckCircle2 className="h-3.5 w-3.5 text-purple-400" />}
                  </button>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => {
                      setRoleDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2 rounded-xl p-2 text-left text-xs text-rose-400 hover:bg-rose-950/30 transition-all font-semibold"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out to Login Screen</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Alerts button */}
          <button 
            onClick={() => onNavigate('alerts')}
            className={`relative rounded-xl border p-2 transition-all ${
              activePage === 'alerts'
                ? 'bg-brand-600 text-white border-brand-500'
                : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
            title="Alerts & Reminders"
          >
            <Bell className="h-4 w-4" />
            {unreadAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-500 px-1 text-[9px] font-bold text-white shadow-sm ring-2 ring-slate-950 animate-pulse">
                {unreadAlertsCount}
              </span>
            )}
          </button>

          {/* Profile button */}
          <button
            onClick={() => onNavigate('user-profile')}
            className={`flex items-center gap-2 rounded-xl p-1 transition-all ${
              activePage === 'user-profile' ? 'ring-2 ring-brand-500' : ''
            }`}
            title="My Profile"
          >
            <img 
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} 
              alt={currentUser?.name}
              className="h-8 w-8 rounded-xl object-cover border border-slate-700"
            />
          </button>

          {/* Sign Out Button */}
          <button
            onClick={onLogout}
            className="rounded-xl border border-slate-800 bg-slate-900 p-2 text-slate-400 hover:text-rose-400 hover:border-rose-900 transition-all"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </button>

        </div>

      </div>
    </header>
  );
};
