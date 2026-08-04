"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PRIMARY_NAV } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";

interface SidebarNavProps {
  unreadCounts?: Record<string, number>;
  role?: string;
}

export function SidebarNav({ unreadCounts, role }: SidebarNavProps) {
  const pathname = usePathname();
  const navItems = PRIMARY_NAV.filter((item) => {
    if (item.clubOnly && role !== "club") return false;
    if (item.clubHidden && role === "club") return false;
    if (item.dancerOnly && role !== "entertainer") return false;
    if (item.patronOnly && role === "entertainer") return false;
    return true;
  });

  return (
    <div
      className="relative flex h-full flex-col overflow-hidden text-white"
      style={{
        backgroundImage: "url('/sidebar-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="flex h-full flex-col">
        <div className="flex flex-col items-center px-6 py-6">
          <Logo height={108} />
          <p className="mt-2 text-[11px] leading-none text-white/40">
            Private. Discreet. Connected.
          </p>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            const badge = unreadCounts?.[item.href];
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-3 rounded-[7px] px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-[var(--brand-red)] text-white"
                    : "text-white/60 hover:bg-[var(--brand-red)]/15 hover:text-white"
                )}
              >
                {/* Hot zone left accent bar */}
                <span
                  className={cn(
                    "absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full transition-all duration-200",
                    active
                      ? "h-3/5 bg-white/70"
                      : "h-0 bg-[var(--brand-red)] group-hover:h-3/5"
                  )}
                />
                <item.icon
                  className={cn(
                    "h-4 w-4 shrink-0 text-white transition-transform duration-200",
                    !active && "group-hover:scale-110"
                  )}
                />
                <span className="flex-1 truncate">{role === "entertainer" && item.labelForDancer ? item.labelForDancer : item.label}</span>
                {!!badge && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white/15 px-1.5 text-[11px] font-semibold">
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

      </div>
    </div>
  );
}
