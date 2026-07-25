"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Gem, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const PRESETS = [50, 100, 200, 500, 1000, 2000];

const ERROR_LABELS: Record<string, string> = {
  insufficient_gems:    "Not enough gems in your wallet.",
  invalid_amount:       "Enter a valid amount (1–100,000 gems).",
  cannot_tip_self:      "You can't tip yourself.",
  duplicate_tip:        "This tip was already sent — please wait a moment.",
  no_wallet:            "Your wallet isn't set up yet.",
  recipient_no_wallet:  "This user can't receive tips right now.",
  unauthenticated:      "Please sign in to send tips.",
};

type Step = "select" | "loading" | "success" | "error";

export interface TipRecipient {
  id: string;
  display_name: string;
  username: string;
  avatar_url: string | null;
}

interface TipModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipient: TipRecipient;
}

export function TipModal({ open, onOpenChange, recipient }: TipModalProps) {
  const supabase = useMemo(() => createClient(), []);

  const [step, setStep] = useState<Step>("select");
  const [preset, setPreset] = useState<number | null>(null);
  const [custom, setCustom] = useState("");
  const [gemBalance, setGemBalance] = useState<number | null>(null);
  const [newBalance, setNewBalance] = useState<number | null>(null);
  const [errorKey, setErrorKey] = useState("");

  const amount = preset ?? (parseInt(custom, 10) || 0);
  const isValidAmount = amount >= 1 && amount <= 100_000;
  const hasEnoughGems = gemBalance === null || amount <= gemBalance;
  const canSend = isValidAmount && hasEnoughGems && gemBalance !== null;

  // Reset and load balance whenever dialog opens
  useEffect(() => {
    if (!open) return;
    setStep("select");
    setPreset(null);
    setCustom("");
    setErrorKey("");
    setNewBalance(null);
    setGemBalance(null);

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("wallets")
        .select("gem_balance")
        .eq("user_id", user.id)
        .single()
        .then(({ data }) => setGemBalance(data?.gem_balance ?? 0));
    });
  }, [open, supabase]);

  const handleConfirm = useCallback(async () => {
    if (!canSend) return;
    setStep("loading");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).rpc("send_tip", {
      p_recipient_id: recipient.id,
      p_gem_amount:   amount,
    }) as { data: { ok: boolean; error?: string; new_balance?: number } | null; error: unknown };

    if (error || !data?.ok) {
      setErrorKey(data?.error ?? "unknown");
      setStep("error");
      return;
    }

    setNewBalance(data.new_balance ?? null);
    setStep("success");
  }, [supabase, recipient.id, amount, canSend]);

  const selectPreset = (n: number) => {
    setPreset(n);
    setCustom("");
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustom(e.target.value.replace(/\D/g, ""));
    setPreset(null);
  };

  const initials = recipient.display_name[0]?.toUpperCase() ?? "?";

  return (
    <Dialog
      open={open}
      onOpenChange={step === "loading" ? undefined : onOpenChange}
    >
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle>Send Tip</DialogTitle>
        </DialogHeader>

        {/* Recipient + balance row */}
        <div className="flex items-center gap-3 rounded-xl bg-muted/50 px-4 py-3">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage src={recipient.avatar_url ?? undefined} />
            <AvatarFallback className="bg-[var(--brand-red)] text-white font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-semibold leading-none">
              {recipient.display_name}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              @{recipient.username}
            </p>
          </div>
          <div className="ml-auto shrink-0 text-right">
            <p className="text-xs text-muted-foreground">Your balance</p>
            {gemBalance === null ? (
              <Loader2 className="ml-auto h-3.5 w-3.5 animate-spin text-muted-foreground" />
            ) : (
              <p className="flex items-center justify-end gap-1 text-sm font-semibold">
                <Gem className="h-3.5 w-3.5 text-[var(--brand-red)]" />
                {gemBalance.toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {/* ── Select / Error step ─────────────────────────── */}
        {(step === "select" || step === "error") && (
          <>
            {/* Preset amounts */}
            <div className="grid grid-cols-3 gap-2">
              {PRESETS.map((n) => (
                <button
                  key={n}
                  onClick={() => selectPreset(n)}
                  className={cn(
                    "flex items-center justify-center gap-1.5 rounded-xl border py-3 text-sm font-semibold transition-colors",
                    preset === n
                      ? "border-[var(--brand-red)] bg-[var(--brand-red)]/10 text-[var(--brand-red)]"
                      : "border-border bg-muted/40 hover:border-[var(--brand-red)]/40"
                  )}
                >
                  <Gem className="h-3.5 w-3.5" />
                  {n.toLocaleString()}
                </button>
              ))}
            </div>

            {/* Custom amount */}
            <div className="relative">
              <Gem className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Custom amount"
                value={custom}
                onChange={handleCustomChange}
                inputMode="numeric"
                maxLength={6}
              />
            </div>

            {/* Inline warnings */}
            {isValidAmount && !hasEnoughGems && gemBalance !== null && (
              <p className="flex items-center gap-1.5 text-xs text-destructive">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                Insufficient gems — balance is{" "}
                {gemBalance.toLocaleString()} gems.
              </p>
            )}
            {step === "error" && (
              <p className="flex items-center gap-1.5 text-xs text-destructive">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {ERROR_LABELS[errorKey] ??
                  "Something went wrong. Please try again."}
              </p>
            )}

            <Button
              className="w-full bg-[var(--brand-red)] text-white hover:bg-[var(--brand-red-dark)]"
              disabled={!canSend}
              onClick={handleConfirm}
            >
              {amount > 0
                ? `Send ${amount.toLocaleString()} Gems`
                : "Send Gems"}
            </Button>
          </>
        )}

        {/* ── Loading step ────────────────────────────────── */}
        {step === "loading" && (
          <div className="flex flex-col items-center gap-3 py-6">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--brand-red)]" />
            <p className="text-sm text-muted-foreground">Sending tip…</p>
          </div>
        )}

        {/* ── Success step ────────────────────────────────── */}
        {step === "success" && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            <div>
              <p className="font-semibold">Tip sent!</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {amount.toLocaleString()} gems sent to{" "}
                {recipient.display_name}.
              </p>
              {newBalance !== null && (
                <p className="mt-1 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                  New balance:&nbsp;
                  <Gem className="h-3 w-3 text-[var(--brand-red)]" />
                  {newBalance.toLocaleString()} gems
                </p>
              )}
            </div>
            <Button
              variant="outline"
              className="mt-2"
              onClick={() => onOpenChange(false)}
            >
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
