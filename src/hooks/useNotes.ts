import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const NOTES_PER_PAGE = 12;

export interface Tag {
  id: string;
  name: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  tags: Tag[];
}

export interface UpdateNoteInput {
  id: string;
  title: string;
  content: string;
  tags: Tag[];
}

export function useNotes() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  const fetchNotes = async ({ pageParam = 0 }) => {
    if (!session?.user) throw new Error("Not authenticated");

    const { data, error, count } = await supabase
      .from("notes")
      .select(`
        id,
        title,
        content,
        created_at,
        notes_tags(
          tag_id,
          tags(
            id,
            name
          )
        )
      `, { count: 'exact' })
      .eq('user_id', session.user.id)
      .range(pageParam * NOTES_PER_PAGE, (pageParam + 1) * NOTES_PER_PAGE - 1)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const notesWithTags = data.map((note: any) => ({
      ...note,
      tags: note.notes_tags.map((nt: any) => nt.tags),
    }));

    return {
      notes: notesWithTags,
      nextPage: data.length === NOTES_PER_PAGE ? pageParam + 1 : undefined,
      totalCount: count,
    };
  };

  const notesQuery = useInfiniteQuery({
    queryKey: ['notes', session?.user?.id],
    queryFn: fetchNotes,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: !!session?.user,
  });

  const createNote = useMutation({
    mutationFn: async (note: Omit<Note, 'id' | 'created_at'>) => {
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
    notesQuery,
    createNote,
    updateNote,
    deleteNote,
  };
}