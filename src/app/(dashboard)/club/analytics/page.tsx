import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ClubAnalyticsClient } from "./club-analytics-client";
import { AnalyticsSubNav } from "@/components/dashboard/analytics-subnav";

export default async function ClubAnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userData?.role !== "club") redirect("/feed");

  return (
    <>
      <AnalyticsSubNav role="club" />
      <ClubAnalyticsClient />
    </>
  );
}
