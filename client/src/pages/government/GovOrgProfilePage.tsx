import React from 'react';
import { User } from '../../types';
import { Building, ShieldCheck, Mail, MapPin, Phone, CheckCircle2 } from 'lucide-react';

interface GovOrgProfilePageProps {
  currentUser: User | null;
}

export const GovOrgProfilePage: React.FC<GovOrgProfilePageProps> = ({ currentUser }) => {
  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Organization Profile
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Government department identity, issuing division, and contact officer credentials.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-5">
        
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Building className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{currentUser?.organization_name || 'National Highways Authority'}</h2>
            <p className="text-xs text-slate-400">Ministry of Road Transport and Highways, Govt of India</p>
            <span className="mt-1 inline-flex items-center gap-1 text-emerald-400 text-xs font-semibold">
              <CheckCircle2 className="h-3.5 w-3.5" /> Verified Public Sector Body
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs">
          <div className="rounded-2xl bg-slate-950 p-3.5 border border-slate-800">
            <span className="text-slate-500 font-bold uppercase text-[10px] block mb-0.5">Procurement Officer</span>
            <span className="text-white font-bold">{currentUser?.name || 'Rajesh Sharma'}</span>
          </div>

          <div className="rounded-2xl bg-slate-950 p-3.5 border border-slate-800">
            <span className="text-slate-500 font-bold uppercase text-[10px] block mb-0.5">Official Email</span>
            <span className="text-white font-bold">{currentUser?.email || 'gov@nhai.gov.in'}</span>
          </div>

          <div className="rounded-2xl bg-slate-950 p-3.5 border border-slate-800">
            <span className="text-slate-500 font-bold uppercase text-[10px] block mb-0.5">Headquarters</span>
            <span className="text-white font-bold">G 5&6, Sector-10, Dwarka, New Delhi</span>
          </div>

          <div className="rounded-2xl bg-slate-950 p-3.5 border border-slate-800">
            <span className="text-slate-500 font-bold uppercase text-[10px] block mb-0.5">Portal Status</span>
            <span className="text-emerald-400 font-bold">Active Tender Publisher</span>
          </div>
        </div>

      </div>

    </div>
  );
};
