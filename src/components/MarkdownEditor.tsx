import React from "react";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import "katex/dist/katex.min.css";
import "highlight.js/styles/github.css";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const MarkdownEditor = ({ value, onChange, placeholder }: MarkdownEditorProps) => {
  return (
    <div className="relative space-y-4">
      <Textarea
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[200px] border resize-none focus-visible:ring-1 px-3 font-mono"
      />
      <div className="p-4 border rounded-lg bg-gray-50 prose prose-sm max-w-none min-h-[200px]">
        {value ? (
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex, rehypeHighlight]}
          >
            {value}
          </ReactMarkdown>
        ) : (
          <p className="text-gray-400 italic">Preview will appear here...</p>
        )}
      </div>
    </div>
  );
};

export default MarkdownEditor;