import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";

// Mock data for entries on specific dates
const entryDates = [
  new Date(2024, 11, 15),
  new Date(2024, 11, 18),
  new Date(2024, 11, 22),
  new Date(2024, 11, 25),
  new Date(2024, 11, 26),
];

export function EntryCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const isDayWithEntry = (day: Date) => {
    return entryDates.some(entryDate => 
      entryDate.toDateString() === day.toDateString()
    );
  };

  return (
    <div className="bg-sidebar-accent rounded-lg p-3">
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-md"
        modifiers={{
          hasEntry: isDayWithEntry,
        }}
        modifiersStyles={{
          hasEntry: {
            backgroundColor: 'hsl(var(--sidebar-primary))',
            color: 'hsl(var(--sidebar-primary-foreground))',
            borderRadius: '4px',
            fontWeight: '600',
          },
        }}
      />
      <div className="mt-2 text-xs text-sidebar-foreground/60 px-1">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-sidebar-primary"></div>
          <span>Days with entries</span>
        </div>
      </div>
    </div>
  );
}