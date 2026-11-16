-- The Long Table: family holiday planner and memory keeper.
--
-- Lives in the shared family Supabase project (also home to Something
-- Borrowed). Every table is prefixed `lt_` and photos use their own bucket so
-- the apps never collide.
--
-- All access goes through the Next.js server using the secret key, so every
-- table has RLS enabled with no policies (the public/anon key can read nothing).

-- The people using the app ("who's this?").
create table public.lt_members (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  emoji text not null default '🦃',
  created_at timestamptz not null default now()
);

-- One gathering = one year's table: Thanksgiving 2026, Christmas Eve 2027, ...
create table public.lt_gatherings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  kind text not null default 'thanksgiving',
  date date,
  time_note text,          -- "Arrive at 1, dinner at 2:30"
  host text,               -- "Grandma & Grandpa"
  place text,              -- "The farmhouse"
  address text,
  notes text,
  created_by uuid references public.lt_members(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index lt_gatherings_date_idx on public.lt_gatherings(date desc);

-- Who's coming. One row per party/household; anyone can RSVP for someone else.
create table public.lt_rsvps (
  id uuid primary key default gen_random_uuid(),
  gathering_id uuid not null references public.lt_gatherings(id) on delete cascade,
  party text not null check (length(party) between 1 and 80),
  status text not null default 'yes' check (status in ('yes', 'maybe', 'no')),
  adults int not null default 1 check (adults between 0 and 50),
  kids int not null default 0 check (kids between 0 and 50),
  note text,               -- allergies, arriving late, bringing a friend...
  member_id uuid references public.lt_members(id) on delete set null,   -- whose RSVP this is
  updated_by uuid references public.lt_members(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (gathering_id, party)
);
create index lt_rsvps_gathering_idx on public.lt_rsvps(gathering_id);

-- The menu. A dish with no bringer is an open slot someone can claim.
create table public.lt_dishes (
  id uuid primary key default gen_random_uuid(),
  gathering_id uuid not null references public.lt_gatherings(id) on delete cascade,
  course text not null default 'Sides',
  name text not null check (length(name) between 1 and 120),
  bringer text,
  bringer_member_id uuid references public.lt_members(id) on delete set null,
  note text,
  sort_order int not null default 0,
  created_by uuid references public.lt_members(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index lt_dishes_gathering_idx on public.lt_dishes(gathering_id, sort_order);

-- Photos from the day, and Rope's art (kind = 'art').
create table public.lt_photos (
  id uuid primary key default gen_random_uuid(),
  gathering_id uuid not null references public.lt_gatherings(id) on delete cascade,
  kind text not null default 'photo' check (kind in ('photo', 'art')),
  artist text,
  caption text,
  path text not null,
  thumb_path text not null,
  member_id uuid references public.lt_members(id) on delete set null,
  created_at timestamptz not null default now()
);
create index lt_photos_gathering_idx on public.lt_photos(gathering_id, created_at desc);
create index lt_photos_kind_idx on public.lt_photos(kind, created_at desc);

create or replace function public.lt_touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;

create trigger lt_gatherings_touch before update on public.lt_gatherings
  for each row execute function public.lt_touch_updated_at();
create trigger lt_rsvps_touch before update on public.lt_rsvps
  for each row execute function public.lt_touch_updated_at();
create trigger lt_dishes_touch before update on public.lt_dishes
  for each row execute function public.lt_touch_updated_at();

alter table public.lt_members enable row level security;
alter table public.lt_gatherings enable row level security;
alter table public.lt_rsvps enable row level security;
alter table public.lt_dishes enable row level security;
alter table public.lt_photos enable row level security;

-- Private bucket for photos and art; served through the app's /img route.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('long-table-photos', 'long-table-photos', false, 5242880, array['image/jpeg', 'image/webp', 'image/png'])
on conflict (id) do nothing;
