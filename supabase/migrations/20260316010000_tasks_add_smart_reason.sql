-- Add smart_reason column to tasks for AI-generated task explanations.
-- Referenced in task-actions.ts persistAiPlanTasks but was missing from schema.

alter table public.tasks
  add column if not exists smart_reason text;
