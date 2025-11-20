

export type Language = 'sr' | 'hr' | 'sl' | 'en';

export enum View {
  LANDING = 'LANDING',
  ONBOARDING = 'ONBOARDING',
  PROFILE_SELECTION = 'PROFILE_SELECTION',
  PIN_ENTRY = 'PIN_ENTRY',
  PARENT_DASHBOARD = 'PARENT_DASHBOARD',
  PARENT_SETTINGS = 'PARENT_SETTINGS',
  PARENT_CONTROLS = 'PARENT_CONTROLS',
  PARENT_REPORTS = 'PARENT_REPORTS',
  ADD_CHILD = 'ADD_CHILD',
  CHILD_HOME = 'CHILD_HOME',
  CHILD_SETTINGS = 'CHILD_SETTINGS',
  SMART_GAME = 'SMART_GAME',
  FUN_GAME = 'FUN_GAME',
  AVATAR_SELECTION = 'AVATAR_SELECTION',
  ADMIN_TENANTS = 'ADMIN_TENANTS',
  ADMIN_PANEL = 'ADMIN_PANEL',
}

export enum GameCategory {
  SMART = 'SMART',
  FUN = 'FUN',
}

export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
  ADAPTIVE = 'ADAPTIVE',
}

export type AvatarId = 'lumi' | 'pixel' | 'nori' | 'tilda' | 'bloop' | 'kapo' | 'byte' | 'zuzu' | 'mira' | 'argo';

export interface AvatarConfig {
  id: AvatarId;
  name: string;
  description: string;
  color: string;
  bgGradient: string;
}

export interface ChildSettings {
  dailyScreenTimeLimitMinutes: number;
  allowFunGames: boolean;
  difficultyLevel: Difficulty;
}

export interface BehavioralMetrics {
  avgResponseTimeSeconds: number;
  hesitationCount: number; // times idle > 15s
  impulsiveClickCount: number; // wrong answers < 2s
  totalMistakes: number;
  focusScore: number; // 0-100 calculated metric
}

export interface ChildProfile {
  id: string;
  name: string;
  age: number;
  avatarId: AvatarId;
  settings: ChildSettings;
  funTimeBalanceSeconds: number;
  stars: number;
  streak: number;
  history: GameSession[];
  friends: string[]; // List of friend names
  gender?: string;
  aiBuddyNickname?: string;
  preferredDifficulty?: Difficulty;
}

export interface ParentProfile {
  id: string;
  name: string;
  pin: string; // 4 digit pin
}

export type ParentAccountStatus = 'email_unverified' | 'active_parent';

export type TenantStatus = 'inactive' | 'active';

export type SubscriptionPlan = 'free' | 'standard' | 'premium';

export interface TenantWorkspace {
  id: string;
  name: string;
  subdomain: string;
  language: Language;
  timezone: string;
  status: TenantStatus;
  plan: SubscriptionPlan;
}

export interface FamilyAccount {
  parent: ParentProfile & {
    firstName?: string;
    lastName?: string;
    email?: string;
    status?: ParentAccountStatus;
  };
  tenant?: TenantWorkspace | null;
  children: ChildProfile[];
}

export interface UserProfile {
  id: string;
  name: string;
  role: 'PARENT' | 'CHILD';
  avatarId?: AvatarId;
}

export interface MathProblem {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  hint: string;
  difficulty: Difficulty;
  theme: string;
}

export interface GameSession {
  id: string;
  timestamp: number;
  gameType: GameCategory;
  durationSeconds: number;
  score?: number;
  success?: boolean;
  behavioral?: BehavioralMetrics;
}

export interface GeminiFeedback {
  message: string;
  emotion: 'happy' | 'excited' | 'thinking' | 'proud';
}

export interface BehavioralInsightReport {
  summary: string;
  observation: string;
  recommendation: string;
}

export interface OnboardingAdvice {
  screenTimeMinutes: number;
  recommendedGames: string[];
  notes: string;
}