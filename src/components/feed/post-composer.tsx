"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ImagePlus, Loader2, X, Globe, Lock, AlertCircle, CheckCircle2, TrendingDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { sanitizeText } from "@/lib/sanitize";
import { createClient } from "@/lib/supabase/client";
import {
  ACCEPT_ATTR,
  ACCEPTED_FORMAT_LABEL,
  validateImageFile,
  optimizeImage,
  formatBytes,
  type OptimizeResult,
} from "@/lib/image-utils";
import type { FeedAuthor, FeedPost } from "@/types/feed";

const CAPTION_MAX = 500;

type Phase = "idle" | "optimizing" | "ready" | "posting";

interface PostComposerProps {
  currentUser: FeedAuthor;
  currentUserId: string;
  role: string;
  onPost: (post: FeedPost) => void;
}

export function PostComposer({
  currentUser,
  currentUserId,
  role,
  onPost,
}: PostComposerProps) {
  const supabase = useMemo(() => createClient(), []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [phase, setPhase] = useState<Phase>("idle");
  const [optimized, setOptimized] = useState<OptimizeResult | null>(null);
  const [caption, setCaption] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  /* Revoke the preview object URL on unmount or when it changes */
  useEffect(() => {
    return () => {
      if (optimized?.previewUrl) URL.revokeObjectURL(optimized.previewUrl);
    };
  }, [optimized]);

  /* ── File handling ─────────────────────────────────────────── */

  function clearImage() {
    if (optimized?.previewUrl) URL.revokeObjectURL(optimized.previewUrl);
    setOptimized(null);
    setPhase("idle");
    setError(null);
  }

  async function handleFile(file: File) {
    setError(null);

    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError.message);
      return;
    }

    setPhase("optimizing");

    try {
      const result = await optimizeImage(file);
      setOptimized(result);
      setPhase("ready");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to process image.");
      setPhase("idle");
    }
  }

  function onFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  /* ── Submit ────────────────────────────────────────────────── */

  async function submit() {
    if (!optimized || phase !== "ready") return;

    setPhase("posting");
    setError(null);

    try {
      const path = `posts/${currentUserId}/${Date.now()}.jpg`;

      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from("media")
        .upload(path, optimized.blob, {
          contentType: "image/jpeg",
          upsert: false,
        });

      if (uploadErr) throw new Error(`Upload failed: ${uploadErr.message}`);

      const { data: urlData } = supabase.storage
        .from("media")
        .getPublicUrl(uploadData.path);

      const cleanCaption = caption.trim()
        ? sanitizeText(caption.trim())
        : null;

      const postType = role === "club" ? "club" : "user";

      const { data: post, error: insertErr } = await supabase
        .from("posts")
        .insert({
          author_id: currentUserId,
          type: postType,
          image_url: urlData.publicUrl,
          caption: cleanCaption,
          is_public: isPublic,
        })
        .select("*")
        .single();

      if (insertErr || !post) throw new Error(insertErr?.message ?? "Post failed.");

      onPost({
        ...post,
        author: currentUser,
        like_count: 0,
        is_liked_by_me: false,
      });

      /* Reset */
      clearImage();
      setCaption("");
      setIsPublic(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setPhase("ready");
    }
  }

  /* ── Derived values ────────────────────────────────────────── */

  const captionCharsLeft = CAPTION_MAX - caption.length;
  const captionNearLimit = captionCharsLeft <= 50;
  const isPosting = phase === "posting";
  const isOptimizing = phase === "optimizing";
  const hasImage = phase === "ready" || phase === "posting";

  const savingsPct =
    optimized && optimized.originalBytes > 0
      ? Math.round(
          (1 - optimized.optimizedBytes / optimized.originalBytes) * 100
        )
      : 0;

  /* ── Render ────────────────────────────────────────────────── */

  return (
    <div className="rounded-2xl bg-card shadow-sm p-4 space-y-3">

      {/* Author row */}
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9 shrink-0">
          {currentUser.avatar_url && (
            <AvatarImage
              src={currentUser.avatar_url}
              alt={currentUser.display_name}
              className="object-cover object-top"
            />
          )}
          <AvatarFallback className="bg-[var(--brand-red)]/15 text-[var(--brand-red)] text-sm font-semibold">
            {(currentUser.display_name?.[0] ?? "?").toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <p className="text-sm font-medium text-muted-foreground">
          Share a photo
        </p>
      </div>

      {/* ── Image zone ─────────────────────────────────────────── */}

      {phase === "idle" && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-10 text-sm transition-colors",
            dragOver
              ? "border-[var(--brand-red)] bg-[var(--brand-red)]/5 text-[var(--brand-red)]"
              : "border-border text-muted-foreground hover:border-[var(--brand-red)]/40 hover:bg-accent hover:text-foreground"
          )}
        >
          <ImagePlus className="h-6 w-6" />
          <span>{dragOver ? "Drop to add" : "Add a photo"}</span>
          <span className="text-xs opacity-60">{ACCEPTED_FORMAT_LABEL} · max 20 MB</span>
        </button>
      )}

      {phase === "optimizing" && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border py-10 text-sm text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--brand-red)]" />
          <span>Optimizing…</span>
        </div>
      )}

      {(phase === "ready" || phase === "posting") && optimized && (
        <div className="relative">
          <img
            src={optimized.previewUrl}
            alt="Preview"
            className={cn(
              "w-full max-h-72 rounded-xl object-cover transition-opacity",
              isPosting && "opacity-50"
            )}
          />

          {/* Remove button — hidden while posting */}
          {!isPosting && (
            <button
              onClick={clearImage}
              aria-label="Remove image"
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Savings badge */}
          {savingsPct >= 5 && (
            <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[11px] text-white">
              <TrendingDown className="h-3 w-3" />
              {formatBytes(optimized.originalBytes)} →{" "}
              {formatBytes(optimized.optimizedBytes)}{" "}
              <span className="font-semibold text-emerald-400">
                −{savingsPct}%
              </span>
            </div>
          )}

          {/* Uploading overlay */}
          {isPosting && (
            <div className="absolute inset-0 flex items-center justify-center rounded-xl">
              <div className="flex items-center gap-2 rounded-full bg-black/70 px-4 py-2 text-sm text-white">
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading…
              </div>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPT_ATTR}
        className="hidden"
        onChange={onFileInputChange}
      />

      {/* ── Caption ──────────────────────────────────────────────── */}

      {hasImage && (
        <div className="space-y-1">
          <Textarea
            placeholder="Write a caption… (optional)"
            value={caption}
            onChange={(e) => {
              if (e.target.value.length <= CAPTION_MAX) {
                setCaption(e.target.value);
              }
            }}
            disabled={isPosting}
            rows={2}
            className="resize-none text-sm disabled:opacity-50"
          />
          {captionNearLimit && (
            <p
              className={cn(
                "text-right text-xs",
                captionCharsLeft <= 0
                  ? "text-destructive"
                  : "text-muted-foreground"
              )}
            >
              {captionCharsLeft}
            </p>
          )}
        </div>
      )}

      {/* ── Error ────────────────────────────────────────────────── */}

      {error && (
        <div className="flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Controls ─────────────────────────────────────────────── */}

      <div className="flex items-center justify-between gap-3">
        <label
          className={cn(
            "flex cursor-pointer items-center gap-2",
            isPosting && "pointer-events-none opacity-50"
          )}
        >
          <Switch
            checked={isPublic}
            onCheckedChange={setIsPublic}
            disabled={isPosting}
            className="data-[state=checked]:bg-[var(--brand-red)]"
          />
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            {isPublic ? (
              <>
                <Globe className="h-3.5 w-3.5" />
                Public
              </>
            ) : (
              <>
                <Lock className="h-3.5 w-3.5" />
                Connections only
              </>
            )}
          </span>
        </label>

        <Button
          onClick={submit}
          disabled={!hasImage || isPosting || isOptimizing}
          className="bg-[var(--brand-red)] text-white hover:bg-[var(--brand-red-dark)] min-w-20"
        >
          {isPosting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <CheckCircle2 className="mr-1.5 h-4 w-4" />
              Post
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
