export function timeAgo(iso: string, now = Date.now()): string {
  const s = Math.max(0, (now - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  const m = s / 60;
  if (m < 60) return `${Math.floor(m)}m ago`;
  const h = m / 60;
  if (h < 24) return `${Math.floor(h)}h ago`;
  const d = h / 24;
  if (d < 7) return `${Math.floor(d)}d ago`;
  if (d < 60) return `${Math.floor(d / 7)}w ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function daysUntil(date: string | null): number | null {
  if (!date) return null;
  const target = new Date(`${date}T12:00:00`);
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

export function countdown(date: string | null): string | null {
  const days = daysUntil(date);
  if (days === null) return null;
  if (days === 0) return "It's today! 🍽️";
  if (days === 1) return "Tomorrow!";
  if (days > 0) return `${days} days to go`;
  if (days === -1) return "Yesterday";
  return `${-days} days ago`;
}

export function prettyDate(date: string | null): string | null {
  if (!date) return null;
  return new Date(`${date}T12:00:00`).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function yearOf(date: string | null): string | null {
  return date ? date.slice(0, 4) : null;
}

/** Fourth Thursday of November for the given year, as YYYY-MM-DD. */
export function thanksgivingDate(year: number): string {
  const nov1 = new Date(year, 10, 1).getDay(); // 0 = Sunday
  const firstThursday = 1 + ((4 - nov1 + 7) % 7);
  return `${year}-11-${String(firstThursday + 21).padStart(2, "0")}`;
}

/** The Thanksgiving that's coming up (or today), as YYYY-MM-DD. */
export function nextThanksgiving(now = new Date()): string {
  const y = now.getFullYear();
  const thisYear = thanksgivingDate(y);
  return (daysUntil(thisYear) ?? 0) >= 0 ? thisYear : thanksgivingDate(y + 1);
}

export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
