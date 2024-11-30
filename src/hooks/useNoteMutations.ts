import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Note, UpdateNoteInput } from "@/types/note.types";

export function useNoteMutations() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  const togglePin = useMutation({
    mutationFn: async (noteId: string) => {
      if (!session?.user) throw new Error("Not authenticated");

      const { data: currentNote, error: fetchError } = await supabase
        .from("notes")
        .select("pinned")
        .eq('id', noteId)
        .single();

      if (fetchError) throw fetchError;

      const { error: updateError } = await supabase
        .from("notes")
        .update({ pinned: !currentNote.pinned })
        .eq('id', noteId)
        .eq('user_id', session.user.id);

      if (updateError) throw updateError;

      return { id: noteId, pinned: !currentNote.pinned };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  const createNote = useMutation({
    mutationFn: async (note: Omit<Note, 'id' | 'created_at' | 'pinned'>) => {
      if (!session?.user) throw new Error("Not authenticated");

      const { data: noteData, error: noteError } = await supabase
        .from("notes")
        .insert({
          title: note.title,
          content: note.content,
          user_id: session.user.id,
        })
        .select()
        .single();

      if (noteError) throw noteError;

      if (note.tags.length > 0) {
        const noteTags = note.tags.map((tag) => ({
          note_id: noteData.id,
          tag_id: tag.id,
        }));

        const { error: tagError } = await supabase
          .from("notes_tags")
          .insert(noteTags);

        if (tagError) throw tagError;
      }

      return noteData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  const updateNote = useMutation({
    mutationFn: async (note: UpdateNoteInput) => {
      if (!session?.user) throw new Error("Not authenticated");

      const { error: noteError } = await supabase
        .from("notes")
        .update({
          title: note.title,
          content: note.content,
        })
        .eq('id', note.id)
        .eq('user_id', session.user.id);

      if (noteError) throw noteError;

      const { error: deleteTagsError } = await supabase
        .from("notes_tags")
        .delete()
        .eq('note_id', note.id);

      if (deleteTagsError) throw deleteTagsError;

      if (note.tags.length > 0) {
        const noteTags = note.tags.map((tag) => ({
          note_id: note.id,
          tag_id: tag.id,
        }));

        const { error: tagError } = await supabase
          .from("notes_tags")
          .insert(noteTags);

        if (tagError) throw tagError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  const deleteNote = useMutation({
    mutationFn: async (noteId: string) => {
      if (!session?.user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("notes")
        .delete()
        .eq('id', noteId)
        .eq('user_id', session.user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  return {
    createNote,
    updateNote,
    deleteNote,
    togglePin,
  };
}