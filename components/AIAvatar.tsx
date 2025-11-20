
import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Heart, Volume2, VolumeX, Minimize2, Maximize2, X } from 'lucide-react';
import { Language, AvatarId } from '../types';
import { TRANSLATIONS } from '../constants';

interface AIAvatarProps {
  message: string;
  emotion: 'happy' | 'excited' | 'thinking' | 'proud';
  loading?: boolean;
  language: Language;
  avatarId: AvatarId;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const AIAvatar: React.FC<AIAvatarProps> = ({ 
  message, 
  emotion, 
  loading, 
  language, 
  avatarId,
  soundEnabled,
  onToggleSound
}) => {
  const [isTalking, setIsTalking] = useState(false);
  const [hearts, setHearts] = useState<{id: number, x: number, y: number}[]>([]);
  const [customMessage, setCustomMessage] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showBubble, setShowBubble] = useState(true);

  const t = TRANSLATIONS[language];
  const synthRef = useRef<SpeechSynthesis | null>(typeof window !== 'undefined' ? window.speechSynthesis : null);

  // Auto-hide bubble after inactivity if not talking
  useEffect(() => {
    if (message || customMessage) {
      setShowBubble(true);
      const timer = setTimeout(() => {
         if (!isTalking && !loading) setShowBubble(false);
      }, 8000); // 8 seconds read time
      return () => clearTimeout(timer);
    }
  }, [message, customMessage, isTalking, loading]);

  // Speak effect
  useEffect(() => {
    if (message && synthRef.current && !loading) {
      synthRef.current.cancel();

      if (!soundEnabled) return; 

      const utter = new SpeechSynthesisUtterance(message);
      const voices = synthRef.current.getVoices();
      
      let langCode = 'en-US';
      if (language === 'sl') langCode = 'sl-SI';
      else if (language === 'hr') langCode = 'hr-HR';
      else if (language === 'sr') langCode = 'sr-RS';

      const voice = voices.find(v => v.lang.includes(langCode)) || 
                    voices.find(v => v.lang.includes('en')); 
      
      if (voice) utter.voice = voice;
      
      // Character pitch customization
      if (['lumi', 'nori', 'byte'].includes(avatarId)) utter.pitch = 0.8;
      else if (['pixel', 'zuzu', 'mira'].includes(avatarId)) utter.pitch = 1.4;
      else utter.pitch = 1.1;

      utter.rate = 1.05;
      
      utter.onstart = () => { setIsTalking(true); setShowBubble(true); };
      utter.onend = () => setIsTalking(false);
      
      setTimeout(() => {
        synthRef.current?.speak(utter);
      }, 500);
    }
  }, [message, loading, language, soundEnabled, avatarId]);

