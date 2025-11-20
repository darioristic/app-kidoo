import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { Building2, ShieldCheck, Sparkles } from 'lucide-react';
import { AdminLogin } from './AdminLogin';
import { isSupabaseConfigured } from '../services/supabase';

interface Props {
  language: Language;
  onLoginSuccess: () => void;
}

export const AdminHome: React.FC<Props> = ({ language, onLoginSuccess }) => {
  const t = TRANSLATIONS[language];
  const configured = isSupabaseConfigured();
  const allowDev = ((import.meta as any).env?.VITE_ALLOW_DEV_ADMIN === 'true') || (typeof window !== 'undefined' && window.location.host.includes('localhost'));
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center p-6">
      <div className="w-full max-w-5xl">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-brand-yellow flex items-center justify-center shadow-lg mb-4">
            <Sparkles className="w-8 h-8 text-brand-blue" />
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white drop-shadow">SaaS Admin Portal</h1>
          <p className="text-white/80 mt-2">Manage tenants, users, settings and integrations</p>
          <div className="mt-4 flex items-center justify-center gap-3 text-white/80">
            <span className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-lg"><Building2 className="w-4 h-4"/> Multi-tenant</span>
            <span className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-lg"><ShieldCheck className="w-4 h-4"/> Secure</span>
          </div>
        </div>
        <div className="mx-auto max-w-md">
          {configured ? (
            <AdminLogin language={language} onSuccess={onLoginSuccess} fullScreen={false} />
          ) : (
            <div className="bg-white rounded-3xl shadow-2xl w-full p-8 text-center">
              <p className="text-gray-600 mb-4 font-bold">Auth nije konfigurisan</p>
              <button
                onClick={onLoginSuccess}
                disabled={!allowDev}
                className={`w-full py-3 rounded-xl font-bold ${allowDev ? 'bg-brand-blue text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              >
                {allowDev ? 'Nastavi u Admin (dev)' : 'Konfiguriši Supabase za pristup'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};