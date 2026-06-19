"use client";

import { useState } from "react";
import { Phone, MoreHorizontal, Send, Smile } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ConversationPreviewProps {
  name: string;
  messages: { id: string; from: string; text: string; time: string }[];
}

export function ConversationPreview({ name, messages }: ConversationPreviewProps) {
  const [draft, setDraft] = useState("");

  return (
    <div className="rounded-2xl border-none bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-[var(--brand-red)]/15 text-[var(--brand-red)]">
              {name[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{name}</p>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Online
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8"><Phone className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
        </div>
      </div>

      <div className="space-y-2">
        {messages.map((m) => (
          <div key={m.id} className={cn("flex", m.from === "me" ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-3 py-1.5 text-xs",
                m.from === "me" ? "bg-[var(--brand-red)] text-white" : "bg-muted text-foreground"
              )}
            >
              <p>{m.text}</p>
              <p className={cn("mt-0.5 text-[10px]", m.from === "me" ? "text-white/70" : "text-muted-foreground")}>
                {m.time}
              </p>
            </div>
          </div>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setDraft("");
        }}
        className="mt-4 flex items-center gap-2"
      >
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8"><Smile className="h-4 w-4" /></Button>
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a message..."
          className="h-9 flex-1"
        />
        <Button type="submit" size="icon" className="h-9 w-9 bg-[var(--brand-red)] text-white hover:bg-[var(--brand-red-dark)]">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
