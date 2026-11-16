-- The Recipe Box: family recipes that outlive any one Thanksgiving.
-- Ingredients and steps are plain text, one per line, so they're easy to type
-- on a phone or paste from an email. A photo of the original handwritten card
-- (kind = 'card') is often the most precious part.

create table public.lt_recipes (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(title) between 1 and 120),
  from_whom text,          -- "Grandma Jean"
  course text,
  servings text,           -- "Feeds 12"
  time_note text,          -- "4 hours, plus an overnight brine"
  story text,              -- where it came from, why it matters
  ingredients text,        -- one per line
  steps text,              -- one per line
  tags text[] not null default '{}',   -- 'favorite', 'secret'
  created_by uuid references public.lt_members(id) on delete set null,
  updated_by uuid references public.lt_members(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index lt_recipes_title_idx on public.lt_recipes(lower(title));

create table public.lt_recipe_photos (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.lt_recipes(id) on delete cascade,
  kind text not null default 'dish' check (kind in ('card', 'dish')),
  path text not null,
  thumb_path text not null,
  sort_order int not null default 0,
  member_id uuid references public.lt_members(id) on delete set null,
  created_at timestamptz not null default now()
);
create index lt_recipe_photos_recipe_idx on public.lt_recipe_photos(recipe_id, sort_order);

-- A dish on a year's menu can point at its recipe, which gives each recipe a
-- "made in 2024, 2025, 2026" history.
alter table public.lt_dishes
  add column recipe_id uuid references public.lt_recipes(id) on delete set null;
create index lt_dishes_recipe_idx on public.lt_dishes(recipe_id);

create trigger lt_recipes_touch before update on public.lt_recipes
  for each row execute function public.lt_touch_updated_at();

alter table public.lt_recipes enable row level security;
alter table public.lt_recipe_photos enable row level security;
