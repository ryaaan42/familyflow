-- ============================================================
-- birth_list_reservations
-- Tracks who reserved/purchased an item on a public birth list.
-- This table is writable by anonymous users via the
-- reserve_birth_list_item() SECURITY DEFINER function only.
-- ============================================================

create table if not exists public.birth_list_reservations (
  id             uuid        primary key default gen_random_uuid(),
  item_id        uuid        not null references public.birth_list_items(id) on delete cascade,
  buyer_name     text        not null,
  buyer_message  text,
  reserved_at    timestamptz not null default timezone('utc', now())
);

create index if not exists idx_birth_list_reservations_item
  on public.birth_list_reservations(item_id, reserved_at desc);

alter table public.birth_list_reservations enable row level security;

-- Household members can read reservations for their own household's items
create policy "reservations readable by household members"
  on public.birth_list_reservations
  for select
  using (
    exists (
      select 1
      from   public.birth_list_items bli
      where  bli.id = item_id
        and  public.is_household_member(bli.household_id)
    )
  );

-- No direct INSERT/UPDATE/DELETE from client — all writes go through the
-- SECURITY DEFINER function below.

-- ============================================================
-- Public SELECT on birth_list_items via share slug
-- Allows anonymous visitors to read items when they have the slug.
-- ============================================================

create policy "birth list items readable via share slug (anon)"
  on public.birth_list_items
  for select
  to anon
  using (
    exists (
      select 1
      from   public.households h
      where  h.id = household_id
        and  h.birth_list_share_slug is not null
    )
  );

-- ============================================================
-- reserve_birth_list_item()
-- Called by the public share page (no user session).
-- SECURITY DEFINER so it can bypass RLS.
-- Validates slug ownership, guards against double-reservation,
-- updates item status and inserts a reservation row atomically.
-- ============================================================

create or replace function public.reserve_birth_list_item(
  p_slug         text,
  p_item_id      uuid,
  p_buyer_name   text,
  p_buyer_message text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_household_id uuid;
  v_item_status  text;
  v_item_qty     integer;
  v_item_res_qty integer;
begin
  -- 1. Validate slug → household
  select id
    into v_household_id
    from public.households
   where birth_list_share_slug = p_slug
   limit 1;

  if v_household_id is null then
    return jsonb_build_object('success', false, 'error', 'Liste introuvable');
  end if;

  -- 2. Lock item row and verify ownership + status
  select status, quantity, reserved_quantity
    into v_item_status, v_item_qty, v_item_res_qty
    from public.birth_list_items
   where id = p_item_id
     and household_id = v_household_id
   for update;

  if v_item_status is null then
    return jsonb_build_object('success', false, 'error', 'Article introuvable');
  end if;

  if v_item_status = 'received' then
    return jsonb_build_object('success', false, 'error', 'Article deja recu');
  end if;

  if v_item_res_qty >= v_item_qty then
    return jsonb_build_object('success', false, 'error', 'Article deja entierement reserve');
  end if;

  -- 3. Update item: increment reserved_quantity and set status if fully reserved
  update public.birth_list_items
     set reserved_quantity = reserved_quantity + 1,
         status = case
                    when reserved_quantity + 1 >= quantity then 'reserved'
                    else status
                  end
   where id = p_item_id;

  -- 4. Record reservation
  insert into public.birth_list_reservations (item_id, buyer_name, buyer_message)
  values (p_item_id, p_buyer_name, p_buyer_message);

  return jsonb_build_object('success', true);
end;
$$;

-- Grant execute to the anon role so unauthenticated callers can invoke it
grant execute on function public.reserve_birth_list_item(text, uuid, text, text) to anon;
