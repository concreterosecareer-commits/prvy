"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface CityFilterProps {
  cities: string[];
}

export function CityFilter({ cities }: CityFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get("city") ?? "All";

  function select(city: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (city === "All") {
      params.delete("city");
    } else {
      params.set("city", city);
    }
    router.push(`/hot-spots?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {["All", ...cities].map((city) => (
        <button
          key={city}
          onClick={() => select(city)}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
            active === city
              ? "bg-[var(--brand-red)] text-white"
              : "bg-muted text-muted-foreground hover:bg-muted/70"
          }`}
        >
          {city}
        </button>
      ))}
    </div>
  );
}
