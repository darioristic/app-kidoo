
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { MathProblem, Difficulty, GeminiFeedback, Language, BehavioralMetrics, BehavioralInsightReport, OnboardingAdvice } from "../types";
import { CHILD_PERSONA_SYSTEM_INSTRUCTION } from "../constants";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const getLanguageName = (lang: Language) => {
  switch (lang) {
    case 'sr': return 'Serbian';
    case 'hr': return 'Croatian';
    case 'sl': return 'Slovenian';
    default: return 'English';
  }
};

const isQuotaError = (error: any): boolean => {
    const errStr = JSON.stringify(error);
    return errStr.includes("429") || errStr.includes("RESOURCE_EXHAUSTED");
};

export const generateMathProblem = async (difficulty: Difficulty, language: Language): Promise<MathProblem | null> => {
  try {
    const difficultyPrompt = difficulty === Difficulty.EASY ? "addition/subtraction up to 20" 
      : difficulty === Difficulty.MEDIUM ? "multiplication/division basic, addition up to 100" 
      : "mixed operations, simple logic puzzles";
    
    const langName = getLanguageName(language);

    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        question: { type: Type.STRING, description: `The math question text in ${langName}.` },
        options: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING },
          description: "4 possible answers." 
        },
        correctAnswer: { type: Type.STRING, description: "The correct option." },
        hint: { type: Type.STRING, description: `A Socratic hint in ${langName} that guides them without giving the answer.` },
        theme: { type: Type.STRING, description: `A fun theme for the question (e.g., space, animals) in ${langName}.` },
      },
      required: ["question", "options", "correctAnswer", "hint", "theme"],
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a creative and fun math problem for a child in ${langName}. Difficulty: ${difficultyPrompt}. Ensure the theme is engaging and the text is culturally appropriate.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: CHILD_PERSONA_SYSTEM_INSTRUCTION,
      },
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      return {
        id: Date.now().toString(),
        ...data,
        difficulty,
      };
    }
    throw new Error("Empty response");
  } catch (error) {
    if (!isQuotaError(error)) {
        console.error("Error generating math problem:", error);
    }
    
    // Rich Fallback Pool for offline/quota-limited mode
    const fallbacks = [
        {
            q: "5 + 3 = ?", a: "8", opts: ["7", "8", "9", "6"], 
            h: language === 'sl' ? "Preštej na prste!" : "Izbroj na prste!", t: "Basic"
        },
        {
            q: "10 - 4 = ?", a: "6", opts: ["5", "6", "7", "4"], 
            h: language === 'sl' ? "Odštevanje je obratno od seštevanja." : "Oduzimanje je suprotno od sabiranja.", t: "Basic"
        },
        {
            q: "2 + 2 + 2 = ?", a: "6", opts: ["5", "6", "8", "4"], 
            h: "2, 4, ...", t: "Patterns"
        },
        {
            q: "7 + 7 = ?", a: "14", opts: ["12", "13", "14", "15"], 
            h: "Double 7", t: "Doubles"
        },
        {
            q: "3 x 3 = ?", a: "9", opts: ["6", "9", "12", "8"], 
            h: "3 + 3 + 3", t: "Multiplication"
        }
    ];

    const fallback = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    
    return {
      id: 'fallback-' + Date.now() + Math.random(),
      question: fallback.q,
      options: fallback.opts,
      correctAnswer: fallback.a,
      hint: fallback.h,
      difficulty: Difficulty.EASY,
      theme: fallback.t,
    };
  }
};

