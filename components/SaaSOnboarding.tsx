import React, { useEffect, useState } from 'react';
import { Language, FamilyAccount, OnboardingAdvice } from '../types';
import { TRANSLATIONS } from '../constants';
import { User, Lock, Sparkles, ArrowRight, Check, ArrowLeft, Globe, Languages, AtSign } from 'lucide-react';
import { startParentSignup, verifyEmailToken, getLastPendingToken, supabaseSendVerificationEmail, checkEmailVerified } from '../services/authService';
import { isSupabaseConfigured, supabase } from '../services/supabase';
import { isSubdomainAvailable, createWorkspace, bindParentToWorkspace } from '../services/tenantService';
import { getOnboardingAdvice } from '../services/geminiService';

interface Props {
  onComplete: (family: FamilyAccount) => void;
  language: Language;
}

export const SaaSOnboarding: React.FC<Props> = ({ onComplete, language }) => {
  const [step, setStep] = useState(1);
  const [provisioning, setProvisioning] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pin, setPin] = useState('');
  const [pendingFamily, setPendingFamily] = useState<FamilyAccount | null>(null);
  const [familyName, setFamilyName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(null);
  const [timezone, setTimezone] = useState('Europe/Belgrade');
  const [advice, setAdvice] = useState<OnboardingAdvice | null>(null);
  const [plan, setPlan] = useState<'free' | 'standard' | 'premium'>('free');
  const canSubmitParent = !!firstName && !!email && /.+@.+\..+/.test(email) && pin.length === 4 && password.length >= 6 && password === confirmPassword;
  const [dbConnected, setDbConnected] = useState<boolean>(false);

  const t = TRANSLATIONS[language];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const verified = params.get('verified');
    if (verified) {
      checkEmailVerified().then(acc => {
        if (acc) {
          setPendingFamily(acc);
          setStep(3);
        }
      });
    }
    const verifyToken = params.get('verify');
    if (verifyToken) {
      const acc = verifyEmailToken(verifyToken);
      if (acc) {
        setPendingFamily(acc);
        setStep(3);
      }
    }
  }, []);

  useEffect(() => {
    const checkDb = async () => {
      if (!isSupabaseConfigured()) { setDbConnected(false); return; }
      const { error } = await supabase.from('workspaces').select('id', { count: 'exact', head: true });
      setDbConnected(!error);
    };
    checkDb();
  }, []);

  useEffect(() => {
    const check = async () => {
      if (!subdomain || step !== 3) return;
      const ok = await isSubdomainAvailable(subdomain.toLowerCase());
      setSubdomainAvailable(ok);
    };
    check();
  }, [subdomain, step]);

  useEffect(() => {
    const loadAdvice = async () => {
      const a = await getOnboardingAdvice(7, language);
      setAdvice(a);
    };
    if (step === 3) loadAdvice();
  }, [step, language]);

  const handleParentSubmit = () => {
    const { account } = startParentSignup(firstName.trim(), lastName.trim(), email.trim().toLowerCase(), password, pin);
    setPendingFamily(account);
    supabaseSendVerificationEmail(firstName.trim(), lastName.trim(), email.trim().toLowerCase(), password, pin).catch(() => {});
    setStep(2);
  };

  const handleVerifyClicked = async () => {
    const accSupabase = await checkEmailVerified();
    if (accSupabase) {
      setPendingFamily(accSupabase);
      setStep(3);
      return;
    }
    const token = getLastPendingToken();
    if (!token) return;
    const acc = verifyEmailToken(token);
    if (acc) {
      setPendingFamily(acc);
      setStep(3);
    }
  };

  const handleWorkspaceCreate = async () => {
    if (!pendingFamily || !subdomainAvailable) return;
    try {
      setProvisioning(true);
      const ws = await createWorkspace(familyName.trim(), subdomain.trim().toLowerCase(), language, timezone, plan);
      const bound = bindParentToWorkspace(pendingFamily, ws);
      onComplete(bound);
    } catch (e) {
      setProvisioning(false);
    }
  };

  const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
  const deriveSubdomain = () => {
    const baseEmail = (pendingFamily?.parent.email || email || '').split('@')[0];
    const last = pendingFamily?.parent.lastName || '';
    const first = pendingFamily?.parent.firstName || '';
    let candidate = baseEmail || last || first || 'family';
    candidate = slugify(candidate);
    if (!candidate) candidate = 'family';
    return candidate.slice(0, 30);
  };

  useEffect(() => {
    const autoProvision = async () => {
      if (!pendingFamily) return;
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || timezone;
      let base = deriveSubdomain();
      let final = base;
      let tries = 0;
      while (!(await isSubdomainAvailable(final)) && tries < 20) {
        tries += 1;
        final = `${base}-${tries}`;
      }
      const famName = pendingFamily.parent.lastName || pendingFamily.parent.name || 'Family';
      try {
        setProvisioning(true);
        const ws = await createWorkspace(famName, final, language, tz, plan);
        const bound = bindParentToWorkspace(pendingFamily, ws);
        onComplete(bound);
      } catch (e) {
        setProvisioning(false);
      }
    };
    if (step === 3 && pendingFamily && !subdomain && !provisioning) autoProvision();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, pendingFamily, provisioning]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col md:flex-row min-h-[500px]">
        <div className="bg-gray-50 md:w-1/3 p-8 flex flex-col justify-between border-r border-gray-100">
            <div>
                <div className="w-12 h-12 bg-brand-yellow rounded-xl flex items-center justify-center mb-6 text-2xl shadow-lg">✨</div>
                <h2 className="text-2xl font-display font-bold text-gray-800 mb-2">{t.setupTitle}</h2>
                <div className="flex gap-2 mb-8">
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`h-2 rounded-full flex-1 transition-colors ${step >= i ? 'bg-brand-blue' : 'bg-gray-200'}`} />
                    ))}
                </div>
            </div>
            <div className="flex flex-col items-center justify-center flex-1 opacity-20">
                <Sparkles className="w-24 h-24 text-brand-blue animate-pulse" />
            </div>
        </div>

        <div className="flex-1 p-8 md:p-12 flex flex-col">
            
            {provisioning && (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <div className="w-14 h-14 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin mb-4"></div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Setting up your workspace…</h3>
                  <p className="text-gray-500">Please wait</p>
                </div>
            )}
            {!provisioning && step === 1 && (
                <div className="flex-1 flex flex-col justify-center">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6">Create Your Family Account</h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-500 mb-1">First name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                    <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-blue" placeholder="Maria" onKeyDown={e => { if (e.key === 'Enter' && canSubmitParent) handleParentSubmit(); }} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-500 mb-1">Last name</label>
                                <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-blue" placeholder="Johnson" onKeyDown={e => { if (e.key === 'Enter' && canSubmitParent) handleParentSubmit(); }} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-500 mb-1">Email</label>
                            <div className="relative">
                                <AtSign className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-blue" placeholder="maria@example.com" onKeyDown={e => { if (e.key === 'Enter' && canSubmitParent) handleParentSubmit(); }} />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-500 mb-1">Password</label>
                                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-blue" onKeyDown={e => { if (e.key === 'Enter' && canSubmitParent) handleParentSubmit(); }} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-500 mb-1">Confirm password</label>
                                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-blue" onKeyDown={e => { if (e.key === 'Enter' && canSubmitParent) handleParentSubmit(); }} />
                                {confirmPassword && password !== confirmPassword && (
                                  <p className="text-xs text-red-600 mt-1">Passwords do not match</p>
                                )}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-500 mb-1">Create PIN (4 digits)</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                <input type="text" maxLength={4} value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, ''))} className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-blue tracking-widest font-bold" placeholder="1234" onKeyDown={e => { if (e.key === 'Enter' && canSubmitParent) handleParentSubmit(); }} />
                                {pin && pin.length !== 4 && (
                                  <p className="text-xs text-red-600 mt-1">PIN must be 4 digits</p>
                                )}
                            </div>
                        </div>
                        {!canSubmitParent && (
                          <p className="text-xs text-gray-400">Fill all fields, a valid email, matching passwords (min 6 chars), and a 4‑digit PIN to continue.</p>
                        )}
                    </div>
                </div>
            )}

            {!provisioning && step === 2 && (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mb-6">
                        <Lock className="w-10 h-10" />
                    </div>
                    <h3 className="text-3xl font-display font-bold text-gray-800 mb-2">Check your email to verify your account</h3>
                    <p className="text-gray-500 mb-8">We sent a verification link to {email || 'your email'}.</p>
                    <div className="flex gap-3">
                        <button onClick={handleVerifyClicked} className="px-6 py-3 rounded-xl font-bold bg-brand-blue text-white hover:bg-blue-700">I've verified my email</button>
                    </div>
                </div>
            )}

            {!provisioning && step === 3 && (
                <div className="flex-1 flex flex-col">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6">Family Workspace Setup</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-500 mb-1">Family / Household Name</label>
                            <input type="text" value={familyName} onChange={e => setFamilyName(e.target.value)} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-blue" placeholder="Johnson Family" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-500 mb-1">Subdomain</label>
                            <div className="relative">
                              <Globe className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                              <input type="text" value={subdomain} onChange={e => setSubdomain(e.target.value.replace(/[^a-z0-9-]/g, ''))} className="w-full pl-10 pr-24 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-blue" placeholder="johnson" />
                              <span className="absolute right-3 top-2.5 text-sm text-gray-400">.brainplaykids.com</span>
                            </div>
                            {subdomain && (
                              <p className={`text-sm mt-1 ${subdomainAvailable ? 'text-green-600' : subdomainAvailable === false ? 'text-red-600' : 'text-gray-400'}`}>
                                {subdomainAvailable === null ? 'Checking availability...' : subdomainAvailable ? 'Available' : 'Not available'}
                              </p>
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-500 mb-1">Language</label>
                            <div className="relative">
                              <Languages className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                              <select value={language} onChange={() => {}} className="w-full pl-10 px-4 py-3 rounded-xl border-2 border-gray-200 bg-white">
                                <option value="sr">Serbian</option>
                                <option value="hr">Croatian</option>
                                <option value="sl">Slovenian</option>
                                <option value="en">English</option>
                              </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-500 mb-1">Timezone</label>
                            <select value={timezone} onChange={e => setTimezone(e.target.value)} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white">
                              <option value="Europe/Belgrade">Europe/Belgrade</option>
                              <option value="Europe/Zagreb">Europe/Zagreb</option>
                              <option value="Europe/Ljubljana">Europe/Ljubljana</option>
                              <option value="Europe/London">Europe/London</option>
                            </select>
                        </div>
                    </div>
                    {advice && (
                      <div className="mb-4 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                        <p className="text-sm text-indigo-900 font-bold">AI Suggestions</p>
                        <p className="text-indigo-800 text-sm">Suggested daily screen-time: {advice.screenTimeMinutes} min</p>
                        <p className="text-indigo-800 text-sm">Recommended games: {advice.recommendedGames.join(', ')}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      <button onClick={() => setPlan('free')} className={`py-3 rounded-xl font-bold ${plan==='free'?'bg-green-100 text-green-700':'bg-gray-100 text-gray-600'}`}>Free</button>
                      <button onClick={() => setPlan('standard')} className={`py-3 rounded-xl font-bold ${plan==='standard'?'bg-blue-100 text-blue-700':'bg-gray-100 text-gray-600'}`}>Standard</button>
                      <button onClick={() => setPlan('premium')} className={`py-3 rounded-xl font-bold ${plan==='premium'?'bg-purple-100 text-purple-700':'bg-gray-100 text-gray-600'}`}>Premium</button>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center mt-8 border-t pt-6">
                {!provisioning && step > 1 ? (
                    <button onClick={() => setStep(prev => prev - 1)} className="text-gray-400 hover:text-gray-600 font-bold flex items-center gap-2">
                        <ArrowLeft className="w-5 h-5" /> {t.back}
                    </button>
                ) : <div></div>}

                {!provisioning && step === 1 && (
                  <button 
                    onClick={handleParentSubmit}
                    disabled={!canSubmitParent}
                    className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg ${!canSubmitParent ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-brand-blue text-white hover:bg-blue-700'}`}
                  >
                    {t.next} <ArrowRight className="w-5 h-5" />
                  </button>
                )}

                {!provisioning && step === 2 && (
                  <div className="text-gray-400 font-bold">Waiting for verification…</div>
                )}

                {!provisioning && step === 3 && (
                  <button 
                    onClick={handleWorkspaceCreate}
                    disabled={!familyName || !subdomain || subdomainAvailable === false}
                    className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg ${(!familyName || !subdomain || subdomainAvailable === false) ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-brand-blue text-white hover:bg-blue-700'}`}
                  >
                    Finish <Check className="w-5 h-5" />
                  </button>
                )}
                {provisioning && (
                  <div className="text-gray-400 font-bold">Provisioning…</div>
                )}
            </div>

        </div>
      </div>
    </div>
  );
};