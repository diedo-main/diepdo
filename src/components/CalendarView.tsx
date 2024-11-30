import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useNotes } from "@/hooks/useNotes";
import { format } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";

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
            const zonedDate = utcToZonedTime(new Date(note.created_at), 'Asia/Ho_Chi_Minh');
            const dateStr = format(zonedDate, 'yyyy-MM-dd');
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
      backgroundColor: '#00BFA5',
      color: 'white',
      fontWeight: 'bold',
      borderRadius: '50%',
    },
  };

  const formatVietnameseMonth = (date: Date) => {
    return `Tháng ${format(date, 'MM yyyy')}`;
  };

  return (
    <Card className="w-full max-w-sm mx-auto bg-white shadow-sm border border-gray-100">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium text-gray-900">
          {formatVietnameseMonth(date || new Date())}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md"
          modifiers={modifiers}
          modifiersStyles={modifiersStyles}
          classNames={{
            months: "space-y-4",
            month: "space-y-4",
            caption: "flex justify-center pt-1 relative items-center",
            caption_label: "text-sm font-medium",
            nav: "space-x-1 flex items-center",
            nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
            nav_button_previous: "absolute left-1",
            nav_button_next: "absolute right-1",
            table: "w-full border-collapse space-y-1",
            head_row: "flex",
            head_cell: "text-gray-500 rounded-md w-9 font-normal text-[0.8rem]",
            row: "flex w-full mt-2",
            cell: "text-center text-sm relative p-0 rounded-md focus-within:relative focus-within:z-20",
            day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-gray-100 rounded-full",
            day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
            day_today: "bg-gray-100 text-gray-900",
            day_outside: "text-gray-400 opacity-50",
            day_disabled: "text-gray-400 opacity-50",
            day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
            day_hidden: "invisible",
          }}
        />
      </CardContent>
    </Card>
  );
};

export default CalendarView;