
import React, { useState } from 'react';
import { ArrowLeft, Check, User } from 'lucide-react';
import { Language, ChildProfile, AvatarId, Difficulty } from '../types';
import { TRANSLATIONS, AVATARS, DEFAULT_CHILD_SETTINGS } from '../constants';

interface AddChildScreenProps {
  onSave: (child: ChildProfile) => void;
  onCancel: () => void;
  language: Language;
}

export const AddChildScreen: React.FC<AddChildScreenProps> = ({ onSave, onCancel, language }) => {
  const t = TRANSLATIONS[language];
  const [name, setName] = useState('');
  const [age, setAge] = useState(7);
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarId>('pixel');
  const [gender, setGender] = useState<string>('');
  const [buddyNickname, setBuddyNickname] = useState('');
  const [prefDifficulty, setPrefDifficulty] = useState<Difficulty>(Difficulty.ADAPTIVE);

  const handleSave = () => {
    if (!name.trim()) return;
    
    const newChild: ChildProfile = {
      id: 'c_' + Date.now(),
      name: name.trim(),
      age,
      avatarId: selectedAvatar,
      settings: { ...DEFAULT_CHILD_SETTINGS },
      funTimeBalanceSeconds: 0,
      stars: 0,
      streak: 0,
      history: [],
      friends: [],
      gender: gender || undefined,
      aiBuddyNickname: buddyNickname || undefined,
      preferredDifficulty: prefDifficulty,
    };
    onSave(newChild);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
       <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-300">
          
          <div className="p-6 border-b bg-white sticky top-0 z-10 flex items-center gap-4">
             <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ArrowLeft className="w-6 h-6 text-gray-500"/>
             </button>
             <h1 className="text-2xl font-display font-bold text-gray-800">{t.addChild}</h1>
          </div>

          <div className="p-8 overflow-y-auto max-h-[80vh]">
             <div className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-500 mb-2">{t.childName}</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                            <input 
                                type="text" 
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-blue focus:ring-0 transition-colors"
                                placeholder="Leo"
                                autoFocus
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-500 mb-2">{t.childAge}</label>
                        <select 
                            value={age}
                            onChange={e => setAge(Number(e.target.value))}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-blue focus:ring-0 bg-white"
                        >
                            {[6, 7, 8, 9, 10].map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-500 mb-2">Gender (optional)</label>
                        <select value={gender} onChange={e => setGender(e.target.value)} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-blue bg-white">
                          <option value="">Prefer not to say</option>
                          <option value="Female">Female</option>
                          <option value="Male">Male</option>
                          <option value="Other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-500 mb-2">AI Buddy nickname</label>
                        <input type="text" value={buddyNickname} onChange={e => setBuddyNickname(e.target.value)} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-blue" placeholder="Buddy" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-500 mb-3">{t.chooseBuddy}</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {AVATARS.map(av => (
                            <div 
                                key={av.id}
                                onClick={() => setSelectedAvatar(av.id)}
                                className={`
                                    cursor-pointer rounded-xl p-2 border-2 transition-all flex flex-col items-center gap-2
                                    ${selectedAvatar === av.id ? 'border-brand-blue bg-blue-50 shadow-md' : 'border-transparent hover:bg-gray-100'}
                                `}
                            >
                                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${av.bgGradient} shadow-sm`} />
                                <span className={`text-xs font-bold ${selectedAvatar === av.id ? 'text-brand-blue' : 'text-gray-500'}`}>
                                    {av.name}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="pt-6">
                    <div className="mb-4">
                        <label className="block text-sm font-bold text-gray-500 mb-2">Preferred difficulty</label>
                        <div className="grid grid-cols-3 gap-3">
                          <button onClick={() => setPrefDifficulty(Difficulty.EASY)} className={`py-2 rounded-xl font-bold ${prefDifficulty===Difficulty.EASY?'bg-green-100 text-green-700':'bg-gray-100 text-gray-600'}`}>Easy</button>
                          <button onClick={() => setPrefDifficulty(Difficulty.MEDIUM)} className={`py-2 rounded-xl font-bold ${prefDifficulty===Difficulty.MEDIUM?'bg-blue-100 text-blue-700':'bg-gray-100 text-gray-600'}`}>Standard</button>
                          <button onClick={() => setPrefDifficulty(Difficulty.ADAPTIVE)} className={`py-2 rounded-xl font-bold ${prefDifficulty===Difficulty.ADAPTIVE?'bg-purple-100 text-purple-700':'bg-gray-100 text-gray-600'}`}>Adaptive AI</button>
                        </div>
                    </div>
                    <button 
                        onClick={handleSave}
                        disabled={!name.trim()}
                        className={`
                            w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all
                            ${!name.trim() 
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                                : 'bg-brand-blue text-white hover:bg-blue-700 hover:scale-[1.02]'}
                        `}
                    >
                        <Check className="w-6 h-6" />
                        {t.save}
                    </button>
                </div>

             </div>
          </div>
       </div>
    </div>
  );
};
