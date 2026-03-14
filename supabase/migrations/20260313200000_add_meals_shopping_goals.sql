-- ============================================================
-- Planning repas
-- ============================================================

create table if not exists public.meal_plans (
  id             uuid        primary key default gen_random_uuid(),
  household_id   uuid        not null references public.households(id) on delete cascade,
  week_start     date        not null,
  day_of_week    smallint    not null check (day_of_week between 0 and 6),
  meal_type      text        not null check (meal_type in ('lunch', 'dinner')),
  title          text        not null,
  notes          text,
  created_at     timestamptz not null default timezone('utc', now()),
  unique (household_id, week_start, day_of_week, meal_type)
);

create index if not exists idx_meal_plans_household_week
  on public.meal_plans(household_id, week_start);

alter table public.meal_plans enable row level security;

create policy "meal plans readable by household members"
  on public.meal_plans for select
  using (public.is_household_member(household_id));

create policy "meal plans managed by household admins"
  on public.meal_plans for all
  using (public.is_household_admin(household_id));

-- ============================================================
-- Liste de courses
-- ============================================================

create table if not exists public.shopping_list_items (
  id                  uuid        primary key default gen_random_uuid(),
  household_id        uuid        not null references public.households(id) on delete cascade,
  name                text        not null,
  quantity            text,
  category            text        not null default 'autre',
  is_checked          boolean     not null default false,
  added_by_member_id  uuid        references public.household_members(id) on delete set null,
  created_at          timestamptz not null default timezone('utc', now()),
  deleted_at          timestamptz
);

create index if not exists idx_shopping_list_household
  on public.shopping_list_items(household_id, created_at desc)
  where deleted_at is null;

alter table public.shopping_list_items enable row level security;

create policy "shopping list readable by household members"
  on public.shopping_list_items for select
  using (public.is_household_member(household_id));

create policy "shopping list managed by household members"
  on public.shopping_list_items for all
  using (public.is_household_member(household_id));

-- ============================================================
-- Objectifs & défis
-- ============================================================

create table if not exists public.household_goals (
  id             uuid        primary key default gen_random_uuid(),
  household_id   uuid        not null references public.households(id) on delete cascade,
  title          text        not null,
  description    text,
  target_value   numeric(12,2),
  current_value  numeric(12,2) not null default 0,
  unit           text,
  category       text        not null default 'autre',
  due_date       date,
  status         text        not null default 'active'
                             check (status in ('active', 'completed', 'abandoned')),
  created_at     timestamptz not null default timezone('utc', now()),
  deleted_at     timestamptz
);

create index if not exists idx_household_goals_household
  on public.household_goals(household_id, status)
  where deleted_at is null;

alter table public.household_goals enable row level security;

create policy "goals readable by household members"
  on public.household_goals for select
  using (public.is_household_member(household_id));

create policy "goals managed by household admins"
  on public.household_goals for all
  using (public.is_household_admin(household_id));
