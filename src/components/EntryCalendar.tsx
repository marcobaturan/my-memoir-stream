/**
 * EntryCalendar Component - Interactive Activity Calendar
 * 
 * Displays a calendar showing days with journal entries and allows
 * date-based filtering of entries. Features include:
 * - Visual indicators for days with entries
 * - Real-time data integration with Supabase
 * - Date selection for filtering entries
 * - Responsive design
 * 
 * @component
 * @author Lifelogger Team
 * @version 1.0.0
 */

import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { useEntries } from "@/hooks/useEntries";

/**
 * Props interface for the EntryCalendar component
 */
interface EntryCalendarProps {
  /** Optional callback when a date is selected */
  onDateSelect?: (date: Date) => void;
  /** Currently selected date */
  selectedDate?: Date;
}

/**
 * EntryCalendar Component Implementation
 */
export function EntryCalendar({ onDateSelect, selectedDate }: EntryCalendarProps) {
  const [date, setDate] = useState<Date | undefined>(selectedDate || new Date());
  const { entries } = useEntries(100); // Load more entries for calendar
  const [entryDates, setEntryDates] = useState<Date[]>([]);

  /**
   * Extract dates from entries for calendar highlighting
   */
  useEffect(() => {
    if (entries.length > 0) {
      const dates = entries.map(entry => new Date(entry.entry_date));
      setEntryDates(dates);
    }
  }, [entries]);

  /**
   * Checks if a given day has entries
   */
  const isDayWithEntry = (day: Date) => {
    return entryDates.some(entryDate => 
      entryDate.toDateString() === day.toDateString()
    );
  };

  /**
   * Handles date selection
   */
  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate && onDateSelect) {
      onDateSelect(selectedDate);
    }
  };

  return (
    <div className="bg-sidebar-accent rounded-lg p-3">
      <Calendar
        mode="single"
        selected={date}
        onSelect={handleDateSelect}
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