"use client";

import { useRef, useState } from "react";
import { Search, Phone, MoreVertical, Send, Smile, ImagePlus, X, Check, CheckCheck } from "lucide-react";
import dynamic from "next/dynamic";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { MOCK_RECENT_ACTIVITY, MOCK_CONVERSATION } from "@/lib/mock-data";
import type { EmojiClickData } from "emoji-picker-react";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

type ReadStatus = "sent" | "delivered" | "read";

type Message = {
  id: string;
  from: "me" | "them";
  text?: string;
  image?: string;
  time: string;
  status?: ReadStatus;
};

function ReadTick({ status }: { status?: ReadStatus }) {
  if (!status) return null;
  if (status === "sent") {
    return <Check className="h-3 w-3 text-white/50" />;
  }
  if (status === "delivered") {
    return <CheckCheck className="h-3 w-3 text-white/50" />;
  }
  return <CheckCheck className="h-3 w-3 text-sky-300" />;
}

const INITIAL_MESSAGES: Message[] = MOCK_CONVERSATION.map((m) => ({
  ...m,
  status: m.from === "me" ? "read" : undefined,
}));

export default function MessagesPage() {
  const [activeId, setActiveId] = useState(MOCK_RECENT_ACTIVITY[0].id);
  const [draft, setDraft] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const active = MOCK_RECENT_ACTIVITY.find((c) => c.id === activeId)!;

  function now() {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function sendMessage() {
    if (!draft.trim() && !imagePreview) return;
    const id = String(Date.now());
    const newMsg: Message = {
      id,
      from: "me",
      time: now(),
      status: "sent",
      ...(imagePreview ? { image: imagePreview } : { text: draft.trim() }),
    };
    setMessages((prev) => [...prev, newMsg]);
    setDraft("");
    setImagePreview(null);
    setShowEmoji(false);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);

    // Simulate delivery → read progression
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: "delivered" } : m))
      );
    }, 800);
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: "read" } : m))
      );
    }, 2500);
  }

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

  return (
    <div className="grid h-[calc(100vh-8rem)] overflow-hidden rounded-2xl border bg-card shadow-sm md:grid-cols-[320px_1fr]">
      {/* Sidebar */}
      <div className="flex flex-col border-r">
        <div className="space-y-3 p-4">
          <h1 className="text-lg font-bold">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search messages..." className="pl-9" />
          </div>
          <Tabs defaultValue="all">
            <TabsList className="w-full">
              <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
              <TabsTrigger value="unread" className="flex-1">Unread</TabsTrigger>
              <TabsTrigger value="favorites" className="flex-1">Favorites</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="flex-1 overflow-y-auto">
          {MOCK_RECENT_ACTIVITY.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-accent",
                activeId === c.id && "bg-[var(--brand-red)]/10"
              )}
            >
              <Avatar className="h-10 w-10">
                {c.avatar && <AvatarImage src={c.avatar} alt={c.name} className="object-cover object-top" />}
                <AvatarFallback className="bg-[var(--brand-red)]/15 text-[var(--brand-red)]">
                  {c.name[0]}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{c.name}</p>
                <p className="truncate text-xs text-muted-foreground">{c.message}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-xs text-muted-foreground">{c.time}</span>
                {c.unread > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--brand-red)] px-1.5 text-[11px] font-semibold text-white">
                    {c.unread}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              {active.avatar && <AvatarImage src={active.avatar} alt={active.name} className="object-cover object-top" />}
              <AvatarFallback className="bg-[var(--brand-red)]/15 text-[var(--brand-red)]">
                {active.name[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{active.name}</p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Online
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon"><Phone className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.map((m) => {
            const isMe = m.from === "me";
            return (
              <div key={m.id} className={cn("flex items-end gap-2", isMe ? "justify-end" : "justify-start")}>
                {!isMe && (
                  <Avatar className="h-7 w-7 shrink-0">
                    {active.avatar && <AvatarImage src={active.avatar} alt={active.name} className="object-cover object-top" />}
                    <AvatarFallback className="bg-[var(--brand-red)]/15 text-[var(--brand-red)] text-xs">
                      {active.name[0]}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className="group relative">
                  {m.image && (
                    <button
                      onClick={() => setMessages((prev) => prev.filter((msg) => msg.id !== m.id))}
                      className="absolute -right-2 -top-2 z-10 hidden h-5 w-5 items-center justify-center rounded-full bg-destructive text-white group-hover:flex"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                  <div
                    className={cn(
                      "max-w-[70%] px-4 py-2.5 text-sm",
                      isMe
                        ? "rounded-t-[14px] rounded-bl-[14px] rounded-br-none bg-[var(--brand-red)] text-white"
                        : "rounded-t-[14px] rounded-br-[14px] rounded-bl-none bg-muted text-foreground"
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
                    <div className={cn("mt-1 flex items-center gap-1", isMe ? "justify-end" : "justify-start")}>
                      <p className={cn("text-[10px]", isMe ? "text-white/70" : "text-muted-foreground")}>
                        {m.time}
                      </p>
                      {isMe && <ReadTick status={m.status} />}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Image preview strip */}
        {imagePreview && (
          <div className="relative mx-4 mb-2 w-fit">
            <img src={imagePreview} alt="preview" className="h-24 w-auto rounded-xl border object-cover" />
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
          onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
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
            disabled={!draft.trim() && !imagePreview}
            className="bg-[var(--brand-red)] text-white hover:bg-[var(--brand-red-dark)]"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
