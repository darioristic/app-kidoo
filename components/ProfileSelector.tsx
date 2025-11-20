
import React from 'react';
import { FamilyAccount, ChildProfile, Language } from '../types';
import { TRANSLATIONS, AVATARS } from '../constants';
import { Plus, Lock, UserCog } from 'lucide-react';

interface ProfileSelectorProps {
  family: FamilyAccount;
  onSelectChild: (child: ChildProfile) => void;
  onSelectParent: () => void;
  language: Language;
}

export const ProfileSelector: React.FC<ProfileSelectorProps> = ({ family, onSelectChild, onSelectParent, language }) => {
  const t = TRANSLATIONS[language];

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl md:text-5xl font-display font-bold text-white mb-12 tracking-wide drop-shadow-lg">
        {t.whoIsPlaying}
      </h1>

      <div className="flex flex-wrap justify-center gap-8 max-w-5xl">
        
        {/* Children Profiles */}
        {family.children.map((child) => {
            const avatarConfig = AVATARS.find(a => a.id === child.avatarId) || AVATARS[0];
            
            return (
                <div 
                    key={child.id}
                    onClick={() => onSelectChild(child)}
                    className="group flex flex-col items-center gap-4 cursor-pointer"
                >
                    <div className={`
                        w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-gradient-to-br ${avatarConfig.bgGradient}
                        relative overflow-hidden border-4 border-transparent group-hover:border-white/50 transition-all duration-300
                        group-hover:scale-110 shadow-2xl flex items-center justify-center
                    `}>
                         <span className="text-4xl md:text-6xl font-display font-bold text-white drop-shadow-md">
                             {child.name.charAt(0)}
                         </span>
                    </div>
                    <span className="text-gray-300 text-xl font-bold group-hover:text-white transition-colors">{child.name}</span>
                </div>
            );
        })}

        {/* Parent Profile */}
        <div 
            onClick={onSelectParent}
            className="group flex flex-col items-center gap-4 cursor-pointer"
        >
            <div className="
                w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-gray-800 
                flex items-center justify-center border-4 border-transparent 
                group-hover:border-white/50 transition-all duration-300 group-hover:scale-110 shadow-2xl
            ">
                <div className="bg-gray-700 p-4 rounded-full text-gray-400 group-hover:text-white transition-colors">
                    <UserCog className="w-12 h-12" />
                </div>
                <div className="absolute top-3 right-3 bg-black/40 p-1 rounded-full">
                    <Lock className="w-4 h-4 text-white/70" />
                </div>
            </div>
            <span className="text-gray-400 text-xl font-bold group-hover:text-white transition-colors">{family.parent.name}</span>
        </div>

        {/* Add Profile (Mock) */}
        <div className="group flex flex-col items-center gap-4 opacity-50 hover:opacity-100 cursor-pointer transition-opacity">
             <div className="
                w-32 h-32 md:w-40 md:h-40 rounded-3xl border-4 border-dashed border-gray-600 
                flex items-center justify-center group-hover:border-gray-400 transition-colors
            ">
                <Plus className="w-12 h-12 text-gray-500 group-hover:text-gray-300" />
            </div>
            <span className="text-gray-500 text-xl font-bold group-hover:text-gray-300">{t.addChild}</span>
        </div>

      </div>
    </div>
  );
};
