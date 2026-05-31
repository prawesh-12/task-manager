do $$
begin
  if not exists (select 1 from pg_type where typname = 'task_status') then
    create type public.task_status as enum ('pending', 'in_progress', 'completed');
  end if;
end;
$$;

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status public.task_status not null default 'pending',
  created_by uuid not null references public.users(id) on delete cascade,
  assigned_to uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tasks_created_by_idx on public.tasks(created_by);
create index if not exists tasks_assigned_to_idx on public.tasks(assigned_to);
create index if not exists tasks_status_idx on public.tasks(status);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_tasks_updated_at on public.tasks;

create trigger set_tasks_updated_at
  before update on public.tasks
  for each row
  execute function public.set_updated_at();

alter table public.tasks enable row level security;

drop policy if exists "Users can read relevant tasks" on public.tasks;
create policy "Users can read relevant tasks"
  on public.tasks
  for select
  using (auth.uid() = created_by or auth.uid() = assigned_to);

drop policy if exists "Users can create tasks as themselves" on public.tasks;
create policy "Users can create tasks as themselves"
  on public.tasks
  for insert
  with check (auth.uid() = created_by);

drop policy if exists "Users can update relevant tasks" on public.tasks;
create policy "Users can update relevant tasks"
  on public.tasks
  for update
  using (auth.uid() = created_by or auth.uid() = assigned_to)
  with check (auth.uid() = created_by or auth.uid() = assigned_to);

drop policy if exists "Creators can delete their tasks" on public.tasks;
create policy "Creators can delete their tasks"
  on public.tasks
  for delete
  using (auth.uid() = created_by);
