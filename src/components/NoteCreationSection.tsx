import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import NoteCreationForm from "./NoteCreationForm";
import { useAuth } from "@/contexts/AuthContext";

interface NoteCreationSectionProps {
  onSave: (title: string, content: string, selectedTags: { id: string; name: string; }[]) => Promise<void>;
  editingNoteId: string | null;
  initialContent?: string;
  initialTags?: { id: string; name: string; }[];
  onCancel: () => void;
}

const NoteCreationSection = ({
  onSave,
  editingNoteId,
  initialContent = "",
  initialTags = [],
  onCancel,
}: NoteCreationSectionProps) => {
  const [content, setContent] = useState(initialContent);
  const [selectedTags, setSelectedTags] = useState(initialTags);
  const { toast } = useToast();
  const { session } = useAuth();

  const extractTitleFromContent = (content: string) => {
    const lines = content.split('\n');
    let title = "Untitled";
    let remainingContent = content;

    const titleMatch = lines[0].match(/^#([^\s#].+)$/);
    if (titleMatch) {
      title = titleMatch[1].trim();
      remainingContent = lines.slice(1).join('\n').trim();
    }

    return { title, content: remainingContent };
  };

  const handleSave = async () => {
    if (!session?.user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save notes",
        variant: "destructive",
      });
      return;
    }

    const { title, content: processedContent } = extractTitleFromContent(content);

    if (!processedContent.trim()) {
      toast({
        title: "Note content is required",
        variant: "destructive",
      });
      return;
    }

    try {
      await onSave(title, processedContent, selectedTags);
      setContent("");
      setSelectedTags([]);
    } catch (error) {
      console.error("Error saving note:", error);
      toast({
        title: `Failed to ${editingNoteId ? 'update' : 'save'} note`,
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <NoteCreationForm
      content={content}
      onContentChange={setContent}
      onSave={handleSave}
      isEditing={!!editingNoteId}
      onCancel={onCancel}
    />
  );
};

export default NoteCreationSection;