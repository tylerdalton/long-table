export type Member = {
  id: string;
  name: string;
  emoji: string;
};

export type Gathering = {
  id: string;
  title: string;
  kind: string;
  date: string | null;
  time_note: string | null;
  host: string | null;
  place: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
};

export type RsvpStatus = "yes" | "maybe" | "no";

export type Rsvp = {
  id: string;
  gathering_id: string;
  party: string;
  status: RsvpStatus;
  adults: number;
  kids: number;
  note: string | null;
  member_id: string | null;
  updated_at: string;
};

/**
 * A dish on the menu. Normally one person (`bringer`) handles the whole thing.
 * When `split`, the jobs are separate: `bringer` cooks it and `buyer` buys it.
 */
export type Dish = {
  id: string;
  gathering_id: string;
  course: string;
  name: string;
  split: boolean;
  bringer: string | null;
  bringer_member_id: string | null;
  buyer: string | null;
  buyer_member_id: string | null;
  note: string | null;
  sort_order: number;
  recipe_id: string | null;
};

export type RecipePhoto = {
  id?: string;
  kind: "card" | "dish";
  path: string;
  thumb_path: string;
};

export type RecipeSummary = {
  id: string;
  title: string;
  from_whom: string | null;
  course: string | null;
  tags: string[];
  thumb: string | null;
  times_made: number;
  updated_at: string;
  search: string; // lowercased title + from + ingredients, for the search box
};

export type Recipe = {
  id: string;
  title: string;
  from_whom: string | null;
  course: string | null;
  servings: string | null;
  time_note: string | null;
  story: string | null;
  ingredients: string | null;
  steps: string | null;
  tags: string[];
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  photos: (RecipePhoto & { id: string; url: string; thumb: string })[];
};

/** A time this recipe was on the menu. */
export type RecipeHistory = {
  dish_id: string;
  gathering_id: string;
  gathering_title: string;
  date: string | null;
  made_by: string | null;
};

export const RECIPE_TAGS: { id: string; label: string; emoji: string }[] = [
  { id: "favorite", label: "Family favorite", emoji: "⭐" },
  { id: "secret", label: "Family secret", emoji: "🤫" },
];

/** Recipe text is one item per line; drop blanks and any numbering or bullets people typed. */
export const lines = (text: string | null) =>
  (text ?? "")
    .split("\n")
    .map((l) => l.replace(/^\s*(\d+[.)]|[-*•])\s+/, "").trim())
    .filter(Boolean);

/** "bring" = the whole dish; "cook" and "buy" are the two halves of a split dish. */
export type DishRole = "bring" | "cook" | "buy";

/** Every job on the dish has someone. */
export const isCovered = (d: Dish) => (d.split ? Boolean(d.bringer && d.buyer) : Boolean(d.bringer));

export type PhotoKind = "photo" | "art";

export type Photo = {
  id: string;
  gathering_id: string;
  kind: PhotoKind;
  artist: string | null;
  caption: string | null;
  path: string;
  thumb_path: string;
  member_id: string | null;
  created_at: string;
  url: string;
  thumb: string;
};

export type Headcount = {
  adults: number;
  kids: number;
  total: number;
  maybe: number;
  parties: number;
};

export const KINDS: { id: string; label: string; emoji: string }[] = [
  { id: "thanksgiving", label: "Thanksgiving", emoji: "🦃" },
  { id: "christmas", label: "Christmas", emoji: "🎄" },
  { id: "easter", label: "Easter", emoji: "🐣" },
  { id: "reunion", label: "Reunion", emoji: "👪" },
  { id: "other", label: "Something else", emoji: "🍽️" },
];

export const kindOf = (id: string) => KINDS.find((k) => k.id === id) ?? KINDS[KINDS.length - 1];

export const COURSES: { id: string; emoji: string }[] = [
  { id: "Appetizers", emoji: "🧀" },
  { id: "Main", emoji: "🦃" },
  { id: "Sides", emoji: "🥔" },
  { id: "Bread & rolls", emoji: "🥖" },
  { id: "Salads", emoji: "🥗" },
  { id: "Desserts", emoji: "🥧" },
  { id: "Drinks", emoji: "🍷" },
  { id: "Other", emoji: "🧺" },
];

export const courseEmoji = (c: string) => COURSES.find((x) => x.id === c)?.emoji ?? "🍽️";

/** The menu a new Thanksgiving starts with. Hosts can delete or add to it. */
export const CLASSIC_THANKSGIVING: { course: string; name: string }[] = [
  { course: "Appetizers", name: "Veggie & cheese tray" },
  { course: "Main", name: "Turkey" },
  { course: "Sides", name: "Stuffing" },
  { course: "Sides", name: "Mashed potatoes" },
  { course: "Sides", name: "Gravy" },
  { course: "Sides", name: "Sweet potatoes" },
  { course: "Sides", name: "Green bean casserole" },
  { course: "Sides", name: "Cranberry sauce" },
  { course: "Bread & rolls", name: "Rolls & butter" },
  { course: "Salads", name: "Green salad" },
  { course: "Desserts", name: "Pumpkin pie" },
  { course: "Desserts", name: "Apple pie" },
  { course: "Desserts", name: "Pecan pie" },
  { course: "Drinks", name: "Cider & drinks" },
  { course: "Other", name: "Ice, plates & napkins" },
];

export const EMOJIS = ["🦃", "🥧", "🍂", "🍁", "🌽", "🎃", "🍠", "🥖", "🍎", "🧀", "🍷", "☕", "🫖", "🌻", "🦉", "🎨"];
