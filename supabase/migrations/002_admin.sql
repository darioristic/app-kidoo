create table if not exists public.profiles (
  id uuid primary key,
  email text unique,
  role text not null default 'user',
  last_active timestamp with time zone,
  created_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;
create policy profiles_self on public.profiles for select using (auth.uid() = id);
create policy profiles_admin on public.profiles for select using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid,
  action text not null,
  target text,
  metadata jsonb,
  created_at timestamp with time zone default now()
);

alter table public.audit_logs enable row level security;
create policy audit_admin on public.audit_logs for select using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create table if not exists public.app_settings (
  key text primary key,
  value jsonb,
  updated_at timestamp with time zone default now()
);

alter table public.app_settings enable row level security;
create policy settings_admin on public.app_settings for select using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));