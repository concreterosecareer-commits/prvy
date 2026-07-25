"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import {
  Camera, MapPin, Edit3, Check, X, AtSign, Loader2, Trash2,
  Lock, Unlock, MessageSquare, Gift, ImagePlus, Globe, Ruler,
  Star, Users, TrendingUp, Eye, Building2, Mail, Phone, Images,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { StatusDot } from "@/components/dashboard/status-dot";
import { Switch } from "@/components/ui/switch";
import { FollowRequests } from "@/components/follow/follow-requests";
import { PostComposer } from "@/components/feed/post-composer";
import { PostCard } from "@/components/feed/post-card";
import { sanitizeText, sanitizeUsername } from "@/lib/sanitize";
import { formatUsd } from "@/lib/format";
import { CityPicker } from "@/components/locations/city-picker";
import type { FeedAuthor, FeedPost } from "@/types/feed";

const RATES = [
  { label: "Private Chat (1hr)", gems: 500 },
  { label: "Video Call (30min)", gems: 1200 },
  { label: "Custom Content", gems: 800, note: "from" },
  { label: "VIP Experience", gems: 3000 },
];

type MediaItem = { id: string; url: string; created_at: string };

type AvailStatus = "Available" | "Working" | "Offline";

const DB_TO_UI: Record<string, AvailStatus> = {
  active:  "Available",
  working: "Working",
  away:    "Available", // legacy — treat old "away" as Available
  offline: "Offline",
};

const UI_TO_DB: Record<AvailStatus, "active" | "working" | "offline"> = {
  Available: "active",
  Working:   "working",
  Offline:   "offline",
};

const DAYS = [
  { id: 0, label: "Mon" },
  { id: 1, label: "Tue" },
  { id: 2, label: "Wed" },
  { id: 3, label: "Thu" },
  { id: 4, label: "Fri" },
  { id: 5, label: "Sat" },
  { id: 6, label: "Sun" },
];

