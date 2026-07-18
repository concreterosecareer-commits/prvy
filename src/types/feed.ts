import type { PostRow } from "@/types/database";

export type FeedAuthor = {
  id: string;
  display_name: string;
  username: string;
  avatar_url: string | null;
  is_verified: boolean;
};

export type FeedPost = PostRow & {
  author: FeedAuthor;
  like_count: number;
  is_liked_by_me: boolean;
};
