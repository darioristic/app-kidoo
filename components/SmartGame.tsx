
import React, { useState, useEffect, useRef } from 'react';
import { MathProblem, Difficulty, GeminiFeedback, Language, AvatarId, BehavioralMetrics } from '../types';
import { generateMathProblem, getEncouragement, getFrustrationHelp } from '../services/geminiService';
import { Star, BrainCircuit, Timer, ArrowLeft } from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { AIAvatar } from './AIAvatar';

interface SmartGameProps {
  onComplete: (score: number, metrics: BehavioralMetrics) => void;
  onExit: () => void;
  language: Language;
  avatarId: AvatarId;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const SmartGame: React.FC<SmartGameProps> = ({ onComplete, onExit, language, avatarId, soundEnabled, onToggleSound }) => {
  const [problem, setProblem] = useState<MathProblem | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<GeminiFeedback>({ message: "", emotion: "happy" });
  const [streak, setStreak] = useState(0);
  const [problemsSolved, setProblemsSolved] = useState(0);
  
  const t = TRANSLATIONS[language];

  // Frustration Detection State
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [idleSeconds, setIdleSeconds] = useState(0);
  const [isIdleHelpShown, setIsIdleHelpShown] = useState(false);

  // Behavioral Telemetry Refs
  const startTimeRef = useRef<number>(Date.now());
  const metricsRef = useRef<BehavioralMetrics>({
    avgResponseTimeSeconds: 0,
    hesitationCount: 0,
    impulsiveClickCount: 0,
    totalMistakes: 0,
    focusScore: 100
  });
  const totalResponseTimeRef = useRef<number>(0);
  const questionCountRef = useRef<number>(0);

  const GOAL = 3; 
  const IDLE_THRESHOLD = 15; // seconds to consider "hesitation"

  useEffect(() => {
    loadNewProblem();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!loading && problem && !selectedOption) {
        setIdleSeconds(prev => prev + 1);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [loading, problem, selectedOption]);

  // Behavioral Tracker: Hesitation
  useEffect(() => {
    const checkIdle = async () => {
      if (idleSeconds === IDLE_THRESHOLD) {
        // Log hesitation
        metricsRef.current.hesitationCount++;
        metricsRef.current.focusScore -= 5;

        if (!isIdleHelpShown && problem) {
            setIsIdleHelpShown(true);
            const aiMsg = await getFrustrationHelp('idle', problem, language);
            setFeedback(aiMsg);
        }
      }
    };
    checkIdle();
  }, [idleSeconds, isIdleHelpShown, problem, language]);

  const loadNewProblem = async () => {
    setLoading(true);
    setSelectedOption(null);
    setWrongAttempts(0);
    setIdleSeconds(0);
    setIsIdleHelpShown(false);
    
    // Reset Start Time for new problem
    startTimeRef.current = Date.now();

    const diff = streak > 3 ? Difficulty.HARD : streak > 1 ? Difficulty.MEDIUM : Difficulty.EASY;
    const newProblem = await generateMathProblem(diff, language);
    setProblem(newProblem);
    setLoading(false);
    
    // Reset timer again right when problem renders to be precise
    startTimeRef.current = Date.now();
  };

  const handleAnswer = async (option: string) => {
    if (!problem || selectedOption) return;
    
    const timeTaken = (Date.now() - startTimeRef.current) / 1000;

    if (option === problem.correctAnswer) {
      setSelectedOption(option);
      const newStreak = streak + 1;
      setStreak(newStreak);
      setProblemsSolved(prev => prev + 1);
      
      // Update Metrics
      totalResponseTimeRef.current += timeTaken;
      questionCountRef.current += 1;
      
      const aiMsg = await getEncouragement('success', newStreak, language);
      setFeedback(aiMsg);

      if (problemsSolved + 1 >= GOAL) {
        // Finalize metrics
        const finalMetrics = {
            ...metricsRef.current,
            avgResponseTimeSeconds: totalResponseTimeRef.current / questionCountRef.current
        };
        setTimeout(() => {
          onComplete(100, finalMetrics);
        }, 2000);
      } else {
        setTimeout(loadNewProblem, 2000);
      }
    } else {
      // Wrong Answer logic
      const newWrongAttempts = wrongAttempts + 1;
      setWrongAttempts(newWrongAttempts);
      setIdleSeconds(0); 
      setIsIdleHelpShown(false); 
      
      // Update Telemetry
      metricsRef.current.totalMistakes++;
      metricsRef.current.focusScore -= 10;
      
      // Detect Impulsivity (wrong answer < 3s)
      if (timeTaken < 3) {
          metricsRef.current.impulsiveClickCount++;
      }

      if (newWrongAttempts >= 2) {
        const aiMsg = await getFrustrationHelp('consecutive_errors', problem, language);
        setFeedback(aiMsg);
        setTimeout(() => setSelectedOption(null), 2500);
      } else {
        const aiMsg = await getEncouragement('failure', 0, language);
        setFeedback(aiMsg);
        setStreak(0);
        setTimeout(() => setSelectedOption(null), 1500); 
      }
    }
  };

  return (
    <div className="min-h-[100dvh] bg-gray-50 flex flex-col">
      {/* Mobile-optimized Header */}
      <div className="p-4 flex justify-between items-center bg-white shadow-sm sticky top-0 z-10">
        <button onClick={onExit} className="text-gray-500 hover:text-gray-700 font-bold flex items-center gap-1 text-sm md:text-base">
            <ArrowLeft className="w-5 h-5" /> {t.back}
        </button>
        
        {/* Progress Dots */}
        <div className="flex gap-2">
             {[...Array(GOAL)].map((_, i) => (
                 <div key={i} className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center transition-all ${i < problemsSolved ? 'bg-brand-green text-white scale-110 shadow-sm' : 'bg-gray-200 text-gray-400'}`}>
                     {i < problemsSolved ? <Star className="w-3 h-3 md:w-5 md:h-5 fill-current" /> : <div className="w-2 h-2 bg-gray-300 rounded-full" />}
                 </div>
             ))}
        </div>
      </div>

      {/* Game Content */}
      <div className="flex-1 p-4 pb-32 max-w-4xl mx-auto w-full flex flex-col justify-center">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden relative transition-all duration-500">
            
            {/* Banner */}
            <div className="bg-brand-blue h-24 md:h-32 relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-white to-transparent"></div>
                <BrainCircuit className="w-12 h-12 md:w-16 md:h-16 text-white opacity-80" />
                <h2 className="text-2xl md:text-3xl font-display font-bold text-white ml-4 relative z-10">{t.smartGameTitle}</h2>
            </div>

            <div className="p-6 md:p-8 text-center">
            {loading ? (
                <div className="flex flex-col items-center py-8 md:py-12">
                    <div className="animate-spin rounded-full h-12 w-12 md:h-16 md:w-16 border-b-4 border-brand-blue mb-4"></div>
                    <p className="text-lg md:text-xl text-gray-600 font-display">{t.loading}</p>
                </div>
            ) : problem ? (
                <div className="animate-fadeIn">
                    <div className="mb-6">
                        <span className="inline-block px-3 py-1 bg-brand-purple/10 text-brand-purple rounded-full text-xs md:text-sm font-bold uppercase tracking-wider mb-4">
                            {t.theme}: {problem.theme}
                        </span>
                        <h3 className="text-2xl md:text-4xl font-display font-bold text-gray-800 leading-tight min-h-[80px] flex items-center justify-center">
                            {problem.question}
                        </h3>
                    </div>

                    {/* Responsive Grid: 1 col mobile, 2 col desktop */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 max-w-2xl mx-auto">
                        {problem.options.map((opt, idx) => {
                            let btnClass = "bg-gray-50 border-2 border-gray-200 hover:border-brand-blue hover:bg-blue-50 text-gray-700";
                            if (selectedOption === opt) {
                                if (opt === problem.correctAnswer) btnClass = "bg-green-100 border-brand-green text-brand-green scale-105 shadow-lg";
                                else btnClass = "bg-red-100 border-red-400 text-red-600 shake";
                            } else if (wrongAttempts >= 2 && opt === problem.correctAnswer) {
                                btnClass = "bg-yellow-50 border-2 border-yellow-300 shadow-[0_0_15px_rgba(253,224,71,0.5)]";
                            }
                            
                            return (
                                <button 
                                    key={idx}
                                    onClick={() => handleAnswer(opt)}
                                    disabled={!!selectedOption && selectedOption === opt}
                                    className={`p-4 md:p-6 rounded-2xl text-xl md:text-2xl font-bold transition-all duration-200 active:scale-95 ${btnClass}`}
                                >
                                    {opt}
                                </button>
                            );
                        })}
                    </div>
                    
                    {(wrongAttempts > 0 || idleSeconds > 15) && (
                        <div className="mt-6 flex items-center justify-center gap-2 text-gray-400 text-sm animate-pulse">
                            <Timer className="w-4 h-4" />
                            <p>{idleSeconds > 15 ? t.takeTime : t.tryAgain}</p>
                        </div>
                    )}
                </div>
            ) : (
                <p className="text-red-500">{t.error}</p>
            )}
            </div>
        </div>
      </div>

      <AIAvatar 
        message={feedback.message || t.thinking}
        emotion={feedback.emotion} 
        loading={loading}
        language={language}
        avatarId={avatarId}
        soundEnabled={soundEnabled}
        onToggleSound={onToggleSound}
      />

    </div>
  );
};
