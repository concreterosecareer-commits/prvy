"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Trophy, Gift } from "lucide-react";

interface SubNavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const ENTERTAINER_ITEMS: SubNavItem[] = [
  { label: "Overview",     href: "/analytics",    icon: BarChart3 },
  { label: "VIP Bonus",    href: "/vip",          icon: Trophy    },
  { label: "Invite & Earn", href: "/invite-earn", icon: Gift      },
];

const CLUB_ITEMS: SubNavItem[] = [
  { label: "Overview",  href: "/club/analytics", icon: BarChart3 },
  { label: "VIP Bonus", href: "/club/vip",        icon: Trophy    },
];

interface AnalyticsSubNavProps {
  role: "entertainer" | "club";
}

export function AnalyticsSubNav({ role }: AnalyticsSubNavProps) {
  const pathname = usePathname();
  const items = role === "club" ? CLUB_ITEMS : ENTERTAINER_ITEMS;

  return (
    <div className="mb-6 flex items-center gap-1 border-b border-white/[0.06] pb-0">
      {items.map(({ label, href, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={[
              "flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors relative",
              active
                ? "text-white"
                : "text-muted-foreground hover:text-white",
            ].join(" ")}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
            {active && (
              <span
                className="absolute bottom-0 left-0 right-0 h-[2px] rounded-t-full"
                style={{ background: "var(--brand-red)" }}
              />
            )}
          </Link>
        );
      })}
    </div>
  );
}