  const handlePet = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    const newHearts = Array.from({length: 5}).map((_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100 - 50,
      y: Math.random() * -50
    }));
    setHearts(prev => [...prev, ...newHearts]);
    setTimeout(() => setHearts([]), 1000);

    const reaction = Math.random() > 0.5 ? t.avatarTickle : t.avatarPet;
    setCustomMessage(reaction);
    setShowBubble(true);
    
    if (soundEnabled && synthRef.current) {
        synthRef.current.cancel();
        const utter = new SpeechSynthesisUtterance(reaction);
        utter.pitch = 1.4; 
        synthRef.current.speak(utter);
    }

    setTimeout(() => setCustomMessage(null), 3000);
  };

  const renderAvatarSvg = () => {
    const talkAnim = isTalking ? "animate-bounce-subtle" : "";
    
    switch (avatarId) {
      case 'lumi': // Owl
        return (
          <svg viewBox="0 0 200 200" className={`w-full h-full drop-shadow-xl ${talkAnim}`}>
            <circle cx="100" cy="100" r="70" fill="#8B5CF6" />
            <circle cx="70" cy="80" r="25" fill="white" />
            <circle cx="130" cy="80" r="25" fill="white" />
            <circle cx="70" cy="80" r="10" fill="black" />
            <circle cx="130" cy="80" r="10" fill="black" />
            <path d="M 90 110 L 100 130 L 110 110" fill="#F59E0B" />
            <path d="M 30 100 Q 10 130 40 150" fill="#7C3AED" />
            <path d="M 170 100 Q 190 130 160 150" fill="#7C3AED" />
            <path d="M 60 20 L 140 20 L 100 60 Z" fill="#1F2937" opacity="0.8" /> 
          </svg>
        );
      case 'pixel': // Dragon
        return (
          <svg viewBox="0 0 200 200" className={`w-full h-full drop-shadow-xl ${talkAnim}`}>
            <path d="M 50 150 Q 100 200 150 150 L 150 80 Q 100 20 50 80 Z" fill="#10B981" />
            <path d="M 30 80 L 50 100 L 30 120" fill="#F59E0B" />
            <path d="M 170 80 L 150 100 L 170 120" fill="#F59E0B" />
            <circle cx="80" cy="90" r="10" fill="white" />
            <circle cx="120" cy="90" r="10" fill="white" />
            <circle cx="80" cy="90" r="4" fill="black" />
            <circle cx="120" cy="90" r="4" fill="black" />
            {isTalking && <path d="M 90 120 Q 100 140 110 120" stroke="#F59E0B" strokeWidth="5" fill="none" />}
            <path d="M 100 50 L 90 70 L 110 70 Z" fill="#047857" />
          </svg>
        );
      case 'nori': // Robot
        return (
          <svg viewBox="0 0 200 200" className={`w-full h-full drop-shadow-xl ${talkAnim}`}>
             <rect x="50" y="50" width="100" height="90" rx="15" fill="#64748B" />
             <rect x="60" y="65" width="80" height="40" rx="5" fill="#1E293B" />
             <circle cx="85" cy="85" r="5" fill="#10B981" className="animate-pulse" />
             <circle cx="115" cy="85" r="5" fill="#10B981" className="animate-pulse" />
             <path d="M 100 50 L 100 30" stroke="#64748B" strokeWidth="5" />
             <circle cx="100" cy="25" r="8" fill={emotion === 'thinking' ? '#F59E0B' : '#EF4444'} className="animate-ping" />
             <path d="M 80 120 Q 100 135 120 120" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
          </svg>
        );
      default:
         return (
          <svg viewBox="0 0 200 200" className={`w-full h-full drop-shadow-xl ${talkAnim}`}>
            <path d="M 50 150 Q 100 200 150 150 L 150 80 Q 100 20 50 80 Z" fill="#10B981" />
            <circle cx="80" cy="90" r="10" fill="white" />
            <circle cx="120" cy="90" r="10" fill="white" />
            <circle cx="80" cy="90" r="4" fill="black" />
            <circle cx="120" cy="90" r="4" fill="black" />
          </svg>
        );
    }
  };

  return (
    <>
    {/* 
      RESPONSIVE POSITIONING: 
      - Bottom-right aligned.
      - pointer-events-none on wrapper allows clicks to pass through empty areas.
      - Scaled down significantly on mobile to prevent obstruction.
    */}
    <div 
      className={`
        fixed z-[100] flex flex-col items-end transition-all duration-500
        bottom-1 right-1 md:bottom-6 md:right-6
        ${isMinimized ? 'translate-x-4' : ''}
        max-w-[140px] md:max-w-[320px] pointer-events-none
      `}
    >
      <style>{`
        @keyframes wiggle {
            0%, 100% { transform: rotate(-3deg); }
            50% { transform: rotate(3deg); }
        }
        @keyframes speech-pulse {
            0%, 100% { transform: scale(1); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
            50% { transform: scale(1.05); box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.2); }
        }
        @keyframes bounce-subtle {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-3px); }
        }
        .animate-speech-pulse {
            animation: speech-pulse 2s infinite ease-in-out;
        }
        .animate-bounce-subtle {
            animation: bounce-subtle 1s infinite ease-in-out;
        }
      `}</style>

      {/* Glassmorphism Speech Bubble */}
      {!isMinimized && showBubble && (
        <div className={`
          pointer-events-auto
          mb-0.5 mr-0.5 md:mb-2 md:mr-4 p-2 md:p-4 rounded-xl md:rounded-2xl rounded-br-none
          backdrop-blur-md bg-white/95 border border-brand-blue/20 shadow-xl
          transform transition-all duration-500 origin-bottom-right
          ${loading ? 'animate-pulse' : 'animate-in fade-in zoom-in-95'}
          ${isTalking ? 'animate-speech-pulse border-brand-blue/40' : ''}
          max-w-[110px] md:max-w-xs
        `}>
          <div className="flex justify-between items-start gap-1 md:gap-2">
            <p className="text-gray-800 font-display font-bold text-[9px] md:text-lg leading-tight md:leading-relaxed drop-shadow-sm">
                {loading ? (
                    <span className="flex items-center gap-2 text-brand-purple">
                        {t.thinking} <Sparkles className="w-3 h-3 md:w-4 md:h-4 animate-spin" />
                    </span>
                ) : (customMessage || message)}
            </p>
            <button 
                onClick={() => setShowBubble(false)}
                className="text-gray-400 hover:text-gray-600 p-0.5 flex-shrink-0"
            >
                <X className="w-3 h-3 md:w-4 md:h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Controls & Avatar Row */}
      <div className="flex items-center gap-1 md:gap-3 pointer-events-auto">
        
        {!isMinimized && (
            <div className="flex flex-col gap-1 md:gap-2">
                <button 
                onClick={onToggleSound} 
                className="bg-white/80 p-1 md:p-2 rounded-full shadow-md hover:bg-white transition-colors"
                title="Toggle Sound"
                >
                {soundEnabled ? <Volume2 className="w-3 h-3 md:w-4 md:h-4 text-gray-600" /> : <VolumeX className="w-3 h-3 md:w-4 md:h-4 text-red-400" />}
                </button>
                <button 
                onClick={() => setIsMinimized(true)} 
                className="bg-white/80 p-1 md:p-2 rounded-full shadow-md hover:bg-white transition-colors md:hidden"
                title="Minimize"
                >
                <Minimize2 className="w-3 h-3 text-gray-600" />
                </button>
            </div>
        )}

        {isMinimized && (
             <button 
             onClick={() => setIsMinimized(false)} 
             className="bg-white/80 p-2 rounded-full shadow-md hover:bg-white transition-colors absolute right-0 bottom-16"
             title="Maximize"
             >
             <Maximize2 className="w-5 h-5 text-gray-600" />
             </button>
        )}

        {/* Avatar Container */}
        <div 
          onClick={!isMinimized ? handlePet : () => setIsMinimized(false)}
          className={`
            relative cursor-pointer group transition-all duration-300 ease-out
            ${isMinimized 
              ? 'w-8 h-8 opacity-50 hover:opacity-100' 
              : 'w-10 h-10 md:w-32 md:h-32 hover:scale-110 hover:-translate-y-2 hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] hover:brightness-105'}
          `}
        >
          {hearts.map(h => (
              <Heart 
                  key={h.id} 
                  className="absolute text-red-500 w-4 h-4 md:w-6 md:h-6 animate-ping z-50" 
                  style={{ top: 0, left: '50%', transform: `translate(${h.x}px, ${h.y}px)` }} 
                  fill="currentColor"
              />
          ))}

          {/* Breathing Glow Effect */}
          {!isMinimized && <div className="absolute inset-0 bg-white/30 blur-xl rounded-full scale-75 animate-pulse group-hover:bg-brand-blue/20 group-hover:scale-100 transition-all duration-500"></div>}

          {/* The SVG */}
          <div className="w-full h-full">
            {renderAvatarSvg()}
          </div>
        </div>
      </div>
    </div>
    </>
  );
};
