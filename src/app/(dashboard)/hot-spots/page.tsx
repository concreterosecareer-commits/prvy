import Link from "next/link";
import { MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MOCK_HOT_SPOTS } from "@/lib/mock-data";
import { CityFilter } from "./city-filter";

export default async function HotSpotsPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string }>;
}) {
  const { city } = await searchParams;
  const cities = Array.from(new Set(MOCK_HOT_SPOTS.map((s) => s.location.split(",")[0].trim())));
  const activeCities = city ? [city] : cities;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Hot Spots</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Top venues where entertainers and patrons connect.
        </p>
      </div>

      <CityFilter cities={cities} />

      <div className="space-y-8">
        {activeCities.map((c) => {
          const spots = MOCK_HOT_SPOTS.filter((s) => s.location.startsWith(c));
          return (
            <section key={c}>
              <div className="mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[var(--brand-red)]" />
                <h2 className="font-semibold">{c}</h2>
                <span className="text-xs text-muted-foreground">({spots.length} venues)</span>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {spots.map((spot) => (
                  <Card key={spot.id} className="group overflow-hidden rounded-2xl border-none p-0 shadow-sm transition hover:shadow-md">
                    <div
                      className="relative flex h-36 items-end overflow-hidden p-4"
                      style={{ background: spot.gradient }}
                    >
                      {"image" in spot && spot.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={spot.image as string}
                          alt=""
                          aria-hidden
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      )}
                      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, oklch(0.08 0.01 25 / 90%) 0%, oklch(0.08 0.01 25 / 40%) 55%, transparent 100%)" }} />
                      <div className="relative z-10">
                        <p className="text-sm font-semibold text-white">{spot.name}</p>
                        <p className="flex items-center gap-1 text-[11px] text-white/70">
                          <MapPin className="h-3 w-3" />
                          {spot.location}
                        </p>
                      </div>
                    </div>
                    <div className="p-3">
                      <Link href={`/hot-spots/${spot.id}`}>
                        <Button size="sm" variant="outline" className="w-full">
                          View
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
