import React, { useState, useEffect, useRef } from 'react';
import { X, MousePointer2, Trophy } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface FunGameProps {
  timeLeft: number; // Seconds
  onExit: () => void;
  language: Language;
}

interface Bubble {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  speed: number;
}

const COLORS = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

export const FunGame: React.FC<FunGameProps> = ({ timeLeft, onExit, language }) => {
  const [score, setScore] = useState(0);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);
  const t = TRANSLATIONS[language];

  // Spawn bubbles
  useEffect(() => {
    const spawnInterval = setInterval(() => {
      if (!containerRef.current) return;
      
      const size = Math.random() * 40 + 40; // 40-80px
      const newBubble: Bubble = {
        id: Date.now(),
        x: Math.random() * (containerRef.current.clientWidth - size),
        y: containerRef.current.clientHeight + size,
        size,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        speed: Math.random() * 2 + 1,
      };

      setBubbles(prev => [...prev, newBubble]);
    }, 800);

    return () => clearInterval(spawnInterval);
  }, []);

  // Game Loop
  const updateBubbles = () => {
    setBubbles(prev => 
      prev
        .map(b => ({ ...b, y: b.y - b.speed }))
        .filter(b => b.y > -100)
    );
    requestRef.current = requestAnimationFrame(updateBubbles);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(updateBubbles);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const popBubble = (id: number) => {
    setScore(prev => prev + 10);
    setBubbles(prev => prev.filter(b => b.id !== id));
    // Play sound effect here (mocked)
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-cyan-300 to-blue-500 overflow-hidden select-none cursor-crosshair">
      
      {/* HUD */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start z-20">
        <div className="bg-white/90 backdrop-blur rounded-2xl p-4 shadow-xl border-b-4 border-cyan-600">
            <div className="text-sm text-gray-500 font-bold uppercase">{t.score}</div>
            <div className="text-3xl font-display font-bold text-cyan-600 flex items-center gap-2">
                <Trophy className="w-6 h-6" />
                {score}
            </div>
        </div>

        <div className={`bg-white/90 backdrop-blur rounded-2xl p-4 shadow-xl border-b-4 ${timeLeft < 60 ? 'border-red-500 animate-pulse' : 'border-brand-orange'}`}>
            <div className="text-sm text-gray-500 font-bold uppercase">{t.timeLeft}</div>
            <div className={`text-3xl font-display font-bold ${timeLeft < 60 ? 'text-red-500' : 'text-brand-orange'}`}>
                {formatTime(timeLeft)}
            </div>
        </div>

        <button onClick={onExit} className="bg-white/90 p-3 rounded-full shadow-lg hover:bg-red-50 transition-colors">
            <X className="w-8 h-8 text-gray-500" />
        </button>
      </div>

      {/* Game Area */}
      <div ref={containerRef} className="absolute inset-0 z-10">
        {bubbles.map(b => (
            <div
                key={b.id}
                onMouseDown={() => popBubble(b.id)}
                onTouchStart={() => popBubble(b.id)}
                style={{
                    left: b.x,
                    top: b.y,
                    width: b.size,
                    height: b.size,
                    backgroundColor: b.color,
                    boxShadow: 'inset -5px -5px 15px rgba(0,0,0,0.2), inset 5px 5px 15px rgba(255,255,255,0.4)'
                }}
                className="absolute rounded-full cursor-pointer active:scale-90 transition-transform hover:brightness-110"
            >
                <div className="absolute top-[20%] left-[20%] w-[20%] h-[20%] bg-white rounded-full opacity-60"></div>
            </div>
        ))}
      </div>

      {/* Instructions Overlay (fades out) */}
      {score === 0 && (
          <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
              <div className="text-white/50 text-6xl font-display font-bold animate-bounce">
                  {t.popBubbles}
              </div>
          </div>
      )}
    </div>
  );
};