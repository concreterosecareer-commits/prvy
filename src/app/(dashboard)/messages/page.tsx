"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search, Phone, MoreVertical, Send, Smile, ImagePlus, X,
  Check, CheckCheck, Plus, Loader2, AlertCircle, MessageSquare,
} from "lucide-react";
import dynamic from "next/dynamic";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { sanitizeText } from "@/lib/sanitize";
import type { EmojiClickData } from "emoji-picker-react";
import type { ConversationRow, MessageRow } from "@/types/database";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

/* ─── Local types ───────────────────────────────────────────── */

type ReadStatus = "sent" | "delivered" | "read";

type Message = {
  id: string;
  from: "me" | "them";
  text?: string;
  image?: string;
  time: string;
  status?: ReadStatus;
  /** True while the DB insert is in-flight */
  isOptimistic?: boolean;
};

type OtherUser = {
  id: string;
  display_name: string;
  username: string;
  avatar_url: string | null;
};

type ConversationItem = ConversationRow & {
  otherUser: OtherUser;
  lastBody: string | null;
  unreadCount: number;
};

/* ─── Helpers ───────────────────────────────────────────────── */

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function nowTime(): string {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function ReadTick({ status }: { status?: ReadStatus }) {
  if (!status) return null;
  if (status === "sent") return <Check className="h-3 w-3 text-white/50" />;
  if (status === "delivered") return <CheckCheck className="h-3 w-3 text-white/50" />;
  return <CheckCheck className="h-3 w-3 text-sky-300" />;
}

/* ─── Page ──────────────────────────────────────────────────── */

export default function MessagesPage() {
  const supabase = useMemo(() => createClient(), []);

  const [userId, setUserId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [convError, setConvError] = useState<string | null>(null);
  const [msgError, setMsgError] = useState<string | null>(null);
  const [tab, setTab] = useState<"all" | "unread" | "favorites">("all");
  const [search, setSearch] = useState("");
  const [showNewConv, setShowNewConv] = useState(false);
  const [newConvUsername, setNewConvUsername] = useState("");
  const [creatingConv, setCreatingConv] = useState(false);
  const [newConvError, setNewConvError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /* ── 1. Resolve current user ──────────────────────────────── */
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
  }, [supabase]);

  /* ── 2. Load conversation list ────────────────────────────── */
  useEffect(() => {
    if (!userId) return;
    const uid: string = userId;
    let cancelled = false;

    async function load() {
      setLoadingConvs(true);
      setConvError(null);

      const { data: rawConvs, error: convErr } = await supabase
        .from("conversations")
        .select("*")
        .or(`user_a_id.eq.${uid},user_b_id.eq.${uid}`)
        .order("last_message_at", { ascending: false, nullsFirst: false });

      if (cancelled) return;
      if (convErr) {
        setConvError("Could not load conversations. Check Supabase RLS policies for the conversations table.");
        setLoadingConvs(false);
        return;
      }

      if (!rawConvs || rawConvs.length === 0) {
        setConversations([]);
        setLoadingConvs(false);
        return;
      }

      const otherIds = rawConvs.map((c) =>
        c.user_a_id === uid ? c.user_b_id : c.user_a_id
      );

      const lastMsgIds = rawConvs
        .map((c) => c.last_message_id)
        .filter((id): id is string => !!id);

      const [{ data: profiles }, { data: lastMsgs }, { data: unreadRows }] =
        await Promise.all([
          supabase
            .from("profiles")
            .select("id, display_name, username, avatar_url")
            .in("id", otherIds),
          lastMsgIds.length > 0
            ? supabase
                .from("messages")
                .select("id, body, created_at, sender_id")
                .in("id", lastMsgIds)
            : Promise.resolve({ data: [] as Pick<MessageRow, "id" | "body" | "created_at" | "sender_id">[] }),
          supabase
            .from("messages")
            .select("conversation_id")
            .eq("is_read", false)
            .neq("sender_id", uid)
            .in(
              "conversation_id",
              rawConvs.map((c) => c.id)
            ),
        ]);

      if (cancelled) return;

      const unreadByConv = (unreadRows ?? []).reduce<Record<string, number>>(
        (acc, m) => {
          const cid = (m as { conversation_id: string }).conversation_id;
          acc[cid] = (acc[cid] ?? 0) + 1;
          return acc;
        },
        {}
      );

      const items: ConversationItem[] = rawConvs.map((c) => {
        const otherId = c.user_a_id === uid ? c.user_b_id : c.user_a_id;
        const profile = (profiles ?? []).find((p) => p.id === otherId);
        const lastMsg = (lastMsgs ?? []).find((m) => m.id === c.last_message_id);
        return {
          ...c,
          otherUser: profile
            ? {
                id: profile.id,
                display_name: profile.display_name ?? "Unknown",
                username: profile.username ?? "unknown",
                avatar_url: profile.avatar_url ?? null,
              }
            : { id: otherId, display_name: "Unknown", username: "unknown", avatar_url: null },
          lastBody: lastMsg?.body ?? null,
          unreadCount: unreadByConv[c.id] ?? 0,
        };
      });

      setConversations(items);
      setLoadingConvs(false);
    }

    load();
    return () => { cancelled = true; };
  }, [userId, supabase]);

  /* ── 3. Auto-select first conversation ───────────────────── */
  useEffect(() => {
    if (conversations.length > 0 && !activeConvId) {
      setActiveConvId(conversations[0].id);
    }
  }, [conversations, activeConvId]);

  /* ── 4. Load messages + realtime for active conversation ──── */
  useEffect(() => {
    if (!activeConvId || !userId) return;
    const cid: string = activeConvId;
    const uid: string = userId;
    let cancelled = false;

    setLoadingMsgs(true);
    setMsgError(null);
    setMessages([]);

    async function loadMessages() {
      const { data, error: msgErr } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", cid)
        .order("created_at", { ascending: true });

      if (cancelled) return;

      if (msgErr) {
        setMsgError("Could not load messages. Check Supabase RLS policies for the messages table.");
        setLoadingMsgs(false);
        return;
      }

      const msgs: Message[] = (data ?? []).map((m) => ({
        id: m.id,
        from: m.sender_id === uid ? "me" : "them",
        text: m.type === "text" ? (m.body ?? undefined) : undefined,
        image: m.type === "image" ? (m.body ?? undefined) : undefined,
        time: formatTime(m.created_at),
        status: m.sender_id === uid
          ? (m.is_read ? "read" : "delivered")
          : undefined,
      }));

      setMessages(msgs);
      setLoadingMsgs(false);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);

      // Mark unread messages from the other person as read
      const unreadIds = (data ?? [])
        .filter((m) => m.sender_id !== uid && !m.is_read)
        .map((m) => m.id);

      if (unreadIds.length > 0 && !cancelled) {
        await supabase
          .from("messages")
          .update({ is_read: true })
          .in("id", unreadIds);

        setConversations((prev) =>
          prev.map((c) =>
            c.id === cid ? { ...c, unreadCount: 0 } : c
          )
        );
      }
    }

    loadMessages();

    // Realtime: new messages from the other person
    const channel = supabase
      .channel(`conv-${cid}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${cid}`,
        },
        (payload) => {
          const m = payload.new as MessageRow;
          // Skip own messages — already added optimistically
          if (m.sender_id === uid) return;

          const incoming: Message = {
            id: m.id,
            from: "them",
            text: m.type === "text" ? (m.body ?? undefined) : undefined,
            image: m.type === "image" ? (m.body ?? undefined) : undefined,
            time: formatTime(m.created_at),
          };

          setMessages((prev) => [...prev, incoming]);
          setTimeout(
            () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
            50
          );

          // Auto-read since the user is looking at this conversation
          supabase
            .from("messages")
            .update({ is_read: true })
            .eq("id", m.id);
        }
      )
      // Track is_read updates on own messages (so ticks update in real time)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${activeConvId}`,
        },
        (payload) => {
          const m = payload.new as MessageRow;
          if (m.sender_id !== userId) return;
          if (m.is_read) {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === m.id ? { ...msg, status: "read" } : msg
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [activeConvId, userId, supabase]);

  /* ── Send message ─────────────────────────────────────────── */
  async function sendMessage() {
    if ((!draft.trim() && !imagePreview) || !activeConvId || !userId || sending) return;

    const text = sanitizeText(draft.trim());
    const imgData = imagePreview;

    setDraft("");
    setImagePreview(null);
    setShowEmoji(false);
    setMsgError(null);
    setSending(true);

    // Optimistic message
    const tempId = `temp-${Date.now()}`;
    const optimistic: Message = {
      id: tempId,
      from: "me",
      time: nowTime(),
      status: "sent",
      isOptimistic: true,
      ...(imgData ? { image: imgData } : { text }),
    };
    setMessages((prev) => [...prev, optimistic]);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);

    try {
      let body = text || null;
      let type: "text" | "image" = "text";

      if (imgData) {
        // Upload image to Supabase Storage
        const blob = await fetch(imgData).then((r) => r.blob());
        const ext = blob.type.split("/")[1] ?? "jpg";
        const path = `messages/${userId}/${Date.now()}.${ext}`;

        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from("media")
          .upload(path, blob, { contentType: blob.type, upsert: false });

        if (uploadErr) throw new Error(`Image upload failed: ${uploadErr.message}`);

        const { data: urlData } = supabase.storage
          .from("media")
          .getPublicUrl(uploadData.path);

        body = urlData.publicUrl;
        type = "image";
      }

      const { data: msg, error: insertErr } = await supabase
        .from("messages")
        .insert({
          conversation_id: activeConvId,
          sender_id: userId,
          type,
          body,
          is_read: false,
        })
        .select("*")
        .single();

      if (insertErr) throw new Error(insertErr.message);

      // Update conversation's last message pointer
      await supabase
        .from("conversations")
        .update({
          last_message_id: msg.id,
          last_message_at: msg.created_at,
        })
        .eq("id", activeConvId);

      // Replace optimistic entry with persisted message
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId
            ? {
                id: msg.id,
                from: "me",
                text: msg.type === "text" ? (msg.body ?? undefined) : undefined,
                image: msg.type === "image" ? (msg.body ?? undefined) : undefined,
                time: formatTime(msg.created_at),
                status: "delivered",
              }
            : m
        )
      );

      // Bubble conversation to top of sidebar
      setConversations((prev) => {
        const updated = prev.map((c) =>
          c.id === activeConvId
            ? { ...c, lastBody: body, last_message_at: msg.created_at }
            : c
        );
        return [...updated].sort((a, b) =>
          (b.last_message_at ?? "").localeCompare(a.last_message_at ?? "")
        );
      });
    } catch (err: unknown) {
      // Remove optimistic entry on failure
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setMsgError(
        err instanceof Error ? err.message : "Message failed to send. Please try again."
      );
    } finally {
      setSending(false);
    }
  }

  /* ── Start / find conversation ────────────────────────────── */
  async function startConversation() {
    if (!newConvUsername.trim() || !userId) return;

    setCreatingConv(true);
    setNewConvError(null);

    try {
      const { data: profile, error: profileErr } = await supabase
        .from("profiles")
        .select("id, display_name, username, avatar_url")
        .eq("username", newConvUsername.trim().toLowerCase())
        .single();

      if (profileErr || !profile) {
        setNewConvError("User not found. Double-check the username.");
        return;
      }
      if (profile.id === userId) {
        setNewConvError("You can't start a conversation with yourself.");
        return;
      }

      // Check for an existing conversation between these two users
      const { data: existing } = await supabase
        .from("conversations")
        .select("id")
        .or(
          `and(user_a_id.eq.${userId},user_b_id.eq.${profile.id}),and(user_a_id.eq.${profile.id},user_b_id.eq.${userId})`
        )
        .maybeSingle();

      let convId: string;

      if (existing) {
        convId = existing.id;
      } else {
        const { data: created, error: createErr } = await supabase
          .from("conversations")
          .insert({ user_a_id: userId, user_b_id: profile.id })
          .select("id, user_a_id, user_b_id, last_message_id, last_message_at, created_at")
          .single();

        if (createErr || !created) {
          throw new Error(createErr?.message ?? "Could not create conversation.");
        }

        convId = created.id;
        const newItem: ConversationItem = {
          ...created,
          otherUser: {
            id: profile.id,
            display_name: profile.display_name ?? "Unknown",
            username: profile.username ?? "unknown",
            avatar_url: profile.avatar_url ?? null,
          },
          lastBody: null,
          unreadCount: 0,
        };
        setConversations((prev) => [newItem, ...prev]);
      }

      setActiveConvId(convId);
      setShowNewConv(false);
      setNewConvUsername("");
    } catch (err: unknown) {
      setNewConvError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    } finally {
      setCreatingConv(false);
    }
  }

  /* ── Misc handlers ────────────────────────────────────────── */
  function onEmojiClick(data: EmojiClickData) {
    setDraft((prev) => prev + data.emoji);
  }

  function onImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  /* ── Derived state ────────────────────────────────────────── */
  const activeConv = conversations.find((c) => c.id === activeConvId) ?? null;
  const totalUnread = conversations.reduce((s, c) => s + c.unreadCount, 0);

  const filteredConvs = conversations.filter((c) => {
    if (tab === "unread" && c.unreadCount === 0) return false;
    if (search) {
      const q = search.toLowerCase();
      const name = (c.otherUser.display_name ?? "").toLowerCase();
      const uname = (c.otherUser.username ?? "").toLowerCase();
      const body = (c.lastBody ?? "").toLowerCase();
      if (!name.includes(q) && !uname.includes(q) && !body.includes(q)) return false;
    }
    return true;
  });

  /* ─── Render ─────────────────────────────────────────────── */
  return (
    <>
      {/* New conversation modal */}
      {showNewConv && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-2xl border bg-card p-6 shadow-xl">
            <h2 className="mb-4 text-sm font-semibold">New Conversation</h2>
            <div className="space-y-3">
              <Input
                placeholder="Enter exact username..."
                value={newConvUsername}
                onChange={(e) => setNewConvUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && startConversation()}
                autoFocus
              />
              {newConvError && (
                <p className="flex items-center gap-1.5 text-xs text-destructive">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {newConvError}
                </p>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowNewConv(false);
                    setNewConvUsername("");
                    setNewConvError(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-[var(--brand-red)] text-white hover:bg-[var(--brand-red-dark)]"
                  onClick={startConversation}
                  disabled={creatingConv || !newConvUsername.trim()}
                >
                  {creatingConv ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Start Chat"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid h-[calc(100vh-8rem)] overflow-hidden rounded-2xl border bg-card shadow-sm md:grid-cols-[320px_1fr]">
        {/* ── Sidebar ─────────────────────────────────────────── */}
        <div className="flex flex-col border-r">
          <div className="space-y-3 p-4">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-bold">Messages</h1>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                title="New conversation"
                onClick={() => setShowNewConv(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Tabs
              value={tab}
              onValueChange={(v) => setTab(v as typeof tab)}
            >
              <TabsList className="w-full">
                <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
                <TabsTrigger value="unread" className="flex-1 gap-1">
                  Unread
                  {totalUnread > 0 && (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--brand-red)] text-[9px] font-bold text-white">
                      {totalUnread > 9 ? "9+" : totalUnread}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="favorites" className="flex-1">Favorites</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingConvs ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : convError ? (
              <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
                <AlertCircle className="h-6 w-6 text-destructive" />
                <p className="text-xs text-muted-foreground">{convError}</p>
              </div>
            ) : filteredConvs.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
                <MessageSquare className="h-8 w-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">
                  {tab === "unread"
                    ? "No unread messages"
                    : search
                    ? "No conversations match"
                    : "No conversations yet"}
                </p>
                {tab === "all" && !search && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-1"
                    onClick={() => setShowNewConv(true)}
                  >
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    Start a conversation
                  </Button>
                )}
              </div>
            ) : (
              filteredConvs.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveConvId(c.id)}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-accent",
                    activeConvId === c.id && "bg-[var(--brand-red)]/10"
                  )}
                >
                  <Avatar className="h-10 w-10 shrink-0">
                    {c.otherUser.avatar_url && (
                      <AvatarImage
                        src={c.otherUser.avatar_url}
                        alt={c.otherUser.display_name}
                        className="object-cover object-top"
                      />
                    )}
                    <AvatarFallback className="bg-[var(--brand-red)]/15 text-[var(--brand-red)]">
                      {(c.otherUser.display_name?.[0] ?? "?").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {c.otherUser.display_name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {c.lastBody ?? "No messages yet"}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    {c.last_message_at && (
                      <span className="text-xs text-muted-foreground">
                        {formatTime(c.last_message_at)}
                      </span>
                    )}
                    {c.unreadCount > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--brand-red)] px-1.5 text-[11px] font-semibold text-white">
                        {c.unreadCount > 99 ? "99+" : c.unreadCount}
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* ── Chat area ───────────────────────────────────────── */}
        {!activeConv ? (
          <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <MessageSquare className="h-10 w-10 opacity-20" />
            <p className="text-sm">Select a conversation to start messaging</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNewConv(true)}
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              New conversation
            </Button>
          </div>
        ) : (
          <div className="flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  {activeConv.otherUser.avatar_url && (
                    <AvatarImage
                      src={activeConv.otherUser.avatar_url}
                      alt={activeConv.otherUser.display_name}
                      className="object-cover object-top"
                    />
                  )}
                  <AvatarFallback className="bg-[var(--brand-red)]/15 text-[var(--brand-red)]">
                    {(activeConv.otherUser.display_name?.[0] ?? "?").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">
                    {activeConv.otherUser.display_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    @{activeConv.otherUser.username}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Error banner */}
            {msgError && (
              <div className="flex items-center gap-2 border-b bg-destructive/10 px-4 py-2 text-xs text-destructive">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span className="flex-1">{msgError}</span>
                <button
                  className="underline"
                  onClick={() => setMsgError(null)}
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {loadingMsgs ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-sm text-muted-foreground">
                    No messages yet. Say hello!
                  </p>
                </div>
              ) : (
                messages.map((m) => {
                  const isMe = m.from === "me";
                  return (
                    <div
                      key={m.id}
                      className={cn(
                        "flex items-end gap-2",
                        isMe ? "justify-end" : "justify-start"
                      )}
                    >
                      {!isMe && (
                        <Avatar className="h-7 w-7 shrink-0">
                          {activeConv.otherUser.avatar_url && (
                            <AvatarImage
                              src={activeConv.otherUser.avatar_url}
                              alt={activeConv.otherUser.display_name}
                              className="object-cover object-top"
                            />
                          )}
                          <AvatarFallback className="bg-[var(--brand-red)]/15 text-[var(--brand-red)] text-xs">
                            {(activeConv.otherUser.display_name?.[0] ?? "?").toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={cn(
                          "max-w-[70%] px-4 py-2.5 text-sm transition-opacity",
                          isMe
                            ? "rounded-t-[14px] rounded-bl-[14px] rounded-br-none bg-[var(--brand-red)] text-white"
                            : "rounded-t-[14px] rounded-br-[14px] rounded-bl-none bg-muted text-foreground",
                          m.isOptimistic && "opacity-60"
                        )}
                      >
                        {m.image ? (
                          <img
                            src={m.image}
                            alt="sent image"
                            className="max-h-48 w-auto rounded-lg object-cover"
                          />
                        ) : (
                          <p>{m.text}</p>
                        )}
                        <div
                          className={cn(
                            "mt-1 flex items-center gap-1",
                            isMe ? "justify-end" : "justify-start"
                          )}
                        >
                          <p
                            className={cn(
                              "text-[10px]",
                              isMe ? "text-white/70" : "text-muted-foreground"
                            )}
                          >
                            {m.time}
                          </p>
                          {isMe && <ReadTick status={m.status} />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Image preview strip */}
            {imagePreview && (
              <div className="relative mx-4 mb-2 w-fit">
                <img
                  src={imagePreview}
                  alt="preview"
                  className="h-24 w-auto rounded-xl border object-cover"
                />
                <button
                  onClick={() => setImagePreview(null)}
                  className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-background"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}

            {/* Emoji picker */}
            {showEmoji && (
              <div className="border-t px-4 pt-2">
                <EmojiPicker
                  onEmojiClick={onEmojiClick}
                  width="100%"
                  height={300}
                  searchDisabled={false}
                  skinTonesDisabled
                  previewConfig={{ showPreview: false }}
                />
              </div>
            )}

            {/* Input bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex items-center gap-2 border-t p-4"
            >
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowEmoji((v) => !v)}
                className={cn(showEmoji && "text-[var(--brand-red)]")}
              >
                <Smile className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImagePlus className="h-4 w-4" />
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onImageChange}
              />
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type a message..."
                className="flex-1"
              />
              <Button
                type="submit"
                size="icon"
                disabled={(!draft.trim() && !imagePreview) || sending}
                className="bg-[var(--brand-red)] text-white hover:bg-[var(--brand-red-dark)]"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}