export const getEncouragement = async (context: 'success' | 'failure' | 'timeout', streak: number, language: Language): Promise<GeminiFeedback> => {
  try {
    const langName = getLanguageName(language);
    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        message: { type: Type.STRING, description: `Encouragement message in ${langName}` },
        emotion: { type: Type.STRING, enum: ['happy', 'excited', 'thinking', 'proud'] },
      },
      required: ["message", "emotion"],
    };

    const prompt = context === 'success' 
      ? `The child just solved a problem correctly! Streak: ${streak}. Provide Growth Mindset praise in ${langName}. Focus on effort or strategy.`
      : context === 'failure'
      ? `The child got an answer wrong. Be gentle and emotionally supportive in ${langName}. Use the Socratic method to suggest a new approach.`
      : `The child is taking a long time. Give a gentle, non-intrusive nudge in ${langName}.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: CHILD_PERSONA_SYSTEM_INSTRUCTION,
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as GeminiFeedback;
    }
    throw new Error("Empty response");
  } catch (error) {
    // Silent fallback
    if (context === 'success') return { message: "Bravo! 🌟", emotion: "happy" };
    if (context === 'failure') return { message: "Samo polako, pokušaj ponovo!", emotion: "thinking" };
    return { message: "Možeš ti to!", emotion: "happy" };
  }
};

export const getFrustrationHelp = async (trigger: 'idle' | 'consecutive_errors', problem: MathProblem, language: Language): Promise<GeminiFeedback> => {
  try {
    const langName = getLanguageName(language);
    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        message: { type: Type.STRING, description: `Helpful message in ${langName}` },
        emotion: { type: Type.STRING, enum: ['happy', 'excited', 'thinking', 'proud'] },
      },
      required: ["message", "emotion"],
    };

    const prompt = `
      The child is playing a Smart Game (Math).
      Problem: "${problem.question}"
      Correct Answer: "${problem.correctAnswer}"
      Context Trigger: ${trigger === 'idle' ? 'Child is staring at screen (25s) without acting.' : 'Child answered incorrectly twice.'}
      
      TASK:
      Generate a supportive, helpful message in **${langName}**.
      
      If 'idle': Validate that it is okay to take time. Suggest breaking the problem down.
      
      If 'consecutive_errors': Offer a very specific conceptual hint (e.g., "Remember that multiplication is just adding groups..."). Do NOT give the answer.
      
      Emotion: 'thinking' or 'happy'.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: CHILD_PERSONA_SYSTEM_INSTRUCTION,
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as GeminiFeedback;
    }
    throw new Error("Empty response");
  } catch (error) {
    if (!isQuotaError(error)) {
        console.error("Error getting frustration help:", error);
    }
    return { message: "Tu sam ako trebaš pomoć! 🐣", emotion: "happy" };
  }
};

export const generateParentBehavioralReport = async (
  childName: string, 
  metrics: BehavioralMetrics, 
  language: Language
): Promise<BehavioralInsightReport> => {
  try {
    const langName = getLanguageName(language);
    
    // Interpret metrics for the prompt
    const speed = metrics.avgResponseTimeSeconds < 5 ? "Very Fast (Impulsive?)" : metrics.avgResponseTimeSeconds > 20 ? "Slow (Thoughtful/Struggling?)" : "Balanced";
    const mistakes = metrics.totalMistakes;
    const hesitation = metrics.hesitationCount;
    
    const prompt = `
      Analyze the gameplay telemetry for a child named ${childName}.
      
      Telemetry Data:
      - Avg Response Time: ${metrics.avgResponseTimeSeconds.toFixed(1)}s (${speed})
      - Total Mistakes: ${mistakes}
      - Hesitation Events (Idle > 15s): ${hesitation}
      - Impulsive Clicks (<2s wrong): ${metrics.impulsiveClickCount}
      
      TASK:
      Generate a behavioral insight report for the parent in **${langName}**.
      
      1. **summary**: One sentence overview of their session.
      2. **observation**: Human-readable observation of their mouse/click behavior (e.g., "Leo answered quickly but made several mistakes, suggesting he might be rushing.").
      3. **recommendation**: A gentle tip for the parent.
    `;

    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        summary: { type: Type.STRING },
        observation: { type: Type.STRING },
        recommendation: { type: Type.STRING },
      },
      required: ["summary", "observation", "recommendation"],
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        // Don't use the child persona for parent reports
        systemInstruction: "You are a child development expert analyzing gameplay data.",
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as BehavioralInsightReport;
    }
    throw new Error("Empty response");

  } catch (error) {
    if (!isQuotaError(error)) {
        console.error("Parent report error:", error);
    }
    return {
      summary: "Session completed successfully.",
      observation: "Standard gameplay patterns detected. Consistent performance.",
      recommendation: "Encourage them to keep playing!"
    };
  }
};

export const getOnboardingAdvice = async (childAge: number, language: Language): Promise<OnboardingAdvice> => {
  try {
    const langName = getLanguageName(language);
    const prompt = `For a family onboarding in ${langName}, suggest:
    1) Daily screen-time minutes for age ${childAge}
    2) 3 recommended Smart Games categories for first week
    3) One short note to the parent`;
    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        screenTimeMinutes: { type: Type.NUMBER },
        recommendedGames: { type: Type.ARRAY, items: { type: Type.STRING } },
        notes: { type: Type.STRING },
      },
      required: ["screenTimeMinutes", "recommendedGames", "notes"],
    };
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json', responseSchema: schema },
    });
    if (response.text) return JSON.parse(response.text) as OnboardingAdvice;
    throw new Error('Empty');
  } catch (error) {
    return { screenTimeMinutes: 60, recommendedGames: ['Math', 'Logic', 'Memory'], notes: 'Start gently and keep sessions short.' };
  }
};
