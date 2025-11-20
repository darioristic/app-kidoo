import { FamilyAccount, ParentAccountStatus } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';

const STORAGE_KEY = 'kidoo_parent_accounts';

type PendingParent = {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  pin: string;
  status: ParentAccountStatus;
  verificationToken: string;
  createdAt: number;
};

const readParents = (): Record<string, PendingParent> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const writeParents = (map: Record<string, PendingParent>) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
};

export const startParentSignup = (firstName: string, lastName: string, email: string, password: string, pin: string): { account: FamilyAccount; token?: string } => {
  if (isSupabaseConfigured()) {
    return { account: {
      parent: {
        id: 'p_' + Date.now(),
        name: `${firstName} ${lastName}`.trim(),
        pin,
        firstName,
        lastName,
        email,
        status: 'email_unverified',
      },
      tenant: null,
      children: [],
    }};
  }
  const token = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const map = readParents();
  map[email] = {
    firstName,
    lastName,
    email,
    passwordHash: `hash:${btoa(password)}`,
    pin,
    status: 'email_unverified',
    verificationToken: token,
    createdAt: Date.now(),
  };
  writeParents(map);
  fetch('/api/email/send-verification', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to: email, token, firstName })
  }).catch(() => {});
  const account: FamilyAccount = {
    parent: {
      id: 'p_' + Date.now(),
      name: `${firstName} ${lastName}`.trim(),
      pin,
      firstName,
      lastName,
      email,
      status: 'email_unverified',
    },
    tenant: null,
    children: [],
  };
  return { account, token };
};

export const supabaseSendVerificationEmail = async (firstName: string, lastName: string, email: string, password: string, pin: string) => {
  if (!isSupabaseConfigured()) return;
  await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `https://${(import.meta as any).env?.VITE_BASE_DOMAIN || 'brainplaykids.com'}/?verified=true`,
      data: { firstName, lastName, pin },
    },
  });
};

export const verifyEmailToken = (token: string): FamilyAccount | null => {
  const map = readParents();
  const entry = Object.values(map).find(p => p.verificationToken === token);
  if (!entry) return null;
  entry.status = 'active_parent';
  writeParents(map);
  return {
    parent: {
      id: 'p_' + Date.now(),
      name: `${entry.firstName} ${entry.lastName}`.trim(),
      pin: entry.pin,
      firstName: entry.firstName,
      lastName: entry.lastName,
      email: entry.email,
      status: 'active_parent',
    },
    tenant: null,
    children: [],
  };
};

export const checkEmailVerified = async (): Promise<FamilyAccount | null> => {
  if (!isSupabaseConfigured()) return null;
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user || !user.email) return null;
  const firstName = (user.user_metadata as any)?.firstName || '';
  const lastName = (user.user_metadata as any)?.lastName || '';
  const pin = (user.user_metadata as any)?.pin || '0000';
  return {
    parent: {
      id: user.id,
      name: `${firstName} ${lastName}`.trim() || user.email,
      pin,
      firstName,
      lastName,
      email: user.email,
      status: 'active_parent',
    },
    tenant: null,
    children: [],
  };
};

export const getLastPendingToken = (): string | null => {
  const map = readParents();
  const list = Object.values(map).sort((a, b) => b.createdAt - a.createdAt);
  return list[0]?.verificationToken || null;
};