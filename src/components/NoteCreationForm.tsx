import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface NoteCreationFormProps {
  title: string;
  content: string;
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
  onSave: () => void;
  isEditing?: boolean;
  onCancel?: () => void;
}

const NoteCreationForm = ({
  title,
  content,
  onTitleChange,
  onContentChange,
  onSave,
  isEditing = false,
  onCancel,
}: NoteCreationFormProps) => {
  return (
    <div className="space-y-4 mb-8">
      <Input
        placeholder="Note title"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
      />
      <Textarea
        placeholder="Note content (supports Markdown)"
        value={content}
        onChange={(e) => onContentChange(e.target.value)}
        className="min-h-[200px]"
      />
      <div className="flex gap-2 justify-end">
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
  );
};

export default NoteCreationForm;