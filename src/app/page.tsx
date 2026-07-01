import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import {
  ShieldCheck,
  Eye,
  Gift,
  Users,
  MessageSquare,
  Gem,
  Lock,
  Star,
  CheckCircle2,
  ArrowRight,
  Zap,
} from "lucide-react";

const STATS = [
  { value: "50K+", label: "Active Members" },
  { value: "5K+", label: "Entertainers" },
  { value: "$2M+", label: "Paid Out" },
  { value: "4.9★", label: "Avg Rating" },
];

const FEATURES = [
  {
    icon: MessageSquare,
    title: "Private Messaging",
    description:
      "Chat directly — no phone numbers, no social handles. Complete discretion built in.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payments",
    description:
      "Crypto-powered via Coinbase. No chargebacks, no fraud, no middlemen holding your money.",
  },
  {
    icon: Eye,
    title: "Your Data, Your Rules",
    description:
      "Nothing shared without explicit consent. Military-grade privacy, zero data selling.",
  },
  {
    icon: Gem,
    title: "Gem Economy",
    description:
      "A universal in-app currency that makes tipping, subscriptions and booking seamless.",
  },
  {
    icon: Gift,
    title: "Earn by Referring",
    description:
      "Invite fellow entertainers and earn 15% of their platform earnings — forever.",
  },
  {
    icon: Lock,
    title: "Invite-Only Access",
    description:
      "Curated, verified members only. Quality over quantity — always.",
  },
];

const ENTERTAINER_PERKS = [
  "Set your own rates and availability",
  "Receive tips, bookings & subscriptions",
  "Earn 15% referral commission",
  "Media vault — share content your way",
  "Analytics dashboard to grow your brand",
  "24/7 dedicated entertainer support",
];

const PATRON_PERKS = [
  "Browse verified entertainer profiles",
  "Direct private messaging, no middlemen",
  "Send gems, tips & custom requests",
  "Complete discretion guaranteed",
  "Loyalty rewards and VIP status",
  "Secure checkout powered by Coinbase",
];

