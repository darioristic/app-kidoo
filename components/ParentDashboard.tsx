
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FamilyAccount, ChildProfile, Language, BehavioralInsightReport } from '../types';
import { Lock, Clock, BookOpen, Activity, ChevronDown, ArrowLeft, Brain, Eye, MousePointer2, Plus, Settings, LogOut, SlidersHorizontal, FileText, Sparkles, Target, Building2 } from 'lucide-react';
import { TRANSLATIONS, AVATARS } from '../constants';
import { generateParentBehavioralReport } from '../services/geminiService';
import { createCheckoutSession } from '../services/billingService';

interface ParentDashboardProps {
  family: FamilyAccount;
  onBack: () => void;
  onAddChild: () => void;
  onSettings: () => void;
  onControls: () => void;
  onReports: () => void;
  onAdmin?: () => void;
  language: Language;
}

const data = [
  { name: 'Mon', smart: 20, fun: 15 },
  { name: 'Tue', smart: 30, fun: 25 },
  { name: 'Wed', smart: 15, fun: 10 },
  { name: 'Thu', smart: 45, fun: 40 },
  { name: 'Fri', smart: 25, fun: 30 },
  { name: 'Sat', smart: 10, fun: 45 },
  { name: 'Sun', smart: 5, fun: 20 },
];

