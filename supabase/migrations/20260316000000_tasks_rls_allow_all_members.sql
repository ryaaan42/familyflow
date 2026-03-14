-- Fix: allow ALL household members to manage tasks and assignments.
-- Previously only admins could insert/update/delete, causing "Impossible d'enregistrer la tâche"
-- for non-admin members and in some edge cases even for admins when the auth context
-- wasn't resolved to an admin role.

-- Tasks: replace admin-only write policy with household-member write policy
drop policy if exists "tasks managed by admins" on public.tasks;

create policy "tasks managed by household members"
on public.tasks
for all
using (public.is_household_member(household_id))
with check (public.is_household_member(household_id));

-- Task assignments: same relaxation
drop policy if exists "task assignments managed by admins" on public.task_assignments;

create policy "task assignments managed by household members"
on public.task_assignments
for all
using (
  exists (
    select 1
    from public.tasks t
    where t.id = task_assignments.task_id
      and public.is_household_member(t.household_id)
  )
)
with check (
  exists (
    select 1
    from public.tasks t
    where t.id = task_assignments.task_id
      and public.is_household_member(t.household_id)
  )
);
