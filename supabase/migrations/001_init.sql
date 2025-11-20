create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subdomain text not null unique,
  language text not null,
  timezone text not null,
  status text not null,
  plan text not null,
  owner_user_id uuid
);

alter table public.workspaces enable row level security;

create policy workspaces_select on public.workspaces
  for select using (auth.uid() = owner_user_id);

create policy workspaces_insert on public.workspaces
  for insert with check (owner_user_id = auth.uid());

create policy workspaces_update on public.workspaces
  for update using (auth.uid() = owner_user_id) with check (auth.uid() = owner_user_id);

create policy workspaces_delete on public.workspaces
  for delete using (auth.uid() = owner_user_id);

create table if not exists public.children (
  id text primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  age int not null,
  avatar_id text not null,
  settings jsonb,
  fun_time_balance_seconds int default 0,
  stars int default 0,
  streak int default 0,
  history jsonb,
  friends jsonb,
  gender text,
  ai_buddy_nickname text,
  preferred_difficulty text,
  created_at timestamp with time zone default now()
);

alter table public.children enable row level security;

create policy children_select on public.children
  for select using (
    exists (
      select 1 from public.workspaces w
      where w.id = children.workspace_id and w.owner_user_id = auth.uid()
    )
  );

create policy children_insert on public.children
  for insert with check (
    exists (
      select 1 from public.workspaces w
      where w.id = children.workspace_id and w.owner_user_id = auth.uid()
    )
  );

create policy children_update on public.children
  for update using (
    exists (
      select 1 from public.workspaces w
      where w.id = children.workspace_id and w.owner_user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.workspaces w
      where w.id = children.workspace_id and w.owner_user_id = auth.uid()
    )
  );

create policy children_delete on public.children
  for delete using (
    exists (
      select 1 from public.workspaces w
      where w.id = children.workspace_id and w.owner_user_id = auth.uid()
    )
  );