import React from 'react';
import { User, Company } from '../../types';
import { User as UserIcon, Building2, Mail, ShieldCheck, LogOut, CheckCircle2 } from 'lucide-react';

interface UserProfilePageProps {
  currentUser: User | null;
  currentCompany: Company | null;
  onNavigate: (page: string) => void;
}

export const UserProfilePage: React.FC<UserProfilePageProps> = ({
  currentUser,
  currentCompany,
  onNavigate
}) => {
  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          My Account Profile
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Account details and verification credentials.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-5">
        
        <div className="flex items-center gap-4">
          <img 
            src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} 
            alt={currentUser?.name}
            className="h-16 w-16 rounded-2xl object-cover ring-2 ring-brand-500/40"
          />
          <div>
            <h2 className="text-lg font-bold text-white">{currentUser?.name}</h2>
            <p className="text-xs text-slate-400">{currentUser?.email}</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="rounded-md bg-brand-500/15 border border-brand-500/30 px-2 py-0.5 text-[10px] font-bold text-brand-300">
                {currentUser?.role}
              </span>
              <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Verified User
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs">
          <div className="rounded-2xl bg-slate-950 p-3.5 border border-slate-800">
            <span className="text-slate-500 font-bold uppercase text-[10px] block mb-0.5">Organization</span>
            <span className="text-white font-bold">{currentUser?.organization_name}</span>
          </div>

          <div className="rounded-2xl bg-slate-950 p-3.5 border border-slate-800">
            <span className="text-slate-500 font-bold uppercase text-[10px] block mb-0.5">Primary Contact Email</span>
            <span className="text-white font-bold">{currentUser?.email}</span>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={() => onNavigate('my-company')}
            className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-brand-600/30 hover:bg-brand-500"
          >
            Edit Company Qualifications
          </button>
        </div>

      </div>

    </div>
  );
};
