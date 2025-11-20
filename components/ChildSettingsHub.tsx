
import React, { useState } from 'react';
import { ChildProfile, Language, AvatarId } from '../types';
import { TRANSLATIONS, AVATARS } from '../constants';
import { ArrowLeft, User, Volume2, VolumeX, Users, Plus, Settings, Sparkles, Check, X } from 'lucide-react';

interface ChildSettingsHubProps {
  child: ChildProfile;
  onUpdateName: (newName: string) => void;
  onChangeAvatarRequest: () => void;
  onToggleSound: () => void;
  soundEnabled: boolean;
  onBack: () => void;
  onAddFriend: (name: string) => void;
  language: Language;
}

export const ChildSettingsHub: React.FC<ChildSettingsHubProps> = ({ 
    child, 
    onUpdateName, 
    onChangeAvatarRequest, 
    onToggleSound, 
    soundEnabled,
    onBack, 
    onAddFriend,
    language 
}) => {
  const t = TRANSLATIONS[language];
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(child.name);
  
  const [isAddingFriend, setIsAddingFriend] = useState(false);
  const [newFriendName, setNewFriendName] = useState('');

  const handleSaveName = () => {
    if (tempName.trim()) {
        onUpdateName(tempName);
        setIsEditingName(false);
    }
  };

  const handleAddFriendSubmit = () => {
      if (newFriendName.trim()) {
          onAddFriend(newFriendName.trim());
          setNewFriendName('');
          setIsAddingFriend(false);
      }
  };

  const avatarConfig = AVATARS.find(a => a.id === child.avatarId) || AVATARS[0];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={onBack} className="bg-white p-3 rounded-full shadow hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-3xl font-display font-bold text-gray-800 flex items-center gap-2">
             <Settings className="w-8 h-8 text-gray-400" />
             {t.settings}
          </h1>
        </div>

        <div className="space-y-6">
            
            {/* Profile Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-6">
                 {/* Avatar is here only for settings context, user can change it */}
                 <div 
                    onClick={onChangeAvatarRequest}
                    className={`w-24 h-24 rounded-full bg-gradient-to-br ${avatarConfig.bgGradient} flex items-center justify-center cursor-pointer relative group`}
                 >
                     {/* Display Initial as placeholder for the avatar choice */}
                     <span className="text-4xl text-white font-display font-bold">{child.name.charAt(0)}</span>
                     <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs">
                        Change
                     </div>
                 </div>
                 
                 <div className="flex-1 text-center md:text-left w-full">
                     <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">{t.changeName}</label>
                     {isEditingName ? (
                         <div className="flex gap-2">
                             <input 
                                value={tempName} 
                                onChange={e => setTempName(e.target.value)}
                                className="flex-1 text-2xl font-bold text-gray-800 border-b-2 border-brand-blue focus:outline-none bg-transparent"
                                autoFocus
                             />
                             <button onClick={handleSaveName} className="bg-brand-blue text-white px-4 rounded-lg font-bold text-sm">OK</button>
                         </div>
                     ) : (
                         <div className="flex items-center justify-center md:justify-start gap-2 group cursor-pointer" onClick={() => setIsEditingName(true)}>
                             <h2 className="text-3xl font-bold text-gray-800">{child.name}</h2>
                             <User className="w-5 h-5 text-gray-300 group-hover:text-brand-blue" />
                         </div>
                     )}
                 </div>
            </div>

            {/* Sound Settings */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${soundEnabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                        {soundEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 text-lg">{t.soundEffects}</h3>
                        <p className="text-sm text-gray-500">Enable AI voice and game sounds</p>
                    </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={soundEnabled} onChange={onToggleSound} className="sr-only peer" />
                    <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-brand-blue"></div>
                </label>
            </div>

            {/* Buddy Selection */}
            <div 
                onClick={onChangeAvatarRequest}
                className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 cursor-pointer hover:bg-blue-50 transition-colors group"
            >
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-100 text-brand-purple rounded-full">
                        <Sparkles className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-gray-800 text-lg">{t.chooseBuddy}</h3>
                        <p className="text-sm text-gray-500">Current: <span className="font-bold text-brand-purple">{avatarConfig.name}</span></p>
                    </div>
                    <ArrowLeft className="w-5 h-5 text-gray-300 rotate-180 group-hover:text-brand-blue group-hover:translate-x-1 transition-all" />
                </div>
            </div>

            {/* Friends */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                 <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-orange-100 text-brand-orange rounded-full">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 text-lg">{t.myFriends}</h3>
                        <p className="text-sm text-gray-500">{t.friendCode}</p>
                    </div>
                </div>
                
                <div className="space-y-2">
                    {child.friends && child.friends.length > 0 ? (
                        child.friends.map((friend, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-500">
                                    {friend.charAt(0)}
                                </div>
                                <span className="font-bold text-gray-700">{friend}</span>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-400 italic p-2">No friends added yet.</p>
                    )}
                    
                    {isAddingFriend ? (
                        <div className="flex gap-2 animate-in slide-in-from-bottom-2">
                            <input 
                                value={newFriendName}
                                onChange={e => setNewFriendName(e.target.value)}
                                placeholder="Friend's name"
                                className="flex-1 px-4 py-3 border-2 border-brand-blue rounded-xl focus:outline-none"
                                autoFocus
                            />
                            <button onClick={handleAddFriendSubmit} className="bg-brand-blue text-white px-4 rounded-xl">
                                <Check className="w-6 h-6" />
                            </button>
                            <button onClick={() => setIsAddingFriend(false)} className="bg-gray-100 text-gray-500 px-4 rounded-xl">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    ) : (
                        <button 
                            onClick={() => setIsAddingFriend(true)}
                            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-400 font-bold flex items-center justify-center gap-2 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                        >
                            <Plus className="w-5 h-5" /> {t.addFriend}
                        </button>
                    )}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};
