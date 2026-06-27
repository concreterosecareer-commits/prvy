import { createClient } from "@/lib/supabase/server";
import { ConnectionsClient } from "./connections-client";

export default async function ConnectionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user!.id)
    .single();

  const isDancer = userData?.role === "entertainer";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {isDancer ? "My Patrons" : "Discover Entertainers"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isDancer
            ? "Manage your patron relationships and review incoming invitations."
            : "Browse entertainers, sort by earnings or activity, and connect privately."}
        </p>
      </div>

      <ConnectionsClient isDancer={isDancer} />
    </div>
  );
}
