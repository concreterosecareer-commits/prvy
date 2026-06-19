import { createClient } from "@/lib/supabase/server";
import { DancersClient } from "./dancers-client";

export default async function DancersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isDancer = false;
  if (user) {
    const { data } = await supabase.from("users").select("role").eq("id", user.id).single();
    isDancer = data?.role === "entertainer";
  }

  return <DancersClient isDancer={isDancer} />;
}
