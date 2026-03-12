-- Fonction transactionnelle pour créer un foyer + ses membres en une seule opération.
-- Appelée via RPC depuis le client : bypasse le cache schema PostgREST et
-- garantit l'atomicité (tout réussit ou tout échoue).
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
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- Créer le foyer
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
    pregnancy_due_date
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
    p_pregnancy_due_date
  )
  returning id into v_household_id;

  -- Créer les membres
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

-- Autoriser l'appel RPC pour les utilisateurs authentifiés
grant execute on function public.create_household_with_members(
  text, public.housing_type, integer, integer, integer,
  boolean, text, boolean, date, jsonb
) to authenticated;
