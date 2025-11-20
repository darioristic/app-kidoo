


import React, { useState, useEffect } from 'react';
import { View, FamilyAccount, ChildProfile, Language, AvatarId, BehavioralMetrics, GameCategory } from './types';
import { FUN_TIME_REWARD_SECONDS, TRANSLATIONS, AVATARS } from './constants';
import { SmartGame } from './components/SmartGame';
import { FunGame } from './components/FunGame';
import { ParentDashboard } from './components/ParentDashboard';
import { ParentSettings } from './components/ParentSettings';
import { ParentControls } from './components/ParentControls';
import { ParentReports } from './components/ParentReports';
import { AvatarSelection } from './components/AvatarSelection';
import { AIAvatar } from './components/AIAvatar';
import { SaaSOnboarding } from './components/SaaSOnboarding';
import { findWorkspaceByHost } from './services/tenantService';
import { supabase, isSupabaseConfigured } from './services/supabase';
import { ProfileSelector } from './components/ProfileSelector';
import { PinPad } from './components/PinPad';
import { ChildSettingsHub } from './components/ChildSettingsHub';
import { AddChildScreen } from './components/AddChildScreen';
import { loadChildren, addChild as addChildPersist, updateChild as updateChildPersist } from './services/childrenService';
import { Gamepad2, Brain, Lock, LogOut, Settings, User } from 'lucide-react';
import { AdminTenants } from './components/AdminTenants';
import { AdminGate } from './components/AdminGate';

