-- Redistribute template/custom tasks that are all stacked on the same due_date.
-- This happens when bootstrapDefaultTasksIfEmpty ran before the index%7 distribution
-- was added. Tasks without assignments and with a shared due_date all render on the
-- same weekday column.

WITH household_tasks AS (
  SELECT
    id,
    household_id,
    due_date,
    ROW_NUMBER() OVER (PARTITION BY household_id ORDER BY created_at, id) AS rn
  FROM public.tasks
  WHERE deleted_at IS NULL
),
stacked_households AS (
  -- households where ALL tasks share exactly one due_date
  SELECT household_id
  FROM household_tasks
  GROUP BY household_id
  HAVING COUNT(DISTINCT due_date) = 1
    AND COUNT(*) > 1
)
UPDATE public.tasks t
SET due_date = (
  -- Monday of the current ISO week + (row_position % 7) days
  DATE_TRUNC('week', CURRENT_DATE)::date + ((ht.rn - 1) % 7)::integer
)
FROM household_tasks ht
WHERE t.id = ht.id
  AND ht.household_id IN (SELECT household_id FROM stacked_households);
