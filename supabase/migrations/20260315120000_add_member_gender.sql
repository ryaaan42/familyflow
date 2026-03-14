-- Add is_female column to household_members for gender tracking
-- Required for pregnancy feature: only female members can be marked as pregnant

alter table public.household_members
  add column if not exists is_female boolean not null default false;

-- Infer gender from existing is_pregnant rows: pregnant members are female
update public.household_members
set is_female = true
where is_pregnant = true
  and is_female = false;
