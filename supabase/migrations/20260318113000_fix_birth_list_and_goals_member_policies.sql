-- Align production policies so household members can create/edit birth-list items and goals.

-- Birth list
DROP POLICY IF EXISTS "birth list items managed by admins" ON public.birth_list_items;
DROP POLICY IF EXISTS "birth list items managed by household members" ON public.birth_list_items;
CREATE POLICY "birth list items managed by household members"
  ON public.birth_list_items
  FOR ALL
  USING (public.is_household_member(household_id))
  WITH CHECK (public.is_household_member(household_id));

-- Goals (safety: ensure WITH CHECK exists even on older DB states)
DROP POLICY IF EXISTS "goals managed by household admins" ON public.household_goals;
DROP POLICY IF EXISTS "goals managed by household members" ON public.household_goals;
CREATE POLICY "goals managed by household members"
  ON public.household_goals
  FOR ALL
  USING (public.is_household_member(household_id))
  WITH CHECK (public.is_household_member(household_id));
