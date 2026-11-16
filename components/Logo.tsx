export function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  const big = size === "lg";
  return (
    <span className="inline-flex flex-col items-center leading-none">
      <span className={`font-display italic text-berry-deep ${big ? "text-5xl sm:text-6xl" : "text-[22px] sm:text-2xl"}`}>
        The Long Table
      </span>
      {/* a little table with place settings under the wordmark */}
      <svg
        aria-hidden
        viewBox="0 0 200 18"
        className={big ? "mt-2 w-60 sm:w-72" : "mt-0.5 w-full max-w-[150px]"}
        preserveAspectRatio="none"
      >
        {[18, 50, 82, 118, 150, 182].map((x) => (
          <circle key={x} cx={x} cy="5" r="4" fill="#f2c9a6" />
        ))}
        <rect x="2" y="10" width="196" height="5" rx="2.5" fill="#a26a3f" />
      </svg>
    </span>
  );
}
