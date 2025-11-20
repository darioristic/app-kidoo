import { TenantWorkspace, Language, SubscriptionPlan, FamilyAccount } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';

const WORKSPACES_KEY = 'kidoo_workspaces';

type WorkspaceMap = Record<string, TenantWorkspace>;

const readWorkspaces = (): WorkspaceMap => {
  try {
    const raw = localStorage.getItem(WORKSPACES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const writeWorkspaces = (map: WorkspaceMap) => {
  localStorage.setItem(WORKSPACES_KEY, JSON.stringify(map));
};

export const isSubdomainAvailable = async (subdomain: string): Promise<boolean> => {
  if (isSupabaseConfigured()) {
    const { data } = await supabase.from('workspaces').select('id').eq('subdomain', subdomain).limit(1);
    return !data || data.length === 0;
  }
  await new Promise(r => setTimeout(r, 300));
  const map = readWorkspaces();
  return !map[subdomain];
};

export const createWorkspace = async (
  name: string,
  subdomain: string,
  language: Language,
  timezone: string,
  plan: SubscriptionPlan,
): Promise<TenantWorkspace> => {
  if (isSupabaseConfigured()) {
    const { data: userData } = await supabase.auth.getUser();
    const ownerId = userData.user?.id || null;
    const { data } = await supabase
      .from('workspaces')
      .insert({ name, subdomain, language, timezone, status: 'active', plan, owner_user_id: ownerId })
      .select('*')
      .single();
    return data as TenantWorkspace;
  }
  const ws: TenantWorkspace = { id: 't_' + Date.now(), name, subdomain, language, timezone, status: 'active', plan };
  const map = readWorkspaces();
  map[subdomain] = ws;
  writeWorkspaces(map);
  return ws;
};

export const findWorkspaceByHost = async (host: string): Promise<TenantWorkspace | null> => {
  const cleanHost = host.split(':')[0];
  const parts = cleanHost.split('.');
  let sub = '';
  if (cleanHost.includes('localhost')) {
    // dev: sub.localhost
    sub = parts[0];
  } else if (parts.length >= 3) {
    // prod: sub.domain.tld
    sub = parts[0];
  } else {
    return null;
  }

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('workspaces').select('*').eq('subdomain', sub).limit(1);
      if (error) {
        // RLS or network error: fall back to minimal workspace
        return { id: 't_' + Date.now(), name: sub, subdomain: sub, language: 'en', timezone: 'Europe/Belgrade', status: 'active', plan: 'free' } as TenantWorkspace;
      }
      return (data && data[0]) || { id: 't_' + Date.now(), name: sub, subdomain: sub, language: 'en', timezone: 'Europe/Belgrade', status: 'active', plan: 'free' } as TenantWorkspace;
    } catch {
      return { id: 't_' + Date.now(), name: sub, subdomain: sub, language: 'en', timezone: 'Europe/Belgrade', status: 'active', plan: 'free' } as TenantWorkspace;
    }
  }

  const map = readWorkspaces();
  return map[sub] || { id: 't_' + Date.now(), name: sub, subdomain: sub, language: 'en', timezone: 'Europe/Belgrade', status: 'active', plan: 'free' } as TenantWorkspace;
};

export const bindParentToWorkspace = (account: FamilyAccount, workspace: TenantWorkspace): FamilyAccount => {
  return {
    ...account,
    tenant: workspace,
  };
};