export type UserRole = "patron" | "entertainer" | "admin";
export type UserStatus = "active" | "away" | "offline" | "suspended" | "pending";
export type ConnectionStatus = "pending" | "active" | "blocked" | "declined";
export type MessageType = "text" | "image" | "video" | "audio" | "tip" | "system";
export type TransactionType =
  | "purchase"
  | "tip"
  | "subscription"
  | "withdrawal"
  | "referral_bonus"
  | "refund";
export type TransactionStatus = "pending" | "completed" | "failed" | "cancelled";
export type NotificationType =
  | "message"
  | "tip"
  | "subscriber"
  | "payout"
  | "invite"
  | "system";
export type ReferralStatus = "pending" | "active" | "expired";
export type MediaType = "image" | "video" | "audio";

export type UserRow = {
  id: string;
  email: string;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
};

export type ProfileRow = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  cover_url: string | null;
  bio: string | null;
  tagline: string | null;
  age: number | null;
  location: string | null;
  languages: string[] | null;
  height: string | null;
  rates: Record<string, unknown> | null;
  is_verified: boolean;
  response_rate: number;
  rating: number;
  patron_count: number;
  earnings_total: number;
  created_at: string;
  updated_at: string;
};

export type MediaRow = {
  id: string;
  owner_id: string;
  type: MediaType;
  url: string;
  thumbnail_url: string | null;
  caption: string | null;
  is_public: boolean;
  created_at: string;
};

export type ConnectionRow = {
  id: string;
  patron_id: string;
  entertainer_id: string;
  status: ConnectionStatus;
  earnings: number;
  last_interaction_at: string | null;
  created_at: string;
};

export type ConversationRow = {
  id: string;
  user_a_id: string;
  user_b_id: string;
  last_message_id: string | null;
  last_message_at: string | null;
  created_at: string;
};

export type MessageRow = {
  id: string;
  conversation_id: string;
  sender_id: string;
  type: MessageType;
  body: string | null;
  media_id: string | null;
  gem_amount: number | null;
  is_read: boolean;
  created_at: string;
};

export type WalletRow = {
  id: string;
  user_id: string;
  gem_balance: number;
  usd_balance: number;
  is_vip: boolean;
  updated_at: string;
};

export type TransactionRow = {
  id: string;
  user_id: string;
  counterparty_id: string | null;
  type: TransactionType;
  status: TransactionStatus;
  gem_amount: number;
  usd_amount: number;
  description: string | null;
  payment_method: string | null;
  reference_id: string | null;
  created_at: string;
};

export type ReferralRow = {
  id: string;
  referrer_id: string;
  invitee_id: string | null;
  invite_code: string;
  status: ReferralStatus;
  commission_rate: number;
  commission_earned: number;
  created_at: string;
  activated_at: string | null;
};

export type NotificationRow = {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  is_read: boolean;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

export type AnalyticsDailyRow = {
  id: string;
  user_id: string;
  date: string;
  earnings: number;
  tips_received: number;
  new_patrons: number;
  messages_count: number;
  profile_views: number;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      users: { Row: UserRow; Insert: Partial<UserRow>; Update: Partial<UserRow>; Relationships: [] };
      profiles: { Row: ProfileRow; Insert: Partial<ProfileRow>; Update: Partial<ProfileRow>; Relationships: [] };
      media: { Row: MediaRow; Insert: Partial<MediaRow>; Update: Partial<MediaRow>; Relationships: [] };
      connections: { Row: ConnectionRow; Insert: Partial<ConnectionRow>; Update: Partial<ConnectionRow>; Relationships: [] };
      conversations: { Row: ConversationRow; Insert: Partial<ConversationRow>; Update: Partial<ConversationRow>; Relationships: [] };
      messages: { Row: MessageRow; Insert: Partial<MessageRow>; Update: Partial<MessageRow>; Relationships: [] };
      wallets: { Row: WalletRow; Insert: Partial<WalletRow>; Update: Partial<WalletRow>; Relationships: [] };
      transactions: { Row: TransactionRow; Insert: Partial<TransactionRow>; Update: Partial<TransactionRow>; Relationships: [] };
      referrals: { Row: ReferralRow; Insert: Partial<ReferralRow>; Update: Partial<ReferralRow>; Relationships: [] };
      notifications: { Row: NotificationRow; Insert: Partial<NotificationRow>; Update: Partial<NotificationRow>; Relationships: [] };
      analytics_daily: { Row: AnalyticsDailyRow; Insert: Partial<AnalyticsDailyRow>; Update: Partial<AnalyticsDailyRow>; Relationships: [] };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
