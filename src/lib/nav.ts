import {
  LayoutDashboard,
  Newspaper,
  Compass,
  MessageSquare,
  Users,
  UserCircle,
  Wallet,
  Gem,
  Receipt,
  Gift,
  BarChart3,
  Bell,
  Settings,
  HelpCircle,
  Images,
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

export const PRIMARY_NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Feed", href: "/feed", icon: Newspaper },
  { label: "Discover", href: "/discover", icon: Compass },
  // Club-only: publish and browse their own promotional posts
  { label: "My Posts", href: "/club/posts", icon: Images, clubOnly: true },
  { label: "Analytics", href: "/club/analytics", icon: BarChart3, clubOnly: true },
  // Hidden for clubs (no messaging, connections, payments, referrals, analytics)
  { label: "Messages", href: "/messages", icon: MessageSquare, clubHidden: true },
  { label: "Connections", href: "/connections", icon: Users, clubHidden: true },
  { label: "Hot Spots", href: "/hot-spots", icon: HotSpotsIcon, clubHidden: true },
  { label: "Entertainers", labelForDancer: "Patrons", href: "/dancers", icon: UserCircle, clubHidden: true },
  { label: "Wallet", href: "/wallet", icon: Wallet, clubHidden: true },
  { label: "Buy Gems", href: "/buy-gems", icon: Gem, patronOnly: true, clubHidden: true },
  { label: "Transactions", href: "/transactions", icon: Receipt, patronOnly: true, clubHidden: true },
  { label: "Invite & Earn", href: "/invite-earn", icon: Gift, dancerOnly: true },
  { label: "Analytics", href: "/analytics", icon: BarChart3, dancerOnly: true },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Support", href: "/support", icon: HelpCircle },
];
