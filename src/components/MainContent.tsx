import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import NoteCard from "./NoteCard";
import { useInView } from "react-intersection-observer";
import { useNotes, type Note } from "@/hooks/useNotes";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import NoteCreationForm from "./NoteCreationForm";

const MainContent = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedTags, setSelectedTags] = useState<{ id: string; name: string; }[]>([]);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const { toast } = useToast();
  const { ref, inView } = useInView();
  const { session, loading: authLoading } = useAuth();

  const [availableTags, setAvailableTags] = useState<{ id: string; name: string; }[]>([]);
  const { notesQuery, createNote, updateNote, deleteNote } = useNotes();

  useEffect(() => {
    const fetchTags = async () => {
      if (!session?.user) return;

      const { data: tags, error } = await supabase
        .from("tags")
        .select("id, name")
        .eq('user_id', session.user.id);
      
      if (error) {
        console.error("Error fetching tags:", error);
        return;
      }

      setAvailableTags(tags);
    };

    fetchTags();
  }, [session?.user]);

  useEffect(() => {
    if (inView && notesQuery.hasNextPage && !notesQuery.isFetchingNextPage) {
      notesQuery.fetchNextPage();
    }
  }, [inView, notesQuery.hasNextPage, notesQuery.isFetchingNextPage, notesQuery.fetchNextPage]);

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        title: "Title is required",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingNoteId) {
        await updateNote.mutateAsync({
          id: editingNoteId,
          title: title.trim(),
          content: content.trim(),
          tags: selectedTags,
        } as UpdateNoteInput);
        toast({ title: "Note updated successfully" });
      } else {
        await createNote.mutateAsync({
          title: title.trim(),
          content: content.trim(),
          tags: selectedTags,
        });
        toast({ title: "Note created successfully" });
      }
      
      // Reset form
      setTitle("");
      setContent("");
      setSelectedTags([]);
      setEditingNoteId(null);
    } catch (error) {
      console.error("Error saving note:", error);
      toast({
        title: `Failed to ${editingNoteId ? 'update' : 'save'} note`,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (note: Note) => {
    setEditingNoteId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setSelectedTags(note.tags);
  };

  const handleDelete = async (noteId: string) => {
    try {
      await deleteNote.mutateAsync(noteId);
      toast({ title: "Note deleted successfully" });
    } catch (error) {
      console.error("Error deleting note:", error);
      toast({
        title: "Failed to delete note",
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
      <div className="max-w-7xl mx-auto">
        <NoteCreationForm
          title={title}
          content={content}
          onTitleChange={setTitle}
          onContentChange={setContent}
          onSave={handleSave}
          isEditing={!!editingNoteId}
          onCancel={() => {
            setTitle("");
            setContent("");
            setSelectedTags([]);
            setEditingNoteId(null);
          }}
        />

        {/* Notes List */}
        {notesQuery.status === "pending" ? (
          <div className="text-center">Loading notes...</div>
        ) : notesQuery.status === "error" ? (
          <div className="text-center text-red-500">Error loading notes</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {notesQuery.data.pages.map((page) => (
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