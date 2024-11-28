import { Note } from "@/hooks/useNotes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bookmark, MoreVertical, Pencil, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import { format } from "date-fns";
import "katex/dist/katex.min.css";
import "highlight.js/styles/github.css";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NoteListProps {
  notes: Note[];
  onEdit: (note: Note) => void;
  onDelete: (noteId: string) => void;
  isLoading?: boolean;
}

const NoteList = ({ notes, onEdit, onDelete, isLoading }: NoteListProps) => {
  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading notes...</div>;
  }

  if (!notes.length) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No notes yet. Create your first note above!
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {notes.map((note) => (
        <div
          key={note.id}
          className="group bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
        >
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-gray-900">{note.title}</h2>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(note.created_at), "MMM d, yyyy")}
                </span>
              </div>
              
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-500 hover:text-gray-700"
                >
                  <Bookmark className="h-4 w-4" />
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-500 hover:text-gray-700"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(note)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(note.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="prose prose-sm max-w-none text-gray-600">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex, rehypeHighlight]}
              >
                {note.content}
              </ReactMarkdown>
            </div>

            {note.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {note.tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="secondary"
                    className="bg-gray-100 text-gray-600 hover:bg-gray-200"
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default NoteList;