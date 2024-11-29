import { Button } from "@/components/ui/button";
import MarkdownEditor from "./MarkdownEditor";

interface NoteCreationFormProps {
  content: string;
  onContentChange: (content: string) => void;
  onSave: () => void;
  isEditing?: boolean;
  onCancel?: () => void;
}

const NoteCreationForm = ({
  content,
  onContentChange,
  onSave,
  isEditing = false,
  onCancel,
}: NoteCreationFormProps) => {
  return (
    <div className="space-y-4 mb-8 animate-fade-in">
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <div className="space-y-4">
            <MarkdownEditor
              value={content}
              onChange={onContentChange}
              placeholder="Start with # to create a title, then write your note content..."
            />
            <div className="hidden preview prose prose-sm max-w-none">
              {/* Preview content will be shown here when unhidden */}
            </div>
          </div>
          <div className="flex gap-2 justify-end mt-4">
            {isEditing && onCancel && (
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button onClick={onSave}>
              {isEditing ? 'Update Note' : 'Create Note'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteCreationForm;