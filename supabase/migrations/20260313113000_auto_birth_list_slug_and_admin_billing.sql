-- Auto-assign birth list slug + admin billing and product configuration primitives.

create extension if not exists pgcrypto;
create extension if not exists unaccent;

create or replace function public.generate_birth_list_slug(p_name text, p_seed text default null)
returns text
language plpgsql
volatile
as $$
declare
  v_base text;
  v_suffix text;
begin
  v_base := lower(regexp_replace(unaccent(coalesce(p_name, 'famille')), '[^a-zA-Z0-9]+', '-', 'g'));
  v_base := trim(both '-' from v_base);
  if v_base = '' then
    v_base := 'famille';
  end if;

  v_suffix := lower(coalesce(nullif(p_seed, ''), substr(encode(gen_random_bytes(4), 'hex'), 1, 8)));
  return v_base || '-naissance-' || v_suffix;
end;
$$;

update public.households
set birth_list_share_slug = public.generate_birth_list_slug(name, substr(id::text, 1, 6))
where coalesce(birth_list_share_slug, '') = '';

alter table public.households
  alter column birth_list_share_slug set default public.generate_birth_list_slug(name, substr(id::text, 1, 6));

create or replace function public.create_household_with_members(
  p_name             text,
  p_housing_type     public.housing_type,
  p_surface_sqm      integer,
  p_rooms            integer,
  p_children_count   integer,
  p_has_pets         boolean,
  p_city             text,
  p_is_expecting_baby boolean,
  p_pregnancy_due_date date,
  p_members          jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_household_id uuid;
  v_user_id      uuid;
  v_member       jsonb;
  v_index        integer := 0;
  v_slug         text;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  v_slug := case
    when p_is_expecting_baby then public.generate_birth_list_slug(p_name, substr(v_user_id::text, 1, 6))
    else public.generate_birth_list_slug(p_name, substr(v_user_id::text, 1, 6))
  end;

  insert into public.households (
    owner_user_id,
    name,
    housing_type,
    surface_sqm,
    rooms,
    children_count,
    has_pets,
    city,
    is_expecting_baby,
    pregnancy_due_date,
    birth_list_share_slug
  )
  values (
    v_user_id,
    p_name,
    p_housing_type,
    p_surface_sqm,
    p_rooms,
    p_children_count,
    p_has_pets,
    nullif(p_city, ''),
    p_is_expecting_baby,
    p_pregnancy_due_date,
    v_slug
  )
  returning id into v_household_id;

  for v_member in select value from jsonb_array_elements(p_members)
  loop
    insert into public.household_members (
      household_id,
      user_id,
      display_name,
      age,
      role,
      avatar_color,
      availability_hours_per_week,
      is_admin,
      is_pregnant
    )
    values (
      v_household_id,
      case when v_index = 0 then v_user_id else null end,
      v_member->>'displayName',
      (v_member->>'age')::integer,
      (v_member->>'role')::public.member_role,
      coalesce(v_member->>'avatarColor', '#6D5EF4'),
      10,
      v_index = 0,
      coalesce((v_member->>'isPregnant')::boolean, false)
    );
    v_index := v_index + 1;
  end loop;

  return v_household_id;
end;
$$;

grant execute on function public.create_household_with_members(
  text, public.housing_type, integer, integer, integer,
  boolean, text, boolean, date, jsonb
) to authenticated;

create table if not exists public.site_settings (
  key text primary key,
  label text not null,
  value text not null,
  section text not null default 'general',
  is_secret boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_percent integer,
  discount_amount integer,
  max_redemptions integer,
  redeemed_count integer not null default 0,
  valid_until timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.subscription_plans (
  key text primary key,
  label text not null,
  stripe_price_id text,
  monthly_price_cents integer not null,
  description text not null,
  features text[] not null default '{}',
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.site_settings enable row level security;
alter table public.promo_codes enable row level security;
alter table public.subscription_plans enable row level security;

create policy if not exists "site settings readable by authenticated"
on public.site_settings for select to authenticated using (true);
create policy if not exists "site settings writable by admins"
on public.site_settings for all to authenticated
using (exists (select 1 from public.users u where u.id = auth.uid() and u.is_admin = true))
with check (exists (select 1 from public.users u where u.id = auth.uid() and u.is_admin = true));

create policy if not exists "promo codes readable by authenticated"
on public.promo_codes for select to authenticated using (true);
create policy if not exists "promo codes writable by admins"
on public.promo_codes for all to authenticated
using (exists (select 1 from public.users u where u.id = auth.uid() and u.is_admin = true))
with check (exists (select 1 from public.users u where u.id = auth.uid() and u.is_admin = true));

create policy if not exists "plans readable by authenticated"
on public.subscription_plans for select to authenticated using (true);
create policy if not exists "plans writable by admins"
on public.subscription_plans for all to authenticated
using (exists (select 1 from public.users u where u.id = auth.uid() and u.is_admin = true))
with check (exists (select 1 from public.users u where u.id = auth.uid() and u.is_admin = true));

insert into public.site_settings (key, label, value, section, is_secret)
values
  ('openai_api_key', 'Clé API OpenAI', '', 'integrations', true),
  ('stripe_secret_key', 'Stripe secret key', '', 'billing', true),
  ('stripe_publishable_key', 'Stripe publishable key', '', 'billing', false),
  ('stripe_webhook_secret', 'Stripe webhook secret', '', 'billing', true)
on conflict (key) do nothing;

insert into public.subscription_plans (key, label, monthly_price_cents, description, features)
values
  ('free', 'Gratuit', 0, 'Essentiel pour démarrer', array['1 foyer', 'Tâches basiques']),
  ('plus', 'Plus', 499, 'Pour les familles qui s''organisent activement', array['IA avancée', 'PDF premium', 'Automatisations']),
  ('family-pro', 'Family Pro', 1299, 'Pilotage familial complet', array['Tout Plus', 'Admin avancé', 'Priorité support'])
on conflict (key) do nothing;
