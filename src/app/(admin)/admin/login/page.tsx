"use client";

import { useActionState } from "react";
import { Loader2, Lock, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { adminLogin } from "./actions";

export default function AdminLoginPage() {
  const [state, action, pending] = useActionState(adminLogin, null);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Solid black base */}
      <div className="absolute inset-0 bg-black" />
      {/* Pattern texture overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/admin pattern.png')",
          backgroundSize: "380px 380px",
          backgroundRepeat: "repeat",
          opacity: 0.08,
          mixBlendMode: "screen",
        }}
      />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-2xl backdrop-blur-xl">
          {/* Red header band */}
          <div
            className="flex flex-col items-center gap-2 px-8 py-8"
            style={{ background: "linear-gradient(135deg, var(--brand-red), var(--brand-red-dark))" }}
          >
            <Logo height={64} />
            <p className="mt-1 text-sm font-semibold uppercase tracking-widest text-white/70">
              Admin Portal
            </p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            <h1 className="mb-1 text-2xl font-bold tracking-tight">Welcome back</h1>
            <p className="mb-6 text-sm text-muted-foreground">Sign in to access the admin dashboard.</p>

            <form action={action} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    name="email"
                    placeholder="admin@prvy.com"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {state?.error && (
                <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {state.error}
                </p>
              )}

              <Button
                type="submit"
                disabled={pending}
                className="h-11 w-full bg-[var(--brand-red)] text-white hover:bg-[var(--brand-red-dark)]"
              >
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
              </Button>
            </form>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-[var(--brand-red)]/60">
          PRVY Admin · Restricted Access
        </p>
      </div>
    </div>
  );
}
