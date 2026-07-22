import { common, createLowlight } from "lowlight";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { MermaidCodeBlock } from "@/components/MermaidCodeBlock";

export const codeBlockLowlight = createLowlight(common);

export const EdgeEverCodeBlock = CodeBlockLowlight.extend({
  addNodeView() {
    return ReactNodeViewRenderer(MermaidCodeBlock);
  },
});

export const CODE_BLOCK_LANGUAGES = [
  { value: "plaintext", label: "Plain text" },
  { value: "bash", label: "Bash" },
  { value: "css", label: "CSS" },
  { value: "html", label: "HTML" },
  { value: "javascript", label: "JavaScript" },
  { value: "json", label: "JSON" },
  { value: "markdown", label: "Markdown" },
  { value: "mermaid", label: "Mermaid" },
  { value: "python", label: "Python" },
  { value: "sql", label: "SQL" },
  { value: "typescript", label: "TypeScript" },
] as const;

export const getCodeBlockLanguageValue = (language: unknown) => {
  if (typeof language !== "string" || !language) {
    return "plaintext";
  }

  return CODE_BLOCK_LANGUAGES.some((option) => option.value === language) ? language : "plaintext";
};