const STEPS = [
  {
    step: "01",
    title: "Request your invite",
    description:
      "Sign up and verify your identity. PRVY is curated — we keep the community safe and exclusive.",
  },
  {
    step: "02",
    title: "Build your profile",
    description:
      "Set your rates, upload your media, write your bio. Your profile is your brand.",
  },
  {
    step: "03",
    title: "Connect & earn",
    description:
      "Start accepting bookings, receiving tips, and growing a loyal patron base — all privately.",
  },
];

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
        <nav className="hidden items-center gap-8 text-sm text-white/60 md:flex">
          <a href="#features" className="transition hover:text-white">
            Features
          </a>
          <a href="#how-it-works" className="transition hover:text-white">
            How it works
          </a>
          <a href="#for-you" className="transition hover:text-white">
            For You
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden sm:block">
            <Button
              variant="ghost"
              className="text-white/80 hover:bg-white/10 hover:text-white"
            >
              Log in
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-[var(--brand-red)] text-white shadow-lg shadow-[var(--brand-red)]/30 hover:bg-[var(--brand-red-dark)]">
              Join PRVY
            </Button>
          </Link>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-6 pb-28 pt-40 text-center md:px-12 md:pt-52" style={{ marginTop: "-96px" }}>
        {/* Hero background image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/Cover 4.jpg"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
          style={{ zIndex: 0 }}
        />
        {/* Dark overlay */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            zIndex: 1,
            background:
              "linear-gradient(to bottom, oklch(0.10 0.01 25 / 55%) 0%, oklch(0.10 0.01 25 / 45%) 60%, oklch(0.10 0.01 25 / 75%) 100%)",
          }}
        />
        {/* Red radial glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            zIndex: 2,
            background:
              "radial-gradient(ellipse 80% 50% at 50% -10%, oklch(0.5 0.22 25 / 45%) 0%, transparent 70%)",
          }}
        />
        {/* Side glows */}
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
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.25em] text-white">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
            Private. Discreet. Connected.
          </div>

          <h1 className="mx-auto max-w-4xl text-5xl font-bold leading-[1.1] tracking-tight uppercase md:text-7xl">
            Private Spaces.{" "}
            <span
              className="inline-block"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.7 0.22 25) 0%, oklch(0.5 0.22 25) 60%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Exceptional Comfort.
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-base leading-relaxed text-white md:text-xl">
            The exclusive platform connecting entertainers and patrons — with
            private messaging, crypto payments, and zero data sharing.
          </p>

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

          {/* Trust line */}
          <p className="mt-6 flex items-center justify-center gap-2 text-xs text-white/30">
            <Lock className="h-3 w-3" /> No credit card required &nbsp;·&nbsp; Invite-only verification &nbsp;·&nbsp; Cancel anytime
          </p>
        </div>

      </section>

      {/* ── Stats strip ──────────────────────────────────────────────────── */}
      <section
        className="relative mx-6 my-16 overflow-hidden rounded-2xl md:mx-12"
        style={{
          background: "oklch(1 0 0 / 3%)",
          border: "1px solid oklch(1 0 0 / 8%)",
        }}
      >
        <div className="grid grid-cols-2 divide-x divide-y divide-white/8 sm:grid-cols-4 sm:divide-y-0">
          {STATS.map((s) => (
            <div key={s.label} className="px-8 py-7 text-center">
              <div
                className="text-3xl font-bold tracking-tight"
                style={{
                  background:
                    "linear-gradient(135deg, #fff 0%, oklch(0.7 0.22 25) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {s.value}
              </div>
              <div className="mt-1 text-xs text-white/40">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section id="features" className="px-6 py-24 md:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-3 text-center text-xs font-medium uppercase tracking-[0.25em] text-[var(--brand-red)]">
            Why PRVY
          </div>
          <h2 className="mb-4 text-center text-3xl font-bold md:text-4xl">
            Built for privacy from day one
          </h2>
          <p className="mx-auto mb-14 max-w-xl text-center text-sm text-white/50">
            Every feature is designed with discretion at its core — for both entertainers and patrons.
          </p>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-0.5"
                style={{
                  border: "1px solid oklch(1 0 0 / 8%)",
                  background: "oklch(1 0 0 / 4%)",
                }}
              >
                {/* Hover glow */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background:
                      "radial-gradient(circle at top left, oklch(0.5 0.22 25 / 12%) 0%, transparent 60%)",
                  }}
                />
                <div
                  className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ background: "oklch(0.5 0.22 25 / 15%)" }}
                >
                  <feature.icon className="h-5 w-5 text-[var(--brand-red)]" />
                </div>
                <h3 className="mb-2 text-base font-semibold">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-white/50">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section id="how-it-works" className="px-6 py-24 md:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-3 text-center text-xs font-medium uppercase tracking-[0.25em] text-[var(--brand-red)]">
            Getting started
          </div>
          <h2 className="mb-14 text-center text-3xl font-bold md:text-4xl">
            Up and running in minutes
          </h2>

          <div className="grid gap-8 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.step} className="relative flex flex-col items-start">
                {/* Connector line */}
                {i < STEPS.length - 1 && (
                  <div
                    aria-hidden
                    className="absolute left-[3.5rem] top-6 hidden h-px w-[calc(100%+2rem)] md:block"
                    style={{ background: "oklch(1 0 0 / 8%)" }}
                  />
                )}
                <div
                  className="mb-5 flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                  style={{
                    background: "oklch(0.5 0.22 25 / 15%)",
                    border: "1px solid oklch(0.5 0.22 25 / 30%)",
                    color: "oklch(0.7 0.22 25)",
                  }}
                >
                  {s.step}
                </div>
                <h3 className="mb-2 text-lg font-semibold">{s.title}</h3>
                <p className="text-sm leading-relaxed text-white/50">
                  {s.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── For Entertainers / For Patrons ───────────────────────────────── */}
      <section id="for-you" className="px-6 py-24 md:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-3 text-center text-xs font-medium uppercase tracking-[0.25em] text-[var(--brand-red)]">
            Built for everyone
          </div>
          <h2 className="mb-14 text-center text-3xl font-bold md:text-4xl">
            Your platform, your way
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Entertainers */}
            <div
              className="relative overflow-hidden rounded-3xl p-8"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.28 0.15 25) 0%, oklch(0.18 0.05 25) 100%)",
                border: "1px solid oklch(0.5 0.22 25 / 25%)",
              }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute right-0 top-0 h-64 w-64 translate-x-1/3 -translate-y-1/3 rounded-full"
                style={{
                  background: "oklch(0.5 0.22 25 / 20%)",
                  filter: "blur(50px)",
                }}
              />
              <div className="relative z-10">
                <div className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-[var(--brand-red)]">
                  <Zap className="h-3.5 w-3.5" />
                  For Entertainers
                </div>
                <h3 className="mb-2 mt-3 text-2xl font-bold">
                  Own your audience.
                  <br />
                  Keep your privacy.
                </h3>
                <p className="mb-7 text-sm text-white/60">
                  Set your rates, grow your brand, and earn on your own schedule
                  — without ever giving out personal contact info.
                </p>
                <ul className="mb-8 space-y-3">
                  {ENTERTAINER_PERKS.map((perk) => (
                    <li key={perk} className="flex items-center gap-2.5 text-sm text-white/75">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--brand-red)]" />
                      {perk}
                    </li>
                  ))}
                </ul>
                <Link href="/signup">
                  <Button className="gap-2 bg-[var(--brand-red)] text-white hover:bg-[var(--brand-red-dark)]">
                    Apply as Entertainer
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Patrons */}
            <div
              className="relative overflow-hidden rounded-3xl p-8"
              style={{
                background: "oklch(1 0 0 / 4%)",
                border: "1px solid oklch(1 0 0 / 10%)",
              }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute right-0 top-0 h-64 w-64 translate-x-1/3 -translate-y-1/3 rounded-full"
                style={{
                  background: "oklch(0.5 0.22 25 / 8%)",
                  filter: "blur(50px)",
                }}
              />
              <div className="relative z-10">
                <div className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-white/50">
                  <Star className="h-3.5 w-3.5" />
                  For Patrons
                </div>
                <h3 className="mb-2 mt-3 text-2xl font-bold">
                  Exclusive access.
                  <br />
                  Complete discretion.
                </h3>
                <p className="mb-7 text-sm text-white/60">
                  Connect with verified entertainers, send tips, book private
                  sessions — with a guarantee that your activity stays private.
                </p>
                <ul className="mb-8 space-y-3">
                  {PATRON_PERKS.map((perk) => (
                    <li key={perk} className="flex items-center gap-2.5 text-sm text-white/75">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-white/40" />
                      {perk}
                    </li>
                  ))}
                </ul>
                <Link href="/signup">
                  <Button
                    variant="outline"
                    className="gap-2 border-white/15 bg-white/5 text-white hover:bg-white/10"
                  >
                    Join as Patron
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <section className="px-6 py-24 md:px-12">
        <div className="mx-auto max-w-3xl">
          <div
            className="relative overflow-hidden rounded-3xl px-8 py-16 text-center"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.28 0.15 25 / 80%) 0%, oklch(0.16 0.01 25) 100%)",
              border: "1px solid oklch(0.5 0.22 25 / 25%)",
            }}
          >
            {/* Background glow */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 70% 60% at 50% 0%, oklch(0.5 0.22 25 / 30%) 0%, transparent 70%)",
              }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage: "url('/curtain-pattern.svg')",
                backgroundSize: "200px 200px",
              }}
            />

            <div className="relative z-10">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--brand-red)]/30 bg-[var(--brand-red)]/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-[var(--brand-red)]">
                <Users className="h-3 w-3" />
                Join the community
              </div>
              <h2 className="mt-4 text-3xl font-bold md:text-4xl">
                Ready to join PRVY?
              </h2>
              <p className="mx-auto mt-4 max-w-md text-sm text-white/55">
                Apply for your invite today and become part of the most discreet,
                private entertainment platform in the world.
              </p>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="gap-2 bg-[var(--brand-red)] px-10 text-white shadow-xl shadow-[var(--brand-red)]/25 hover:bg-[var(--brand-red-dark)]"
                  >
                    Create Account
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    size="lg"
                    variant="ghost"
                    className="text-white/60 hover:bg-white/5 hover:text-white"
                  >
                    Already a member? Log in
                  </Button>
                </Link>
              </div>
            </div>
          </div>
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
            <a href="#features" className="hover:text-white/60 transition">Features</a>
            <a href="#how-it-works" className="hover:text-white/60 transition">How it works</a>
            <Link href="/login" className="hover:text-white/60 transition">Log in</Link>
            <Link href="/signup" className="hover:text-white/60 transition">Sign up</Link>
          </nav>
          <p className="text-xs text-white/20">
            © {new Date().getFullYear()} PRVY. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
