-- ─────────────────────────────────────────────────────
-- 1. Colonne is_admin sur public.users
-- ─────────────────────────────────────────────────────
alter table public.users
  add column if not exists is_admin boolean not null default false;

-- ─────────────────────────────────────────────────────
-- 2. Table site_content (textes éditables du site)
-- ─────────────────────────────────────────────────────
create table if not exists public.site_content (
  key        text primary key,
  label      text not null,
  value      text not null default '',
  section    text not null default 'general',
  updated_at timestamptz not null default timezone('utc', now())
);

-- Trigger updated_at
create or replace trigger site_content_updated_at
  before update on public.site_content
  for each row execute function public.set_updated_at();

-- RLS
alter table public.site_content enable row level security;

create policy "site_content_read_all"
  on public.site_content for select
  using (true);

create policy "site_content_admin_write"
  on public.site_content for all
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and is_admin = true
    )
  );

-- ─────────────────────────────────────────────────────
-- 3. Table feature_flags
-- ─────────────────────────────────────────────────────
create table if not exists public.feature_flags (
  key         text primary key,
  label       text not null,
  description text not null default '',
  category    text not null default 'general',
  enabled     boolean not null default false,
  updated_at  timestamptz not null default timezone('utc', now())
);

create or replace trigger feature_flags_updated_at
  before update on public.feature_flags
  for each row execute function public.set_updated_at();

alter table public.feature_flags enable row level security;

create policy "feature_flags_read_all"
  on public.feature_flags for select
  using (true);

create policy "feature_flags_admin_write"
  on public.feature_flags for all
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and is_admin = true
    )
  );

-- ─────────────────────────────────────────────────────
-- 4. Politique RLS : admin peut lire TOUS les users
-- ─────────────────────────────────────────────────────
-- On ajoute une politique additive pour la lecture admin
create policy "users_admin_read_all"
  on public.users for select
  using (
    exists (
      select 1 from public.users u2
      where u2.id = auth.uid() and u2.is_admin = true
    )
  );

-- Admin peut mettre à jour le plan et is_admin de n'importe quel user
create policy "users_admin_update"
  on public.users for update
  using (
    exists (
      select 1 from public.users u2
      where u2.id = auth.uid() and u2.is_admin = true
    )
  );

-- ─────────────────────────────────────────────────────
-- 5. Données initiales — site_content
-- ─────────────────────────────────────────────────────
insert into public.site_content (key, label, value, section) values
  -- Hero
  ('hero_title',          'Titre principal (hero)',         'Votre famille,\nmieux organisée', 'hero'),
  ('hero_subtitle',       'Sous-titre (hero)',              'FamilyFlow centralise tâches, budget et économies pour que votre foyer avance sereinement.', 'hero'),
  ('hero_cta_primary',    'Bouton CTA principal',           'Commencer gratuitement', 'hero'),
  ('hero_cta_secondary',  'Bouton CTA secondaire',          'Voir une démo', 'hero'),
  -- Value grid
  ('value_1_title',       'Avantage 1 — titre',             'Organisez les tâches', 'valeurs'),
  ('value_1_desc',        'Avantage 1 — description',       'Répartissez les corvées équitablement entre tous les membres du foyer.', 'valeurs'),
  ('value_2_title',       'Avantage 2 — titre',             'Pilotez votre budget', 'valeurs'),
  ('value_2_desc',        'Avantage 2 — description',       'Visualisez vos revenus, dépenses fixes et variables en un coup d''œil.', 'valeurs'),
  ('value_3_title',       'Avantage 3 — titre',             'Boostez vos économies', 'valeurs'),
  ('value_3_desc',        'Avantage 3 — description',       'Des scénarios concrets pour économiser chaque mois sans effort.', 'valeurs'),
  -- Steps
  ('steps_title',         'Titre section étapes',           'Lancez-vous en 3 étapes', 'etapes'),
  ('step_1_title',        'Étape 1 — titre',                'Créez votre foyer', 'etapes'),
  ('step_1_desc',         'Étape 1 — description',          'Ajoutez les membres de votre famille et configurez votre espace.', 'etapes'),
  ('step_2_title',        'Étape 2 — titre',                'Organisez vos tâches', 'etapes'),
  ('step_2_desc',         'Étape 2 — description',          'L''IA suggère un planning adapté à chaque membre.', 'etapes'),
  ('step_3_title',        'Étape 3 — titre',                'Suivez vos progrès', 'etapes'),
  ('step_3_desc',         'Étape 3 — description',          'Tableaux de bord, exports PDF et alertes pour garder le cap.', 'etapes'),
  -- Testimonials
  ('testimonials_title',  'Titre section témoignages',      'Ils ont adopté FamilyFlow', 'temoignages'),
  -- FAQ
  ('faq_title',           'Titre section FAQ',              'Questions fréquentes', 'faq'),
  -- Footer / général
  ('app_tagline',         'Tagline application',            'Votre foyer, simplifié.', 'general'),
  ('footer_legal',        'Texte légal footer',             'FamilyFlow SAS — Paris, France', 'general'),
  ('welcome_message',     'Message de bienvenue (app)',     'Bienvenue dans votre espace familial ✨', 'general'),
  ('maintenance_banner',  'Bannière maintenance',           '', 'general')
on conflict (key) do nothing;

-- ─────────────────────────────────────────────────────
-- 6. Données initiales — feature_flags
-- ─────────────────────────────────────────────────────
insert into public.feature_flags (key, label, description, category, enabled) values
  ('ai_assistant',    'Assistant IA',           'Génération de plannings via LLM',            'IA',        true),
  ('birth_list',      'Liste de naissance',     'Module bébé et partage public',              'Fonctionnel',true),
  ('pdf_export',      'Export PDF premium',     'Génération PDF multi-thèmes',                'Export',    true),
  ('budget_alerts',   'Alertes budget',         'Notifications dépassement de seuil',         'Budget',    false),
  ('dark_mode',       'Mode sombre',            'Thème nuit pour l''app web',                  'UI',        false),
  ('mobile_push',     'Push mobile',            'Notifications push Expo',                    'Mobile',    false),
  ('stripe_billing',  'Paiement Stripe',        'Gestion abonnements live',                   'Paiement',  false),
  ('maintenance',     'Mode maintenance',       'Bannière maintenance pour les utilisateurs', 'Système',   false)
on conflict (key) do nothing;
