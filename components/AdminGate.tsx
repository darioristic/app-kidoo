import React, { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { AdminLogin } from './AdminLogin';
import { AdminHome } from './AdminHome';
import { AdminPanel } from './AdminPanel';
import { Language } from '../types';

interface Props {
  language: Language;
  onBack: () => void;
}

export const AdminGate: React.FC<Props> = ({ language, onBack }) => {
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const run = async () => {
      if (!isSupabaseConfigured()) {
        const allowDev = ((import.meta as any).env?.VITE_ALLOW_DEV_ADMIN === 'true') || (typeof window !== 'undefined' && window.location.host.includes('localhost'));
        setIsAdmin(allowDev);
        setReady(true);
        return;
      }
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) { setReady(true); setIsAdmin(false); return; }
      // If profiles table is available, check role; otherwise allow
      try {
        const { data: rows } = await supabase.from('profiles').select('role').eq('id', user.id).limit(1);
        const role = rows && rows[0]?.role;
        setIsAdmin(role === 'admin' || role === 'saas_admin');
      } catch {
        setIsAdmin(true);
      }
      setReady(true);
    };
    run();
  }, []);

  if (!ready) return (
    <div className="min-h-screen bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center">
      <div className="bg-white rounded-3xl shadow-2xl px-8 py-6 text-center">
        <p className="text-gray-500 font-bold">Loading…</p>
      </div>
    </div>
  );
  if (!isAdmin) return <AdminHome language={language} onLoginSuccess={() => { window.location.reload(); }} />;
  return <AdminPanel language={language} onBack={onBack} />;
};