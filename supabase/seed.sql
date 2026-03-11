insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
values (
  '00000000-0000-0000-0000-000000000000',
  '11111111-1111-1111-1111-111111111111',
  'authenticated',
  'authenticated',
  'emma@familyflow.app',
  crypt('password123', gen_salt('bf')),
  timezone('utc', now()),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"display_name":"Emma Martin"}'::jsonb,
  timezone('utc', now()),
  timezone('utc', now())
)
on conflict (id) do nothing;

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
values (
  '00000000-0000-0000-0000-000000000000',
  '22222222-2222-2222-2222-222222222222',
  'authenticated',
  'authenticated',
  'lucas@familyflow.app',
  crypt('password123', gen_salt('bf')),
  timezone('utc', now()),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"display_name":"Lucas Martin"}'::jsonb,
  timezone('utc', now()),
  timezone('utc', now())
)
on conflict (id) do nothing;

update public.users
set plan = 'plus'
where id in (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222'
);

insert into public.households (
  id,
  owner_user_id,
  name,
  housing_type,
  surface_sqm,
  rooms,
  children_count,
  has_pets,
  city,
  planning_mode
)
values (
  '33333333-3333-3333-3333-333333333333',
  '11111111-1111-1111-1111-111111111111',
  'Famille Martin',
  'maison',
  118,
  6,
  2,
  true,
  'Lyon',
  'shared'
)
on conflict (id) do nothing;

insert into public.household_members (
  id,
  household_id,
  user_id,
  display_name,
  age,
  role,
  avatar_color,
  availability_hours_per_week,
  favorite_categories,
  blocked_categories,
  is_admin
)
values
  (
    '44444444-4444-4444-4444-444444444441',
    '33333333-3333-3333-3333-333333333333',
    '11111111-1111-1111-1111-111111111111',
    'Emma',
    38,
    'parent',
    '#6D5EF4',
    12,
    '{budget,courses}',
    '{}',
    true
  ),
  (
    '44444444-4444-4444-4444-444444444442',
    '33333333-3333-3333-3333-333333333333',
    '22222222-2222-2222-2222-222222222222',
    'Lucas',
    40,
    'parent',
    '#FF7E6B',
    10,
    '{administratif,entretien}',
    '{}',
    true
  ),
  (
    '44444444-4444-4444-4444-444444444443',
    '33333333-3333-3333-3333-333333333333',
    null,
    'Lea',
    15,
    'ado',
    '#56C7A1',
    7,
    '{animaux,cuisine}',
    '{administratif}',
    false
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    '33333333-3333-3333-3333-333333333333',
    null,
    'Noe',
    8,
    'enfant',
    '#FFBF5A',
    4,
    '{enfants,animaux}',
    '{hygiene}',
    false
  )
on conflict (id) do nothing;

insert into public.pets (id, household_id, name, type, notes)
values
  (
    '55555555-5555-5555-5555-555555555551',
    '33333333-3333-3333-3333-333333333333',
    'Moka',
    'chien',
    'Sortie longue le soir'
  ),
  (
    '55555555-5555-5555-5555-555555555552',
    '33333333-3333-3333-3333-333333333333',
    'Lune',
    'chat',
    'Aime les coins calmes'
  )
on conflict (id) do nothing;

insert into public.task_templates (
  id,
  is_system,
  title,
  description,
  category,
  min_age,
  roles,
  requires_pet_type,
  base_frequency,
  estimated_minutes,
  difficulty,
  indirect_cost_per_month,
  points
)
values
  (
    '66666666-6666-6666-6666-666666666661',
    true,
    'Planifier les repas',
    'Prevoir les repas de la semaine et la liste associée.',
    'budget',
    18,
    '{parent,adulte}',
    null,
    'hebdomadaire',
    30,
    3,
    55,
    32
  ),
  (
    '66666666-6666-6666-6666-666666666662',
    true,
    'Promener le chien',
    'Sortie de 20 minutes minimum.',
    'animaux',
    12,
    '{ado,parent,adulte}',
    'chien',
    'quotidienne',
    25,
    2,
    20,
    20
  ),
  (
    '66666666-6666-6666-6666-666666666663',
    true,
    'Ranger les jouets',
    'Remettre les jouets dans les bacs.',
    'enfants',
    4,
    '{enfant,ado}',
    null,
    'quotidienne',
    10,
    1,
    0,
    10
  )
on conflict (id) do nothing;

insert into public.tasks (
  id,
  household_id,
  template_id,
  created_by,
  title,
  description,
  category,
  frequency,
  due_date,
  status,
  estimated_minutes,
  difficulty,
  indirect_cost_per_month,
  minimum_age,
  recommended_roles,
  origin
)
values
  (
    '77777777-7777-7777-7777-777777777771',
    '33333333-3333-3333-3333-333333333333',
    '66666666-6666-6666-6666-666666666661',
    '11111111-1111-1111-1111-111111111111',
    'Planifier les repas',
    'Prevoir les repas de la semaine pour limiter les commandes.',
    'budget',
    'hebdomadaire',
    '2026-03-12',
    'in_progress',
    30,
    3,
    55,
    18,
    '{parent,adulte}',
    'smart'
  ),
  (
    '77777777-7777-7777-7777-777777777772',
    '33333333-3333-3333-3333-333333333333',
    '66666666-6666-6666-6666-666666666662',
    '11111111-1111-1111-1111-111111111111',
    'Promener le chien',
    'Sortie du soir.',
    'animaux',
    'quotidienne',
    '2026-03-11',
    'todo',
    25,
    2,
    20,
    12,
    '{ado,parent,adulte}',
    'smart'
  ),
  (
    '77777777-7777-7777-7777-777777777773',
    '33333333-3333-3333-3333-333333333333',
    '66666666-6666-6666-6666-666666666663',
    '11111111-1111-1111-1111-111111111111',
    'Ranger les jouets',
    'Routine avant le repas du soir.',
    'enfants',
    'quotidienne',
    '2026-03-11',
    'done',
    10,
    1,
    0,
    4,
    '{enfant,ado}',
    'smart'
  )
