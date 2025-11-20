
import React, { useState } from 'react';
import { Language, FamilyAccount, ChildProfile, AvatarId } from '../types';
import { TRANSLATIONS, AVATARS, DEFAULT_CHILD_SETTINGS } from '../constants';
import { User, Lock, Sparkles, ArrowRight, Check, ArrowLeft } from 'lucide-react';

interface OnboardingWizardProps {
  onComplete: (family: FamilyAccount) => void;
  language: Language;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete, language }) => {
  const [step, setStep] = useState(1);
  const [parentName, setParentName] = useState('');
  const [pin, setPin] = useState('');
  
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState<number>(7);
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarId>('pixel');

  const t = TRANSLATIONS[language];

  const handleNext = () => {
    if (step === 1 && parentName && pin.length === 4) setStep(2);
    else if (step === 2 && childName) setStep(3);
  };

  const handleFinish = () => {
    const newFamily: FamilyAccount = {
      parent: {
        id: 'p_' + Date.now(),
        name: parentName,
        pin: pin,
      },
      children: [
        {
          id: 'c_' + Date.now(),
          name: childName,
          age: childAge,
          avatarId: selectedAvatar,
          settings: { ...DEFAULT_CHILD_SETTINGS },
          funTimeBalanceSeconds: 0,
          stars: 0,
          streak: 0,
          history: [],
          friends: [],
        }
      ]
    };
    onComplete(newFamily);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col md:flex-row min-h-[500px]">
        
        {/* Sidebar / Visual */}
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

        {/* Form Area */}
        <div className="flex-1 p-8 md:p-12 flex flex-col">
            
            {/* STEP 1: PARENT INFO */}
            {step === 1 && (
                <div className="flex-1 flex flex-col justify-center animate-in slide-in-from-right duration-500">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6">{t.parentBtn}</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-500 mb-1">{t.parentName}</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                <input 
                                    type="text" 
                                    value={parentName}
                                    onChange={e => setParentName(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-blue focus:ring-0 transition-colors"
                                    placeholder="Maria"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-500 mb-1">{t.createPin}</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                <input 
                                    type="text" 
                                    maxLength={4}
                                    value={pin}
                                    onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-blue focus:ring-0 transition-colors tracking-widest font-bold"
                                    placeholder="1234"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* STEP 2: CHILD INFO */}
            {step === 2 && (
                <div className="flex-1 flex flex-col animate-in slide-in-from-right duration-500">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6">{t.kidBtn}</h3>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                         <div>
                            <label className="block text-sm font-bold text-gray-500 mb-1">{t.childName}</label>
                            <input 
                                type="text" 
                                value={childName}
                                onChange={e => setChildName(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-blue focus:ring-0"
                                placeholder="Leo"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-500 mb-1">{t.childAge}</label>
                            <select 
                                value={childAge}
                                onChange={e => setChildAge(Number(e.target.value))}
                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-blue focus:ring-0 bg-white"
                            >
                                {[6, 7, 8, 9, 10].map(a => <option key={a} value={a}>{a}</option>)}
                            </select>
                        </div>
                    </div>

                    <label className="block text-sm font-bold text-gray-500 mb-2">{t.chooseBuddy}</label>
                    <div className="grid grid-cols-5 gap-2 mb-4">
                        {AVATARS.slice(0, 5).map(av => (
                            <div 
                                key={av.id}
                                onClick={() => setSelectedAvatar(av.id)}
                                className={`cursor-pointer rounded-xl p-1 border-2 transition-all ${selectedAvatar === av.id ? 'border-brand-blue bg-blue-50 scale-110' : 'border-transparent hover:bg-gray-100'}`}
                            >
                                <div className={`w-full aspect-square rounded-lg bg-gradient-to-br ${av.bgGradient} relative overflow-hidden`}>
                                     {/* Just a colored box preview, no interactive avatar */}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* STEP 3: SUCCESS */}
            {step === 3 && (
                <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6">
                        <Check className="w-10 h-10" />
                    </div>
                    <h3 className="text-3xl font-display font-bold text-gray-800 mb-2">{t.unlockFun}</h3>
                    <p className="text-gray-500 mb-8">Setup Complete!</p>
                </div>
            )}

            {/* NAVIGATION */}
            <div className="flex justify-between items-center mt-8 border-t pt-6">
                {step > 1 ? (
                    <button onClick={() => setStep(prev => prev - 1)} className="text-gray-400 hover:text-gray-600 font-bold flex items-center gap-2">
                        <ArrowLeft className="w-5 h-5" /> {t.back}
                    </button>
                ) : <div></div>}

                <button 
                    onClick={step === 3 ? handleFinish : handleNext}
                    disabled={(step === 1 && (!parentName || pin.length !== 4)) || (step === 2 && !childName)}
                    className={`
                        px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all
                        ${(step === 1 && (!parentName || pin.length !== 4)) || (step === 2 && !childName)
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-brand-blue text-white hover:bg-blue-700 hover:scale-105'}
                    `}
                >
                    {step === 3 ? t.finish : t.next} <ArrowRight className="w-5 h-5" />
                </button>
            </div>

        </div>
      </div>
    </div>
  );
};
