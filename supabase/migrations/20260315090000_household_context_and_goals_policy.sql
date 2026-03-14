alter table public.households
  add column if not exists ai_context jsonb not null default '{}'::jsonb;

drop policy if exists "goals managed by household admins" on public.household_goals;
create policy "goals managed by household members"
  on public.household_goals for all
  using (public.is_household_member(household_id));
