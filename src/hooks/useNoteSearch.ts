import { useMemo } from "react";
import { Note } from "@/hooks/useNotes";

export const useNoteSearch = (notes: Note[], searchQuery: string) => {
  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;

    const query = searchQuery.toLowerCase();
    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query)
    );
  }, [notes, searchQuery]);

  return filteredNotes;
};