export const ParentDashboard: React.FC<ParentDashboardProps> = ({ family, onBack, onAddChild, onSettings, onControls, onReports, onAdmin, language }) => {
  const t = TRANSLATIONS[language];
  const [selectedChildId, setSelectedChildId] = useState<string>(family.children[0]?.id || '');
  const [insightReport, setInsightReport] = useState<BehavioralInsightReport | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);

  const selectedChild = family.children.find(c => c.id === selectedChildId) || family.children[0];
  const canAddChild = (family.tenant?.status === 'active') && (family.parent.status === 'active_parent');

  // Fetch AI Insight when child changes
  useEffect(() => {
    const fetchInsight = async () => {
      if (!selectedChild) return;
      
      // Find last session with behavioral data
      const lastSession = [...selectedChild.history].reverse().find(s => s.behavioral);
      
      if (lastSession && lastSession.behavioral) {
        setLoadingInsight(true);
        const report = await generateParentBehavioralReport(selectedChild.name, lastSession.behavioral, language);
        setInsightReport(report);
        setLoadingInsight(false);
      } else {
        setInsightReport(null);
      }
    };
    fetchInsight();
  }, [selectedChildId, language]);

  if (!selectedChild) return (
    <div className="min-h-screen bg-gray-100 pb-10">
      <div className="p-4 md:p-8 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-800">{t.dashboardTitle}</h1>
            <p className="text-gray-500">Welcome, {family.parent.name}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-blue-50 text-brand-blue flex items-center justify-center mx-auto mb-4">+
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">No children yet</h2>
          <p className="text-gray-500 mb-6">Create your first child profile to start.</p>
          <button
            onClick={() => canAddChild && onAddChild()}
            disabled={!canAddChild}
            className={`px-6 py-3 rounded-xl font-bold ${canAddChild ? 'bg-brand-blue text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
          >
            {t.addChild}
          </button>
        </div>
      </div>
    </div>
  );

  const avatarConfig = AVATARS.find(a => a.id === selectedChild.avatarId) || AVATARS[0];

  return (
    <div className="min-h-screen bg-gray-100 pb-10">
      {/* Mobile Header */}
      <div className="bg-white p-4 sticky top-0 z-20 shadow-sm md:hidden flex items-center justify-between">
          <div className="flex items-center gap-2">
             <Lock className="w-5 h-5 text-brand-blue" />
             <span className="font-bold text-gray-800">{t.dashboardTitle}</span>
          </div>
          <div className="flex gap-2">
             <button onClick={onControls} className="p-2 bg-blue-50 rounded-full text-brand-blue hover:bg-blue-100">
                 <SlidersHorizontal className="w-5 h-5" />
             </button>
             <button onClick={onReports} className="p-2 bg-purple-50 rounded-full text-brand-purple hover:bg-purple-100">
                 <FileText className="w-5 h-5" />
             </button>
             {onAdmin && (import.meta as any).env?.VITE_SHOW_ADMIN === 'true' && (
               <button onClick={onAdmin} className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200">
                 <Building2 className="w-5 h-5" />
               </button>
             )}
             <button onClick={onSettings} className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200">
                 <Settings className="w-5 h-5" />
             </button>
             <button onClick={onBack} className="p-2 bg-red-50 rounded-full text-red-500 hover:bg-red-100">
                 <LogOut className="w-5 h-5" />
             </button>
          </div>
      </div>

      <div className="p-4 md:p-8 max-w-6xl mx-auto">
        
        {/* Desktop Header */}
        <div className="hidden md:flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-display font-bold text-gray-800 flex items-center gap-2">
                    <Lock className="w-6 h-6 text-gray-400" />
                    {t.dashboardTitle}
                </h1>
                <p className="text-gray-500">Welcome, {family.parent.name}</p>
            </div>
            <div className="flex items-center gap-3">
                <button onClick={onControls} className="bg-white px-4 py-2 rounded-lg shadow text-brand-blue font-bold hover:bg-blue-50 flex items-center gap-2 transition-colors">
                    <SlidersHorizontal className="w-4 h-4" /> {t.controls}
                </button>
                <button onClick={onReports} className="bg-white px-4 py-2 rounded-lg shadow text-brand-purple font-bold hover:bg-purple-50 flex items-center gap-2 transition-colors">
                    <FileText className="w-4 h-4" /> {t.reports}
                </button>
                <button
                  onClick={async () => {
                    const url = await createCheckoutSession((family.tenant?.subdomain || 'local'), (family.tenant?.plan || 'free'));
                    if (url) window.location.href = url;
                  }}
                  className="bg-white px-4 py-2 rounded-lg shadow text-green-700 font-bold hover:bg-green-50 flex items-center gap-2 transition-colors"
                >
                  Billing
                </button>
                <button onClick={onSettings} className="bg-white px-4 py-2 rounded-lg shadow text-gray-700 font-bold hover:bg-gray-50 flex items-center gap-2 transition-colors">
                    <Settings className="w-4 h-4" /> {t.settings}
                </button>
                <button onClick={onBack} className="bg-red-50 px-4 py-2 rounded-lg shadow text-red-500 font-bold hover:bg-red-100 flex items-center gap-2 transition-colors" title={t.exitChildMode}>
                    <LogOut className="w-4 h-4" /> {t.exitChildMode}
                </button>
            </div>
        </div>

        {/* Child Selector & Add Button */}
        <div className="flex gap-3 overflow-x-auto pb-4 mb-4 snap-x">
            {family.children.map(child => (
                <button
                    key={child.id}
                    onClick={() => setSelectedChildId(child.id)}
                    className={`
                        snap-start flex items-center gap-3 px-4 md:px-6 py-3 rounded-2xl transition-all whitespace-nowrap border-2
                        ${selectedChildId === child.id ? 'border-brand-blue bg-blue-50 text-brand-blue shadow-md' : 'border-transparent bg-white text-gray-600 hover:bg-gray-50'}
                    `}
                >
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${AVATARS.find(a => a.id === child.avatarId)?.bgGradient}`} />
                    <span className="font-bold">{child.name}</span>
                </button>
            ))}
            
            {/* Add Child Button */}
            <button
                onClick={() => canAddChild && onAddChild()}
                disabled={!canAddChild}
                className={`snap-start flex items-center gap-3 px-4 md:px-6 py-3 rounded-2xl border-2 transition-all whitespace-nowrap group ${canAddChild ? 'border-dashed border-gray-300 text-gray-500 hover:bg-gray-50 hover:border-gray-400' : 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-100'}`}
            >
                <div className={`w-8 h-8 rounded-full ${canAddChild ? 'bg-gray-200 group-hover:bg-gray-300' : 'bg-gray-300'} flex items-center justify-center transition-colors`}>
                    <Plus className="w-5 h-5 text-gray-600" />
                </div>
                <span className={`font-bold ${canAddChild ? 'group-hover:text-gray-700' : 'text-gray-500'}`}>{t.addChild}</span>
            </button>
        </div>

        {/* Stats Cards - Stack on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-brand-blue flex sm:block items-center justify-between sm:justify-start">
                <div className="flex items-center gap-3 mb-0 sm:mb-2">
                    <div className="p-2 bg-blue-100 rounded-lg"><BookOpen className="text-brand-blue w-5 h-5" /></div>
                    <h3 className="text-base md:text-lg font-bold text-gray-700">{t.smartGamesCount}</h3>
                </div>
                <div className="text-right sm:text-left">
                    <p className="text-2xl md:text-3xl font-bold">{selectedChild.stars / 10}</p>
                    <p className="text-xs text-gray-400">{t.weeklyStats}</p>
                </div>
            </div>
            
            <div className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-brand-orange flex sm:block items-center justify-between sm:justify-start">
                <div className="flex items-center gap-3 mb-0 sm:mb-2">
                    <div className="p-2 bg-orange-100 rounded-lg"><Clock className="text-brand-orange w-5 h-5" /></div>
                    <h3 className="text-base md:text-lg font-bold text-gray-700">{t.funTimeCount}</h3>
                </div>
                <div className="text-right sm:text-left">
                    <p className="text-2xl md:text-3xl font-bold">{Math.round(selectedChild.funTimeBalanceSeconds / 60)}m</p>
                    <p className="text-xs text-gray-400">{t.weeklyStats}</p>
                </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-brand-purple flex sm:block items-center justify-between sm:justify-start">
                 <div className="flex items-center gap-3 mb-0 sm:mb-2">
                    <div className="p-2 bg-purple-100 rounded-lg"><Activity className="text-brand-purple w-5 h-5" /></div>
                    <h3 className="text-base md:text-lg font-bold text-gray-700">{t.focusScore}</h3>
                </div>
                <div className="text-right sm:text-left">
                    <p className="text-2xl md:text-3xl font-bold">{(selectedChild.streak + 5).toFixed(1)}/10</p>
                    <p className="text-xs text-gray-400">AI Metric</p>
                </div>
            </div>
        </div>

        {/* AI Behavioral Insights (New Section) */}
        {insightReport ? (
             <div className="mb-8 bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-3xl p-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
                
                <div className="flex items-center gap-3 mb-6 relative z-10">
                    <div className="bg-white p-2 rounded-xl shadow-sm text-indigo-600">
                        <Brain className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-display font-bold text-indigo-900">Behavioral & Cognitive Insights</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                    {/* Observation Card */}
                    <div className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-indigo-50">
                        <div className="flex items-center gap-2 text-indigo-800 font-bold mb-2 text-sm uppercase tracking-wider">
                            <Eye className="w-4 h-4" /> Observation
                        </div>
                        <p className="text-gray-700 leading-relaxed italic">"{insightReport.observation}"</p>
                    </div>

                    {/* Analysis/Summary Card */}
                    <div className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-indigo-50">
                        <div className="flex items-center gap-2 text-indigo-800 font-bold mb-2 text-sm uppercase tracking-wider">
                            <Activity className="w-4 h-4" /> Analysis
                        </div>
                        <p className="text-gray-700 leading-relaxed">{insightReport.summary}</p>
                    </div>

                    {/* Recommendation Card */}
                    <div className="bg-indigo-600 text-white p-4 rounded-2xl shadow-lg transform transition-transform hover:scale-[1.02]">
                        <div className="flex items-center gap-2 font-bold mb-2 text-sm uppercase tracking-wider text-indigo-100">
                            <Brain className="w-4 h-4" /> AI Recommendation
                        </div>
                        <p className="leading-relaxed font-medium">{insightReport.recommendation}</p>
                    </div>
                </div>
             </div>
        ) : loadingInsight ? (
             <div className="mb-8 bg-gray-50 rounded-3xl p-8 flex items-center justify-center">
                 <div className="animate-pulse flex flex-col items-center gap-4">
                     <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div>
                     <p className="text-gray-400 font-bold">Analyzing recent gameplay telemetry...</p>
                 </div>
             </div>
        ) : (
            <div className="mb-8 bg-gray-50 rounded-3xl p-8 text-center text-gray-400">
                <p>Play some games to generate behavioral insights!</p>
            </div>
        )}

        {/* Analytics & Insights Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm">
                <h3 className="text-xl font-bold mb-6 text-gray-800">{t.activityBalance}</h3>
                <div className="h-[250px] md:h-[300px] -ml-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" fontSize={12} tickMargin={10} />
                            <YAxis fontSize={12} />
                            <Tooltip 
                                cursor={{fill: 'transparent'}} 
                                contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                            />
                            <Bar dataKey="smart" fill="#4F46E5" radius={[4, 4, 0, 0]} name="Learning" />
                            <Bar dataKey="fun" fill="#F97316" radius={[4, 4, 0, 0]} name="Playing" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm flex flex-col">
                <h3 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-brand-yellow" /> 
                    AI Recommendations
                </h3>
                <div className="space-y-4 flex-1">
                    <div className="p-4 bg-green-50 rounded-xl border border-green-100 transition-transform hover:scale-[1.02]">
                        <div className="flex gap-3 items-start">
                            <div className="bg-white p-2 rounded-full shadow-sm text-green-600"><Target className="w-5 h-5" /></div>
                            <div>
                                <p className="font-bold text-green-900">Challenge Level</p>
                                <p className="text-green-800 text-sm mt-1 leading-relaxed">
                                    Ready for <strong>Medium Difficulty</strong> in Logic games.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 transition-transform hover:scale-[1.02]">
                        <div className="flex gap-3 items-start">
                            <div className="bg-white p-2 rounded-full shadow-sm text-blue-600"><Clock className="w-5 h-5" /></div>
                            <div>
                                <p className="font-bold text-blue-900">Schedule</p>
                                <p className="text-blue-800 text-sm mt-1 leading-relaxed">
                                    Best focus observed between <strong>10 AM - 12 PM</strong>.
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-auto pt-6 border-t">
                        <h4 className="font-bold text-gray-700 mb-3">{t.controls}</h4>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors" onClick={onControls}>
                            <span className="flex items-center gap-2 text-gray-600"><Lock className="w-4 h-4" /> {t.dailyLimit}</span>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-800">{selectedChild.settings.dailyScreenTimeLimitMinutes} min</span>
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
