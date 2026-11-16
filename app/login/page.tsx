import { Leaves } from "@/components/Leaves";
import { Logo } from "@/components/Logo";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-dvh items-center justify-center px-4 py-10">
      <Leaves />
      <div className="card pop-in relative w-full max-w-md px-6 py-10 text-center sm:px-10">
        <Logo size="lg" />
        <p className="mx-auto mt-5 max-w-xs text-[15px] leading-relaxed text-ink-soft">
          Every year the table gets a little longer.
          <br />
          <span className="font-bold text-ink">Come on in, there&apos;s room for one more.</span>
        </p>
        <LoginForm />
      </div>
    </main>
  );
}
