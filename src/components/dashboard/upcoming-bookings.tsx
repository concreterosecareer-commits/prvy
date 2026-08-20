"use client";

import { useState } from "react";
import Link from "next/link";
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
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Hash,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { MOCK_BOOKINGS, type MockBooking } from "@/lib/mock-data";
import { formatUsd } from "@/lib/format";

// ── Helpers ───────────────────────────────────────────────────────────────────

function getRelativeDate(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  const diff = Math.round((target.getTime() - today.getTime()) / 86_400_000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff < 7) return `In ${diff} days`;
  return d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
}

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

function formatBookingType(type: string): string {
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

type BadgeInfo = { label: string; classes: string; Icon: React.ElementType };

function getPaymentBadge(paymentStatus: string, bookingStatus: string): BadgeInfo {
  if (paymentStatus === "paid" && bookingStatus === "confirmed") {
    return {
      label: "Prepaid",
      classes: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
      Icon: CheckCircle2,
    };
  }
  if (paymentStatus === "pending") {
    return {
      label: "Payment Pending",
      classes: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
      Icon: Clock,
    };
  }
  if (paymentStatus === "failed") {
    return {
      label: "Payment Failed",
      classes: "bg-red-500/15 text-red-400 border border-red-500/30",
      Icon: XCircle,
    };
  }
  return {
    label: "Refunded",
    classes: "bg-white/5 text-white/40 border border-white/10",
    Icon: AlertCircle,
  };
}

// ── Booking Card ──────────────────────────────────────────────────────────────

function BookingCard({
  booking,
  onView,
}: {
  booking: MockBooking;
  onView: (b: MockBooking) => void;
}) {
  const d = new Date(booking.scheduled_at);
  const dayLabel = d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
  const dateNum = d.getDate();
  const timeLabel = formatTime(booking.scheduled_at);
  const relLabel = getRelativeDate(booking.scheduled_at);
  const badge = getPaymentBadge(booking.payment_status, booking.booking_status);

  return (
    <div className="flex items-center gap-3 sm:gap-4">
      {/* Date block */}
      <div
        className="flex shrink-0 flex-col items-center justify-center rounded-xl px-3 py-3 text-center"
        style={{ background: "var(--brand-red)", minWidth: 60 }}
      >
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">
          {dayLabel}
        </span>
        <span className="text-2xl font-black leading-tight text-white">{dateNum}</span>
        <span className="text-[10px] font-medium text-white/70">{timeLabel}</span>
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6 shrink-0">
            {booking.patron_avatar && (
              <AvatarImage
                src={booking.patron_avatar}
                alt={booking.patron_name}
                className="object-cover object-top"
              />
            )}
            <AvatarFallback className="text-[10px] bg-[var(--brand-red)]/20 text-[var(--brand-red)]">
              {booking.patron_name[0]}
            </AvatarFallback>
          </Avatar>
          <span className="truncate text-sm font-semibold">{booking.patron_name}</span>
          <span className="shrink-0 text-xs text-muted-foreground">· {relLabel}</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {formatBookingType(booking.booking_type)} · {booking.duration_minutes} min
        </p>
        <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{booking.club_name}</span>
        </div>
      </div>

      {/* Status + action */}
      <div className="flex shrink-0 flex-col items-end gap-2">
        <span
          className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold leading-5 ${badge.classes}`}
        >
          <badge.Icon className="h-3 w-3" />
          {badge.label}
        </span>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => onView(booking)}
        >
          View
        </Button>
      </div>
    </div>
  );
}

// ── Booking Detail Modal ──────────────────────────────────────────────────────

function BookingDetailModal({
  booking,
  onClose,
}: {
  booking: MockBooking | null;
  onClose: () => void;
}) {
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

        {/* Patron row */}
        <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
          <Avatar className="h-10 w-10">
            {booking.patron_avatar && (
              <AvatarImage
                src={booking.patron_avatar}
                alt={booking.patron_name}
                className="object-cover object-top"
              />
            )}
            <AvatarFallback className="bg-[var(--brand-red)]/20 text-[var(--brand-red)]">
              {booking.patron_name[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold">{booking.patron_name}</p>
            <p className="text-xs text-muted-foreground">Patron</p>
          </div>
          <span
            className={`ml-auto flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${badge.classes}`}
          >
            <badge.Icon className="h-3 w-3" />
            {badge.label}
          </span>
        </div>

        {/* Details grid */}
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
            <div
              key={label}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3"
            >
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Icon className="h-3 w-3" />
                {label}
              </div>
              <p className="mt-1 text-sm font-medium">{value}</p>
            </div>
          ))}
        </div>

        {/* Reference */}
        <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
          <Hash className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Booking Reference</span>
          <span className="ml-auto font-mono text-sm font-semibold tracking-widest">
            {booking.reference}
          </span>
        </div>

        {/* Notes */}
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

// ── Main export ───────────────────────────────────────────────────────────────

const MAX_VISIBLE = 5;

export function UpcomingBookings() {
  const [selected, setSelected] = useState<MockBooking | null>(null);

  const now = new Date();
  const upcoming = MOCK_BOOKINGS.filter(
    (b) =>
      new Date(b.scheduled_at) > now &&
      b.booking_status !== "cancelled" &&
      b.booking_status !== "completed",
  ).sort(
    (a, b) =>
      new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime(),
  );

  const visible = upcoming.slice(0, MAX_VISIBLE);
  const hasMore = upcoming.length > MAX_VISIBLE;

  return (
    <>
      <Card className="rounded-2xl border-none p-5 shadow-sm">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-[var(--brand-red)]" />
            <h2 className="font-semibold">Upcoming Bookings</h2>
            {upcoming.length > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--brand-red)] px-1.5 text-[11px] font-bold text-white">
                {upcoming.length}
              </span>
            )}
          </div>
          <Link
            href="/bookings"
            className="flex items-center gap-1 text-xs font-medium text-[var(--brand-red)] hover:underline"
          >
            View All <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Empty state */}
        {visible.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <CalendarDays className="h-10 w-10 text-muted-foreground/25" />
            <p className="text-sm font-medium">No upcoming bookings</p>
            <p className="text-xs text-muted-foreground">
              You don&apos;t have any prepaid appointments scheduled yet.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {visible.map((booking) => (
              <div key={booking.id} className="py-3 first:pt-0 last:pb-0">
                <BookingCard booking={booking} onView={setSelected} />
              </div>
            ))}
          </div>
        )}

        {hasMore && (
          <div className="mt-4 text-center">
            <Link href="/bookings">
              <Button variant="ghost" size="sm" className="text-xs text-[var(--brand-red)]">
                View All {upcoming.length} Bookings
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </div>
        )}
      </Card>

      <BookingDetailModal booking={selected} onClose={() => setSelected(null)} />
    </>
  );
}
