import React, { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { Language, TenantWorkspace } from '../types';
import { TRANSLATIONS } from '../constants';

interface Props {
  onBack: () => void;
  language: Language;
}

export const AdminTenants: React.FC<Props> = ({ onBack, language }) => {
  const t = TRANSLATIONS[language];
  const [items, setItems] = useState<TenantWorkspace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      if (!isSupabaseConfigured()) { setLoading(false); return; }
      const { data } = await supabase.from('workspaces').select('*').order('name', { ascending: true });
      setItems((data || []) as any);
      setLoading(false);
    };
    run();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 bg-white shadow-sm flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Tenants</h1>
        <button onClick={onBack} className="px-4 py-2 rounded-lg bg-gray-100 font-bold text-gray-700">Back</button>
      </div>
      <div className="p-6">
        {loading ? (
          <div className="text-gray-400 font-bold">Loading…</div>
        ) : items.length === 0 ? (
          <div className="text-gray-400 font-bold">No tenants</div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-2xl shadow">
            <table className="min-w-full">
              <thead>
                <tr className="text-left">
                  <th className="p-3">Name</th>
                  <th className="p-3">Subdomain</th>
                  <th className="p-3">Plan</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Language</th>
                  <th className="p-3">Timezone</th>
                </tr>
              </thead>
              <tbody>
                {items.map(w => (
                  <tr key={w.id} className="border-t">
                    <td className="p-3 font-bold text-gray-800">{w.name}</td>
                    <td className="p-3 text-gray-600">{w.subdomain}</td>
                    <td className="p-3 text-gray-600">{w.plan}</td>
                    <td className="p-3 text-gray-600">{w.status}</td>
                    <td className="p-3 text-gray-600">{w.language}</td>
                    <td className="p-3 text-gray-600">{w.timezone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};