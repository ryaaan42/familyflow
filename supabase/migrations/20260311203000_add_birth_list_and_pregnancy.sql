alter table public.households
add column if not exists is_expecting_baby boolean not null default false,
add column if not exists pregnancy_due_date date,
add column if not exists birth_list_share_slug text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'households_birth_list_share_slug_key'
  ) then
    alter table public.households
    add constraint households_birth_list_share_slug_key unique (birth_list_share_slug);
  end if;
end
$$;

alter table public.household_members
add column if not exists is_pregnant boolean not null default false;

create table if not exists public.birth_list_items (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  title text not null,
  description text,
  category text not null,
  priority text not null check (priority in ('essentiel', 'utile', 'confort')),
  status text not null default 'wanted' check (status in ('wanted', 'reserved', 'received')),
  quantity integer not null default 1 check (quantity > 0),
  reserved_quantity integer not null default 0 check (reserved_quantity >= 0),
  estimated_price numeric(12,2),
  store_url text,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_birth_list_items_household
on public.birth_list_items(household_id, created_at desc);

create trigger set_birth_list_items_updated_at
before update on public.birth_list_items
for each row execute procedure public.set_updated_at();

alter table public.birth_list_items enable row level security;

create policy "birth list items visible to household"
on public.birth_list_items
for select
using (public.is_household_member(household_id));

create policy "birth list items managed by admins"
on public.birth_list_items
for all
using (public.is_household_admin(household_id))
with check (public.is_household_admin(household_id));
