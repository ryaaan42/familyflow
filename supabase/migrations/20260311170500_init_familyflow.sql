create extension if not exists "pgcrypto";

do $$ begin
  create type public.subscription_plan as enum ('free', 'plus', 'family-pro');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.housing_type as enum ('appartement', 'maison');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.member_role as enum ('parent', 'adulte', 'ado', 'enfant', 'autre');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.pet_type as enum ('chien', 'chat', 'autre');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.task_category as enum (
    'menage',
    'cuisine',
    'animaux',
    'enfants',
    'administratif',
    'budget',
    'courses',
    'hygiene',
    'entretien',
    'routine'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.task_frequency as enum ('quotidienne', 'hebdomadaire', 'mensuelle', 'personnalisee');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.task_status as enum ('todo', 'in_progress', 'done', 'late');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.task_origin as enum ('template', 'custom', 'smart');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.budget_item_type as enum ('income', 'fixed', 'variable');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.budget_category as enum (
    'loyer_credit',
    'courses',
    'transport',
    'abonnements',
    'loisirs',
    'sorties',
    'restaurant_fast_food',
    'animaux',
    'enfants',
    'sante',
    'imprevus',
    'maison'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.savings_domain as enum ('sorties', 'repas', 'courses', 'linge', 'animaux', 'organisation');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.pdf_theme as enum ('minimal', 'familial-kawaii', 'premium', 'print');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.notification_channel as enum ('email', 'push', 'in_app');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.notification_type as enum ('task_reminder', 'budget_reminder', 'pdf_summary', 'system');
exception when duplicate_object then null;
end $$;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  display_name text not null,
  locale text not null default 'fr-FR',
  currency text not null default 'EUR',
  plan public.subscription_plan not null default 'free',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.households (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references public.users(id) on delete restrict,
  name text not null,
  housing_type public.housing_type not null,
  surface_sqm integer not null check (surface_sqm >= 15),
  rooms integer not null check (rooms >= 1),
  children_count integer not null default 0 check (children_count >= 0),
  has_pets boolean not null default false,
  city text,
  planning_mode text not null default 'shared',
  deleted_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.household_members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null,
  display_name text not null,
  age integer not null check (age between 0 and 120),
  role public.member_role not null,
  avatar_color text not null default '#6D5EF4',
  availability_hours_per_week numeric(5,2) not null default 5 check (availability_hours_per_week >= 0),
  favorite_categories public.task_category[] not null default '{}',
  blocked_categories public.task_category[] not null default '{}',
  preferences jsonb not null default '{}'::jsonb,
  is_admin boolean not null default false,
  deleted_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.pets (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  name text not null,
  type public.pet_type not null,
  notes text,
  deleted_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.task_templates (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references public.households(id) on delete cascade,
  created_by uuid references public.users(id) on delete set null,
  is_system boolean not null default false,
  title text not null,
  description text not null default '',
  category public.task_category not null,
  min_age integer not null default 0 check (min_age >= 0),
  roles public.member_role[] not null default '{parent,adulte,ado,enfant,autre}',
  requires_pet_type public.pet_type,
  housing_types public.housing_type[],
  base_frequency public.task_frequency not null,
  estimated_minutes integer not null check (estimated_minutes > 0),
  difficulty integer not null check (difficulty between 1 and 5),
  indirect_cost_per_month numeric(10,2),
  points integer not null default 0,
  deleted_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  template_id uuid references public.task_templates(id) on delete set null,
  created_by uuid references public.users(id) on delete set null,
  title text not null,
  description text,
  category public.task_category not null,
  frequency public.task_frequency not null,
  due_date date not null,
  status public.task_status not null default 'todo',
  estimated_minutes integer not null check (estimated_minutes > 0),
  difficulty integer not null check (difficulty between 1 and 5),
  indirect_cost_per_month numeric(10,2),
  minimum_age integer,
  recommended_roles public.member_role[] not null default '{}',
  origin public.task_origin not null default 'custom',
  deleted_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.task_assignments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  member_id uuid not null references public.household_members(id) on delete cascade,
  status public.task_status not null default 'todo',
  scheduled_for date not null,
  duplicated_from_assignment_id uuid references public.task_assignments(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (task_id, member_id, scheduled_for)
);

create table if not exists public.task_completions (
  id uuid primary key default gen_random_uuid(),
  task_assignment_id uuid references public.task_assignments(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  member_id uuid not null references public.household_members(id) on delete cascade,
  completed_by_user_id uuid references public.users(id) on delete set null,
  notes text,
  completed_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  month date not null,
  target_savings numeric(12,2) not null default 0,
  notes text,
  deleted_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (household_id, month)
);

create table if not exists public.budget_items (
  id uuid primary key default gen_random_uuid(),
  budget_id uuid not null references public.budgets(id) on delete cascade,
  type public.budget_item_type not null,
  category public.budget_category not null,
  label text not null,
  amount numeric(12,2) not null check (amount >= 0),
  recurring boolean not null default true,
  occurred_on date,
  metadata jsonb not null default '{}'::jsonb,
  deleted_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.savings_scenarios (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  title text not null,
  description text not null default '',
  domain public.savings_domain not null,
  monthly_cost numeric(12,2) not null check (monthly_cost >= 0),
  improved_monthly_cost numeric(12,2) not null check (improved_monthly_cost >= 0),
  linked_task_category public.task_category,
  effort text not null default 'moyen' check (effort in ('facile', 'moyen', 'avance')),
  source text not null default 'manual' check (source in ('manual', 'suggested')),
  deleted_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.savings_projections (
  id uuid primary key default gen_random_uuid(),
  scenario_id uuid not null references public.savings_scenarios(id) on delete cascade,
  horizon_months integer not null check (horizon_months in (3, 6, 12)),
  current_cost numeric(12,2) not null,
  improved_cost numeric(12,2) not null,
  savings numeric(12,2) not null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (scenario_id, horizon_months)
);

create table if not exists public.pdf_exports (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  created_by uuid references public.users(id) on delete set null,
  export_type text not null,
  theme public.pdf_theme not null default 'premium',
  storage_path text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references public.households(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  type public.notification_type not null,
  channel public.notification_channel not null,
  title text not null,
  body text not null,
  scheduled_for timestamptz,
  delivered_at timestamptz,
  read_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.user_settings (
  user_id uuid primary key references public.users(id) on delete cascade,
  theme text not null default 'light',
  preferred_pdf_theme public.pdf_theme not null default 'premium',
  locale text not null default 'fr-FR',
  currency text not null default 'EUR',
  weekly_summary_day integer not null default 1 check (weekly_summary_day between 0 and 6),
  push_enabled boolean not null default false,
  email_enabled boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_household_members_household on public.household_members(household_id) where deleted_at is null;
create index if not exists idx_household_members_user on public.household_members(user_id) where deleted_at is null;
create index if not exists idx_pets_household on public.pets(household_id) where deleted_at is null;
create index if not exists idx_task_templates_household on public.task_templates(household_id) where deleted_at is null;
create index if not exists idx_tasks_household_due_date on public.tasks(household_id, due_date) where deleted_at is null;
create index if not exists idx_task_assignments_member_schedule on public.task_assignments(member_id, scheduled_for);
create index if not exists idx_task_completions_member on public.task_completions(member_id, completed_at desc);
create index if not exists idx_budgets_household_month on public.budgets(household_id, month desc) where deleted_at is null;
create index if not exists idx_budget_items_budget on public.budget_items(budget_id) where deleted_at is null;
create index if not exists idx_savings_scenarios_household on public.savings_scenarios(household_id) where deleted_at is null;
create index if not exists idx_pdf_exports_household on public.pdf_exports(household_id, created_at desc);
create index if not exists idx_notifications_user on public.notifications(user_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, display_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(coalesce(new.email, 'FamilyFlow'), '@', 1))
  )
  on conflict (id) do update
  set email = excluded.email,
      display_name = excluded.display_name,
      updated_at = timezone('utc', now());

  insert into public.user_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create trigger set_users_updated_at
before update on public.users
for each row execute procedure public.set_updated_at();
create trigger set_households_updated_at
before update on public.households
for each row execute procedure public.set_updated_at();
create trigger set_household_members_updated_at
before update on public.household_members
for each row execute procedure public.set_updated_at();
create trigger set_pets_updated_at
before update on public.pets
for each row execute procedure public.set_updated_at();
create trigger set_task_templates_updated_at
before update on public.task_templates
for each row execute procedure public.set_updated_at();
create trigger set_tasks_updated_at
before update on public.tasks
for each row execute procedure public.set_updated_at();
create trigger set_task_assignments_updated_at
before update on public.task_assignments
for each row execute procedure public.set_updated_at();
create trigger set_budgets_updated_at
before update on public.budgets
for each row execute procedure public.set_updated_at();
create trigger set_budget_items_updated_at
before update on public.budget_items
for each row execute procedure public.set_updated_at();
create trigger set_savings_scenarios_updated_at
before update on public.savings_scenarios
for each row execute procedure public.set_updated_at();
create trigger set_user_settings_updated_at
before update on public.user_settings
for each row execute procedure public.set_updated_at();

create or replace function public.is_household_member(target_household uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.household_members hm
    where hm.household_id = target_household
      and hm.user_id = auth.uid()
      and hm.deleted_at is null
  ) or exists (
    select 1
    from public.households h
    where h.id = target_household
      and h.owner_user_id = auth.uid()
      and h.deleted_at is null
  );
$$;

create or replace function public.is_household_admin(target_household uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.household_members hm
    where hm.household_id = target_household
      and hm.user_id = auth.uid()
      and hm.is_admin = true
      and hm.deleted_at is null
  ) or exists (
    select 1
    from public.households h
    where h.id = target_household
      and h.owner_user_id = auth.uid()
      and h.deleted_at is null
  );
$$;

alter table public.users enable row level security;
alter table public.households enable row level security;
alter table public.household_members enable row level security;
alter table public.pets enable row level security;
alter table public.task_templates enable row level security;
alter table public.tasks enable row level security;
alter table public.task_assignments enable row level security;
alter table public.task_completions enable row level security;
alter table public.budgets enable row level security;
alter table public.budget_items enable row level security;
alter table public.savings_scenarios enable row level security;
alter table public.savings_projections enable row level security;
alter table public.pdf_exports enable row level security;
alter table public.notifications enable row level security;
alter table public.user_settings enable row level security;

create policy "users self access"
on public.users
for all
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "user settings self access"
on public.user_settings
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "households visible to members"
on public.households
for select
using (public.is_household_member(id));

create policy "households insert by owner"
on public.households
for insert
with check (owner_user_id = auth.uid());

create policy "households update by admins"
on public.households
for update
using (public.is_household_admin(id))
with check (public.is_household_admin(id));

create policy "household members visible to household"
on public.household_members
for select
using (public.is_household_member(household_id));

create policy "household members insert by admins"
on public.household_members
for insert
with check (public.is_household_admin(household_id));

create policy "household members update by admins"
on public.household_members
for update
using (public.is_household_admin(household_id))
with check (public.is_household_admin(household_id));

create policy "pets visible to household"
on public.pets
for select
using (public.is_household_member(household_id));

create policy "pets managed by admins"
on public.pets
for all
using (public.is_household_admin(household_id))
with check (public.is_household_admin(household_id));

create policy "task templates visible to household or system"
on public.task_templates
for select
using (household_id is null or public.is_household_member(household_id));

create policy "task templates managed by admins"
on public.task_templates
for all
using (household_id is not null and public.is_household_admin(household_id))
with check (household_id is not null and public.is_household_admin(household_id));

create policy "tasks visible to household"
on public.tasks
for select
using (public.is_household_member(household_id));

create policy "tasks managed by admins"
on public.tasks
for all
using (public.is_household_admin(household_id))
with check (public.is_household_admin(household_id));

create policy "task assignments visible to household"
on public.task_assignments
for select
using (
  exists (
    select 1
    from public.tasks t
    where t.id = task_assignments.task_id
      and public.is_household_member(t.household_id)
  )
);

create policy "task assignments managed by admins"
on public.task_assignments
for all
using (
  exists (
    select 1
    from public.tasks t
    where t.id = task_assignments.task_id
      and public.is_household_admin(t.household_id)
  )
)
with check (
  exists (
    select 1
    from public.tasks t
    where t.id = task_assignments.task_id
      and public.is_household_admin(t.household_id)
  )
);

create policy "task completions visible to household"
on public.task_completions
for select
using (
  exists (
    select 1
    from public.tasks t
    where t.id = task_completions.task_id
      and public.is_household_member(t.household_id)
  )
);

create policy "task completions managed by household"
on public.task_completions
for all
using (
  exists (
    select 1
    from public.tasks t
    where t.id = task_completions.task_id
      and public.is_household_member(t.household_id)
  )
)
with check (
  exists (
    select 1
    from public.tasks t
    where t.id = task_completions.task_id
      and public.is_household_member(t.household_id)
  )
);

create policy "budgets visible to household"
on public.budgets
for select
using (public.is_household_member(household_id));

create policy "budgets managed by admins"
on public.budgets
for all
using (public.is_household_admin(household_id))
with check (public.is_household_admin(household_id));

create policy "budget items visible to household"
on public.budget_items
for select
using (
  exists (
    select 1
    from public.budgets b
    where b.id = budget_items.budget_id
      and public.is_household_member(b.household_id)
  )
);

create policy "budget items managed by admins"
on public.budget_items
for all
using (
  exists (
    select 1
    from public.budgets b
    where b.id = budget_items.budget_id
      and public.is_household_admin(b.household_id)
  )
)
with check (
  exists (
    select 1
    from public.budgets b
    where b.id = budget_items.budget_id
      and public.is_household_admin(b.household_id)
  )
);

create policy "savings scenarios visible to household"
on public.savings_scenarios
for select
using (public.is_household_member(household_id));

create policy "savings scenarios managed by admins"
on public.savings_scenarios
for all
using (public.is_household_admin(household_id))
with check (public.is_household_admin(household_id));

create policy "savings projections visible to household"
on public.savings_projections
for select
using (
  exists (
    select 1
    from public.savings_scenarios ss
    where ss.id = savings_projections.scenario_id
      and public.is_household_member(ss.household_id)
  )
);

create policy "savings projections managed by admins"
on public.savings_projections
for all
using (
  exists (
    select 1
    from public.savings_scenarios ss
    where ss.id = savings_projections.scenario_id
      and public.is_household_admin(ss.household_id)
  )
)
with check (
  exists (
    select 1
    from public.savings_scenarios ss
    where ss.id = savings_projections.scenario_id
      and public.is_household_admin(ss.household_id)
  )
);

create policy "pdf exports visible to household"
on public.pdf_exports
for select
using (public.is_household_member(household_id));

create policy "pdf exports managed by admins"
on public.pdf_exports
for all
using (public.is_household_admin(household_id))
with check (public.is_household_admin(household_id));

create policy "notifications self access"
on public.notifications
for all
using (user_id = auth.uid())
with check (user_id = auth.uid());
