-- Add day_of_week directly to tasks table so that tasks without assignments
-- still have an explicit weekly slot (avoids depending solely on due_date + timezone conversion).

alter table public.tasks
  add column if not exists day_of_week smallint check (day_of_week between 1 and 7);

-- Backfill from task_assignments where available.
update public.tasks t
set day_of_week = ta.day_of_week
from public.task_assignments ta
where ta.task_id = t.id
  and t.day_of_week is null;

-- For remaining tasks, infer from due_date (1=Monday…7=Sunday, ISO week convention).
update public.tasks
set day_of_week = (((extract(dow from due_date::date)::int + 6) % 7) + 1)
where day_of_week is null;
