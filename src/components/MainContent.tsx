import { useState, useEffect } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import NoteCard from "./NoteCard";
import NoteEditor from "./NoteEditor";
import { useInView } from "react-intersection-observer";

interface Tag {
  id: string;
  name: string;
}

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  tags: Tag[];
}

const NOTES_PER_PAGE = 12;

const MainContent = () => {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | undefined>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { ref, inView } = useInView();

  const [availableTags, setAvailableTags] = useState<Tag[]>([]);

  useEffect(() => {
    const fetchTags = async () => {
      const { data: tags, error } = await supabase
        .from("tags")
        .select("id, name");
      
      if (error) {
        console.error("Error fetching tags:", error);
        return;
      }

      setAvailableTags(tags);
    };

    fetchTags();
  }, []);

  const fetchNotes = async ({ pageParam = 0 }) => {
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

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['notes'],
    queryFn: fetchNotes,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const createNoteMutation = useMutation({
    mutationFn: async (note: Omit<Note, 'id' | 'created_at'>) => {
      const { data: noteData, error: noteError } = await supabase
        .from("notes")
        .insert({
          title: note.title,
          content: note.content,
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
      toast({ title: "Note created successfully" });
    },
    onError: (error) => {
      console.error("Error creating note:", error);
      toast({
        title: "Failed to create note",
        variant: "destructive",
      });
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: async (note: Note) => {
      const { error: noteError } = await supabase
        .from("notes")
        .update({
          title: note.title,
          content: note.content,
        })
        .eq('id', note.id);

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
      toast({ title: "Note updated successfully" });
    },
    onError: (error) => {
      console.error("Error updating note:", error);
      toast({
        title: "Failed to update note",
        variant: "destructive",
      });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      const { error } = await supabase
        .from("notes")
        .delete()
        .eq('id', noteId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast({ title: "Note deleted successfully" });
    },
    onError: (error) => {
      console.error("Error deleting note:", error);
      toast({
        title: "Failed to delete note",
        variant: "destructive",
      });
    },
  });

  const handleSave = async (note: Note) => {
    if (note.id) {
      await updateNoteMutation.mutateAsync(note);
    } else {
      await createNoteMutation.mutateAsync(note);
    }
    setIsEditorOpen(false);
    setEditingNote(undefined);
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setIsEditorOpen(true);
  };

  const handleDelete = async (noteId: string) => {
    await deleteNoteMutation.mutateAsync(noteId);
  };

  return (
    <div className="p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-memos-dark">My Notes</h1>
          <Button
            onClick={() => {
              setEditingNote(undefined);
              setIsEditorOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Note
          </Button>
        </div>

        {status === "pending" ? (
          <div className="text-center">Loading notes...</div>
        ) : status === "error" ? (
          <div className="text-center text-red-500">Error loading notes</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.pages.map((page, i) => (
                page.notes.map((note: Note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))
              ))}
            </div>
            <div ref={ref} className="h-8" />
            {isFetchingNextPage && (
              <div className="text-center mt-4">Loading more notes...</div>
            )}
          </>
        )}

        <NoteEditor
          note={editingNote}
          isOpen={isEditorOpen}
          onClose={() => {
            setIsEditorOpen(false);
            setEditingNote(undefined);
          }}
          onSave={handleSave}
          availableTags={availableTags}
        />
      </div>
    </div>
  );
};

export default MainContent;