"use client";

import { useState, useMemo } from "react";
import { Plus, X, MapPin, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export const POPULAR_CITIES = [
  "Miami, FL",
  "Las Vegas, NV",
  "Los Angeles, CA",
  "New York, NY",
  "Atlanta, GA",
  "Houston, TX",
  "Chicago, IL",
  "Dallas, TX",
  "Phoenix, AZ",
  "Orlando, FL",
  "Nashville, TN",
  "New Orleans, LA",
  "Charlotte, NC",
  "Tampa, FL",
  "San Francisco, CA",
  "Denver, CO",
  "Austin, TX",
  "Washington, DC",
  "Seattle, WA",
  "San Diego, CA",
  "Detroit, MI",
  "Philadelphia, PA",
  "Boston, MA",
  "Minneapolis, MN",
  "Baltimore, MD",
  "Portland, OR",
  "San Antonio, TX",
  "Jacksonville, FL",
  "Memphis, TN",
  "Sacramento, CA",
];

const MAX_CITIES = 5;

interface CityPickerProps {
  value: string[];
  onChange: (cities: string[]) => void;
  saving?: boolean;
}

export function CityPicker({ value, onChange, saving = false }: CityPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return POPULAR_CITIES;
    return POPULAR_CITIES.filter((c) => c.toLowerCase().includes(q));
  }, [search]);

  const trimmed = search.trim();
  const canAddCustom =
    trimmed.length >= 2 &&
    !POPULAR_CITIES.some((c) => c.toLowerCase() === trimmed.toLowerCase()) &&
    !value.some((c) => c.toLowerCase() === trimmed.toLowerCase());

  function add(city: string) {
    if (value.includes(city) || value.length >= MAX_CITIES) return;
    onChange([...value, city]);
    setSearch("");
    setOpen(false);
  }

  function remove(city: string) {
    onChange(value.filter((c) => c !== city));
  }

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center gap-1.5">
        {value.map((city) => (
          <span
            key={city}
            className="flex items-center gap-1 rounded-full bg-[var(--brand-red)]/10 px-2.5 py-1 text-xs font-medium text-[var(--brand-red)]"
          >
            <MapPin className="h-3 w-3 shrink-0" />
            {city}
            <button
              onClick={() => remove(city)}
              aria-label={`Remove ${city}`}
              className="ml-0.5 rounded-full transition-opacity hover:opacity-70"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}

        {value.length < MAX_CITIES && (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-1 rounded-full border border-dashed border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-[var(--brand-red)]/50 hover:text-[var(--brand-red)]">
                <Plus className="h-3 w-3" />
                Add city
              </button>
            </PopoverTrigger>

            <PopoverContent align="start" className="w-60 p-2">
              {/* Search */}
              <div className="relative mb-2">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search or type a city…"
                  className="h-8 pl-7 text-xs"
                  autoFocus
                />
              </div>

              {/* List */}
              <div className="max-h-52 overflow-y-auto">
                {canAddCustom && (
                  <button
                    onClick={() => add(trimmed)}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs hover:bg-accent"
                  >
                    <Plus className="h-3 w-3 text-[var(--brand-red)]" />
                    Add &ldquo;{trimmed}&rdquo;
                  </button>
                )}

                {filtered.length === 0 && !canAddCustom ? (
                  <p className="px-2 py-2 text-xs text-muted-foreground">
                    No cities found.
                  </p>
                ) : (
                  filtered.map((city) => {
                    const already = value.includes(city);
                    return (
                      <button
                        key={city}
                        onClick={() => add(city)}
                        disabled={already}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs",
                          already
                            ? "cursor-default opacity-40"
                            : "hover:bg-accent"
                        )}
                      >
                        <MapPin className="h-3 w-3 shrink-0 text-muted-foreground" />
                        {city}
                        {already && (
                          <span className="ml-auto text-[var(--brand-red)]">
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>

              {value.length >= MAX_CITIES && (
                <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
                  Max {MAX_CITIES} cities reached
                </p>
              )}
            </PopoverContent>
          </Popover>
        )}

        {saving && (
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            Saving…
          </span>
        )}
      </div>

      {value.length === 0 && !saving && (
        <p className="text-xs text-muted-foreground">
          Add up to {MAX_CITIES} cities to personalise your feed.
        </p>
      )}
    </div>
  );
}
