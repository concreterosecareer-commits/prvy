import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { Lock, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[var(--brand-black)] text-white">
      {/* ── Sticky nav ───────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 md:px-12"
        style={{
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          background: "transparent",
          borderBottom: "1px solid oklch(1 0 0 / 15%)",
        }}
      >
        <Logo height={85} className="h-[50px] md:h-[85px]" />
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" className="text-white/80 hover:bg-white/10 hover:text-white">
              Log in
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-[var(--brand-red)] text-white hover:bg-[var(--brand-red-dark)]">
              Join PRIVY
            </Button>
          </Link>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-6 pb-28 pt-40 text-center md:px-12 md:pt-52" style={{ marginTop: "-96px" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/Cover 3.jpg"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
          style={{ zIndex: 0 }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            zIndex: 1,
            background:
              "linear-gradient(to bottom, oklch(0.10 0.01 25 / 55%) 0%, oklch(0.10 0.01 25 / 45%) 60%, oklch(0.10 0.01 25 / 75%) 100%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            zIndex: 2,
            background:
              "radial-gradient(ellipse 80% 50% at 50% -10%, oklch(0.5 0.22 25 / 45%) 0%, transparent 70%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            zIndex: 2,
            background: "radial-gradient(circle, oklch(0.5 0.22 25 / 18%) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 top-1/2 h-96 w-96 translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            zIndex: 2,
            background: "radial-gradient(circle, oklch(0.5 0.22 25 / 18%) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />

        <div className="relative z-10">
          <h1 className="mx-auto max-w-4xl text-5xl font-bold leading-[1.1] tracking-tight uppercase md:text-7xl">
            What Diamonds{" "}
            <span
              className="inline-block"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.65 0.24 295) 0%, oklch(0.48 0.24 295) 60%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Are Made Of.
            </span>
          </h1>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/signup">
              <Button
                size="lg"
                className="gap-2 bg-[var(--brand-red)] px-8 text-white shadow-xl shadow-[var(--brand-red)]/25 hover:bg-[var(--brand-red-dark)]"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="border-white/15 bg-white/5 px-8 text-white backdrop-blur hover:bg-white/10"
              >
                Sign in
              </Button>
            </Link>
          </div>

          <p className="mt-6 flex items-center justify-center gap-2 text-xs text-white/30">
            <Lock className="h-3 w-3" /> No credit card required &nbsp;·&nbsp; Invite-only verification &nbsp;·&nbsp; Cancel anytime
          </p>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer
        className="px-6 py-10 md:px-12"
        style={{ borderTop: "1px solid oklch(1 0 0 / 8%)" }}
      >
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <Logo height={42} />
          <nav className="flex flex-wrap items-center justify-center gap-6 text-xs text-white/30">
            <Link href="/login" className="hover:text-white/60 transition">Log in</Link>
            <Link href="/signup" className="hover:text-white/60 transition">Sign up</Link>
          </nav>
          <p className="text-xs text-white/20">
            © {new Date().getFullYear()} PRIVY. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
