import {
  LayoutDashboard,
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
}

export const PRIMARY_NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Messages", href: "/messages", icon: MessageSquare },
  { label: "Connections", href: "/connections", icon: Users },
  { label: "Hot Spots", href: "/hot-spots", icon: HotSpotsIcon },
  { label: "Dancers", labelForDancer: "Patrons", href: "/dancers", icon: UserCircle },
  { label: "Wallet", href: "/wallet", icon: Wallet },
  { label: "Buy Gems", href: "/buy-gems", icon: Gem, patronOnly: true },
  { label: "Transactions", href: "/transactions", icon: Receipt, patronOnly: true },
  { label: "Invite & Earn", href: "/invite-earn", icon: Gift, dancerOnly: true },
  { label: "Analytics", href: "/analytics", icon: BarChart3, dancerOnly: true },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Support", href: "/support", icon: HelpCircle },
];
