
import React, { useState } from 'react';
import { FamilyAccount, Language } from '../types';
import { TRANSLATIONS, AVATARS } from '../constants';
import { ArrowLeft, FileText, Brain, Target, History, TrendingUp, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface ParentReportsProps {
  family: FamilyAccount;
  onBack: () => void;
  language: Language;
}

export const ParentReports: React.FC<ParentReportsProps> = ({ family, onBack, language }) => {
  const t = TRANSLATIONS[language];
  const [selectedChildId, setSelectedChildId] = useState<string>(family.children[0]?.id || '');
  
  const selectedChild = family.children.find(c => c.id === selectedChildId) || family.children[0];

  // Mock Data for Charts if no history is present
  const cognitiveData = [
    { day: 'M', score: 65, focus: 70 },
    { day: 'T', score: 70, focus: 75 },
    { day: 'W', score: 68, focus: 65 },
    { day: 'T', score: 75, focus: 85 },
    { day: 'F', score: 80, focus: 80 },
    { day: 'S', score: 85, focus: 90 },
    { day: 'S', score: 82, focus: 88 },
  ];

  const subjectData = [
    { subject: t.math, A: 120, fullMark: 150 },
    { subject: t.logic, A: 98, fullMark: 150 },
    { subject: t.languages, A: 86, fullMark: 150 },
    { subject: 'Creative', A: 99, fullMark: 150 },
    { subject: 'Memory', A: 85, fullMark: 150 },
    { subject: 'Speed', A: 65, fullMark: 150 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      
      {/* Header */}
      <div className="bg-white shadow-sm p-4 sticky top-0 z-10">
         <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
                <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                </button>
                <h1 className="text-2xl font-display font-bold text-gray-800 flex items-center gap-2">
                    <FileText className="w-6 h-6 text-brand-blue" />
                    {t.reports}
                </h1>
            </div>
            
            {/* Child Selector for Reports */}
            <div className="flex gap-2">
                {family.children.map(child => (
                    <button
                        key={child.id}
                        onClick={() => setSelectedChildId(child.id)}
                        className={`w-10 h-10 rounded-full bg-gradient-to-br ${AVATARS.find(a => a.id === child.avatarId)?.bgGradient} ring-2 transition-all ${selectedChildId === child.id ? 'ring-brand-blue scale-110' : 'ring-transparent opacity-50 hover:opacity-100'}`}
                        title={child.name}
                    >
                        <span className="text-white font-bold text-sm">{child.name.charAt(0)}</span>
                    </button>
                ))}
            </div>
         </div>
      </div>

      <div className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full space-y-8">

        {/* Executive Summary */}
        <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 text-brand-purple rounded-lg">
                    <Brain className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">{t.executiveSummary}</h2>
            </div>
            <div className="bg-purple-50 rounded-2xl p-6 text-gray-700 leading-relaxed italic border-l-4 border-brand-purple">
                "{selectedChild.name} has shown remarkable improvement in **Logic Puzzles** this week. Focus trends indicate peak performance in the morning sessions. Recommended to increase difficulty in Math challenges to maintain engagement."
            </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Cognitive Growth Chart */}
            <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                 <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-100 text-brand-blue rounded-lg">
                        <TrendingUp className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">{t.cognitiveGrowth}</h2>
                </div>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={cognitiveData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorFocus" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="day" />
                            <YAxis />
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                            <Area type="monotone" dataKey="score" stroke="#4F46E5" fillOpacity={1} fill="url(#colorScore)" name="Success Rate" />
                            <Area type="monotone" dataKey="focus" stroke="#10B981" fillOpacity={1} fill="url(#colorFocus)" name="Focus Score" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </section>

            {/* Subject Mastery Radar */}
            <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                 <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-orange-100 text-brand-orange rounded-lg">
                        <Target className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">{t.subjectMastery}</h2>
                </div>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={subjectData}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 'bold' }} />
                            <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} />
                            <Radar name={selectedChild.name} dataKey="A" stroke="#F97316" fill="#F97316" fillOpacity={0.6} />
                            <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </section>
        </div>

        {/* Session Log Table */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gray-100 text-gray-600 rounded-lg">
                    <History className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">{t.sessionLog}</h2>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-100">
                            <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                            <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Type</th>
                            <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">{t.reactionTime}</th>
                            <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">{t.mistakes}</th>
                            <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">{t.accuracy}</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm text-gray-600">
                        {selectedChild.history.length > 0 ? (
                            [...selectedChild.history].reverse().slice(0, 5).map(session => (
                                <tr key={session.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                    <td className="p-4 font-bold">{new Date(session.timestamp).toLocaleDateString()}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-lg text-xs font-bold uppercase ${session.gameType === 'SMART' ? 'bg-blue-50 text-brand-blue' : 'bg-orange-50 text-brand-orange'}`}>
                                            {session.gameType}
                                        </span>
                                    </td>
                                    <td className="p-4">{session.behavioral?.avgResponseTimeSeconds.toFixed(1)}s</td>
                                    <td className="p-4 text-red-500 font-bold">{session.behavioral?.totalMistakes || 0}</td>
                                    <td className="p-4 text-green-600 font-bold">{session.score || 100}%</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-400 italic">No sessions recorded yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>

      </div>
    </div>
  );
};
