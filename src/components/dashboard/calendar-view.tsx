"use client";

import { useState, useMemo } from "react";
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
  ChevronLeft,
  ChevronRight,
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
import { cn } from "@/lib/utils";

// ── Constants ─────────────────────────────────────────────────────────────────

const DOW_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// ── Helpers ───────────────────────────────────────────────────────────────────

/** DB working_days convention: 0=Monday … 6=Sunday. JS getDay(): 0=Sunday … 6=Saturday. */
function jsToDbDay(jsDay: number): number {
  return (jsDay + 6) % 7;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function buildMonthCells(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  const startDow = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthTotal = new Date(year, month, 0).getDate();

  const cells: Date[] = [];

  for (let i = 0; i < startDow; i++) {
    cells.push(new Date(year, month - 1, prevMonthTotal - startDow + i + 1));
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(year, month, d));
  }
  let nextDay = 1;
  while (cells.length < 42) {
    cells.push(new Date(year, month + 1, nextDay++));
  }

  return cells;
}

function getBookingsForDay(date: Date, bookings: MockBooking[]): MockBooking[] {
  return bookings.filter((b) => isSameDay(new Date(b.scheduled_at), date));
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDateFull(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
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

type BadgeInfo = {
  label: string;
  classes: string;
  dotClass: string;
  Icon: React.ElementType;
};

function getPaymentBadge(paymentStatus: string, bookingStatus: string): BadgeInfo {
  if (paymentStatus === "paid" && bookingStatus === "confirmed") {
    return {
      label: "Prepaid",
      classes: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
      dotClass: "bg-emerald-400",
      Icon: CheckCircle2,
    };
  }
  if (paymentStatus === "pending") {
    return {
      label: "Payment Pending",
      classes: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
      dotClass: "bg-amber-400",
      Icon: Clock,
    };
  }
  if (paymentStatus === "failed") {
    return {
      label: "Payment Failed",
      classes: "bg-red-500/15 text-red-400 border border-red-500/30",
      dotClass: "bg-red-400",
      Icon: XCircle,
    };
  }
  return {
    label: "Refunded",
    classes: "bg-white/5 text-white/40 border border-white/10",
    dotClass: "bg-white/30",
    Icon: AlertCircle,
  };
}

// ── Booking Detail Modal ──────────────────────────────────────────────────────

function BookingModal({
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

        <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
          <Hash className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Booking Reference</span>
          <span className="ml-auto font-mono text-sm font-semibold tracking-widest">
            {booking.reference}
          </span>
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

// ── CalendarView ──────────────────────────────────────────────────────────────

interface CalendarViewProps {
  /** working_days from profiles table (0=Monday … 6=Sunday) */
  workingDays: number[];
}

export function CalendarView({ workingDays }: CalendarViewProps) {
  const today = useMemo(() => new Date(), []);

  const [viewDate, setViewDate] = useState<Date>(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(today);
  const [selectedBooking, setSelectedBooking] = useState<MockBooking | null>(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();

  const cells = useMemo(() => buildMonthCells(year, month), [year, month]);

  const selectedDayBookings = useMemo(
    () =>
      selectedDate
        ? getBookingsForDay(selectedDate, MOCK_BOOKINGS).sort(
            (a, b) =>
              new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime(),
          )
        : [],
    [selectedDate],
  );

  function prevMonth() { setViewDate(new Date(year, month - 1, 1)); }
  function nextMonth() { setViewDate(new Date(year, month + 1, 1)); }
  function goToday() {
    setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(today);
  }

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden rounded-2xl border-none shadow-sm">

        {/* ── Month navigation ──────────────────────────────────────────── */}
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold">
              {MONTH_NAMES[month]} {year}
            </h2>
            {!isCurrentMonth && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-[var(--brand-red)]"
                onClick={goToday}
              >
                Today
              </Button>
            )}
          </div>

          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* ── Weekday header ────────────────────────────────────────────── */}
        <div className="grid grid-cols-7 border-b border-white/[0.06]">
          {DOW_LABELS.map((d) => (
            <div
              key={d}
              className="py-2 text-center text-[11px] font-semibold uppercase tracking-widest text-muted-foreground"
            >
              {d}
            </div>
          ))}
        </div>

        {/* ── Calendar grid ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-7">
          {cells.map((date, i) => {
            const inCurrentMonth = date.getMonth() === month;
            const isToday = isSameDay(date, today);
            const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;
            const isWorkingDay =
              inCurrentMonth && workingDays.includes(jsToDbDay(date.getDay()));
            const dayBookings = getBookingsForDay(date, MOCK_BOOKINGS);

            return (
              <button
                key={i}
                onClick={() => setSelectedDate(date)}
                className={cn(
                  "relative flex min-h-0 flex-col items-start gap-0.5 border-b border-r border-white/[0.04] p-1.5 sm:p-2 text-left transition-colors",
                  "h-14 sm:h-20 lg:h-24",
                  (i + 1) % 7 === 0 && "border-r-0",
                  i >= 35 && "border-b-0",
                  isWorkingDay && !isSelected && "bg-[var(--brand-red)]/[0.05]",
                  isSelected && "bg-[var(--brand-red)]/10",
                  !isSelected && "hover:bg-white/[0.03]",
                )}
              >
                {/* Date number */}
                <span
                  className={cn(
                    "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                    !inCurrentMonth && "text-muted-foreground/25",
                    inCurrentMonth && !isToday && "text-foreground/80",
                    isToday && "bg-[var(--brand-red)] text-white",
                    isSelected && !isToday && "font-bold text-[var(--brand-red)]",
                  )}
                >
                  {date.getDate()}
                </span>

                {/* Mobile: coloured dots */}
                {dayBookings.length > 0 && (
                  <div className="flex items-center gap-0.5 sm:hidden">
                    {dayBookings.slice(0, 3).map((b) => {
                      const badge = getPaymentBadge(b.payment_status, b.booking_status);
                      return (
                        <span
                          key={b.id}
                          className={cn("h-1.5 w-1.5 rounded-full flex-shrink-0", badge.dotClass)}
                        />
                      );
                    })}
                  </div>
                )}

                {/* Desktop: booking pills */}
                <div className="hidden w-full flex-1 flex-col gap-0.5 overflow-hidden sm:flex">
                  {dayBookings.slice(0, 2).map((b) => {
                    const badge = getPaymentBadge(b.payment_status, b.booking_status);
                    return (
                      <span
                        key={b.id}
                        className={cn(
                          "flex w-full items-center gap-1 truncate rounded px-1 py-0.5 text-[10px] font-medium",
                          badge.classes,
                        )}
                      >
                        <span className={cn("h-1.5 w-1.5 flex-shrink-0 rounded-full", badge.dotClass)} />
                        <span className="truncate">
                          {formatTime(b.scheduled_at).replace(":00", "")} {b.patron_name.split(" ")[0]}
                        </span>
                      </span>
                    );
                  })}
                  {dayBookings.length > 2 && (
                    <span className="px-1 text-[10px] text-muted-foreground">
                      +{dayBookings.length - 2} more
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* ── Legend ───────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-4 border-t border-white/[0.06] px-5 py-3">
          {workingDays.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="h-2.5 w-2.5 rounded-sm bg-[var(--brand-red)]/20" />
              Working day
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Prepaid booking
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            Pending payment
          </div>
        </div>
      </Card>

      {/* ── Day detail panel ──────────────────────────────────────────────── */}
      {selectedDate && (
        <Card className="rounded-2xl border-none p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">{formatDateFull(selectedDate)}</h3>
            {selectedDayBookings.length > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--brand-red)] px-1.5 text-[11px] font-bold text-white">
                {selectedDayBookings.length}
              </span>
            )}
          </div>

          {selectedDayBookings.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-6 text-center">
              <CalendarDays className="h-8 w-8 text-muted-foreground/25" />
              <p className="text-sm text-muted-foreground">No bookings on this day.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {selectedDayBookings.map((booking) => {
                const badge = getPaymentBadge(booking.payment_status, booking.booking_status);
                const [timePart, ampm] = formatTime(booking.scheduled_at).split(" ");

                return (
                  <div
                    key={booking.id}
                    className="flex items-center gap-3 py-3 first:pt-0 last:pb-0 sm:gap-4"
                  >
                    {/* Time block */}
                    <div
                      className="flex shrink-0 flex-col items-center justify-center rounded-xl px-3 py-2 text-center"
                      style={{ background: "var(--brand-red)", minWidth: 56 }}
                    >
                      <span className="text-sm font-bold leading-tight text-white">
                        {timePart}
                      </span>
                      <span className="text-[10px] font-medium text-white/70">{ampm}</span>
                    </div>

                    {/* Details */}
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
                        <span className="truncate text-sm font-semibold">
                          {booking.patron_name}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {formatBookingType(booking.booking_type)} · {booking.duration_minutes} min · {booking.club_name}
                      </p>
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
                        onClick={() => setSelectedBooking(booking)}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      <BookingModal
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
      />
    </div>
  );
}
