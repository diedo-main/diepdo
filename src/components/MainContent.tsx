import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useInView } from "react-intersection-observer";
import { useNotes } from "@/hooks/useNotes";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import NoteCreationSection from "./NoteCreationSection";
import NoteList from "./NoteList";
import NoteSearch from "./NoteSearch";
import { useNoteSearch } from "@/hooks/useNoteSearch";

const MainContent = () => {
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const { ref, inView } = useInView();
  const { session, loading: authLoading } = useAuth();
  const [availableTags, setAvailableTags] = useState<{ id: string; name: string; }[]>([]);
  const { notesQuery, createNote, updateNote, deleteNote } = useNotes();

  const allNotes = notesQuery.data?.pages.flatMap(page => page.notes) || [];
  const filteredNotes = useNoteSearch(allNotes, searchQuery);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        if (!session?.user) {
          console.log("No active session, skipping tag fetch");
          return;
        }

        console.log("Fetching tags for user:", session.user.id);
        const { data: tags, error } = await supabase
          .from("tags")
          .select("id, name")
          .eq('user_id', session.user.id);
        
        if (error) {
          console.error("Error fetching tags:", error);
          toast({
            title: "Error fetching tags",
            description: error.message,
            variant: "destructive",
          });
          return;
        }

        console.log("Tags fetched successfully:", tags);
        setAvailableTags(tags || []);
      } catch (error) {
        console.error("Unexpected error fetching tags:", error);
        toast({
          title: "Error fetching tags",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      }
    };

    fetchTags();
  }, [session?.user, toast]);

  useEffect(() => {
    if (inView && notesQuery.hasNextPage && !notesQuery.isFetchingNextPage) {
      notesQuery.fetchNextPage();
    }
  }, [inView, notesQuery]);

  const handleSave = async (title: string, content: string, tags: { id: string; name: string; }[]) => {
    if (editingNoteId) {
      await updateNote.mutateAsync({
        id: editingNoteId,
        title,
        content,
        tags,
      });
      toast({ title: "Note updated successfully" });
    } else {
      await createNote.mutateAsync({
        title,
        content,
        tags,
      });
      toast({ title: "Note created successfully" });
    }
  };

  const handleEdit = (note: { id: string; title: string; content: string; tags: { id: string; name: string; }[] }) => {
    setEditingNoteId(note.id);
  };

  const handleDelete = async (noteId: string) => {
    try {
      await deleteNote.mutateAsync(noteId);
      toast({ title: "Note deleted successfully" });
    } catch (error) {
      console.error("Error deleting note:", error);
      toast({
        title: "Failed to delete note",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  if (authLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!session) {
    return (
      <div className="max-w-md mx-auto p-8">
        <Auth 
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          theme="light"
        />
      </div>
    );
  }

  return (
    <div className="p-8 animate-fade-in">
      <div className="max-w-5xl mx-auto">
        <NoteCreationSection
          onSave={handleSave}
          editingNoteId={editingNoteId}
          onCancel={() => setEditingNoteId(null)}
        />

        <NoteSearch
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {notesQuery.status === "error" ? (
          <div className="text-center text-red-500">
            Error loading notes: {notesQuery.error instanceof Error ? notesQuery.error.message : "Unknown error"}
          </div>
        ) : (
          <>
            <NoteList
              notes={filteredNotes}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isLoading={notesQuery.status === "pending"}
            />
            <div ref={ref} className="h-8" />
            {notesQuery.isFetchingNextPage && (
              <div className="text-center mt-4">Loading more notes...</div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MainContent;