on conflict (id) do nothing;

insert into public.task_assignments (id, task_id, member_id, status, scheduled_for)
values
  (
    '88888888-8888-8888-8888-888888888881',
    '77777777-7777-7777-7777-777777777771',
    '44444444-4444-4444-4444-444444444441',
    'in_progress',
    '2026-03-12'
  ),
  (
    '88888888-8888-8888-8888-888888888882',
    '77777777-7777-7777-7777-777777777772',
    '44444444-4444-4444-4444-444444444443',
    'todo',
    '2026-03-11'
  ),
  (
    '88888888-8888-8888-8888-888888888883',
    '77777777-7777-7777-7777-777777777773',
    '44444444-4444-4444-4444-444444444444',
    'done',
    '2026-03-11'
  )
on conflict (id) do nothing;

insert into public.task_completions (
  id,
  task_assignment_id,
  task_id,
  member_id,
  completed_by_user_id,
  completed_at
)
values (
  '99999999-9999-9999-9999-999999999991',
  '88888888-8888-8888-8888-888888888883',
  '77777777-7777-7777-7777-777777777773',
  '44444444-4444-4444-4444-444444444444',
  '11111111-1111-1111-1111-111111111111',
  timezone('utc', now())
)
on conflict (id) do nothing;

insert into public.budgets (id, household_id, month, target_savings, notes)
values (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
  '33333333-3333-3333-3333-333333333333',
  '2026-03-01',
  450,
  'Objectif V1: lisser courses et sorties'
)
on conflict (id) do nothing;

insert into public.budget_items (id, budget_id, type, category, label, amount, recurring)
values
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'income', 'maison', 'Salaires nets', 5200, true),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'fixed', 'loyer_credit', 'Credit maison', 1420, true),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'fixed', 'abonnements', 'Abonnements', 94, true),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb4', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'variable', 'courses', 'Courses', 780, true),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb5', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'variable', 'restaurant_fast_food', 'Livraisons repas', 220, true),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb6', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'variable', 'sorties', 'Cinema du mardi', 100, true),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb7', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'variable', 'animaux', 'Animaux', 130, true)
on conflict (id) do nothing;

insert into public.savings_scenarios (
  id,
  household_id,
  title,
  description,
  domain,
  monthly_cost,
  improved_monthly_cost,
  linked_task_category,
  effort,
  source
)
values
  (
    'cccccccc-cccc-cccc-cccc-ccccccccccc1',
    '33333333-3333-3333-3333-333333333333',
    'Cinema du mardi',
    'Passer de 4 a 2 sorties par mois.',
    'sorties',
    100,
    50,
    null,
    'facile',
    'manual'
  ),
  (
    'cccccccc-cccc-cccc-cccc-ccccccccccc2',
    '33333333-3333-3333-3333-333333333333',
    'Uber Eats x2 / semaine',
    'Remplacer une commande par un repas planifie.',
    'repas',
    220,
    120,
    'cuisine',
    'moyen',
    'suggested'
  ),
  (
    'cccccccc-cccc-cccc-cccc-ccccccccccc3',
    '33333333-3333-3333-3333-333333333333',
    'Courses mal planifiees',
    'Limiter le gaspillage avec une routine stock.',
    'courses',
    65,
    20,
    'courses',
    'facile',
    'suggested'
  )
on conflict (id) do nothing;

insert into public.savings_projections (id, scenario_id, horizon_months, current_cost, improved_cost, savings)
values
  ('dddddddd-dddd-dddd-dddd-ddddddddddd1', 'cccccccc-cccc-cccc-cccc-ccccccccccc1', 3, 300, 150, 150),
  ('dddddddd-dddd-dddd-dddd-ddddddddddd2', 'cccccccc-cccc-cccc-cccc-ccccccccccc2', 6, 1320, 720, 600),
  ('dddddddd-dddd-dddd-dddd-ddddddddddd3', 'cccccccc-cccc-cccc-cccc-ccccccccccc3', 12, 780, 240, 540)
on conflict (id) do nothing;

insert into public.pdf_exports (id, household_id, created_by, export_type, theme, metadata)
values (
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1',
  '33333333-3333-3333-3333-333333333333',
  '11111111-1111-1111-1111-111111111111',
  'planning-hebdomadaire',
  'premium',
  '{"paper":"A4","includeBudget":true}'::jsonb
)
on conflict (id) do nothing;

insert into public.notifications (id, household_id, user_id, type, channel, title, body)
values (
  'ffffffff-ffff-ffff-ffff-fffffffffff1',
  '33333333-3333-3333-3333-333333333333',
  '11111111-1111-1111-1111-111111111111',
  'budget_reminder',
  'in_app',
  'Verifier le budget',
  'Le budget de mars depasse la cible restauration.'
)
on conflict (id) do nothing;
