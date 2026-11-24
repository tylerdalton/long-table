import { Leaves } from "@/components/Leaves";
import { Logo } from "@/components/Logo";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-dvh items-center justify-center px-4 pt-8 pb-28">
      <Leaves />
      {/* Rope's painted board as the ground everything stands on */}
      <div aria-hidden className="painted-board fixed inset-x-0 bottom-0 h-20 shadow-[0_-6px_20px_-8px_rgba(0,0,0,.35)] sm:h-24" />
      <div className="card pop-in relative w-full max-w-md overflow-hidden text-center">
        <figure className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/rope/turkey.jpg"
            alt="Rope's turkey: a pine-cone body, a purple neck, a blue head and a tail fan of bark, dried flowers and seed pods"
            className="h-56 w-full object-cover object-[50%_28%] sm:h-64"
          />
          <figcaption className="absolute right-3 bottom-3 rounded-full bg-ink/70 px-3 py-1 text-xs font-bold text-pod backdrop-blur-sm">
            Turkey by Rope
          </figcaption>
        </figure>
        <div className="px-6 pt-7 pb-9 sm:px-10">
          <Logo size="lg" />
          <p className="mx-auto mt-5 max-w-xs text-[15px] leading-relaxed text-ink-soft">
            Every year the table gets a little longer.
            <br />
            <span className="font-bold text-ink">Come on in, there&apos;s room for one more.</span>
          </p>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
