import React, { useEffect, useMemo, useState } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, ShieldCheck, SlidersHorizontal, Cpu, Bell, Settings, Database, Activity, Globe, KeyRound } from 'lucide-react';

interface Props {
  language: Language;
  onBack: () => void;
}

type Tab = 'dashboard' | 'users' | 'settings' | 'security' | 'integrations' | 'logs' | 'modules';

export const AdminPanel: React.FC<Props> = ({ language, onBack }) => {
  const t = TRANSLATIONS[language];
  const [tab, setTab] = useState<Tab>('dashboard');
  const [activeUsers, setActiveUsers] = useState<number>(0);
  const [events, setEvents] = useState<number[]>([5, 10, 7, 12, 8, 14, 9]);
  const [notif, setNotif] = useState<string | null>(null);
  const [users, setUsers] = useState<Array<{id:string,email:string,role:string,status:string}>>([]);
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [envForm, setEnvForm] = useState<Record<string, string>>({
    SUPABASE_URL: '',
    SUPABASE_SERVICE_ROLE_KEY: '',
    VITE_SUPABASE_URL: '',
    VITE_SUPABASE_ANON_KEY: '',
    VITE_STRIPE_PUBLISHABLE_KEY: '',
    STRIPE_SECRET_KEY: ''
  });
  const [logs, setLogs] = useState<Array<{time:string,actor:string,action:string,target:string}>>([]);

  useEffect(() => {
    setActiveUsers(32);
    setNotif(null);
    fetch('/api/admin/users').then(r=>r.json()).then(d=>{ setUsers(d.users||[]); });
    fetch('/api/admin/settings?env=1').then(r=>r.json()).then(d=>{ setSettings({...d.settings, envs: d.envs}); });
  }, []);

  useEffect(() => {
    if (tab !== 'logs') return;
    fetch('/api/admin/logs').then(r=>r.json()).then(d=>{ setLogs(d.logs||[]); });
  }, [tab]);

  const chartData = useMemo(() => (
    ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((name, i) => ({ name, events: events[i] || 0 }))
  ), [events]);

  return (
    <div className="min-h-screen bg-gray-100 grid grid-cols-1 lg:grid-cols-[260px_1fr]">
      <aside className="bg-white border-r border-gray-100 p-4 lg:p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-bold text-xl text-gray-800">Admin</h2>
          <button onClick={onBack} className="px-3 py-1 rounded-lg bg-gray-100 font-bold text-gray-700">Back</button>
        </div>
        <nav className="space-y-2">
          <button onClick={() => setTab('dashboard')} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg ${tab==='dashboard'?'bg-blue-50 text-brand-blue':'hover:bg-gray-50 text-gray-600'}`}><Activity className="w-4 h-4"/> Dashboard</button>
          <button onClick={() => setTab('users')} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg ${tab==='users'?'bg-blue-50 text-brand-blue':'hover:bg-gray-50 text-gray-600'}`}><Users className="w-4 h-4"/> Users</button>
          <button onClick={() => setTab('settings')} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg ${tab==='settings'?'bg-blue-50 text-brand-blue':'hover:bg-gray-50 text-gray-600'}`}><Settings className="w-4 h-4"/> Settings</button>
          <button onClick={() => setTab('modules')} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg ${tab==='modules'?'bg-blue-50 text-brand-blue':'hover:bg-gray-50 text-gray-600'}`}><SlidersHorizontal className="w-4 h-4"/> Modules</button>
          <button onClick={() => setTab('integrations')} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg ${tab==='integrations'?'bg-blue-50 text-brand-blue':'hover:bg-gray-50 text-gray-600'}`}><Cpu className="w-4 h-4"/> Integrations</button>
          <button onClick={() => setTab('security')} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg ${tab==='security'?'bg-blue-50 text-brand-blue':'hover:bg-gray-50 text-gray-600'}`}><ShieldCheck className="w-4 h-4"/> Security</button>
          <button onClick={() => setTab('logs')} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg ${tab==='logs'?'bg-blue-50 text-brand-blue':'hover:bg-gray-50 text-gray-600'}`}><Database className="w-4 h-4"/> Audit Logs</button>
        </nav>
      </aside>
      <main className="p-4 lg:p-8">
        {tab==='dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-brand-blue">
                <p className="text-sm font-bold text-gray-600">Active Users</p>
                <p className="text-3xl font-bold">{activeUsers}</p>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-brand-purple">
                <p className="text-sm font-bold text-gray-600">Weekly Events</p>
                <p className="text-3xl font-bold">{events.reduce((a,b)=>a+b,0)}</p>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-brand-green">
                <p className="text-sm font-bold text-gray-600">Notifications</p>
                <p className="text-3xl font-bold">{notif?1:0}</p>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4">Usage</h3>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" fontSize={12} tickMargin={10} />
                    <YAxis fontSize={12} />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                    <Bar dataKey="events" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
        {tab==='users' && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800">Users</h3>
              <button onClick={async()=>{
                const email = prompt('Email')||''
                if(!email) return
                const role = prompt('Role (admin/moderator/user)')||'user'
                await fetch('/api/admin/users',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'create',email,role})})
                const d=await (await fetch('/api/admin/users')).json(); setUsers(d.users||[])
              }} className="px-4 py-2 rounded-lg bg-brand-blue text-white font-bold">Create</button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="text-left">
                    <th className="p-3">Email</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u=> (
                    <tr key={u.id} className="border-t">
                      <td className="p-3">{u.email}</td>
                      <td className="p-3">{u.role}</td>
                      <td className="p-3">{u.status}</td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <button onClick={async()=>{
                            const role = prompt('Role (admin/moderator/user)', u.role)||u.role
                            await fetch('/api/admin/users',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'update',id:u.id,role})})
                            const d=await (await fetch('/api/admin/users')).json(); setUsers(d.users||[])
                          }} className="px-3 py-1 rounded-lg bg-gray-100">Edit</button>
                          <button onClick={async()=>{
                            if(!confirm('Delete user?')) return
                            await fetch('/api/admin/users',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'delete',id:u.id})})
                            const d=await (await fetch('/api/admin/users')).json(); setUsers(d.users||[])
                          }} className="px-3 py-1 rounded-lg bg-red-100 text-red-600">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {tab==='settings' && (
          <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-800">Global Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-500 mb-1">Theme</label>
                <select value={settings.theme||'Light'} onChange={e=>setSettings({...settings,theme:e.target.value})} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200">
                  <option>Light</option>
                  <option>Dark</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-500 mb-1">Language</label>
                <select value={settings.lang||'English'} onChange={e=>setSettings({...settings,lang:e.target.value})} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200">
                  <option>English</option>
                  <option>Serbian</option>
                </select>
              </div>
            </div>
            <button onClick={async()=>{
              await fetch('/api/admin/settings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({items:[{key:'theme',value:settings.theme||'Light'},{key:'lang',value:settings.lang||'English'}]})})
            }} className="px-4 py-2 rounded-lg bg-brand-blue text-white font-bold">Save</button>
          </div>
        )}
        {tab==='modules' && (
          <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-800">Modules</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-xl p-4">
                <p className="font-bold">Smart Games</p>
                <button onClick={async()=>{
                  const next = !(settings.module_smart_games===true)
                  setSettings({...settings,module_smart_games:next})
                  await fetch('/api/admin/settings/set',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({key:'module_smart_games',value:next})})
                }} className={`mt-2 px-3 py-1 rounded-lg ${settings.module_smart_games? 'bg-green-100 text-green-700':'bg-gray-100 text-gray-600'}`}>{settings.module_smart_games?'Enabled':'Disabled'}</button>
              </div>
              <div className="border rounded-xl p-4">
                <p className="font-bold">Fun Games</p>
                <button onClick={async()=>{
                  const next = !(settings.module_fun_games===true)
                  setSettings({...settings,module_fun_games:next})
                  await fetch('/api/admin/settings/set',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({key:'module_fun_games',value:next})})
                }} className={`mt-2 px-3 py-1 rounded-lg ${settings.module_fun_games? 'bg-green-100 text-green-700':'bg-gray-100 text-gray-600'}`}>{settings.module_fun_games?'Enabled':'Disabled'}</button>
              </div>
              <div className="border rounded-xl p-4">
                <p className="font-bold">AI Insights</p>
                <button onClick={async()=>{
                  const next = (settings.module_ai_insights||'limited')==='enabled'? 'limited':'enabled'
                  setSettings({...settings,module_ai_insights:next})
                  await fetch('/api/admin/settings/set',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({key:'module_ai_insights',value:next})})
                }} className={`mt-2 px-3 py-1 rounded-lg ${settings.module_ai_insights==='enabled'? 'bg-green-100 text-green-700':'bg-yellow-100 text-yellow-700'}`}>{settings.module_ai_insights==='enabled'?'Enabled':'Limited'}</button>
              </div>
            </div>
          </div>
        )}
        {tab==='integrations' && (
          <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-800">Integrations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-xl p-4">
                <div className="flex items-center gap-2"><Globe className="w-4 h-4"/> Supabase</div>
                <button onClick={async()=>{
                  setSettings({...settings,integration_supabase:'configured'})
                  await fetch('/api/admin/settings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({key:'integration_supabase',value:'configured'})})
                }} className="mt-2 px-3 py-1 rounded-lg bg-blue-100 text-blue-700">{settings.integration_supabase==='configured'?'Configured':'Configure'}</button>
                <div className="mt-2 text-xs">
                  <div className={`${settings.envs?.SUPABASE_URL? 'text-green-700':'text-red-600'}`}>SUPABASE_URL: {settings.envs?.SUPABASE_URL? 'OK':'Missing'}</div>
                  <div className={`${settings.envs?.SUPABASE_SERVICE_ROLE_KEY? 'text-green-700':'text-red-600'}`}>SERVICE_ROLE: {settings.envs?.SUPABASE_SERVICE_ROLE_KEY? 'OK':'Missing'}</div>
                  <div className={`${settings.envs?.VITE_SUPABASE_URL? 'text-green-700':'text-red-600'}`}>VITE_SUPABASE_URL: {settings.envs?.VITE_SUPABASE_URL? 'OK':'Missing'}</div>
                  <div className={`${settings.envs?.VITE_SUPABASE_ANON_KEY? 'text-green-700':'text-red-600'}`}>VITE_ANON_KEY: {settings.envs?.VITE_SUPABASE_ANON_KEY? 'OK':'Missing'}</div>
                </div>
              </div>
              <div className="border rounded-xl p-4">
                <div className="flex items-center gap-2"><KeyRound className="w-4 h-4"/> Stripe</div>
                <button onClick={async()=>{
                  setSettings({...settings,integration_stripe:'configured'})
                  await fetch('/api/admin/settings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({key:'integration_stripe',value:'configured'})})
                }} className="mt-2 px-3 py-1 rounded-lg bg-blue-100 text-blue-700">{settings.integration_stripe==='configured'?'Configured':'Configure'}</button>
                <div className="mt-2 text-xs">
                  <div className={`${settings.envs?.STRIPE_SECRET_KEY? 'text-green-700':'text-red-600'}`}>STRIPE_SECRET_KEY: {settings.envs?.STRIPE_SECRET_KEY? 'OK':'Missing'}</div>
                </div>
              </div>
            </div>
            <div className="mt-6 border-t pt-4">
              <h4 className="font-bold text-gray-800 mb-3">Manage Vercel Environment</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input value={envForm.SUPABASE_URL} onChange={e=>setEnvForm({...envForm,SUPABASE_URL:e.target.value})} placeholder="SUPABASE_URL" className="px-3 py-2 rounded-lg border" />
                <input value={envForm.SUPABASE_SERVICE_ROLE_KEY} onChange={e=>setEnvForm({...envForm,SUPABASE_SERVICE_ROLE_KEY:e.target.value})} placeholder="SUPABASE_SERVICE_ROLE_KEY" className="px-3 py-2 rounded-lg border" />
                <input value={envForm.VITE_SUPABASE_URL} onChange={e=>setEnvForm({...envForm,VITE_SUPABASE_URL:e.target.value})} placeholder="VITE_SUPABASE_URL" className="px-3 py-2 rounded-lg border" />
                <input value={envForm.VITE_SUPABASE_ANON_KEY} onChange={e=>setEnvForm({...envForm,VITE_SUPABASE_ANON_KEY:e.target.value})} placeholder="VITE_SUPABASE_ANON_KEY" className="px-3 py-2 rounded-lg border" />
                <input value={envForm.VITE_STRIPE_PUBLISHABLE_KEY} onChange={e=>setEnvForm({...envForm,VITE_STRIPE_PUBLISHABLE_KEY:e.target.value})} placeholder="VITE_STRIPE_PUBLISHABLE_KEY" className="px-3 py-2 rounded-lg border" />
                <input value={envForm.STRIPE_SECRET_KEY} onChange={e=>setEnvForm({...envForm,STRIPE_SECRET_KEY:e.target.value})} placeholder="STRIPE_SECRET_KEY" className="px-3 py-2 rounded-lg border" />
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={async()=>{
                  const pairs = [
                    ['SUPABASE_URL', envForm.SUPABASE_URL],
                    ['SUPABASE_SERVICE_ROLE_KEY', envForm.SUPABASE_SERVICE_ROLE_KEY],
                    ['VITE_SUPABASE_URL', envForm.VITE_SUPABASE_URL],
                    ['VITE_SUPABASE_ANON_KEY', envForm.VITE_SUPABASE_ANON_KEY],
                    ['VITE_STRIPE_PUBLISHABLE_KEY', envForm.VITE_STRIPE_PUBLISHABLE_KEY],
                    ['STRIPE_SECRET_KEY', envForm.STRIPE_SECRET_KEY],
                  ] as const
                  for (const [key, value] of pairs) {
                    if (!value) continue
                    await fetch('/api/admin/vercel-env',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({key,value,targets:['production','preview']})})
                  }
                  const d = await (await fetch('/api/admin/settings?env=1')).json();
                  setSettings({...d.settings, envs: d.envs});
                }} className="px-4 py-2 rounded-lg bg-brand-blue text-white font-bold">Save to Vercel</button>
                <div className="text-xs text-gray-500">Requires VERCEL_API_TOKEN on server</div>
              </div>
            </div>
          </div>
        )}
        {tab==='security' && (
          <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-800">Security</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-500 mb-1">Two-factor auth</label>
                <button onClick={async()=>{
                  const next = !(settings.security_2fa===true)
                  setSettings({...settings,security_2fa:next})
                  await fetch('/api/admin/settings/set',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({key:'security_2fa',value:next})})
                }} className={`px-3 py-1 rounded-lg ${settings.security_2fa? 'bg-green-100 text-green-700':'bg-gray-100 text-gray-600'}`}>{settings.security_2fa?'Enabled':'Disabled'}</button>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-500 mb-1">Suspicious activity</label>
                <button onClick={async()=>{
                  const next = !(settings.security_monitor===true)
                  setSettings({...settings,security_monitor:next})
                  await fetch('/api/admin/settings/set',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({key:'security_monitor',value:next})})
                }} className={`px-3 py-1 rounded-lg ${settings.security_monitor? 'bg-blue-100 text-blue-700':'bg-gray-100 text-gray-600'}`}>{settings.security_monitor?'Monitoring':'Monitor'}</button>
              </div>
            </div>
          </div>
        )}
        {tab==='logs' && (
          <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-800">Audit Logs</h3>
            <div className="flex gap-2 mb-3">
              <a href="/api/admin/logs?format=csv" className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 font-bold">Export CSV</a>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="text-left"><th className="p-3">Time</th><th className="p-3">Actor</th><th className="p-3">Action</th><th className="p-3">Target</th></tr>
                </thead>
                <tbody>
                  {logs.map((l,i)=> (
                    <tr key={i} className="border-t"><td className="p-3">{l.time}</td><td className="p-3">{l.actor}</td><td className="p-3">{l.action}</td><td className="p-3">{l.target}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};