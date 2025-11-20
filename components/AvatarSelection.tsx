
import React from 'react';
import { Check, ArrowLeft, Star } from 'lucide-react';
import { AVATARS, TRANSLATIONS } from '../constants';
import { AvatarId, Language } from '../types';
import { AIAvatar } from './AIAvatar';

interface AvatarSelectionProps {
  currentAvatarId: AvatarId;
  onSelect: (id: AvatarId) => void;
  onBack: () => void;
  language: Language;
}

export const AvatarSelection: React.FC<AvatarSelectionProps> = ({ currentAvatarId, onSelect, onBack, language }) => {
  const t = TRANSLATIONS[language];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        
        <div className="flex items-center gap-4 mb-8">
          <button onClick={onBack} className="bg-white p-2 rounded-full shadow hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-3xl font-display font-bold text-gray-800">{t.chooseBuddy}</h1>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 pb-10">
          {AVATARS.map((avatar) => {
            const isSelected = currentAvatarId === avatar.id;
            
            return (
              <div 
                key={avatar.id}
                onClick={() => !isSelected && onSelect(avatar.id)}
                className={`
                  relative group cursor-pointer rounded-3xl p-4 transition-all duration-300 flex flex-col
                  ${isSelected ? 'ring-4 ring-brand-blue ring-offset-2 scale-105 shadow-xl bg-white z-10' : 'hover:scale-105 bg-white hover:shadow-lg border-2 border-transparent hover:border-gray-200'}
                `}
              >
                {isSelected && (
                  <div className="absolute -top-3 -right-2 bg-brand-yellow text-brand-blue px-3 py-1 rounded-full text-xs font-bold shadow-md flex items-center gap-1 z-20">
                    <Star className="w-3 h-3 fill-current" /> Current
                  </div>
                )}

                {/* Gradient Background for Avatar Preview */}
                <div className={`w-full aspect-square rounded-2xl bg-gradient-to-br ${avatar.bgGradient} mb-4 flex items-center justify-center relative overflow-hidden`}>
                   <div className="w-24 h-24 pointer-events-none transform transition-transform group-hover:scale-110">
                      <AIAvatar 
                        message="" 
                        emotion="happy" 
                        language={language} 
                        avatarId={avatar.id} 
                        soundEnabled={false} 
                        onToggleSound={() => {}}
                      />
                   </div>
                </div>

                <div className="text-center mt-auto">
                  <h3 className="font-bold text-xl font-display text-gray-800 mb-1">{avatar.name}</h3>
                  <p className="text-xs text-gray-500 mb-4 line-clamp-2 h-8">{avatar.description}</p>
                  
                  <button 
                    className={`
                      w-full py-2 rounded-xl font-bold text-sm transition-colors
                      ${isSelected 
                        ? 'bg-green-100 text-green-600 cursor-default' 
                        : 'bg-gray-100 text-gray-600 group-hover:bg-brand-blue group-hover:text-white'}
                    `}
                  >
                    {isSelected ? (
                        <span className="flex items-center justify-center gap-1">
                            <Check className="w-4 h-4" /> Active
                        </span>
                    ) : (
                        t.select
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
