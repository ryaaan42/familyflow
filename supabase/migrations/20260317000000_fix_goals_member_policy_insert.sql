-- Ensure goals can be created by household members (INSERT requires WITH CHECK).

drop policy if exists "goals managed by household members" on public.household_goals;

create policy "goals managed by household members"
  on public.household_goals
  for all
  using (public.is_household_member(household_id))
  with check (public.is_household_member(household_id));
