import React, { useState, useEffect } from 'react';
import { UserRole, User, Company } from '../../types';
import { ApiService } from '../../services/api';
import { 
  Building2, 
  Building, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  X,
  Sparkles,
  Layers,
  Zap
} from 'lucide-react';

interface LoginPageProps {
  initialPortal?: 'PUBLISHER' | 'USER' | 'ADMIN';
  onLoginSuccess: (user: User, company: Company | null) => void;
  onClose?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ 
  initialPortal = 'USER', 
  onLoginSuccess,
  onClose 
}) => {
  const [role, setRole] = useState<'GOVERNMENT' | 'COMPANY'>(
    initialPortal === 'PUBLISHER' ? 'GOVERNMENT' : 'COMPANY'
  );
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form Fields
  const [email, setEmail] = useState('user@apextech.com');
  const [password, setPassword] = useState('user123');
  const [name, setName] = useState('');
  const [orgName, setOrgName] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Pre-configured accounts for quick 1-click fill
  const demoAccounts = {
    GOVERNMENT: [
      { name: 'Rajesh Sharma (NHAI)', email: 'publisher@nhai.gov.in', pass: 'publisher123' },
      { name: 'Priya Nambiar (SECI)', email: 'publisher@seci.gov.in', pass: 'publisher123' }
    ],
    COMPANY: [
      { name: 'Ananya Verma (Apex IT)', email: 'user@apextech.com', pass: 'user123' },
      { name: 'Vikram Mehta (Larsen EPC)', email: 'user@larseninfra.com', pass: 'user123' }
    ]
  };

  // Sync default fields on role switch
  useEffect(() => {
    setErrorMsg('');
    setSuccessMsg('');
    if (role === 'GOVERNMENT') {
      setEmail('publisher@nhai.gov.in');
      setPassword('publisher123');
    } else {
      setEmail('user@apextech.com');
      setPassword('user123');
    }
  }, [role]);

  const handleQuickFill = (accEmail: string, accPass: string) => {
    setEmail(accEmail);
    setPassword(accPass);
    setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (!isRegister) {
        const data = await ApiService.login(email.trim(), password.trim(), role);
        setSuccessMsg(`Welcome, ${data.user.name}!`);
        setTimeout(() => {
          onLoginSuccess(data.user, data.company);
        }, 300);
      } else {
        const payload = {
          name: name.trim(),
          email: email.trim(),
          password: password.trim(),
          role: role,
          organization_name: orgName.trim() || `${name}'s Organization`
        };
        const data = await ApiService.register(payload);
        setSuccessMsg(`Account created! Logging you in...`);
        setTimeout(() => {
          onLoginSuccess(data.user, data.company);
        }, 400);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const isGov = role === 'GOVERNMENT';

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800 relative">
      
      {/* Top Header */}
      <div className="p-6 pb-4 bg-gradient-to-b from-slate-50 to-white border-b border-slate-100 relative">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-lg bg-[#006970] text-white flex items-center justify-center font-bold text-sm shadow-md">
            <Layers className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-lg tracking-tight text-[#006970]">
            TenderSphere
          </span>
        </div>

        <h2 className="text-xl font-bold text-slate-900">
          {isRegister ? 'Create an Account' : 'Sign In'}
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          {isGov ? '🏛️ Official Tender Publisher & Issuer Portal' : '🏢 Vendor, Contractor & Bidder Portal'}
        </p>
      </div>

      <div className="p-6 space-y-4">
        
        {/* Simple Role Selector Tabs */}
        <div>
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
            Select Your Role
          </label>
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setRole('COMPANY')}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                !isGov 
                  ? 'bg-white text-[#006970] shadow-sm border border-slate-200/80' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>User / Bidder</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('GOVERNMENT')}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                isGov 
                  ? 'bg-white text-emerald-800 shadow-sm border border-slate-200/80' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building className="w-3.5 h-3.5 text-emerald-700" />
              <span>Publisher (Govt)</span>
            </button>
          </div>
        </div>

        {/* Quick Demo Fill Chips */}
        {!isRegister && (
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase font-mono flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-500" />
                Quick 1-Click Auto-Fill:
              </span>
              <span className="text-[10px] text-slate-400">Click to fill</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {demoAccounts[role].map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleQuickFill(acc.email, acc.pass)}
                  className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border transition-all ${
                    email === acc.email
                      ? 'bg-[#006970] text-white border-[#006970]'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {acc.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Alerts */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          
          {isRegister && (
            <>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:border-[#006970] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {isGov ? 'Department / Ministry Name' : 'Company / Firm Name'}
                </label>
                <input
                  type="text"
                  required
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder={isGov ? 'e.g. National Highways Authority' : 'e.g. Bharat Tech Solutions Pvt Ltd'}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:border-[#006970] focus:outline-none"
                />
              </div>
            </>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {isGov ? 'Official Authority Email' : 'Work Email Address'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isGov ? 'publisher@nhai.gov.in' : 'user@apextech.com'}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:border-[#006970] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-semibold text-slate-700">Password</label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-slate-500 hover:text-slate-800"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:border-[#006970] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 rounded-lg text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all mt-2 disabled:opacity-50 ${
              isGov 
                ? 'bg-emerald-700 hover:bg-emerald-800' 
                : 'bg-[#006970] hover:bg-[#004f54]'
            }`}
          >
            <span>
              {loading 
                ? 'Authenticating...' 
                : isRegister 
                  ? 'Create Account' 
                  : `Sign In as ${isGov ? 'Publisher' : 'Bidder'}`}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

        </form>

        {/* Toggle Register / Sign In */}
        <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-600">
          {isRegister ? (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                className="font-bold text-[#006970] hover:underline"
              >
                Sign In
              </button>
            </p>
          ) : (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(true)}
                className="font-bold text-[#006970] hover:underline"
              >
                Register as {isGov ? 'Publisher' : 'Bidder'}
              </button>
            </p>
          )}
        </div>

      </div>

    </div>
  );
};
