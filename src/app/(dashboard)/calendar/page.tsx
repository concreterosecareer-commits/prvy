import { createClient } from "@/lib/supabase/server";
import { CalendarView } from "@/components/dashboard/calendar-view";

export default async function CalendarPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("working_days")
    .eq("id", user!.id)
    .single();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Calendar</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your schedule, working days, and upcoming appointments.
        </p>
      </div>

      <CalendarView workingDays={profile?.working_days ?? []} />
    </div>
  );
}
