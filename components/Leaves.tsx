// Leaves, plus a few loose feathers from Rope's turkey.
const LEAVES = ["🍂", "🪶", "🍁", "🍂", "🌾", "🪶", "🍁", "🍂", "🍁", "🪶"];

/** Gently falling leaves and feathers behind the login and "who's this?" cards. */
export function Leaves() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      {LEAVES.map((leaf, i) => (
        <span
          key={i}
          className="leaf text-2xl opacity-80"
          style={{
            left: `${(i * 37) % 100}%`,
            animationDuration: `${11 + ((i * 7) % 9)}s`,
            animationDelay: `${-((i * 13) % 17)}s`,
            fontSize: `${18 + ((i * 5) % 14)}px`,
          }}
        >
          {leaf}
        </span>
      ))}
    </div>
  );
}
