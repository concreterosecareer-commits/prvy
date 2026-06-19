import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Clock, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MOCK_HOT_SPOTS } from "@/lib/mock-data";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export default async function HotSpotDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const spot = MOCK_HOT_SPOTS.find((s) => s.id === id);
  if (!spot) notFound();

  const image = "image" in spot ? (spot.image as string | undefined) : undefined;
  const address = "address" in spot ? (spot.address as string) : undefined;
  const hours = "hours" in spot ? (spot.hours as Record<string, string>) : undefined;

  const today = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link href="/hot-spots" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Hot Spots
      </Link>

      {/* Hero card */}
      <Card className="overflow-hidden rounded-2xl border-none p-0 shadow-sm">
        <div
          className="relative flex h-52 items-end overflow-hidden p-6"
          style={{ background: spot.gradient }}
        >
          {image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt={spot.name}
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to top, oklch(0.06 0.01 25 / 95%) 0%, oklch(0.06 0.01 25 / 50%) 50%, transparent 100%)" }}
          />
          <div className="relative z-10">
            <h1 className="text-2xl font-bold text-white">{spot.name}</h1>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-white/70">
              <MapPin className="h-4 w-4" /> {spot.location}
            </p>
          </div>
        </div>

        {/* Address */}
        {address && (
          <div className="flex items-start gap-3 border-t px-6 py-4">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand-red)]" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Address</p>
              <p className="mt-0.5 text-sm">{address}</p>
            </div>
          </div>
        )}
      </Card>

      {/* Hours */}
      {hours && (
        <Card className="rounded-2xl border-none p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-[var(--brand-red)]" />
            <h2 className="font-semibold">Opening Hours</h2>
          </div>
          <div className="divide-y">
            {DAYS.map((day) => {
              const isToday = day === today;
              return (
                <div
                  key={day}
                  className={`flex items-center justify-between py-2.5 text-sm ${isToday ? "font-semibold text-foreground" : "text-muted-foreground"}`}
                >
                  <span className="flex items-center gap-2">
                    {isToday && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
                    {!isToday && <span className="h-1.5 w-1.5" />}
                    {day}
                  </span>
                  <span className={hours[day] === "Closed" ? "text-destructive" : ""}>
                    {hours[day]}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <div className="flex gap-3">
        <Button className="bg-[var(--brand-red)] text-white hover:bg-[var(--brand-red-dark)]">
          Get Directions
        </Button>
        <Button variant="outline">Share Venue</Button>
      </div>
    </div>
  );
}
