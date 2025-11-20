create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  role text not null default 'user',
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.profiles enable row level security;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles(id, email, role)
  values (new.id, new.email, 'user')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create policy select_own on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

create policy select_admin on public.profiles
  for select
  to authenticated
  using (exists(select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','saas_admin')));

create policy update_own on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy update_admin on public.profiles
  for update
  to authenticated
  using (exists(select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','saas_admin')))
  with check (true);

create policy delete_admin on public.profiles
  for delete
  to authenticated
  using (exists(select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','saas_admin')));

-- optional bootstrap: promote a known email to saas_admin
update public.profiles set role = 'saas_admin' where email = 'admin@brainplaykids.com';