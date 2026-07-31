import {
  LayoutDashboard,
  Newspaper,
  Users,
  BarChart3,
  Settings,
  HelpCircle,
} from "lucide-react";
import type { ComponentType } from "react";
import { HotSpotsIcon } from "@/components/icons/hot-spots-icon";

export interface NavItem {
  label: string;
  labelForDancer?: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  badge?: number;
  dancerOnly?: boolean;
  patronOnly?: boolean;
  /** Visible only when role === "club" */
  clubOnly?: boolean;
  /** Hidden when role === "club" */
  clubHidden?: boolean;
}

/**
 * Primary navigation — 6 items max per role.
 *
 * Absorbed into parent sections (still accessible at their original URLs):
 *   Dashboard  ← Wallet, Messages, Transactions, Buy Gems
 *   Connections ← Feed, Discover, Patrons/Entertainers, My Posts (club)
 *   Analytics   ← VIP Bonus, Invite & Earn
 *   Settings    ← Notifications preferences
 *
 * Notifications are accessed only via the bell in the header (Topbar).
 */
export const PRIMARY_NAV: NavItem[] = [
  { label: "Dashboard",   href: "/dashboard",      icon: LayoutDashboard },
  { label: "Feed",        href: "/feed",            icon: Newspaper,      clubHidden: true },
  { label: "Connections", href: "/connections",     icon: Users,          clubHidden: true },
  { label: "Hot Spots",   href: "/hot-spots",       icon: HotSpotsIcon,   clubHidden: true },
  // Analytics routes differ by role — both show as "Analytics" in the sidebar
  { label: "Analytics",   href: "/club/analytics",  icon: BarChart3,      clubOnly: true },
  { label: "Analytics",   href: "/analytics",       icon: BarChart3,      dancerOnly: true },
  { label: "Settings",    href: "/settings",        icon: Settings },
  { label: "Support",     href: "/support",         icon: HelpCircle },
];
