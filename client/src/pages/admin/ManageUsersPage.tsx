import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { ApiService } from '../../services/api';
import { 
  Users, 
  ShieldCheck, 
  ShieldAlert, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Building2, 
  Briefcase 
} from 'lucide-react';

export const ManageUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getAdminUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVerification = async (userId: string) => {
    try {
      await ApiService.toggleUserVerification(userId);
      await loadUsers();
    } catch (err) {
      console.error('Failed to toggle verification:', err);
    }
  };

  const filtered = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.organization_name && u.organization_name.toLowerCase().includes(search.toLowerCase()));
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="inline-flex items-center gap-2 rounded-full bg-purple-500/10 border border-purple-500/30 px-3 py-0.5 text-xs font-bold text-purple-400 mb-2">
          <Users className="h-3.5 w-3.5" />
          <span>User Verification & KYC Governance</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          User & Organization Registry
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Verify government procurement issuing departments and bidding contractors.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by user name, organization, or email..."
            className="w-full rounded-2xl bg-slate-900 border border-slate-800 py-2 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          {['ALL', 'GOVERNMENT', 'COMPANY', 'ADMIN'].map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                roleFilter === role
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent mb-3" />
          <p className="text-sm font-semibold text-slate-300">Loading registered organizations...</p>
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 bg-slate-950/60">
              <tr>
                <th className="py-3.5 px-5">User & Organization</th>
                <th className="py-3.5 px-5">Email</th>
                <th className="py-3.5 px-5">Role</th>
                <th className="py-3.5 px-5">Verification</th>
                <th className="py-3.5 px-5 text-right">KYC Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-5">
                    <div className="font-bold text-white text-sm">{user.name}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      {user.role === 'GOVERNMENT' ? <Building2 className="h-3 w-3 text-emerald-400" /> : <Briefcase className="h-3 w-3 text-brand-400" />}
                      <span>{user.organization_name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-5 font-mono text-slate-300">
                    {user.email}
                  </td>
                  <td className="py-4 px-5">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      user.role === 'GOVERNMENT'
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : user.role === 'ADMIN'
                        ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                        : 'bg-brand-500/10 border-brand-500/30 text-brand-400'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4 px-5">
                    {user.verified ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-xs">
                        <CheckCircle2 className="h-4 w-4" /> Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-400 font-semibold text-xs">
                        <ShieldAlert className="h-4 w-4" /> Pending
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-5 text-right">
                    <button
                      onClick={() => handleToggleVerification(user.id)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                        user.verified
                          ? 'bg-slate-800 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 border border-slate-700'
                          : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/30'
                      }`}
                    >
                      {user.verified ? 'Revoke Verify' : 'Approve & Verify'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};
