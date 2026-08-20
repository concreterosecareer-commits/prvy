"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CalendarDays,
  Clock,
  MapPin,
  CheckCircle2,
  CreditCard,
  Hash,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { MOCK_BOOKINGS, type MockBooking } from "@/lib/mock-data";
import { formatUsd } from "@/lib/format";

// ── Helpers (duplicated from upcoming-bookings to keep pages self-contained) ──

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDateLong(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatDateMed(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatBookingType(type: string): string {
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

type BadgeInfo = { label: string; classes: string; Icon: React.ElementType };

function getPaymentBadge(paymentStatus: string, bookingStatus: string): BadgeInfo {
  if (paymentStatus === "paid" && bookingStatus === "confirmed") {
    return { label: "Prepaid", classes: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30", Icon: CheckCircle2 };
  }
  if (paymentStatus === "pending") {
    return { label: "Payment Pending", classes: "bg-amber-500/15 text-amber-400 border border-amber-500/30", Icon: Clock };
  }
  if (paymentStatus === "failed") {
    return { label: "Payment Failed", classes: "bg-red-500/15 text-red-400 border border-red-500/30", Icon: XCircle };
  }
  return { label: "Refunded", classes: "bg-white/5 text-white/40 border border-white/10", Icon: AlertCircle };
}

// ── Modal ─────────────────────────────────────────────────────────────────────

function BookingModal({ booking, onClose }: { booking: MockBooking | null; onClose: () => void }) {
  if (!booking) return null;
  const badge = getPaymentBadge(booking.payment_status, booking.booking_status);

  return (
    <Dialog open={!!booking} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-[var(--brand-red)]" />
            Booking Details
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
          <Avatar className="h-10 w-10">
            {booking.patron_avatar && (
              <AvatarImage src={booking.patron_avatar} alt={booking.patron_name} className="object-cover object-top" />
            )}
            <AvatarFallback className="bg-[var(--brand-red)]/20 text-[var(--brand-red)]">
              {booking.patron_name[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold">{booking.patron_name}</p>
            <p className="text-xs text-muted-foreground">Patron</p>
          </div>
          <span className={`ml-auto flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${badge.classes}`}>
            <badge.Icon className="h-3 w-3" />
            {badge.label}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {(
            [
              { icon: CalendarDays, label: "Date",         value: formatDateLong(booking.scheduled_at) },
              { icon: Clock,        label: "Time",         value: formatTime(booking.scheduled_at) },
              { icon: Clock,        label: "Duration",     value: `${booking.duration_minutes} min` },
              { icon: MapPin,       label: "Location",     value: booking.club_name ?? "TBD" },
              { icon: CheckCircle2, label: "Booking Type", value: formatBookingType(booking.booking_type) },
              { icon: CreditCard,   label: "Amount Paid",  value: formatUsd(booking.amount_usd) },
            ] as { icon: React.ElementType; label: string; value: string }[]
          ).map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Icon className="h-3 w-3" />
                {label}
              </div>
              <p className="mt-1 text-sm font-medium">{value}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
          <Hash className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Booking Reference</span>
          <span className="ml-auto font-mono text-sm font-semibold tracking-widest">{booking.reference}</span>
        </div>

        {booking.notes && (
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
            <p className="text-xs text-muted-foreground">Notes</p>
            <p className="mt-1 text-sm">{booking.notes}</p>
          </div>
        )}

        <p className="text-center text-[11px] text-muted-foreground">
          Payment information is managed securely and cannot be modified.
        </p>
      </DialogContent>
    </Dialog>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

type Tab = "upcoming" | "past";

export default function BookingsPage() {
  const [tab, setTab] = useState<Tab>("upcoming");
  const [selected, setSelected] = useState<MockBooking | null>(null);

  const now = new Date();
  const upcoming = MOCK_BOOKINGS.filter(
    (b) =>
      new Date(b.scheduled_at) > now &&
      b.booking_status !== "cancelled" &&
      b.booking_status !== "completed",
  ).sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());

  const past = MOCK_BOOKINGS.filter(
    (b) =>
      new Date(b.scheduled_at) <= now ||
      b.booking_status === "completed" ||
      b.booking_status === "cancelled",
  ).sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime());

  const list = tab === "upcoming" ? upcoming : past;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Bookings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your upcoming and past prepaid appointments.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-white/[0.06] bg-white/[0.03] p-1 w-fit">
        {(["upcoming", "past"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
              tab === t
                ? "bg-[var(--brand-red)] text-white"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
            {t === "upcoming" && upcoming.length > 0 && (
              <span className="ml-2 rounded-full bg-white/20 px-1.5 py-0.5 text-[11px] font-bold">
                {upcoming.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {list.length === 0 ? (
        <Card className="rounded-2xl border-none p-10 shadow-sm">
          <div className="flex flex-col items-center gap-2 text-center">
            <CalendarDays className="h-10 w-10 text-muted-foreground/25" />
            <p className="text-sm font-medium">
              {tab === "upcoming" ? "No upcoming bookings" : "No past bookings"}
            </p>
            <p className="text-xs text-muted-foreground">
              {tab === "upcoming"
                ? "You don't have any prepaid appointments scheduled yet."
                : "Completed appointments will appear here."}
            </p>
          </div>
        </Card>
      ) : (
        <Card className="rounded-2xl border-none p-5 shadow-sm">
          <div className="divide-y divide-white/[0.04]">
            {list.map((booking) => {
              const d = new Date(booking.scheduled_at);
              const dayLabel = d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
              const dateNum = d.getDate();
              const badge = getPaymentBadge(booking.payment_status, booking.booking_status);

              return (
                <div key={booking.id} className="flex items-center gap-3 py-4 first:pt-0 last:pb-0 sm:gap-4">
                  {/* Date block */}
                  <div
                    className="flex shrink-0 flex-col items-center justify-center rounded-xl px-3 py-3 text-center opacity-90"
                    style={{ background: "var(--brand-red)", minWidth: 60 }}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">{dayLabel}</span>
                    <span className="text-2xl font-black leading-tight text-white">{dateNum}</span>
                    <span className="text-[10px] font-medium text-white/70">{formatTime(booking.scheduled_at)}</span>
                  </div>

                  {/* Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6 shrink-0">
                        {booking.patron_avatar && (
                          <AvatarImage src={booking.patron_avatar} alt={booking.patron_name} className="object-cover object-top" />
                        )}
                        <AvatarFallback className="text-[10px] bg-[var(--brand-red)]/20 text-[var(--brand-red)]">
                          {booking.patron_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate text-sm font-semibold">{booking.patron_name}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatBookingType(booking.booking_type)} · {booking.duration_minutes} min
                    </p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />{booking.club_name}
                      </span>
                      <span>{formatDateMed(booking.scheduled_at)}</span>
                      <span className="font-medium text-foreground">{formatUsd(booking.amount_usd)}</span>
                    </div>
                  </div>

                  {/* Badge + action */}
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold leading-5 ${badge.classes}`}>
                      <badge.Icon className="h-3 w-3" />
                      {badge.label}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => setSelected(booking)}
                    >
                      View
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <BookingModal booking={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
