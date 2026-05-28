"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, Italic, List, ListOrdered } from "lucide-react";
import { useEffect } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

function ToolbarButton({
  onClick,
  active,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  // A11Y-019 (audit_accessibility): every icon-only toolbar button needs an
  // accessible name. We expose `aria-pressed` so SR users hear the toggle state.
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={!!active}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      // A11Y-005: bump padding so the hit target is ≥24×24 CSS px
      // (p-2 + 14×14 icon ≈ 30×30).
      className={`inline-flex h-7 w-7 items-center justify-center rounded text-sm transition-colors ${
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      }`}
    >
      {children}
    </button>
  );
}

export function RichTextEditor({ value, onChange, placeholder, minHeight = 120 }: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
      }),
      BulletList,
      OrderedList,
      Placeholder.configure({ placeholder: placeholder ?? "Wpisz treść..." }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html === "<p></p>" ? "" : html);
    },
    editorProps: {
      attributes: {
        class: "outline-none text-sm text-foreground",
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const incoming = value || "";
    if (current !== incoming && !editor.isFocused) {
      editor.commands.setContent(incoming);
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="border border-border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-0">
      {/* A11Y-019: role="toolbar" landmark + labelled buttons. */}
      <div role="toolbar" aria-label="Formatting" className="flex items-center gap-0.5 px-2 py-1.5 border-b border-border bg-muted/30">
        <ToolbarButton
          label="Bold"
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
        >
          <Bold className="w-3.5 h-3.5" aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          label="Italic"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
        >
          <Italic className="w-3.5 h-3.5" aria-hidden="true" />
        </ToolbarButton>
        <div className="w-px h-4 bg-border mx-1" aria-hidden="true" />
        <ToolbarButton
          label="Bulleted list"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
        >
          <List className="w-3.5 h-3.5" aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          label="Numbered list"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
        >
          <ListOrdered className="w-3.5 h-3.5" aria-hidden="true" />
        </ToolbarButton>
      </div>
      <div style={{ minHeight }} className="px-3 py-2 text-sm">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
