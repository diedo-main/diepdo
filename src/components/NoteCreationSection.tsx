import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MarkdownEditor from "./MarkdownEditor";
import { useToast } from "@/components/ui/use-toast";
import { useNotes } from "@/hooks/useNotes";

interface NoteCreationSectionProps {
  onSave: (title: string, content: string, tags: { id: string; name: string; }[]) => Promise<void>;
  editingNoteId: string | null;
  onCancel: () => void;
}

const NoteCreationSection = ({ onSave, editingNoteId, onCancel }: NoteCreationSectionProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { notesQuery } = useNotes();

  // Effect to populate form when editing
  useEffect(() => {
    if (editingNoteId && notesQuery.data) {
      const noteToEdit = notesQuery.data.pages
        .flatMap(page => page.notes)
        .find(note => note.id === editingNoteId);

      if (noteToEdit) {
        console.log("Populating form with note:", noteToEdit);
        setTitle(noteToEdit.title);
        setContent(noteToEdit.content || "");
      }
    } else {
      // Reset form when not editing
      setTitle("");
      setContent("");
    }
  }, [editingNoteId, notesQuery.data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Title is required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(title.trim(), content.trim(), []);
      if (!editingNoteId) {
        setTitle("");
        setContent("");
      }
      toast({
        title: `Note ${editingNoteId ? "updated" : "created"} successfully`,
      });
    } catch (error) {
      console.error("Error saving note:", error);
      toast({
        title: `Failed to ${editingNoteId ? "update" : "create"} note`,
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-8">
      <Input
        type="text"
        placeholder="Note title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <MarkdownEditor
        value={content}
        onChange={setContent}
        placeholder="Write your note content here..."
      />
      <div className="flex justify-end gap-2">
        {editingNoteId && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
            : editingNoteId
            ? "Update Note"
            : "Create Note"}
        </Button>
      </div>
    </form>
  );
};

export default NoteCreationSection;