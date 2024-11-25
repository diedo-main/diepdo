import React from "react";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const MarkdownEditor = ({ value, onChange, placeholder }: MarkdownEditorProps) => {
  return (
    <div className="relative">
      <Textarea
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[100px] border-0 resize-none focus-visible:ring-0 px-0 font-mono"
      />
      {value && (
        <div className="mt-2 p-4 border rounded-lg bg-gray-50">
          <ReactMarkdown>{value}</ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export default MarkdownEditor;