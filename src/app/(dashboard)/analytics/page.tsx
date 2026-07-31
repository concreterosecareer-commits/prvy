import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { EntertainerAnalyticsClient } from "./entertainer-analytics-client";

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userData?.role !== "entertainer") redirect("/feed");

  return <EntertainerAnalyticsClient />;
}
