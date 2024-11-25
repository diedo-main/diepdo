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
    <div className="relative">
      <Textarea
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[100px] border-0 resize-none focus-visible:ring-0 px-0 font-mono"
      />
      {value && (
        <div className="mt-2 p-4 border rounded-lg bg-gray-50 prose prose-sm max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex, rehypeHighlight]}
          >
            {value}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export default MarkdownEditor;