import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNoteMutations } from "./useNoteMutations";
import type { Note } from "@/types/note.types";

const NOTES_PER_PAGE = 12;

export type { Note } from "@/types/note.types";
export type { Tag } from "@/types/note.types";
export type { UpdateNoteInput } from "@/types/note.types";

export function useNotes() {
  const { session } = useAuth();
  const mutations = useNoteMutations();

  const fetchNotes = async ({ pageParam = 0 }) => {
    if (!session?.user) throw new Error("Not authenticated");

    const { data, error, count } = await supabase
      .from("notes")
      .select(`
        id,
        title,
        content,
        created_at,
        pinned,
        notes_tags(
          tag_id,
          tags(
            id,
            name
          )
        )
      `, { count: 'exact' })
      .eq('user_id', session.user.id)
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .range(pageParam * NOTES_PER_PAGE, (pageParam + 1) * NOTES_PER_PAGE - 1);

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

  return {
    notesQuery,
    ...mutations,
  };
}