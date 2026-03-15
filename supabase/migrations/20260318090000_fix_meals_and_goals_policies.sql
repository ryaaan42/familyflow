-- Ensure meal plans and goals are manageable by all household members with INSERT checks.

drop policy if exists "meal plans managed by household admins" on public.meal_plans;
drop policy if exists "meal plans managed by household members" on public.meal_plans;
create policy "meal plans managed by household members"
  on public.meal_plans
  for all
  using (public.is_household_member(household_id))
  with check (public.is_household_member(household_id));

drop policy if exists "goals managed by household admins" on public.household_goals;
drop policy if exists "goals managed by household members" on public.household_goals;
create policy "goals managed by household members"
  on public.household_goals
  for all
  using (public.is_household_member(household_id))
  with check (public.is_household_member(household_id));
