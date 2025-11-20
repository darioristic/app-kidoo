import { ChildProfile, FamilyAccount, GameSession } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';

const LS_CHILDREN_PREFIX = 'kidoo_children_';

const lsKey = (subdomain: string) => `${LS_CHILDREN_PREFIX}${subdomain}`;

const readChildrenLS = (subdomain: string): ChildProfile[] => {
  try {
    const raw = localStorage.getItem(lsKey(subdomain));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const writeChildrenLS = (subdomain: string, children: ChildProfile[]) => {
  localStorage.setItem(lsKey(subdomain), JSON.stringify(children));
};

export const loadChildren = async (family: FamilyAccount): Promise<ChildProfile[]> => {
  const subdomain = family.tenant?.subdomain;
  if (!subdomain) return [];
  if (isSupabaseConfigured() && family.tenant?.id) {
    const { data } = await supabase
      .from('children')
      .select('*')
      .eq('workspace_id', family.tenant.id)
      .order('created_at', { ascending: true });
    return (data as any[])?.map(mapRowToChild) || [];
  }
  return readChildrenLS(subdomain);
};

export const addChild = async (family: FamilyAccount, child: ChildProfile): Promise<ChildProfile> => {
  const subdomain = family.tenant?.subdomain || 'local';
  if (isSupabaseConfigured() && family.tenant?.id) {
    const payload = mapChildToRow(child, family.tenant.id);
    const { data } = await supabase.from('children').insert(payload).select('*').single();
    return mapRowToChild(data);
  }
  const children = readChildrenLS(subdomain);
  children.push(child);
  writeChildrenLS(subdomain, children);
  return child;
};

export const updateChild = async (family: FamilyAccount, child: ChildProfile): Promise<void> => {
  const subdomain = family.tenant?.subdomain || 'local';
  if (isSupabaseConfigured() && family.tenant?.id) {
    const payload = mapChildToRow(child, family.tenant.id);
    await supabase.from('children').update(payload).eq('id', payload.id);
    return;
  }
  const list = readChildrenLS(subdomain).map(c => (c.id === child.id ? child : c));
  writeChildrenLS(subdomain, list);
};

const mapRowToChild = (row: any): ChildProfile => ({
  id: row.id,
  name: row.name,
  age: row.age,
  avatarId: row.avatar_id,
  settings: row.settings || { dailyScreenTimeLimitMinutes: 60, allowFunGames: true, difficultyLevel: 'EASY' },
  funTimeBalanceSeconds: row.fun_time_balance_seconds || 0,
  stars: row.stars || 0,
  streak: row.streak || 0,
  history: row.history || [],
  friends: row.friends || [],
  gender: row.gender || undefined,
  aiBuddyNickname: row.ai_buddy_nickname || undefined,
  preferredDifficulty: row.preferred_difficulty || undefined,
});

const mapChildToRow = (child: ChildProfile, workspaceId: string) => ({
  id: child.id,
  workspace_id: workspaceId,
  name: child.name,
  age: child.age,
  avatar_id: child.avatarId,
  settings: child.settings,
  fun_time_balance_seconds: child.funTimeBalanceSeconds,
  stars: child.stars,
  streak: child.streak,
  history: child.history,
  friends: child.friends,
  gender: child.gender || null,
  ai_buddy_nickname: child.aiBuddyNickname || null,
  preferred_difficulty: child.preferredDifficulty || null,
});