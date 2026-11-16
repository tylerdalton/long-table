"use client";

const BITS = ["🍂", "🥧", "🍁", "✨", "🦃", "🌽", "🍎", "🎉"];

/** A one-shot celebratory burst. Re-mount with a new `key` to fire again. */
export function Confetti() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[60] overflow-hidden motion-reduce:hidden">
      {Array.from({ length: 26 }, (_, i) => {
        const angle = (i / 26) * Math.PI * 2;
        const dist = 140 + ((i * 37) % 120);
        return (
          <span
            key={i}
            className="confetti-bit text-2xl"
            style={
              {
                "--dx": `${Math.cos(angle) * dist}px`,
                "--dy": `${Math.sin(angle) * dist + 120}px`,
                "--r": `${(i % 2 ? 1 : -1) * (180 + i * 20)}deg`,
                animationDelay: `${(i % 5) * 0.02}s`,
              } as React.CSSProperties
            }
          >
            {BITS[i % BITS.length]}
          </span>
        );
      })}
    </div>
  );
}
