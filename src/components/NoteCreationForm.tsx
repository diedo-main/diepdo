import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link2, Hash, Bold, Italic, Paperclip } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import MarkdownEditor from "./MarkdownEditor";

interface NoteCreationFormProps {
  title: string;
  content: string;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onSave: () => void;
}

const NoteCreationForm = ({
  title,
  content,
  onTitleChange,
  onContentChange,
  onSave,
}: NoteCreationFormProps) => {
  return (
    <div className="mb-8 bg-white rounded-lg shadow-sm border p-4">
      <div className="space-y-4">
        <Input
          placeholder="Title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="border-0 text-lg font-medium focus-visible:ring-0 px-0"
        />
        <MarkdownEditor
          value={content}
          onChange={onContentChange}
          placeholder="Any thoughts... (Supports markdown: # for headings, ** for bold, _ for italic)"
        />
        <div className="flex items-center gap-2 border-t pt-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Hash className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add tags</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Bold className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Format text</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Paperclip className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Attach files</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Link2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add link</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className="ml-auto">
            <Button onClick={onSave} className="bg-[#7DD1C1] hover:bg-[#6BC1B1] text-white">
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteCreationForm;