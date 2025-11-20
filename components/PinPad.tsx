import React, { useState, useEffect } from 'react';
import { Delete, Lock } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface PinPadProps {
  expectedPin: string;
  onSuccess: () => void;
  onCancel: () => void;
  language: Language;
  title?: string;
}

export const PinPad: React.FC<PinPadProps> = ({ expectedPin, onSuccess, onCancel, language, title }) => {
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const t = TRANSLATIONS[language];

  useEffect(() => {
    if (input.length === 4) {
      if (input === expectedPin) {
        onSuccess();
      } else {
        setError(true);
        setTimeout(() => {
          setInput('');
          setError(false);
        }, 1000);
      }
    }
  }, [input, expectedPin, onSuccess]);

  const handleNum = (num: number) => {
    if (input.length < 4) setInput(prev => prev + num);
  };

  const handleDel = () => {
    setInput(prev => prev.slice(0, -1));
    setError(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xs p-8">
        <div className="flex justify-center mb-6">
          <div className={`p-4 rounded-full ${error ? 'bg-red-100 text-red-500' : 'bg-brand-blue/10 text-brand-blue'}`}>
            <Lock className="w-8 h-8" />
          </div>
        </div>
        
        <h2 className="text-center text-gray-700 font-bold text-xl mb-6 font-display">
            {title || t.enterPin}
        </h2>

        <div className="flex justify-center gap-4 mb-8">
          {[0, 1, 2, 3].map(i => (
            <div 
                key={i} 
                className={`w-4 h-4 rounded-full transition-all duration-300 ${
                    i < input.length ? 'bg-brand-blue scale-110' : 'bg-gray-200'
                } ${error ? 'bg-red-500 animate-shake' : ''}`}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button
              key={num}
              onClick={() => handleNum(num)}
              className="aspect-square rounded-2xl bg-gray-50 hover:bg-brand-blue hover:text-white text-gray-700 text-2xl font-bold transition-colors shadow-sm active:scale-95"
            >
              {num}
            </button>
          ))}
          <div />
          <button
              onClick={() => handleNum(0)}
              className="aspect-square rounded-2xl bg-gray-50 hover:bg-brand-blue hover:text-white text-gray-700 text-2xl font-bold transition-colors shadow-sm active:scale-95"
            >
              0
          </button>
          <button
              onClick={handleDel}
              className="aspect-square rounded-2xl bg-gray-50 hover:bg-red-100 hover:text-red-500 text-gray-700 flex items-center justify-center transition-colors shadow-sm active:scale-95"
            >
              <Delete className="w-6 h-6" />
          </button>
        </div>

        <button onClick={onCancel} className="w-full py-3 text-gray-400 hover:text-gray-600 font-bold">
            {t.back}
        </button>
      </div>
    </div>
  );
};