export default function AccountPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState("patron");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  // Committed profile state
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [height, setHeight] = useState("");
  const [language, setLanguage] = useState("");
  const [address, setAddress] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<AvailStatus>("Available");
  const [workingDays, setWorkingDays] = useState<number[]>([]);
  const [savingDays, setSavingDays] = useState(false);
  const [preferredLocations, setPreferredLocations] = useState<string[]>([]);
  const [savingLocations, setSavingLocations] = useState(false);

  // Stats
  const [patronCount, setPatronCount] = useState(0);
  const [earnings, setEarnings] = useState(0);
  const [views, setViews] = useState(0);
  const [rating, setRating] = useState(0);
  const [responseRate, setResponseRate] = useState(0);
  const [followerCount, setFollowerCount] = useState(0);

  // Draft state (only live while editing === true)
  const [draftName, setDraftName] = useState("");
  const [draftUsername, setDraftUsername] = useState("");
  const [draftBio, setDraftBio] = useState("");
  const [draftLocation, setDraftLocation] = useState("");
  const [draftAddress, setDraftAddress] = useState("");
  const [draftContactEmail, setDraftContactEmail] = useState("");
  const [draftContactPhone, setDraftContactPhone] = useState("");

  // Privacy
  const [isPrivate, setIsPrivate] = useState(false);
  const [savingPrivacy, setSavingPrivacy] = useState(false);

  // Media (non-club)
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);

  // Club posts
  const [clubPosts, setClubPosts] = useState<FeedPost[]>([]);
  const [clubAuthor, setClubAuthor] = useState<FeedAuthor | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const headerInputRef = useRef<HTMLInputElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);

  // ── Load ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setUserId(user.id);

        const [{ data: profile }, { data: userData }, { data: analytics }, { data: mediaData }] =
          await Promise.all([
            supabase
              .from("profiles")
              .select(
                "display_name, username, avatar_url, cover_url, bio, location, height, languages, rating, response_rate, patron_count, earnings_total, is_private, follower_count, address, contact_email, contact_phone, working_days, preferred_locations"
              )
              .eq("id", user.id)
              .single(),
            supabase.from("users").select("status, role").eq("id", user.id).single(),
            supabase.from("analytics_daily").select("profile_views").eq("user_id", user.id),
            supabase
              .from("media")
              .select("id, url, created_at")
              .eq("owner_id", user.id)
              .order("created_at", { ascending: false }),
          ]);

        const userRole = userData?.role ?? "patron";
        setRole(userRole);

        if (profile) {
          setDisplayName(profile.display_name ?? "");
          setUsername(profile.username ?? "");
          setBio(profile.bio ?? "");
          setLocation(profile.location ?? "");
          setHeight(profile.height ?? "");
          setLanguage((profile.languages as string[] | null)?.[0] ?? "English");
          setAddress((profile as Record<string, unknown>).address as string ?? "");
          setContactEmail((profile as Record<string, unknown>).contact_email as string ?? "");
          setContactPhone((profile as Record<string, unknown>).contact_phone as string ?? "");
          setAvatarUrl(profile.avatar_url ?? null);
          setCoverUrl(profile.cover_url ?? null);
          setPatronCount(profile.patron_count ?? 0);
          setEarnings(Number(profile.earnings_total ?? 0));
          setRating(Number(profile.rating ?? 0));
          setResponseRate(Number(profile.response_rate ?? 0));
          setIsPrivate(profile.is_private ?? false);
          setFollowerCount(profile.follower_count ?? 0);

          const author: FeedAuthor = {
            id: user.id,
            display_name: profile.display_name ?? "",
            username: profile.username ?? "",
            avatar_url: profile.avatar_url ?? null,
            is_verified: false,
          };
          setClubAuthor(author);

          // Load club's own posts
          if (userRole === "club") {
            const { data: rawPosts } = await supabase
              .from("posts")
              .select("*")
              .eq("author_id", user.id)
              .order("created_at", { ascending: false })
              .limit(50);

            if (rawPosts && rawPosts.length > 0) {
              const postIds = rawPosts.map((p) => p.id);
              const { data: likes } = await supabase
                .from("post_likes")
                .select("post_id, user_id")
                .in("post_id", postIds);

              const likeMap = (likes ?? []).reduce<
                Record<string, { count: number; likedByMe: boolean }>
              >((acc, l) => {
                if (!acc[l.post_id]) acc[l.post_id] = { count: 0, likedByMe: false };
                acc[l.post_id].count++;
                if (l.user_id === user.id) acc[l.post_id].likedByMe = true;
                return acc;
              }, {});

              setClubPosts(
                rawPosts.map((p) => ({
                  ...p,
                  author,
                  like_count: likeMap[p.id]?.count ?? 0,
                  is_liked_by_me: likeMap[p.id]?.likedByMe ?? false,
                }))
              );
            }
          }
        }

        if (userData?.status) setStatus(DB_TO_UI[userData.status] ?? "Available");
        const wd = (profile as Record<string, unknown>).working_days;
        if (Array.isArray(wd)) setWorkingDays(wd as number[]);
        const pl = (profile as Record<string, unknown>).preferred_locations;
        if (Array.isArray(pl)) setPreferredLocations(pl as string[]);
        if (analytics) setViews(analytics.reduce((sum, row) => sum + (row.profile_views ?? 0), 0));
        if (mediaData) setMediaItems(mediaData);
      } catch (err) {
        console.error("Account page load failed:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── localStorage cache ───────────────────────────────────────────────────
  function cacheProfile(patch: Record<string, string>) {
    if (!userId) return;
    try {
      const key = `prvy_profile_${userId}`;
      const current = JSON.parse(localStorage.getItem(key) ?? "{}");
      localStorage.setItem(key, JSON.stringify({ ...current, ...patch }));
    } catch {}
  }

  // ── Text edit ────────────────────────────────────────────────────────────
  function startEdit() {
    setDraftName(displayName);
    setDraftUsername(username);
    setDraftBio(bio);
    setDraftLocation(location);
    setDraftAddress(address);
    setDraftContactEmail(contactEmail);
    setDraftContactPhone(contactPhone);
    setEditing(true);
  }

  async function saveEdit() {
    if (!userId) return;
    setSaving(true);
    const cleanName     = sanitizeText(draftName);
    const cleanUsername = sanitizeUsername(draftUsername);
    const cleanBio      = sanitizeText(draftBio);
    const cleanLocation = sanitizeText(draftLocation);

    const basePatch = {
      display_name: cleanName,
      username:     cleanUsername,
      bio:          cleanBio,
      location:     cleanLocation,
    };

    const clubPatch = role === "club" ? {
      address:       sanitizeText(draftAddress) || null,
      contact_email: sanitizeText(draftContactEmail) || null,
      contact_phone: sanitizeText(draftContactPhone) || null,
    } : {};

    const { error } = await supabase
      .from("profiles")
      .update({ ...basePatch, ...clubPatch })
      .eq("id", userId);

    if (error) {
      toast.error("Could not save profile: " + error.message);
    } else {
      setDisplayName(cleanName);
      setUsername(cleanUsername);
      setBio(cleanBio);
      setLocation(cleanLocation);
      if (role === "club") {
        setAddress(clubPatch.address ?? "");
        setContactEmail(clubPatch.contact_email ?? "");
        setContactPhone(clubPatch.contact_phone ?? "");
      }
      setEditing(false);
      cacheProfile({ displayName: cleanName, username: cleanUsername });
      router.refresh();
      toast.success("Profile saved!");
    }
    setSaving(false);
  }

  // ── Image uploads ────────────────────────────────────────────────────────
  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${userId}/avatar.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, contentType: file.type });
    if (upErr) { toast.error("Upload failed: " + upErr.message); return; }
    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
    await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", userId);
    setAvatarUrl(publicUrl);
    cacheProfile({ avatarSrc: publicUrl });
    router.refresh();
    toast.success(role === "club" ? "Logo updated!" : "Profile picture updated!");
  }

  async function handleHeaderChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${userId}/cover.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("covers")
      .upload(path, file, { upsert: true, contentType: file.type });
    if (upErr) { toast.error("Upload failed: " + upErr.message); return; }
    const { data: { publicUrl } } = supabase.storage.from("covers").getPublicUrl(path);
    await supabase.from("profiles").update({ cover_url: publicUrl }).eq("id", userId);
    setCoverUrl(publicUrl);
    cacheProfile({ headerSrc: publicUrl });
    router.refresh();
    toast.success("Cover photo updated!");
  }

  // ── Privacy toggle ───────────────────────────────────────────────────────
  async function handlePrivacyChange(next: boolean) {
    if (!userId) return;
    setSavingPrivacy(true);
    const { error } = await supabase.from("profiles").update({ is_private: next }).eq("id", userId);
    if (error) {
      toast.error("Could not update privacy setting");
    } else {
      setIsPrivate(next);
      toast.success(next ? "Profile set to private" : "Profile set to public");
    }
    setSavingPrivacy(false);
  }

  // ── Status toggle ────────────────────────────────────────────────────────
  async function handleStatusChange(next: AvailStatus) {
    if (!userId) return;
    const { error } = await supabase
      .from("users")
      .update({ status: UI_TO_DB[next] })
      .eq("id", userId);
    if (error) { toast.error("Could not update availability"); return; }
    setStatus(next);
  }

  async function toggleWorkingDay(day: number) {
    if (!userId) return;
    const next = workingDays.includes(day)
      ? workingDays.filter((d) => d !== day)
      : [...workingDays, day].sort((a, b) => a - b);
    setWorkingDays(next);
    setSavingDays(true);
    const { error } = await supabase
      .from("profiles")
      .update({ working_days: next.length > 0 ? next : null })
      .eq("id", userId);
    setSavingDays(false);
    if (error) toast.error("Could not save working days");
  }

  // ── Preferred locations ──────────────────────────────────────────────────
  async function handleLocationsChange(cities: string[]) {
    if (!userId) return;
    setPreferredLocations(cities);
    setSavingLocations(true);
    const { error } = await supabase
      .from("profiles")
      .update({ preferred_locations: cities.length > 0 ? cities : null })
      .eq("id", userId);
    setSavingLocations(false);
    if (error) toast.error("Could not save preferred cities");
  }

  // ── Media upload / delete ────────────────────────────────────────────────
  function storagePathFromUrl(url: string): string {
    const marker = "/storage/v1/object/public/media/";
    const idx = url.indexOf(marker);
    return idx >= 0 ? url.slice(idx + marker.length) : "";
  }

  async function handleMediaUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length || !userId) return;
    setUploading(true);
    const inserted: MediaItem[] = [];
    for (const file of files) {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${userId}/media/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("media")
        .upload(path, file, { upsert: false, contentType: file.type });
      if (upErr) { toast.error(`Upload failed: ${file.name}`); continue; }
      const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(path);
      const { data: row, error: dbErr } = await supabase
        .from("media")
        .insert({ owner_id: userId, type: "image", url: publicUrl, is_public: true })
        .select("id, url, created_at")
        .single();
      if (dbErr) { toast.error(`DB insert failed: ${file.name}`); continue; }
      if (row) inserted.push(row);
    }
    setMediaItems((prev) => [...inserted, ...prev]);
    if (inserted.length) toast.success(`${inserted.length} file${inserted.length > 1 ? "s" : ""} uploaded!`);
    setUploading(false);
    e.target.value = "";
  }

  async function handleDeleteMedia(item: MediaItem) {
    const path = storagePathFromUrl(item.url);
    if (path) await supabase.storage.from("media").remove([path]);
    const { error } = await supabase.from("media").delete().eq("id", item.id);
    if (error) { toast.error("Could not delete item"); return; }
    setMediaItems((prev) => prev.filter((m) => m.id !== item.id));
    toast.success("Deleted");
  }

  // ── Render ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--brand-red)]" />
      </div>
    );
  }

  const initials = displayName.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase() || "U";
  const isClub = role === "club";

  // ── Shared header card (cover + avatar + name + username + edit) ──────────
  const headerCard = (
    <Card className="overflow-hidden rounded-2xl border-none p-0 shadow-sm">
      {/* Banner */}
      <div
        className="relative h-36"
        style={{
          background: coverUrl
            ? `url(${coverUrl}) center/cover no-repeat`
            : "linear-gradient(135deg, oklch(0.5 0.22 25 / 70%), oklch(0.16 0.01 25))",
        }}
      >
        <input ref={headerInputRef} type="file" accept="image/*" className="hidden" onChange={handleHeaderChange} />
        <Button
          size="icon" variant="ghost"
          onClick={() => headerInputRef.current?.click()}
          className="absolute right-3 top-3 h-8 w-8 bg-black/40 text-white hover:bg-black/60"
        >
          <Camera className="h-4 w-4" />
        </Button>
      </div>

      {/* Profile row */}
      <div className="flex flex-wrap items-end gap-4 p-6 pt-0">
        <div className="relative -mt-12">
          <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          <Avatar className="h-24 w-24 border-4 border-card">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
            <AvatarFallback className="bg-[var(--brand-red)] text-2xl font-bold text-white">{initials}</AvatarFallback>
          </Avatar>
          <Button
            size="icon"
            onClick={() => avatarInputRef.current?.click()}
            className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-[var(--brand-red)] text-white shadow hover:bg-[var(--brand-red-dark)]"
          >
            <Camera className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="min-w-0 flex-1 pt-3">
          {editing ? (
            <Input value={draftName} onChange={(e) => setDraftName(e.target.value)} className="mb-1 h-8 text-xl font-bold" />
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold">{displayName || "—"}</h1>
              {isClub && (
                <span className="flex items-center gap-1 rounded-full bg-[var(--brand-red)]/10 px-2 py-0.5 text-[11px] font-medium text-[var(--brand-red)]">
                  <Building2 className="h-3 w-3" /> Club
                </span>
              )}
              {!isClub && <StatusDot status={status} />}
            </div>
          )}

          {editing ? (
            <div className="mt-1 flex items-center gap-1">
              <AtSign className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <Input
                value={draftUsername}
                onChange={(e) => setDraftUsername(e.target.value.replace(/[^a-z0-9_]/gi, "").toLowerCase())}
                className="h-7 text-xs" placeholder="your_handle"
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">@{username || "—"}</p>
          )}

          {editing ? (
            <Input value={draftLocation} onChange={(e) => setDraftLocation(e.target.value)} className="mt-2 h-7 text-xs" placeholder={isClub ? "City, State" : "City, State"} />
          ) : (
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" /> {location || "—"}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 pt-3">
          {editing ? (
            <>
              <Button size="sm" onClick={saveEdit} disabled={saving} className="gap-1.5 bg-[var(--brand-red)] text-white hover:bg-[var(--brand-red-dark)]">
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} Save
              </Button>
              <Button size="sm" variant="outline" onClick={() => setEditing(false)} disabled={saving} className="gap-1.5">
                <X className="h-3.5 w-3.5" /> Cancel
              </Button>
            </>
          ) : (
            <Button size="sm" variant="outline" onClick={startEdit} className="gap-1.5">
              <Edit3 className="h-3.5 w-3.5" /> Edit Profile
            </Button>
          )}
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 gap-4 border-t px-6 py-4 sm:grid-cols-4">
        {isClub ? (
          <>
            <div>
              <p className="text-lg font-bold">{followerCount.toLocaleString()}</p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground"><Users className="h-3 w-3" /> Followers</p>
            </div>
            <div>
              <p className="text-lg font-bold">{clubPosts.length}</p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground"><Images className="h-3 w-3" /> Posts</p>
            </div>
            <div>
              <p className="text-lg font-bold">{views.toLocaleString()}</p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground"><Eye className="h-3 w-3" /> Profile Views</p>
            </div>
            <div>
              <p className="text-lg font-bold">Public</p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground"><Building2 className="h-3 w-3" /> Visibility</p>
            </div>
          </>
        ) : (
          <>
            <div>
              <p className="text-lg font-bold">{patronCount}</p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground"><Users className="h-3 w-3" /> Patrons</p>
            </div>
            <div>
              <p className="text-lg font-bold">{formatUsd(earnings)}</p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground"><TrendingUp className="h-3 w-3" /> Lifetime Earnings</p>
            </div>
            <div>
              <p className="text-lg font-bold">{views.toLocaleString()}</p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground"><Eye className="h-3 w-3" /> Profile Views</p>
            </div>
            <div>
              <p className="text-lg font-bold">{rating > 0 ? rating.toFixed(1) : "—"}</p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground"><Star className="h-3 w-3" /> Rating</p>
            </div>
          </>
        )}
      </div>
    </Card>
  );

  // ── Club layout ───────────────────────────────────────────────────────────
  if (isClub) {
    return (
      <div className="space-y-6">
        {headerCard}

        <Tabs defaultValue="info">
          <TabsList>
            <TabsTrigger value="info">Club Info</TabsTrigger>
            <TabsTrigger value="posts">
              Posts {clubPosts.length > 0 && `(${clubPosts.length})`}
            </TabsTrigger>
          </TabsList>

          {/* ── Info tab ─────────────────────────────────────────── */}
          <TabsContent value="info" className="mt-4">
            <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
              {/* Description */}
              <Card className="rounded-2xl border-none p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="font-semibold">Description</h2>
                  {!editing && (
                    <Button size="sm" variant="ghost" onClick={startEdit} className="h-7 gap-1 text-xs">
                      <Edit3 className="h-3 w-3" /> Edit
                    </Button>
                  )}
                </div>
                {editing ? (
                  <Textarea value={draftBio} onChange={(e) => setDraftBio(e.target.value)} rows={4} className="text-sm" />
                ) : (
                  <p className="text-sm text-muted-foreground">{bio || "No description yet."}</p>
                )}
              </Card>

              {/* Contact + Address */}
              <Card className="rounded-2xl border-none p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="font-semibold">Details</h2>
                  {!editing && (
                    <Button size="sm" variant="ghost" onClick={startEdit} className="h-7 gap-1 text-xs">
                      <Edit3 className="h-3 w-3" /> Edit
                    </Button>
                  )}
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                    {editing ? (
                      <Input
                        value={draftAddress}
                        onChange={(e) => setDraftAddress(e.target.value)}
                        className="h-7 text-xs"
                        placeholder="Full address"
                      />
                    ) : (
                      <span>{address || "—"}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4 shrink-0" />
                    {editing ? (
                      <Input
                        value={draftContactEmail}
                        onChange={(e) => setDraftContactEmail(e.target.value)}
                        className="h-7 text-xs"
                        placeholder="contact@club.com"
                        type="email"
                      />
                    ) : (
                      <span>{contactEmail || "—"}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4 shrink-0" />
                    {editing ? (
                      <Input
                        value={draftContactPhone}
                        onChange={(e) => setDraftContactPhone(e.target.value)}
                        className="h-7 text-xs"
                        placeholder="+1 (555) 000-0000"
                        type="tel"
                      />
                    ) : (
                      <span>{contactPhone || "—"}</span>
                    )}
                  </div>
                </div>

                <div className="mt-4 rounded-lg border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                  Club profiles are always public. Private mode is not available.
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* ── Posts tab ────────────────────────────────────────── */}
          <TabsContent value="posts" className="mt-4">
            <div className="max-w-xl space-y-4">
              {clubAuthor && userId && (
                <PostComposer
                  currentUser={clubAuthor}
                  currentUserId={userId}
                  role="club"
                  onPost={(newPost) => setClubPosts((prev) => [newPost, ...prev])}
                />
              )}

              {clubPosts.length === 0 ? (
                <Card className="rounded-2xl border-none p-8 shadow-sm">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <Images className="h-10 w-10 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">
                      No promotional posts yet. Share your first photo above.
                    </p>
                  </div>
                </Card>
              ) : (
                clubPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUserId={userId ?? ""}
                    onDelete={(id) => setClubPosts((prev) => prev.filter((p) => p.id !== id))}
                  />
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // ── Patron / Entertainer layout (original) ────────────────────────────────
  return (
    <div className="space-y-6">
      {headerCard}

      <Tabs defaultValue="about">
        <TabsList>
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="rates">Rates</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
        </TabsList>

        <TabsContent value="about" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
            <Card className="rounded-2xl border-none p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-semibold">Bio</h2>
                {!editing && (
                  <Button size="sm" variant="ghost" onClick={startEdit} className="h-7 gap-1 text-xs">
                    <Edit3 className="h-3 w-3" /> Edit
                  </Button>
                )}
              </div>
              {editing ? (
                <Textarea value={draftBio} onChange={(e) => setDraftBio(e.target.value)} rows={4} className="text-sm" />
              ) : (
                <p className="text-sm text-muted-foreground">{bio || "No bio yet."}</p>
              )}
            </Card>

            <Card className="rounded-2xl border-none p-5 shadow-sm">
              <h2 className="mb-3 font-semibold">Info</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0" />
                  {editing ? (
                    <Input value={draftLocation} onChange={(e) => setDraftLocation(e.target.value)} className="h-7 text-xs" />
                  ) : (
                    location || "—"
                  )}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Globe className="h-4 w-4 shrink-0" /> {language || "—"}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Ruler className="h-4 w-4 shrink-0" /> {height || "—"}
                </div>
              </div>
              <div className="mt-4 border-t pt-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Response Rate</p>
                <div className="flex items-center gap-2">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-[var(--brand-red)]" style={{ width: `${responseRate}%` }} />
                  </div>
                  <span className="text-xs font-semibold">{responseRate > 0 ? `${responseRate}%` : "—"}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Preferred Cities — hidden for clubs (clubs set their own location) */}
          {!isClub && (
            <Card className="rounded-2xl border-none p-5 shadow-sm">
              <div className="mb-3">
                <h2 className="font-semibold">Preferred Cities</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Your feed will prioritize clubs, promotions, and profiles from these cities.
                </p>
              </div>
              <CityPicker
                value={preferredLocations}
                onChange={handleLocationsChange}
                saving={savingLocations}
              />
            </Card>
          )}
        </TabsContent>

        <TabsContent value="media" className="mt-4">
          <Card className="rounded-2xl border-none p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-semibold">My Media</h2>
                <p className="text-xs text-muted-foreground">{mediaItems.length} item{mediaItems.length !== 1 ? "s" : ""}</p>
              </div>
              <div className="flex items-center gap-2">
                {uploading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                <input ref={mediaInputRef} type="file" accept="image/*,video/mp4,video/webm" multiple className="hidden" onChange={handleMediaUpload} />
                <Button size="sm" disabled={uploading} onClick={() => mediaInputRef.current?.click()} className="gap-1.5 bg-[var(--brand-red)] text-white hover:bg-[var(--brand-red-dark)]">
                  <ImagePlus className="h-3.5 w-3.5" />
                  {uploading ? "Uploading…" : "Upload"}
                </Button>
              </div>
            </div>
            {mediaItems.length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-muted-foreground/20">
                <ImagePlus className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No media yet. Upload your first image.</p>
                <Button size="sm" variant="outline" onClick={() => mediaInputRef.current?.click()}>Choose files</Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                {mediaItems.map((item) => (
                  <div key={item.id} className="group relative aspect-square overflow-hidden rounded-xl bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.url} alt="" className="h-full w-full object-cover transition group-hover:brightness-75" />
                    <button
                      onClick={() => handleDeleteMedia(item)}
                      className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition hover:bg-red-600 group-hover:opacity-100"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="rates" className="mt-4">
          <Card className="rounded-2xl border-none p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">My Rates</h2>
              <Button size="sm" variant="outline" className="gap-1.5">
                <Edit3 className="h-3.5 w-3.5" /> Edit Rates
              </Button>
            </div>
            <div className="divide-y">
              {RATES.map((rate) => (
                <div key={rate.label} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">{rate.label}</p>
                    {rate.note && <p className="text-xs text-muted-foreground">{rate.note}</p>}
                  </div>
                  <Badge variant="secondary" className="font-semibold">{rate.gems.toLocaleString()} Gems</Badge>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="availability" className="mt-4">
          <div className="space-y-4">
            {/* Status */}
            <Card className="rounded-2xl border-none p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold">Status</h2>
                <StatusDot status={status} />
              </div>
              <div className="flex flex-wrap gap-2">
                {(["Available", "Working", "Offline"] as const).map((s) => (
                  <Button
                    key={s}
                    size="sm"
                    variant={status === s ? "default" : "outline"}
                    onClick={() => handleStatusChange(s)}
                    className={
                      status === s
                        ? "bg-[var(--brand-red)] text-white hover:bg-[var(--brand-red-dark)]"
                        : ""
                    }
                  >
                    <StatusDot status={s} className="mr-1.5 text-current [&>span:first-child]:shrink-0" />
                    {s}
                  </Button>
                ))}
              </div>
            </Card>

            {/* Working days */}
            <Card className="rounded-2xl border-none p-5 shadow-sm">
              <div className="mb-1 flex items-center justify-between">
                <h2 className="font-semibold">Working Days</h2>
                {savingDays && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                )}
              </div>
              <p className="mb-4 text-xs text-muted-foreground">
                Optional — lets others know when you&apos;re typically active.
              </p>
              <div className="flex flex-wrap gap-2">
                {DAYS.map(({ id, label }) => {
                  const active = workingDays.includes(id);
                  return (
                    <button
                      key={id}
                      disabled={savingDays}
                      onClick={() => toggleWorkingDay(id)}
                      className={
                        active
                          ? "rounded-lg bg-[var(--brand-red)] px-3 py-1.5 text-sm font-semibold text-white transition-colors"
                          : "rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-[var(--brand-red)]/40 hover:text-foreground"
                      }
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              {workingDays.length > 0 && (
                <p className="mt-3 text-xs text-muted-foreground">
                  Schedule: {workingDays.map((d) => DAYS[d]?.label).join(" · ")}
                </p>
              )}
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* ── Privacy ──────────────────────────────────────────────── */}
      <Card className="rounded-2xl border-none p-5 shadow-sm">
        <h2 className="mb-1 font-semibold">Privacy</h2>
        <p className="mb-4 text-xs text-muted-foreground">Control who can see your profile and posts.</p>
        <div className="flex items-center justify-between gap-4 rounded-xl border p-4">
          <div className="flex items-center gap-3">
            {isPrivate ? (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                <Lock className="h-4 w-4 text-muted-foreground" />
              </div>
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--brand-red)]/10">
                <Unlock className="h-4 w-4 text-[var(--brand-red)]" />
              </div>
            )}
            <div>
              <p className="text-sm font-medium">{isPrivate ? "Private account" : "Public account"}</p>
              <p className="text-xs text-muted-foreground">
                {isPrivate ? "Only approved followers can see your posts." : "Anyone can see your posts and follow you."}
              </p>
            </div>
          </div>
          <Switch
            checked={isPrivate}
            disabled={savingPrivacy}
            onCheckedChange={handlePrivacyChange}
            className="data-[state=checked]:bg-[var(--brand-red)]"
          />
        </div>
      </Card>

      {isPrivate && userId && (
        <Card className="rounded-2xl border-none p-5 shadow-sm">
          <h2 className="mb-1 font-semibold">Follow Requests</h2>
          <p className="mb-4 text-xs text-muted-foreground">People who want to follow your private account.</p>
          <FollowRequests currentUserId={userId} />
        </Card>
      )}

      {/* ── Preview ──────────────────────────────────────────────── */}
      <Card className="rounded-2xl border-none p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-semibold">How Patrons See Your Profile</h2>
            <p className="text-xs text-muted-foreground">This is what others see when they visit your page</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" /> Message
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5">
              <Gift className="h-3.5 w-3.5" /> Send Tip
            </Button>
          </div>
        </div>
        <p className="text-sm italic text-muted-foreground">&ldquo;{bio || "No bio yet."}&rdquo;</p>
      </Card>
    </div>
  );
}
