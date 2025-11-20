import React, { useEffect, useState } from 'react';
import { isSupabaseConfigured } from '../services/supabase';
import { Language, TenantWorkspace } from '../types';
import { TRANSLATIONS } from '../constants';

interface Props {
  onBack: () => void;
  language: Language;
}

export const AdminTenants: React.FC<Props> = ({ onBack, language }) => {
  const t = TRANSLATIONS[language];
  const [items, setItems] = useState<TenantWorkspace[]>([]);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [form, setForm] = useState({ name: '', subdomain: '', language: 'en', timezone: 'Europe/Belgrade', plan: 'free' as TenantWorkspace['plan'] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      if (!isSupabaseConfigured()) { setLoading(false); return; }
      const r = await fetch(`/api/admin/tenants?page=${page}&query=${encodeURIComponent(query)}`);
      const d = await r.json();
      setItems((d.tenants || []) as any);
      setLoading(false);
    };
    run();
  }, [page, query]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 bg-white shadow-sm flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Tenants</h1>
        <button onClick={onBack} className="px-4 py-2 rounded-lg bg-gray-100 font-bold text-gray-700">Back</button>
      </div>
      <div className="p-6">
        <div className="bg-white rounded-2xl shadow p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
            <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Name" className="px-3 py-2 rounded-lg border"/>
            <input value={form.subdomain} onChange={e=>setForm({...form,subdomain:e.target.value.replace(/[^a-z0-9-]/g,'')})} placeholder="Subdomain" className="px-3 py-2 rounded-lg border"/>
            <select value={form.plan} onChange={e=>setForm({...form,plan:e.target.value as any})} className="px-3 py-2 rounded-lg border">
              <option value="free">Free</option>
              <option value="standard">Standard</option>
              <option value="premium">Premium</option>
            </select>
            <select value={form.language} onChange={e=>setForm({...form,language:e.target.value})} className="px-3 py-2 rounded-lg border">
              <option value="en">English</option>
              <option value="sr">Serbian</option>
              <option value="hr">Croatian</option>
              <option value="sl">Slovenian</option>
            </select>
            <select value={form.timezone} onChange={e=>setForm({...form,timezone:e.target.value})} className="px-3 py-2 rounded-lg border">
              <option value="Europe/Belgrade">Europe/Belgrade</option>
              <option value="Europe/Zagreb">Europe/Zagreb</option>
              <option value="Europe/Ljubljana">Europe/Ljubljana</option>
              <option value="Europe/London">Europe/London</option>
            </select>
            <button onClick={async()=>{
              if(!form.name || !form.subdomain) return
              await fetch('/api/admin/tenants',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'create',...form})})
              setForm({ name: '', subdomain: '', language: 'en', timezone: 'Europe/Belgrade', plan: 'free' })
              setLoading(true); setPage(1); setQuery('')
            }} className="px-3 py-2 rounded-lg bg-brand-blue text-white font-bold">Create</button>
          </div>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search tenants" className="px-3 py-2 rounded-lg border"/>
        </div>
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
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(w => (
                  <tr key={w.id} className="border-t">
                    <td className="p-3 font-bold text-gray-800">{w.name}</td>
                    <td className="p-3 text-gray-600">{w.subdomain}</td>
                    <td className="p-3 text-gray-600">
                      <select defaultValue={w.plan} onChange={async(e)=>{ await fetch('/api/admin/tenants',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'update',id:w.id,plan:e.target.value})}) }} className="px-2 py-1 rounded border">
                        <option value="free">Free</option>
                        <option value="standard">Standard</option>
                        <option value="premium">Premium</option>
                      </select>
                    </td>
                    <td className="p-3 text-gray-600">
                      <select defaultValue={w.status} onChange={async(e)=>{ await fetch('/api/admin/tenants',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'update',id:w.id,status:e.target.value})}) }} className="px-2 py-1 rounded border">
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </td>
                    <td className="p-3 text-gray-600">{w.language}</td>
                    <td className="p-3 text-gray-600">{w.timezone}</td>
                    <td className="p-3">
                      <button onClick={async()=>{ if(!confirm('Delete tenant?')) return; await fetch('/api/admin/tenants',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'delete',id:w.id})}); setLoading(true); }} className="px-3 py-1 rounded-lg bg-red-100 text-red-600">Delete</button>
                    </td>
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