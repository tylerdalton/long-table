-- Split dishes: one person buys it, another cooks it (e.g. Melanie buys the
-- turkey, Rope cooks it). When `split` is false, `bringer` handles the whole
-- dish. When `split` is true, `bringer` is the cook and `buyer` buys it.
alter table public.lt_dishes
  add column split boolean not null default false,
  add column buyer text,
  add column buyer_member_id uuid references public.lt_members(id) on delete set null;
