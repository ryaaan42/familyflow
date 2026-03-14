-- Core production hardening: member category normalization, AI persistence, billing, and task bootstrap helpers.

create table if not exists public.onboarding_profiles (
  household_id uuid primary key references public.households(id) on delete cascade,
  objective text,
  answers jsonb not null default '{}'::jsonb,
  completed_at timestamptz,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.ai_generations (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  created_by uuid references public.users(id) on delete set null,
  model text,
  status text not null check (status in ('success','fallback','failed')),
  prompt_version text not null default 'v2',
  input_snapshot jsonb not null default '{}'::jsonb,
  output_payload jsonb,
  error_message text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.ai_suggestions (
  id uuid primary key default gen_random_uuid(),
  generation_id uuid not null references public.ai_generations(id) on delete cascade,
  household_id uuid not null references public.households(id) on delete cascade,
  suggestion_type text not null,
  title text,
  body text not null,
  metadata jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.billing_customers (
  user_id uuid primary key references public.users(id) on delete cascade,
  stripe_customer_id text not null unique,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  household_id uuid references public.households(id) on delete set null,
  stripe_customer_id text,
  stripe_subscription_id text unique,
  stripe_price_id text,
  plan public.subscription_plan not null default 'free',
  status text not null default 'inactive',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.billing_events (
  id uuid primary key default gen_random_uuid(),
  stripe_event_id text not null unique,
  type text not null,
  payload jsonb not null,
  processed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.usage_counters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  household_id uuid references public.households(id) on delete set null,
  metric text not null,
  period_start date not null,
  period_end date not null,
  usage_count integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, metric, period_start)
);

create table if not exists public.usage_limits (
  plan public.subscription_plan not null,
  metric text not null,
  monthly_limit integer,
  primary key (plan, metric)
);

insert into public.usage_limits (plan, metric, monthly_limit)
values
  ('free', 'ai_generations', 3),
  ('plus', 'ai_generations', 100),
  ('family-pro', 'ai_generations', 1000),
  ('free', 'pdf_exports', 3),
  ('plus', 'pdf_exports', null),
  ('family-pro', 'pdf_exports', null)
on conflict (plan, metric) do nothing;

create index if not exists idx_ai_generations_household on public.ai_generations(household_id, created_at desc);
create index if not exists idx_ai_suggestions_household on public.ai_suggestions(household_id, created_at desc);
create index if not exists idx_subscriptions_user on public.subscriptions(user_id, updated_at desc);

alter table public.onboarding_profiles enable row level security;
alter table public.ai_generations enable row level security;
alter table public.ai_suggestions enable row level security;
alter table public.billing_customers enable row level security;
alter table public.subscriptions enable row level security;
alter table public.billing_events enable row level security;
alter table public.usage_counters enable row level security;
alter table public.usage_limits enable row level security;

create policy "onboarding profiles visible to household"
on public.onboarding_profiles for select
using (public.is_household_member(household_id));
create policy "onboarding profiles managed by admins"
on public.onboarding_profiles for all
using (public.is_household_admin(household_id))
with check (public.is_household_admin(household_id));

create policy "ai generations visible to household"
on public.ai_generations for select
using (public.is_household_member(household_id));
create policy "ai generations managed by admins"
on public.ai_generations for all
using (public.is_household_admin(household_id))
with check (public.is_household_admin(household_id));

create policy "ai suggestions visible to household"
on public.ai_suggestions for select
using (public.is_household_member(household_id));
create policy "ai suggestions managed by admins"
on public.ai_suggestions for all
using (public.is_household_admin(household_id))
with check (public.is_household_admin(household_id));

create policy "billing customers self access"
on public.billing_customers for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "subscriptions self access"
on public.subscriptions for select
using (auth.uid() = user_id);
create policy "subscriptions self manage"
on public.subscriptions for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "billing events admin write"
on public.billing_events for all
using (exists (select 1 from public.users u where u.id = auth.uid() and u.is_admin = true))
with check (exists (select 1 from public.users u where u.id = auth.uid() and u.is_admin = true));

create policy "usage counters self access"
on public.usage_counters for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "usage limits readable"
on public.usage_limits for select to authenticated using (true);

create or replace function public.member_role_from_age(p_age integer)
returns public.member_role
language sql
immutable
as $$
  select case
    when p_age between 0 and 3 then 'autre'::public.member_role
    when p_age between 4 and 11 then 'enfant'::public.member_role
    when p_age between 12 and 17 then 'ado'::public.member_role
    else 'adulte'::public.member_role
  end;
$$;

alter table public.household_members
  add column if not exists member_category text generated always as (
    case
      when age between 0 and 3 then 'bebe'
      when age between 4 and 11 then 'enfant'
      when age between 12 and 17 then 'ado'
      else 'adulte'
    end
  ) stored;

create or replace function public.enforce_household_member_role_from_age()
returns trigger
language plpgsql
as $$
begin
  new.role := public.member_role_from_age(new.age);
  return new;
end;
$$;

drop trigger if exists set_member_role_from_age on public.household_members;
create trigger set_member_role_from_age
before insert or update of age
on public.household_members
for each row execute procedure public.enforce_household_member_role_from_age();

insert into public.task_templates (
  is_system, title, description, category, min_age, roles, base_frequency, estimated_minutes, difficulty, points
)
values
  (true, 'Ranger le salon', 'Ranger le salon et les jouets.', 'menage', 8, '{adulte,ado,enfant}', 'quotidienne', 15, 1, 5),
  (true, 'Préparer les repas de base', 'Préparer un repas simple et équilibré.', 'cuisine', 16, '{adulte,ado}', 'quotidienne', 35, 2, 8),
  (true, 'Vider le lave-vaisselle', 'Ranger la vaisselle propre.', 'cuisine', 10, '{adulte,ado,enfant}', 'quotidienne', 10, 1, 5),
  (true, 'Lancer une lessive', 'Trier et lancer le linge.', 'routine', 14, '{adulte,ado}', 'hebdomadaire', 20, 2, 7),
  (true, 'Nettoyer la salle de bain', 'Nettoyer lavabo, douche et toilettes.', 'hygiene', 14, '{adulte,ado}', 'hebdomadaire', 25, 2, 8),
  (true, 'Faire les courses', 'Acheter les essentiels de la semaine.', 'courses', 18, '{adulte}', 'hebdomadaire', 45, 3, 9),
  (true, 'Routine du matin', 'Préparer le départ (petit-déjeuner, sacs, habits).', 'routine', 6, '{adulte,ado,enfant}', 'quotidienne', 20, 1, 5),
  (true, 'Routine du soir', 'Rangement express, préparation du lendemain.', 'routine', 6, '{adulte,ado,enfant}', 'quotidienne', 20, 1, 5),
  (true, 'Gestion administrative', 'Traiter courrier et papiers du foyer.', 'administratif', 18, '{adulte}', 'hebdomadaire', 30, 2, 8),
  (true, 'Suivi budget hebdomadaire', 'Revoir dépenses et ajuster.', 'budget', 18, '{adulte}', 'hebdomadaire', 30, 2, 8)
on conflict do nothing;
