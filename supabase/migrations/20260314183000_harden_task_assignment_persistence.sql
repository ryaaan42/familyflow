-- Root-cause fix for unstable task persistence:
-- 1) constrain one active assignment row per task
-- 2) store household scope directly on assignment rows
-- 3) persist day_of_week for weekly planning and PDF grouping

alter table public.task_assignments
  add column if not exists household_id uuid references public.households(id) on delete cascade,
  add column if not exists day_of_week smallint check (day_of_week between 1 and 7);

-- Backfill household_id from tasks and normalize day_of_week from scheduled_for.
update public.task_assignments ta
set household_id = t.household_id,
    day_of_week = coalesce(ta.day_of_week, (((extract(dow from ta.scheduled_for)::int + 6) % 7) + 1))
from public.tasks t
where t.id = ta.task_id
  and (ta.household_id is null or ta.day_of_week is null);

-- Keep only the latest assignment per task to avoid non-deterministic reads.
with ranked as (
  select
    id,
    row_number() over (partition by task_id order by updated_at desc, created_at desc, id desc) as rn
  from public.task_assignments
)
delete from public.task_assignments ta
using ranked r
where ta.id = r.id
  and r.rn > 1;

alter table public.task_assignments
  alter column household_id set not null,
  alter column day_of_week set not null;

create unique index if not exists idx_task_assignments_unique_task
on public.task_assignments(task_id);

create index if not exists idx_task_assignments_household_day
on public.task_assignments(household_id, day_of_week, scheduled_for desc);

create or replace function public.sync_task_assignment_scope()
returns trigger
language plpgsql
as $$
declare
  v_task_household uuid;
  v_member_household uuid;
begin
  select household_id into v_task_household
  from public.tasks
  where id = new.task_id;

  if v_task_household is null then
    raise exception 'Task % not found', new.task_id;
  end if;

  select household_id into v_member_household
  from public.household_members
  where id = new.member_id;

  if v_member_household is null then
    raise exception 'Member % not found', new.member_id;
  end if;

  if v_task_household <> v_member_household then
    raise exception 'Task/member household mismatch';
  end if;

  new.household_id := v_task_household;
  if new.day_of_week is null then
    new.day_of_week := (((extract(dow from new.scheduled_for)::int + 6) % 7) + 1);
  end if;
  return new;
end;
$$;

drop trigger if exists trg_sync_task_assignment_scope on public.task_assignments;
create trigger trg_sync_task_assignment_scope
before insert or update of task_id, member_id, scheduled_for, day_of_week
on public.task_assignments
for each row execute procedure public.sync_task_assignment_scope();
