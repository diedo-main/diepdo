import { Note } from "@/hooks/useNotes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import { format } from "date-fns";
import "katex/dist/katex.min.css";
import "highlight.js/styles/github.css";

interface NoteListProps {
  notes: Note[];
  onEdit: (note: Note) => void;
  onDelete: (noteId: string) => void;
  isLoading?: boolean;
}

const NoteList = ({ notes, onEdit, onDelete, isLoading }: NoteListProps) => {
  if (isLoading) {
    return <div className="text-center">Loading notes...</div>;
  }

  if (!notes.length) {
    return (
      <div className="text-center text-gray-500 mt-8">
        No notes yet. Create your first note above!
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4 animate-fade-in">
      {notes.map((note) => (
        <div
          key={note.id}
          className="flex flex-col md:flex-row items-start justify-between p-6 bg-card hover:bg-accent/5 border rounded-lg shadow-sm transition-colors"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-lg font-semibold text-primary">{note.title}</h2>
              <span className="text-sm text-muted-foreground">
                {format(new Date(note.created_at), "MMM d, yyyy")}
              </span>
            </div>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex, rehypeHighlight]}
              >
                {note.content}
              </ReactMarkdown>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {note.tags.map((tag) => (
                <Badge key={tag.id} variant="secondary">
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0 md:ml-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(note)}
              className="h-8 w-8"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(note.id)}
              className="h-8 w-8 text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NoteList;