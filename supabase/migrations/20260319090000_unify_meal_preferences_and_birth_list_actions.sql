create table if not exists public.household_meal_preferences (
  household_id uuid primary key references public.households(id) on delete cascade,
  diets text[] not null default '{}'::text[],
  allergies text[] not null default '{}'::text[],
  avoids text[] not null default '{}'::text[],
  child_friendly boolean not null default false,
  budget_tight boolean not null default false,
  quick_meals boolean not null default false,
  batch_cooking boolean not null default false,
  healthy_focus boolean not null default true,
  notes text,
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger set_household_meal_preferences_updated_at
before update on public.household_meal_preferences
for each row execute procedure public.set_updated_at();

alter table public.household_meal_preferences enable row level security;

drop policy if exists "meal preferences visible to household" on public.household_meal_preferences;
create policy "meal preferences visible to household"
  on public.household_meal_preferences
  for select
  using (public.is_household_member(household_id));

drop policy if exists "meal preferences managed by household" on public.household_meal_preferences;
create policy "meal preferences managed by household"
  on public.household_meal_preferences
  for all
  using (public.is_household_member(household_id))
  with check (public.is_household_member(household_id));

alter table public.birth_list_reservations
add column if not exists action text not null default 'reserved' check (action in ('intent','reserved','purchased'));
