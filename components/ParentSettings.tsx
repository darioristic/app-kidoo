
import React, { useState } from 'react';
import { FamilyAccount, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { 
  ArrowLeft, Bell, Smartphone, Shield, Eye, Moon, Sun, 
  Type, Globe, Volume2, UserCog, KeyRound
} from 'lucide-react';

interface ParentSettingsProps {
  family: FamilyAccount;
  onBack: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export const ParentSettings: React.FC<ParentSettingsProps> = ({ family, onBack, language, onLanguageChange }) => {
  const t = TRANSLATIONS[language];
  const [notifications, setNotifications] = useState({ weekly: true, alerts: true });
  const [theme, setTheme] = useState<'light' | 'dark' | 'contrast'>('light');
  const [largeText, setLargeText] = useState(false);
  const [parentName, setParentName] = useState(family.parent.name);

  const Toggle = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => (
    <button 
      onClick={onChange}
      className={`w-12 h-7 rounded-full transition-all duration-300 relative ${checked ? 'bg-brand-blue' : 'bg-gray-200'}`}
    >
      <div className={`
        absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300
        ${checked ? 'translate-x-5' : 'translate-x-0'}
      `} />
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      
      {/* Header */}
      <div className="bg-white shadow-sm p-4 sticky top-0 z-10">
         <div className="max-w-4xl mx-auto flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-2xl font-display font-bold text-gray-800">{t.settings}</h1>
         </div>
      </div>

      <div className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full space-y-6">

        {/* Parent Profile Card */}
        <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-50 to-transparent rounded-bl-full -mr-16 -mt-16 pointer-events-none" />
             
             <div className="flex items-center gap-3 mb-6 relative z-10">
                 <div className="p-3 bg-brand-blue/10 text-brand-blue rounded-xl">
                     <UserCog className="w-6 h-6" />
                 </div>
                 <h2 className="text-xl font-bold text-gray-800">{t.parentProfile}</h2>
             </div>

             <div className="flex flex-col md:flex-row gap-6 items-center md:items-start relative z-10">
                 <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-4xl border-4 border-white shadow-md text-gray-500 font-bold">
                     {parentName.charAt(0)}
                 </div>
                 <div className="flex-1 w-full space-y-4">
                     <div>
                         <label className="block text-sm font-bold text-gray-400 mb-1">{t.parentName}</label>
                         <div className="flex gap-2">
                             <input 
                                value={parentName} 
                                onChange={(e) => setParentName(e.target.value)}
                                className="flex-1 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-2 font-bold text-gray-700 focus:border-brand-blue focus:outline-none transition-colors"
                             />
                         </div>
                     </div>
                     <button className="flex items-center gap-2 text-brand-blue font-bold bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors w-fit">
                         <KeyRound className="w-4 h-4" /> {t.changePin}
                     </button>
                 </div>
             </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* App Settings */}
            <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-purple-100 text-brand-purple rounded-xl">
                        <Smartphone className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">{t.appSettings}</h2>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Globe className="w-5 h-5 text-gray-400" />
                            <span className="font-bold text-gray-700">{t.language}</span>
                        </div>
                        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                            {(['sr', 'hr', 'sl', 'en'] as Language[]).map(l => (
                                <button 
                                    key={l}
                                    onClick={() => onLanguageChange(l)}
                                    className={`w-8 h-8 rounded-md text-sm font-bold transition-all ${language === l ? 'bg-white shadow text-brand-blue' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    {l === 'en' ? 'EN' : l.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <Volume2 className="w-5 h-5 text-gray-400" />
                            <span className="font-bold text-gray-700">{t.soundEffects}</span>
                        </div>
                        <Toggle checked={true} onChange={() => {}} />
                    </div>
                </div>
            </section>

            {/* Notifications */}
            <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-orange-100 text-brand-orange rounded-xl">
                        <Bell className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">{t.notifications}</h2>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-bold text-gray-700">{t.weeklyReport}</p>
                            <p className="text-xs text-gray-400">Email summary every Monday</p>
                        </div>
                        <Toggle checked={notifications.weekly} onChange={() => setNotifications(prev => ({...prev, weekly: !prev.weekly}))} />
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-bold text-gray-700">{t.childAlerts}</p>
                            <p className="text-xs text-gray-400">Push notification for milestones</p>
                        </div>
                        <Toggle checked={notifications.alerts} onChange={() => setNotifications(prev => ({...prev, alerts: !prev.alerts}))} />
                    </div>
                </div>
            </section>

        </div>

        {/* Theme & Accessibility */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
             <div className="flex items-center gap-3 mb-6">
                 <div className="p-3 bg-green-100 text-brand-green rounded-xl">
                     <Eye className="w-6 h-6" />
                 </div>
                 <h2 className="text-xl font-bold text-gray-800">{t.themeAccess}</h2>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div>
                     <label className="block font-bold text-gray-700 mb-3">{t.theme}</label>
                     <div className="grid grid-cols-3 gap-3">
                         <button 
                            onClick={() => setTheme('light')}
                            className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${theme === 'light' ? 'border-brand-blue bg-blue-50 text-brand-blue' : 'border-gray-100 hover:border-gray-200'}`}
                         >
                             <Sun className="w-6 h-6" />
                             <span className="text-xs font-bold">Light</span>
                         </button>
                         <button 
                            onClick={() => setTheme('dark')}
                            className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${theme === 'dark' ? 'border-brand-blue bg-gray-800 text-white' : 'border-gray-100 hover:border-gray-200'}`}
                         >
                             <Moon className="w-6 h-6" />
                             <span className="text-xs font-bold">Dark</span>
                         </button>
                          <button 
                            onClick={() => setTheme('contrast')}
                            className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${theme === 'contrast' ? 'border-black bg-white text-black' : 'border-gray-100 hover:border-gray-200'}`}
                         >
                             <Shield className="w-6 h-6" />
                             <span className="text-xs font-bold">Contrast</span>
                         </button>
                     </div>
                 </div>

                 <div>
                     <div className="flex items-center justify-between mb-4">
                         <div className="flex items-center gap-2">
                             <Type className="w-5 h-5 text-gray-400" />
                             <span className="font-bold text-gray-700">{t.largeText}</span>
                         </div>
                         <Toggle checked={largeText} onChange={() => setLargeText(!largeText)} />
                     </div>
                     <div className="bg-gray-50 p-4 rounded-xl">
                         <p className={`text-gray-600 transition-all ${largeText ? 'text-lg' : 'text-sm'}`}>
                             The quick brown fox jumps over the lazy dog.
                         </p>
                     </div>
                 </div>
             </div>
        </section>

      </div>
    </div>
  );
};