const App: React.FC = () => {
  // Global State
  const [family, setFamily] = useState<FamilyAccount | null>(null);
  const [activeChild, setActiveChild] = useState<ChildProfile | null>(null);
  
  const [currentView, setCurrentView] = useState<View>(View.LANDING);
  const [language, setLanguage] = useState<Language>('en'); 
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [debugMode, setDebugMode] = useState(false);

  // Session State
  const [funTimeBank, setFunTimeBank] = useState(0); 
  const [activeSessionTime, setActiveSessionTime] = useState(0); 
  
  const t = TRANSLATIONS[language];
  const currentAvatarConfig = AVATARS.find(a => a.id === activeChild?.avatarId) || AVATARS[0];

  // Timer for Fun Game
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (currentView === View.FUN_GAME && activeSessionTime > 0) {
      interval = setInterval(() => {
        setActiveSessionTime((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setCurrentView(View.CHILD_HOME);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentView, activeSessionTime]);

  useEffect(() => {
    const run = async () => {
      const host = window.location.host.split(':')[0];
      const parts = host.split('.');
      const sub = host.includes('localhost') ? parts[0] : (parts.length >= 3 ? parts[0] : '');
      if (sub === 'admin') {
        setCurrentView(View.ADMIN_PANEL);
        return;
      }
      const params = new URLSearchParams(window.location.search);
      const dbg = params.get('debug');
      if (dbg === '1' || dbg === 'true') setDebugMode(true);
      const st = params.get('st');
      const rt = params.get('rt');
      if (isSupabaseConfigured() && st && rt) {
        await supabase.auth.setSession({ access_token: st, refresh_token: rt });
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, '', cleanUrl);
      }
      const ws = await findWorkspaceByHost(window.location.host);
      if (ws && !family) {
        let parentProfile = { id: 'p_' + Date.now(), name: 'Parent', pin: '0000', status: 'active_parent' } as FamilyAccount['parent'];
        if (isSupabaseConfigured()) {
          const { data } = await supabase.auth.getUser();
          const user = data.user;
          if (user) {
            const fn = (user.user_metadata as any)?.firstName || '';
            const ln = (user.user_metadata as any)?.lastName || '';
            const pinMeta = (user.user_metadata as any)?.pin || '0000';
            parentProfile = { id: user.id, name: (`${fn} ${ln}`.trim() || user.email || 'Parent'), pin: pinMeta, firstName: fn, lastName: ln, email: user.email || undefined, status: 'active_parent' } as any;
          }
        }
        const baseFamily = { parent: parentProfile, tenant: ws, children: [] } as FamilyAccount;
        const children = await loadChildren(baseFamily);
        setFamily({ ...baseFamily, children });
        setCurrentView(View.PARENT_DASHBOARD);
      }
    };
    run();
  }, []);

  // --- Handlers ---

  const handleStartOnboarding = () => {
    setCurrentView(View.ONBOARDING);
  };

  const [redirecting, setRedirecting] = useState(false);

  const handleOnboardingComplete = (newFamily: FamilyAccount) => {
    setFamily(newFamily);
    if (newFamily.tenant?.subdomain) {
      const host = window.location.host;
      const isLocal = host.includes('localhost');
      const baseDomain = (import.meta as any).env?.VITE_BASE_DOMAIN || 'brainplaykids.com';
      let authParams = '';
      if (isSupabaseConfigured()) {
        supabase.auth.getSession().then(({ data }) => {
          const at = data.session?.access_token;
          const rt = data.session?.refresh_token;
          if (at && rt) {
            authParams = `?st=${encodeURIComponent(at)}&rt=${encodeURIComponent(rt)}`;
          }
          const target = isLocal 
            ? `http://${newFamily.tenant!.subdomain}.localhost:${window.location.port || '8080'}/${authParams}`
            : `https://${newFamily.tenant!.subdomain}.${baseDomain}/${authParams}`;
          setRedirecting(true);
          setTimeout(() => { window.location.replace(target); }, 1000);
        });
        return;
      }
      const target = isLocal 
        ? `http://${newFamily.tenant.subdomain}.localhost:${window.location.port || '8080'}/`
        : `https://${newFamily.tenant.subdomain}.${baseDomain}/`;
      setRedirecting(true);
      setTimeout(() => { window.location.replace(target); }, 1000);
    } else {
      setCurrentView(View.PARENT_DASHBOARD);
    }
  };

  const handleChildSelect = (child: ChildProfile) => {
    setActiveChild(child);
    setFunTimeBank(child.funTimeBalanceSeconds); // Load saved time
    setCurrentView(View.CHILD_HOME);
  };

  const handleParentAccess = () => {
    setCurrentView(View.PIN_ENTRY);
  };

  const handlePinSuccess = () => {
    setCurrentView(View.PARENT_DASHBOARD);
  };

  const handleLogout = () => {
    setActiveChild(null);
    setCurrentView(View.PROFILE_SELECTION);
  };

  const handleSmartGameComplete = (score: number, metrics: BehavioralMetrics) => {
    const reward = FUN_TIME_REWARD_SECONDS;
    setFunTimeBank(prev => prev + reward);
    
    // Update Child Stats (Mock persistence)
    if (activeChild && family) {
        const newSession = {
            id: Date.now().toString(),
            timestamp: Date.now(),
            gameType: GameCategory.SMART,
            durationSeconds: metrics.avgResponseTimeSeconds * 3, // approx
            score: score,
            success: true,
            behavioral: metrics
        };

        const updatedChild = { 
            ...activeChild, 
            stars: activeChild.stars + 10, 
            streak: activeChild.streak + 1,
            funTimeBalanceSeconds: activeChild.funTimeBalanceSeconds + reward,
            history: [...activeChild.history, newSession]
        };
        
        setActiveChild(updatedChild);
        setFamily({
            ...family,
            children: family.children.map(c => c.id === activeChild.id ? updatedChild : c)
        });
        updateChildPersist(family, updatedChild).catch(() => {});
    }
    setCurrentView(View.CHILD_HOME);
  };

  const startFunGame = () => {
    if (funTimeBank <= 0) return;
    setActiveSessionTime(funTimeBank);
    setFunTimeBank(0); 
    setCurrentView(View.FUN_GAME);
  };

  const handleFunGameExit = () => {
    setFunTimeBank(activeSessionTime);
    setActiveSessionTime(0);
    setCurrentView(View.CHILD_HOME);
  };

  const handleAvatarChange = (id: AvatarId) => {
    if (activeChild && family) {
        const updatedChild = { ...activeChild, avatarId: id };
        setActiveChild(updatedChild);
        setFamily({
            ...family,
            children: family.children.map(c => c.id === activeChild.id ? updatedChild : c)
        });
    }
    // Go back to settings, not home, if coming from settings hub
    if (currentView === View.AVATAR_SELECTION) {
        setCurrentView(View.CHILD_SETTINGS); 
    } else {
        setCurrentView(View.CHILD_HOME);
    }
  };

  const handleUpdateChildName = (newName: string) => {
      if (activeChild && family) {
        const updatedChild = { ...activeChild, name: newName };
        setActiveChild(updatedChild);
        setFamily({
            ...family,
            children: family.children.map(c => c.id === activeChild.id ? updatedChild : c)
        });
    }
  };

  const handleAddFriend = (friendName: string) => {
      if (activeChild && family) {
        const updatedChild = { 
            ...activeChild, 
            friends: [...(activeChild.friends || []), friendName] 
        };
        setActiveChild(updatedChild);
        setFamily({
            ...family,
            children: family.children.map(c => c.id === activeChild.id ? updatedChild : c)
        });
    }
  };

  const handleAddChild = async (newChild: ChildProfile) => {
      if (family) {
          const saved = await addChildPersist(family, newChild);
          setFamily({
              ...family,
              children: [...family.children, saved]
          });
      }
      setCurrentView(View.PARENT_DASHBOARD);
  };

  const LanguageSwitcher = ({ inline = false }: { inline?: boolean }) => (
    <div className={`${inline ? 'flex gap-2 bg-white/90 p-1 rounded-lg shadow-sm border border-gray-100 mx-auto mt-6 w-fit' : 'flex gap-2 bg-white/90 p-1 rounded-lg shadow-sm absolute bottom-4 left-4 z-[90] border border-gray-100'}`}>
        <button onClick={() => setLanguage('sr')} className={`px-2 py-1 rounded text-sm ${language === 'sr' ? 'bg-brand-blue text-white' : 'hover:bg-gray-100 text-gray-500'}`}>🇷🇸</button>
        <button onClick={() => setLanguage('hr')} className={`px-2 py-1 rounded text-sm ${language === 'hr' ? 'bg-brand-blue text-white' : 'hover:bg-gray-100 text-gray-500'}`}>🇭🇷</button>
        <button onClick={() => setLanguage('sl')} className={`px-2 py-1 rounded text-sm ${language === 'sl' ? 'bg-brand-blue text-white' : 'hover:bg-gray-100 text-gray-500'}`}>🇸🇮</button>
        <button onClick={() => setLanguage('en')} className={`px-2 py-1 rounded text-sm ${language === 'en' ? 'bg-brand-blue text-white' : 'hover:bg-gray-100 text-gray-500'}`}>🇺🇸</button>
    </div>
  );

  // --- Render Views ---

  if (redirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-2xl px-10 py-8 text-center">
          <div className="w-14 h-14 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin mx-auto mb-4"></div>
          <h2 className="text-3xl font-display font-bold text-gray-800 mb-2">Preparing your space…</h2>
          <p className="text-gray-500">Please wait</p>
        </div>
      </div>
    );
  }

  if (debugMode) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-bold mb-4">Debug Info</h2>
          <div className="space-y-2 text-sm text-gray-700">
            <div>host: {typeof window !== 'undefined' ? window.location.host : ''}</div>
            <div>view: {currentView}</div>
            <div>tenant: {family?.tenant?.subdomain || 'none'}</div>
            <div>supabase: {isSupabaseConfigured() ? 'configured' : 'not configured'}</div>
            <div>children: {family?.children?.length ?? 0}</div>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === View.LANDING) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-blue to-brand-purple flex flex-col items-center justify-center p-4 relative text-center">
        <div className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <h1 className="text-6xl md:text-8xl font-display font-bold text-white mb-4 drop-shadow-lg">{t.title}</h1>
            <p className="text-2xl text-white/80">{t.subtitle}</p>
        </div>
        <button 
            onClick={handleStartOnboarding}
            className="bg-brand-yellow hover:bg-yellow-400 text-brand-blue text-2xl font-bold py-4 px-12 rounded-full shadow-[0_0_40px_rgba(245,158,11,0.5)] hover:scale-110 transition-all duration-300 animate-pulse"
        >
            {t.getStarted}
        </button>
        <LanguageSwitcher inline />
      </div>
    );
  }

  if (currentView === View.ONBOARDING) {
    return <SaaSOnboarding onComplete={handleOnboardingComplete} language={language} />;
  }

  if (currentView === View.PROFILE_SELECTION && family) {
      return <ProfileSelector family={family} onSelectChild={handleChildSelect} onSelectParent={handleParentAccess} language={language} />;
  }

  if (currentView === View.PIN_ENTRY && family) {
      return (
        <PinPad 
            expectedPin={family.parent.pin} 
            onSuccess={handlePinSuccess} 
            onCancel={() => setCurrentView(View.PROFILE_SELECTION)} 
            language={language} 
        />
      );
  }

  if (currentView === View.PARENT_DASHBOARD && family) {
    return (
        <ParentDashboard 
            family={family} 
            onBack={() => setCurrentView(View.PROFILE_SELECTION)} 
            onAddChild={() => setCurrentView(View.ADD_CHILD)}
            onSettings={() => setCurrentView(View.PARENT_SETTINGS)}
            onControls={() => setCurrentView(View.PARENT_CONTROLS)}
            onReports={() => setCurrentView(View.PARENT_REPORTS)}
            language={language} 
        />
    );
  }

  if (currentView === View.PARENT_SETTINGS && family) {
      return (
          <ParentSettings 
            family={family}
            onBack={() => setCurrentView(View.PARENT_DASHBOARD)}
            language={language}
            onLanguageChange={setLanguage}
          />
      );
  }

  if (currentView === View.PARENT_CONTROLS && family) {
      return (
          <ParentControls 
            family={family}
            onBack={() => setCurrentView(View.PARENT_DASHBOARD)}
            language={language}
          />
      );
  }
  
  if (currentView === View.PARENT_REPORTS && family) {
      return (
          <ParentReports 
            family={family}
            onBack={() => setCurrentView(View.PARENT_DASHBOARD)}
            language={language}
          />
      );
  }

  if (currentView === View.ADD_CHILD) {
      return (
          <AddChildScreen 
            onSave={handleAddChild}
            onCancel={() => setCurrentView(View.PARENT_DASHBOARD)}
            language={language}
          />
      );
  }

  // -- Authenticated Child Views Below --

  if (currentView === View.CHILD_SETTINGS && activeChild) {
      return (
          <ChildSettingsHub 
            child={activeChild}
            onUpdateName={handleUpdateChildName}
            onChangeAvatarRequest={() => setCurrentView(View.AVATAR_SELECTION)}
            onToggleSound={() => setSoundEnabled(!soundEnabled)}
            soundEnabled={soundEnabled}
            onBack={() => setCurrentView(View.CHILD_HOME)}
            onAddFriend={handleAddFriend}
            language={language}
          />
      );
  }

  if (currentView === View.AVATAR_SELECTION && activeChild) {
    return <AvatarSelection currentAvatarId={activeChild.avatarId} onSelect={handleAvatarChange} onBack={() => setCurrentView(View.CHILD_SETTINGS)} language={language} />;
  }

  if (currentView === View.FUN_GAME) {
    return <FunGame timeLeft={activeSessionTime} onExit={handleFunGameExit} language={language} />;
  }

  if (currentView === View.SMART_GAME && activeChild) {
    return (
      <SmartGame 
        onComplete={handleSmartGameComplete} 
        onExit={() => setCurrentView(View.CHILD_HOME)} 
        language={language}
        avatarId={activeChild.avatarId} 
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
      />
    );
  }

  // Child Home
  if (activeChild) {
      return (
        <div className="min-h-screen bg-[#F3F4F6] relative pb-32">
        <LanguageSwitcher />
        <header className="bg-white p-4 shadow-sm sticky top-0 z-30">
            <div className="max-w-5xl mx-auto flex justify-between items-center">
                
                {/* Settings/Name Button (No Profile Photo/Avatar) */}
                <div className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded-xl transition-colors" onClick={() => setCurrentView(View.CHILD_SETTINGS)}>
                    <div className="p-2 bg-gray-100 rounded-full text-gray-600">
                        <Settings className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="font-bold text-gray-800 leading-tight text-lg">{activeChild.name}</h2>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span> {t.online}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 md:gap-4">
                    <div className="bg-orange-100 text-brand-orange px-3 py-1.5 md:px-4 md:py-2 rounded-xl font-bold flex items-center gap-2 text-sm md:text-base">
                        <Gamepad2 className="w-4 h-4 md:w-5 md:h-5" />
                        {Math.floor(funTimeBank / 60)} {t.minsEarned}
                    </div>
                    
                    {/* Logout Button */}
                    <button 
                        onClick={handleLogout} 
                        className="bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 p-2 pr-3 rounded-lg flex items-center gap-1 transition-colors"
                        title="Logout"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="hidden md:inline font-bold text-sm">{t.exitChildMode}</span>
                    </button>
                </div>
            </div>
        </header>

        <main className="max-w-5xl mx-auto p-6">
            <div className="mb-8 flex justify-between items-end">
                <div>
                <h1 className="text-2xl md:text-3xl font-display font-bold text-gray-800 mb-2">{t.welcomeBack} {activeChild.name}! 👋</h1>
                <p className="text-gray-500">{t.unlockFun}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Smart Card */}
                <div 
                    onClick={() => setCurrentView(View.SMART_GAME)}
                    className="bg-white rounded-3xl p-1 shadow-xl cursor-pointer transition-transform hover:-translate-y-1 group"
                >
                    <div className="bg-gradient-to-br from-brand-blue to-brand-purple rounded-[20px] p-8 h-full relative overflow-hidden text-white">
                        <Brain className="w-32 h-32 absolute -right-6 -bottom-6 text-white opacity-20 group-hover:scale-110 transition-transform duration-500" />
                        <div className="relative z-10">
                            <div className="bg-white/20 w-fit px-3 py-1 rounded-lg text-sm font-bold mb-4 backdrop-blur-sm">
                                Daily Challenge
                            </div>
                            <h2 className="text-3xl font-display font-bold mb-2">{t.smartGameTitle}</h2>
                            <p className="opacity-90 mb-6">{t.smartGameDesc}</p>
                            
                            <button className="bg-white text-brand-blue px-6 py-3 rounded-xl font-bold shadow-lg group-hover:shadow-white/25 transition-all">
                                {t.playNow}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Fun Card */}
                <div 
                    onClick={startFunGame}
                    className={`bg-white rounded-3xl p-1 shadow-xl transition-transform ${funTimeBank > 0 ? 'cursor-pointer hover:-translate-y-1' : 'opacity-70 cursor-not-allowed grayscale'}`}
                >
                    <div className="bg-gradient-to-br from-brand-orange to-brand-yellow rounded-[20px] p-8 h-full relative overflow-hidden text-white">
                        <Gamepad2 className="w-32 h-32 absolute -right-6 -bottom-6 text-white opacity-20" />
                        {funTimeBank <= 0 && (
                            <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px] flex flex-col items-center justify-center z-20">
                                <Lock className="w-12 h-12 mb-2" />
                                <span className="font-bold">{t.locked}</span>
                                <span className="text-sm">{t.lockedDesc}</span>
                            </div>
                        )}
                        
                        <div className="relative z-10">
                            <div className="bg-white/20 w-fit px-3 py-1 rounded-lg text-sm font-bold mb-4 backdrop-blur-sm">
                                Reward Zone
                            </div>
                            <h2 className="text-3xl font-display font-bold mb-2">{t.funGameTitle}</h2>
                            <p className="opacity-90 mb-6">{t.funGameDesc}</p>
                            
                            <button className="bg-white text-brand-orange px-6 py-3 rounded-xl font-bold shadow-lg">
                                {funTimeBank > 0 ? t.enterZone : t.earnTime}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
        
        <AIAvatar 
            message={t.welcomeBack + " " + activeChild.name + "!"} 
            emotion="happy" 
            language={language} 
            avatarId={activeChild.avatarId}
            soundEnabled={soundEnabled}
            onToggleSound={() => setSoundEnabled(!soundEnabled)}
        />
        </div>
      );
  }

  if (currentView === View.ADMIN_PANEL) {
    return <AdminGate language={'en'} onBack={() => setCurrentView(View.PARENT_DASHBOARD)} />;
  }
  if (currentView === View.ADMIN_TENANTS) {
    return <AdminTenants onBack={() => setCurrentView(View.PARENT_DASHBOARD)} language={'en'} />;
  }

  // Fallback
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center">
      <div className="bg-white rounded-3xl shadow-2xl px-8 py-6 text-center">
        <p className="text-gray-500 font-bold">Loading…</p>
      </div>
    </div>
  );
};

export default App;