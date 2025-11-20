
import React, { useState } from 'react';
import { FamilyAccount, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { ArrowLeft, Clock, SlidersHorizontal, Zap, BookOpen, Brain, Languages, Activity } from 'lucide-react';

interface ParentControlsProps {
  family: FamilyAccount;
  onBack: () => void;
  language: Language;
}

export const ParentControls: React.FC<ParentControlsProps> = ({ family, onBack, language }) => {
  const t = TRANSLATIONS[language];
  
  // Mock state for controls
  const [dailyGoal, setDailyGoal] = useState(60);
  const [funRuleActive, setFunRuleActive] = useState(true);
  const [rewardRatio, setRewardRatio] = useState(15); // mins
  const [subjects, setSubjects] = useState({ math: true, logic: true, lang: true });

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
            <h1 className="text-2xl font-display font-bold text-gray-800 flex items-center gap-2">
                <SlidersHorizontal className="w-6 h-6 text-brand-blue" />
                {t.parentControls}
            </h1>
         </div>
      </div>

      <div className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full space-y-6">

        {/* Screen Time Goal */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
             <div className="flex items-center gap-3 mb-6">
                 <div className="p-3 bg-blue-100 text-brand-blue rounded-xl">
                     <Clock className="w-6 h-6" />
                 </div>
                 <div>
                     <h2 className="text-xl font-bold text-gray-800">{t.globalDailyGoal}</h2>
                     <p className="text-sm text-gray-500">Limit total screen time per day</p>
                 </div>
             </div>
             
             <div className="px-2">
                 <div className="flex justify-between items-end mb-4">
                     <span className="text-4xl font-bold text-gray-800">{dailyGoal} <span className="text-lg text-gray-400 font-normal">min</span></span>
                 </div>
                 <input 
                    type="range" 
                    min="15" 
                    max="180" 
                    step="15"
                    value={dailyGoal}
                    onChange={e => setDailyGoal(Number(e.target.value))}
                    className="w-full h-4 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-brand-blue"
                 />
                 <div className="flex justify-between text-xs text-gray-400 mt-2 font-bold uppercase">
                     <span>15 min</span>
                     <span>3 h</span>
                 </div>
             </div>
        </section>

        {/* Fun Rule */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
             <div className="flex items-center gap-3 mb-6">
                 <div className="p-3 bg-orange-100 text-brand-orange rounded-xl">
                     <Zap className="w-6 h-6" />
                 </div>
                 <div className="flex-1">
                     <h2 className="text-xl font-bold text-gray-800">{t.funRule}</h2>
                     <p className="text-sm text-gray-500">{t.funRuleDesc} (Family Wide)</p>
                 </div>
                 <div className="flex items-center gap-2">
                     <span className={`text-sm font-bold ${funRuleActive ? 'text-brand-blue' : 'text-gray-400'}`}>{t.active}</span>
                     <Toggle checked={funRuleActive} onChange={() => setFunRuleActive(!funRuleActive)} />
                 </div>
             </div>

             <div className={`transition-opacity ${funRuleActive ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                 <label className="block text-sm font-bold text-gray-500 mb-3">{t.rewardRatio}</label>
                 <div className="grid grid-cols-4 gap-3">
                     {[5, 10, 15, 20].map(mins => (
                         <button 
                            key={mins}
                            onClick={() => setRewardRatio(mins)}
                            className={`py-3 rounded-xl font-bold border-2 transition-all ${rewardRatio === mins ? 'border-brand-orange bg-orange-50 text-brand-orange' : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}
                         >
                             {mins}m
                         </button>
                     ))}
                 </div>
             </div>
        </section>

        {/* Educational Focus */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
             <div className="flex items-center gap-3 mb-6">
                 <div className="p-3 bg-purple-100 text-brand-purple rounded-xl">
                     <BookOpen className="w-6 h-6" />
                 </div>
                 <h2 className="text-xl font-bold text-gray-800">{t.subjects}</h2>
             </div>

             <div className="space-y-4">
                 <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                     <div className="flex items-center gap-3">
                         <Activity className="w-5 h-5 text-blue-500" />
                         <span className="font-bold text-gray-700">{t.math}</span>
                     </div>
                     <Toggle checked={subjects.math} onChange={() => setSubjects(p => ({...p, math: !p.math}))} />
                 </div>
                 <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                     <div className="flex items-center gap-3">
                         <Brain className="w-5 h-5 text-purple-500" />
                         <span className="font-bold text-gray-700">{t.logic}</span>
                     </div>
                     <Toggle checked={subjects.logic} onChange={() => setSubjects(p => ({...p, logic: !p.logic}))} />
                 </div>
                 <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                     <div className="flex items-center gap-3">
                         <Languages className="w-5 h-5 text-green-500" />
                         <span className="font-bold text-gray-700">{t.languages}</span>
                     </div>
                     <Toggle checked={subjects.lang} onChange={() => setSubjects(p => ({...p, lang: !p.lang}))} />
                 </div>
             </div>
        </section>

      </div>
    </div>
  );
};
