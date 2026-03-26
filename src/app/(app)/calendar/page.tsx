import { getCalendarEvents, detectConflicts } from "@/lib/actions/calendar";
import { EventCalendar } from "@/components/calendar/event-calendar";

export default async function CalendarPage() {
  const events = await getCalendarEvents();
  const conflicts = await detectConflicts(events);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Event Portfolio</h2>
        <p className="text-sm text-muted-foreground">
          Timeline view of all proposed events. Spot conflicts, gaps, and
          density issues across your portfolio.
        </p>
      </div>
      <EventCalendar events={events} conflicts={conflicts} />
    </div>
  );
}
