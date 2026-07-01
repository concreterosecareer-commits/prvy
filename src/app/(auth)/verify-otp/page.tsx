"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Loader2, Mail } from "lucide-react";

function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const supabase = createClient();
  const [resending, setResending] = useState(false);

  async function handleResend() {
    setResending(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setResending(false);

    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Verification link resent — check your inbox");
  }

  return (
    <div className="text-center">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--brand-red)]/10">
        <Mail className="h-8 w-8 text-[var(--brand-red)]" />
      </div>

      <h1 className="text-2xl font-bold">Check your email</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        We sent a verification link to{" "}
        <span className="font-semibold text-foreground">{email}</span>.
        Click the link in that email to activate your account.
      </p>

      <p className="mt-2 text-xs text-muted-foreground">
        The link will expire in 24 hours. Check your spam folder if you
        don&apos;t see it.
      </p>

      <Button
        onClick={handleResend}
        disabled={resending}
        variant="outline"
        className="mt-8 w-full"
      >
        {resending && <Loader2 className="h-4 w-4 animate-spin" />}
        Resend verification link
      </Button>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        <Link href="/login" className="hover:underline">
          Back to login
        </Link>
      </p>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense>
      <VerifyEmailForm />
    </Suspense>
  );
}
