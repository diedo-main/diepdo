import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useNotes } from "@/hooks/useNotes";
import { format } from "date-fns";

const CalendarView = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [daysWithNotes, setDaysWithNotes] = useState<Set<string>>(new Set());
  const { notesQuery } = useNotes();

  useEffect(() => {
    if (notesQuery.data?.pages) {
      const noteDates = new Set<string>();
      notesQuery.data.pages.forEach(page => {
        page.notes.forEach(note => {
          if (note.created_at) {
            const dateStr = format(new Date(note.created_at), 'yyyy-MM-dd');
            noteDates.add(dateStr);
          }
        });
      });
      console.log('Days with notes:', Array.from(noteDates));
      setDaysWithNotes(noteDates);
    }
  }, [notesQuery.data]);

  const modifiers = {
    hasNotes: (date: Date) => {
      const dateStr = format(date, 'yyyy-MM-dd');
      return daysWithNotes.has(dateStr);
    },
  };

  const modifiersStyles = {
    hasNotes: {
      backgroundColor: 'rgb(134 239 172)', // Tailwind's green-300
      color: 'rgb(21 128 61)', // Tailwind's green-700
      fontWeight: 'bold',
    },
  };

  return (
    <Card className="w-full max-w-sm mx-auto bg-white shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md"
          modifiers={modifiers}
          modifiersStyles={modifiersStyles}
        />
      </CardContent>
    </Card>
  );
};

export default CalendarView;