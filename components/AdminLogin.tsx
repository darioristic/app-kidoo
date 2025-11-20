import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { Lock, AtSign } from 'lucide-react';

interface Props {
  language: Language;
  onSuccess: () => void;
  fullScreen?: boolean;
}

export const AdminLogin: React.FC<Props> = ({ language, onSuccess, fullScreen = true }) => {
  const t = TRANSLATIONS[language];
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError(null);
    if (!isSupabaseConfigured()) { setError('Auth not configured'); return; }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { setError(error.message); return; }
    onSuccess();
  };

  const card = (
    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
      <h2 className="text-2xl font-display font-bold text-gray-800 mb-6">Admin Login</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-500 mb-1">Email</label>
          <div className="relative">
            <AtSign className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-blue" placeholder="admin@brainplaykids.com" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-500 mb-1">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-blue" placeholder="••••••••" />
          </div>
        </div>
        {error && <div className="text-red-600 text-sm font-bold">{error}</div>}
        <button onClick={handleLogin} disabled={loading || !email || !password} className={`w-full py-3 rounded-xl font-bold ${loading || !email || !password ? 'bg-gray-200 text-gray-400' : 'bg-brand-blue text-white hover:bg-blue-700'}`}>Login</button>
      </div>
    </div>
  );
  if (!fullScreen) return card;
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center p-4">
      {card}
    </div>
  );
};