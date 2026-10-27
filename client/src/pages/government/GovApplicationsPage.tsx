import React, { useState, useEffect } from 'react';
import { ApiService } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Users, Building2, CheckCircle2, Search, ArrowUpRight, Award } from 'lucide-react';
import { Tender } from '../../types';

interface GovApplicationsPageProps {
  onSelectTender: (tender: Tender) => void;
}

export const GovApplicationsPage: React.FC<GovApplicationsPageProps> = ({ onSelectTender }) => {
  const applications = [
    {
      id: 'app-1',
      company_name: 'Apex Infotech Solutions Pvt Ltd',
      tender_title: 'Design, Development & Cloud Hosting of Enterprise Highway Traffic Analytics System',
      tender_ref: 'NHAI/TECH/2026/089',
      match_score: 88,
      eligibility: 'Partially Eligible',
      turnover: '₹15.00 Cr',
      experience: '7 Years',
      status: 'Preparing Bid',
      date: '12 Aug 2026'
    },
    {
      id: 'app-2',
      company_name: 'Larsen Infrastructure Works Ltd',
      tender_title: 'EPC Construction of 6-Lane Greenfield Coastal Highway Corridor',
      tender_ref: 'MSRDC/EPC/2026/412',
      match_score: 95,
      eligibility: 'Eligible',
      turnover: '₹95.00 Cr',
      experience: '12 Years',
      status: 'Preparing Bid',
      date: '10 Aug 2026'
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Bidder Interest & Applications
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Companies currently evaluating your published tenders and preparing bids.
        </p>
      </div>

      <div className="space-y-3">
        {applications.map((app) => (
          <div
            key={app.id}
            className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-brand-400" />
                  <h3 className="text-sm font-bold text-white">{app.company_name}</h3>
                  <span className="rounded bg-brand-500/10 border border-brand-500/20 text-brand-400 text-[10px] font-bold px-2 py-0.5">
                    Match: {app.match_score}%
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Evaluating: <strong className="text-slate-200">{app.tender_title}</strong> ({app.tender_ref})
                </p>
              </div>

              <div className="flex items-center gap-2">
                <StatusBadge status={app.eligibility} type="eligibility" size="sm" />
                <span className="rounded-md bg-slate-800 text-slate-300 px-2.5 py-1 text-xs font-semibold">
                  {app.status}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
              <span>Turnover: <strong className="text-emerald-400">{app.turnover}</strong></span>
              <span>Experience: <strong className="text-slate-200">{app.experience}</strong></span>
              <span>Last Evaluated: <strong className="text-slate-300">{app.date}</strong></span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
